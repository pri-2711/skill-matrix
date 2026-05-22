import psycopg2

DB_CONFIG = {
    "dbname": "skill_matrix",
    "user": "postgres",
    "password": "maansi27",
    "host": "localhost",
    "port": "5432"
}

def get_connection():
    """Return a new psycopg2 connection using environment DATABASE_URL or fallback local config."""
    import os
    db_url = os.environ.get("DATABASE_URL")
    
    # Sanitize env to prevent libpq overrides
    os.environ.pop("PGUSER", None)
    os.environ.pop("PGPASSWORD", None)
    os.environ.pop("PGDATABASE", None)
    os.environ.pop("PGHOST", None)
    os.environ.pop("PGPORT", None)

    if db_url:
        return psycopg2.connect(db_url)
    return psycopg2.connect(**DB_CONFIG)
