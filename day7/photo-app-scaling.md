# SnapShare: Scaling Plan

## 1. Assumptions

| Item | Value |
|---|---|
| Registered users | 10,000,000 |
| Daily active users (DAU) | 10% of registered users |
| Uploads per active user per day | 1 photo |
| Feed page views per active user per day | 50 |
| Average original photo size | 2 MB |
| Thumbnail size (one per photo) | 50 KB |
| Peak traffic | 5x the average |
| Seconds in a day | 86,400 |
| Units | Decimal (1 TB = 1,000,000 MB) |

Extra assumptions: traffic is spread across the day (the peak factor covers busy hours), photos are never deleted, and replication/backup copies are not counted in the raw storage figure.

**Daily active users:** 10,000,000 x 10% = **1,000,000 DAU**

## 2. Estimates

### Uploads per second
- Uploads per day: 1,000,000 users x 1 photo = 1,000,000 uploads/day
- **Average:** 1,000,000 / 86,400 = about **12 uploads/s**
- **Peak (5x):** about **58 uploads/s**

### Feed views per second
- Feed views per day: 1,000,000 users x 50 = 50,000,000 views/day
- **Average:** 50,000,000 / 86,400 = about **579 views/s**
- **Peak (5x):** about **2,894 views/s** (roughly 2,900)

### Photo storage per year
- Originals per day: 1,000,000 x 2 MB = 2,000,000 MB = 2 TB/day
- Originals per year: 2 TB x 365 = **730 TB/year**
- Thumbnails per day: 1,000,000 x 50 KB = 50 GB/day
- Thumbnails per year: 50 GB x 365 = about **18.25 TB/year**
- **Total: about 748 TB per year (roughly 0.75 PB)**, before replication. With 3 copies this would be about 2.2 PB.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. Users make about 50 feed views for every 1 upload (579 reads/s vs 12 writes/s on average), a ratio of about 50:1.

What this means for the design:
- Optimise reads first: cache feed data, serve photos from a CDN, and add read replicas so reads do not overload the database.
- Writes are fewer, so one primary database can handle them for a long time, and slow work (thumbnails) can be done in the background.
- Because reads are so frequent, even small savings per read (a cache hit instead of a database query) matter a lot.

## 4. Why photos should not be stored in the database

Photos are large binary files (2 MB each, 730 TB per year). Storing them in the database would:
- make the database huge, slow to back up and slow to restore;
- fill its memory and disk I/O with big files instead of small, fast queries;
- make the database expensive to scale, since database storage costs far more than file storage;
- stop us from serving the photos through a CDN.

Instead, photo files go in **object storage** (such as Amazon S3). It is cheap, almost unlimited, durable (data is copied across locations) and works well with a CDN. The database stores only the **path/URL** of each photo plus small metadata (owner, caption, time, status).

## 5. Architecture diagram

```
                         +----------------+
                         |     Users      |
                         | (phone / web)  |
                         +-------+--------+
                                 |
              static photos &    |    API requests
              thumbnails         |    (feed, upload, follow)
            +--------------------+---------------------+
            |                                          |
            v                                          v
     +-------------+                          +----------------+
     |     CDN     |                          | Load Balancer  |
     +------+------+                          +--------+-------+
            | (cache miss)                             |
            |                          +---------------+---------------+
            |                          |               |               |
            |                          v               v               v
            |                    +-----------+   +-----------+   +-----------+
            |                    | App       |   | App       |   | App       |
            |                    | Server 1  |   | Server 2  |   | Server N  |
            |                    +-----+-----+   +-----+-----+   +-----+-----+
            |                          |               |               |
            |            +-------------+---------------+---------------+------+
            |            |                     |                       |      |
            |            v                     v                       v      |
            |     +-------------+      +----------------+      +-----------+  |
            |     |    Cache    |      |   Database     |      |  Queue    |  |
            |     |   (Redis)   |      |   (Primary)    |      | (jobs)    |  |
            |     +-------------+      +-------+--------+      +-----+-----+  |
            |                                  | replication         |        |
            |                                  v                     v        |
            |                          +----------------+     +-----------+   |
            |                          | Read Replica   |     |  Worker   |   |
            |                          | (feed reads)   |     | (thumb-   |   |
            |                          +----------------+     |  nails)   |   |
            |                                                 +-----+-----+   |
            |                                                       |         |
            |           +-------------------------------+           |         |
            +---------->|   Object Storage (photo files)|<----------+---------+
                        |   originals + thumbnails      |   save/read photos
                        +-------------------------------+
```

Reads: the app server checks the cache first, then the read replica. Photos are fetched by the user's device from the CDN, which fetches from object storage on a miss.
Writes: the app server writes metadata to the primary database, photos go to object storage, and thumbnail jobs go through the queue to the worker.

## 6. Components (one sentence each)

- **CDN:** Delivers photos and thumbnails from servers close to the user, which solves slow image loading and takes most of the heavy bandwidth load off our own servers.
- **Load balancer:** Spreads incoming requests across many app servers, which solves a single server being overloaded and removes it as a single point of failure.
- **App servers:** Run the application logic (login, feed, upload) and can be added or removed in numbers to handle more traffic, which solves the limit of one machine's capacity.
- **Cache (Redis):** Keeps frequently requested data (such as feed pages and popular photo info) in memory, which solves repeated slow database queries for the same data.
- **Database (primary):** Stores the reliable, structured data (users, follows, photo metadata) and accepts all writes, which solves the need for consistent, queryable data.
- **Read replica:** Holds a copy of the primary database to answer read queries, which solves the primary being overwhelmed by our 50:1 read load.
- **Object storage:** Stores the photo files themselves cheaply and durably at huge scale, which solves the problem of storing hundreds of terabytes without bloating the database.
- **Queue:** Holds thumbnail jobs until a worker can process them, which solves slow uploads and lost work during traffic spikes by decoupling the upload from the slow processing.
- **Worker:** Takes jobs from the queue and creates the 50 KB thumbnail, which solves the need to do heavy image processing without making the user wait.

## 7. Upload flow (step by step)

1. The user picks a photo in the app and taps upload. The request goes through the **load balancer** to an **app server**.
2. The app server checks the user is logged in and validates the file (type, size limit).
3. The app server saves the original photo to **object storage** (or gives the app a temporary pre-signed link to upload straight to it, which saves server bandwidth).
4. The app server inserts a row in the **primary database** with the owner, the photo's storage path, the time, and status = `processing`.
5. The app server puts a message such as `{photo_id, path}` on the **queue**.
6. The app server immediately replies "upload successful" to the user. The user does not wait for the thumbnail.
7. A **worker** takes the message from the queue, downloads the original from object storage and creates a 50 KB thumbnail.
8. The worker saves the thumbnail to object storage and updates the database row with the thumbnail path and status = `ready`.
9. The relevant **cache** entries (the feeds of followers) are updated or invalidated so the new photo can appear.
10. The photo and thumbnail are served to viewers through the **CDN**. If the worker fails, the job is retried from the queue, and after several failed attempts it moves to a "failed jobs" list for review.

## 8. Trade-offs

1. **Cache speed vs freshness.** The cache makes feeds fast and protects the database, but cached data can be slightly out of date, so a new photo may take a few seconds to appear. We accept this because feeds do not need to be perfectly up to date, and a short expiry time limits how stale they get. Caching also adds complexity (deciding when to invalidate).
2. **Asynchronous thumbnails: fast uploads vs delay.** Using a queue and worker makes uploads fast and tolerant of spikes, but the thumbnail is not available instantly and the system becomes more complex (queue, retries, failed jobs). Until the thumbnail is ready, the feed can show a placeholder or the resized original.
3. **Read replica: scale vs consistency.** Replicas let us serve many more reads, but they copy data from the primary with a small delay (replication lag), so a user may briefly not see something they just posted. We can read the user's own recent posts from the primary to avoid this.
4. **CDN: speed vs cost.** A CDN gives much faster image loading worldwide and saves our bandwidth, but it costs money, and deleted or changed photos can remain cached for a while.
5. **Object storage vs database: cost vs convenience.** Object storage is cheap and scalable, but the photo and its metadata live in two places, so they can get out of sync (for example a database row pointing at a missing file) and we must handle that.