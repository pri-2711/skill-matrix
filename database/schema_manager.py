import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="skill_matrix",
        user="postgres",
        password="postgres123",
        host="localhost",
        port="5432"
    )

def ensure_schema():
    conn = get_connection()
    cur = conn.cursor()

    # ---- COURSE TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS course (
        course_id SERIAL PRIMARY KEY,
        course_title TEXT,
        description TEXT,
        url TEXT,
        level TEXT,
        platform TEXT,
        rating DOUBLE PRECISION,
        review_count BIGINT,
        duration TEXT
    );
    """)

    # ---- SKILL TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS skill (
        skill_id SERIAL PRIMARY KEY,
        skill_name TEXT UNIQUE
    );
    """)

    # ---- COURSE-SKILL RELATION ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS course_skill (
        course_id INT,
        skill_id INT,
        PRIMARY KEY (course_id, skill_id),
        FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skill(skill_id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    cur.close()
    conn.close()