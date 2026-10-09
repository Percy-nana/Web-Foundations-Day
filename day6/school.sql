PRAGMA foreign_keys = ON;

-- Day 6 assignment: A School Database (SQLite)
-- Run the whole file in sqliteonline.com (choose SQLite) or with: sqlite3 :memory: < school.sql

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE students (
    student_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    credits     INTEGER NOT NULL CHECK (credits > 0)
);

-- Join table: one row = one student enrolled on one course
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id   INTEGER NOT NULL,
    course_id    INTEGER NOT NULL,
    enrolled_on  TEXT NOT NULL DEFAULT (DATE('now')),
    grade        INTEGER CHECK (grade IS NULL OR (grade BETWEEN 0 AND 100)),
    FOREIGN KEY (student_id) REFERENCES students (student_id),
    FOREIGN KEY (course_id)  REFERENCES courses (course_id),
    -- the same student cannot enrol on the same course twice
    UNIQUE (student_id, course_id)
);

-- ============================================================
-- 2. SAMPLE DATA
-- ============================================================

INSERT INTO students (first_name, last_name, email) VALUES
    ('Thandi', 'Mokoena', 'thandi.mokoena@school.test'),
    ('Liam',   'van Wyk', 'liam.vanwyk@school.test'),
    ('Aisha',  'Patel',   'aisha.patel@school.test'),
    ('Sipho',  'Dlamini', 'sipho.dlamini@school.test');   -- not enrolled anywhere yet

INSERT INTO courses (title, credits) VALUES
    ('Web Foundations',  10),
    ('Databases',        12),
    ('JavaScript Basics', 8);

INSERT INTO enrolments (student_id, course_id, enrolled_on, grade) VALUES
    (1, 1, '2026-09-01', 82),
    (1, 2, '2026-09-01', 75),
    (2, 1, '2026-09-02', 68),
    (3, 1, '2026-09-02', NULL),   -- no grade yet
    (3, 2, '2026-09-03', 91),
    (3, 3, '2026-09-03', NULL);

-- ============================================================
-- 3. QUERIES
-- ============================================================

-- Q1. All courses for one student (by name): Thandi Mokoena
SELECT c.title, c.credits, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.student_id
JOIN courses c    ON c.course_id  = e.course_id
WHERE s.first_name = 'Thandi' AND s.last_name = 'Mokoena';

-- Q2. All students on one course: Web Foundations
SELECT s.first_name, s.last_name, s.email, e.grade
FROM courses c
JOIN enrolments e ON e.course_id  = c.course_id
JOIN students s   ON s.student_id = e.student_id
WHERE c.title = 'Web Foundations';

-- Q3. Number of students per course (courses with 0 students still show)
SELECT c.title, COUNT(e.enrolment_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.title
ORDER BY student_count DESC;

-- Q4. Students who have no enrolments
SELECT s.student_id, s.first_name, s.last_name
FROM students s
LEFT JOIN enrolments e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL;

-- Q5. Update one enrolment's grade: give Aisha Patel a grade of 77 for Web Foundations
UPDATE enrolments
SET grade = 77
WHERE student_id = (SELECT student_id FROM students WHERE email = 'aisha.patel@school.test')
  AND course_id  = (SELECT course_id  FROM courses  WHERE title = 'Web Foundations');

-- Check the update worked
SELECT s.first_name, c.title, e.grade
FROM enrolments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c  ON c.course_id  = e.course_id
WHERE s.email = 'aisha.patel@school.test';