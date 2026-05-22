import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="skill_matrix",
        user="postgres",
        password="maansi27",
        host="localhost",
        port="5432"
    )

def ensure_schema():
    # First, connect to default 'postgres' database to ensure 'skill_matrix' exists
    try:
        temp_conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="maansi27",
            host="localhost",
            port="5432"
        )
        temp_conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        temp_cur = temp_conn.cursor()
        
        # Check if database exists
        temp_cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'skill_matrix';")
        exists = temp_cur.fetchone()
        
        if not exists:
            print("Database 'skill_matrix' does not exist. Creating...")
            temp_cur.execute("CREATE DATABASE skill_matrix;")
        
        temp_cur.close()
        temp_conn.close()
    except Exception as e:
        print(f"Warning: Could not check/create database 'skill_matrix': {e}")

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
        duration_minutes INT
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

    # ---- USER SKILL TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_skill (
        id SERIAL PRIMARY KEY,
        skill_name TEXT NOT NULL,
        proficiency_level TEXT DEFAULT 'Beginner',
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # ---- USER PROGRESS TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        skill_name TEXT NOT NULL,
        current_level TEXT,
        target_level TEXT,
        progress_percent INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # ---- CERTIFICATE TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS certificate (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        issuer TEXT,
        issue_date DATE,
        expiry_date DATE,
        credential_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # ---- PROJECT TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS project (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT,
        role TEXT,
        start_date DATE,
        end_date DATE,
        url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # ---- RESUME TABLE ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS resume (
        id SERIAL PRIMARY KEY,
        title TEXT,
        summary TEXT,
        skills_json TEXT,
        certificates_json TEXT,
        projects_json TEXT,
        generated_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # ---- APP USER TABLE (simple auth) ----
    cur.execute("""
    CREATE TABLE IF NOT EXISTS app_user (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    conn.commit()
    cur.close()
    conn.close()