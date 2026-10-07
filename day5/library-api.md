# Library API Design

A REST API for a library's `books` resource. All requests and responses use JSON.

## Book object

- `id` - number, assigned by the server
- `title` - string
- `author` - string
- `isbn` - string
- `year` - number

## Endpoints

### 1. List books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns all books in the library.
- **Request body:** none
- **Success status:** 200 OK

### 2. Get one book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns the single book with the given id.
- **Request body:** none
- **Success status:** 200 OK

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "9780385474542",
  "year": 1958
}
```

- **Success status:** 201 Created

### 4. Update a book

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "9780385474542",
  "year": 1959
}
```

- **Success status:** 200 OK

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Removes the book with the given id.
- **Request body:** none
- **Success status:** 204 No Content

### 6. List books by an author

- **Method:** GET
- **Path:** `/books?author={name}` (example: `/books?author=Chinua%20Achebe`)
- **Description:** Returns only the books written by the given author.
- **Request body:** none
- **Success status:** 200 OK

## Error codes

### 400 Bad Request

- The client sent a request the server cannot process.
- **Example:** `POST /books` with a body that is missing `title`, or where `year` is the text `"nineteen"` instead of a number.

### 404 Not Found

- The requested resource does not exist.
- **Example:** `GET /books/9999` when no book has the id 9999
