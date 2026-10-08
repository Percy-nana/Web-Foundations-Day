# School Database Design

## The tables

**students** holds one row per person who studies at the school: an auto-generated `student_id` (primary key), `first_name`, `last_name` and `email`. The email is `NOT NULL` and `UNIQUE`, so two students can never share an address and it can be used to identify someone reliably.

**courses** holds one row per course offered: `course_id` (primary key), `title` and `credits`. Credits must be greater than zero.

**enrolments** records the fact that a particular student is taking a particular course. It has its own `enrolment_id` primary key, a `student_id` foreign key pointing to `students`, a `course_id` foreign key pointing to `courses`, the date enrolled, and the `grade` (which may be `NULL` until the student has been marked). A `UNIQUE (student_id, course_id)` constraint stops the same student being enrolled on the same course twice.

## The relationships

- **students to enrolments: one-to-many.** One student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses to enrolments: one-to-many.** One course can have many enrolments, but each enrolment belongs to exactly one course.
- **students to courses: many-to-many.** A student can take many courses and a course has many students. This is the relationship we actually care about.

A relational database cannot store a many-to-many relationship directly. We would have to put a list of course ids in a student row (breaking the one-value-per-column rule and making queries and foreign keys impossible) or repeat student details on every course row. The **join table** (`enrolments`) solves this by turning one many-to-many relationship into two one-to-many relationships. It is also the natural home for data that belongs to the *pairing* rather than to either side, such as the grade and the enrolment date. A grade is not a property of the student or of the course, only of that student on that course.

## An index I would add

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);
```

The `UNIQUE (student_id, course_id)` constraint already creates an index that helps queries starting from a student. Queries starting from a course ("all students on this course", "students per course") filter and join on `course_id` alone, which that composite index cannot serve efficiently, because `course_id` is its second column. Without a dedicated index, SQLite would scan the whole enrolments table, which becomes slow as enrolments grow into the hundreds of thousands.

## SQL or NoSQL?

I would choose SQL (a relational database) for this system. The data is naturally structured and relational: students, courses and enrolments have a fixed shape and clear links between them. We need the database itself to enforce rules (unique emails, no duplicate enrolments, no enrolment for a student or course that does not exist), and foreign keys and constraints do that for us. We also need flexible queries across relationships ("which students have no enrolments?", "how many students per course?"), which JOINs and GROUP BY handle very well, and changes such as updating a grade must be consistent, which transactions guarantee. A NoSQL document store would suit data with a highly variable shape or enormous scale and simple lookups, such as activity logs or a content feed, but for a school's records the integrity and relational querying of SQL matter more than the extra flexibility.