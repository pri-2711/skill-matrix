CREATE TABLE course (
    course_id INT PRIMARY KEY,
    course_title TEXT,
    description TEXT,
    url TEXT,
    level TEXT,
    platform TEXT,
    rating FLOAT,
    review_count INT,
    duration TEXT
);

CREATE TABLE skill (
    skill_id INT PRIMARY KEY,
    skill_name TEXT UNIQUE
);

CREATE TABLE course_skill (
    course_id INT,
    skill_id INT,
    PRIMARY KEY (course_id, skill_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (skill_id) REFERENCES skill(skill_id)
);
