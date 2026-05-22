import os
import psycopg2

DB_CONFIG = os.environ.get("DATABASE_URL") or "postgresql://neondb_owner:npg_m2TOBrAkDG3c@ep-polished-sky-ap87bjo1-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def get_connection():
    """Return a new psycopg2 connection using Neon connection string."""
    # Sanitize env to prevent libpq overrides
    os.environ.pop("PGUSER", None)
    os.environ.pop("PGPASSWORD", None)
    os.environ.pop("PGDATABASE", None)
    os.environ.pop("PGHOST", None)
    os.environ.pop("PGPORT", None)
    return psycopg2.connect(DB_CONFIG)
