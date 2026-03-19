import psycopg2

DB_CONFIG = {
    "dbname": "skill_matrix",
    "user": "postgres",
    "password": "postgres123",
    "host": "localhost",
    "port": "5432"
}

def get_connection():
    """Return a new psycopg2 connection using shared config."""
    return psycopg2.connect(**DB_CONFIG)
