import psycopg2
import pandas as pd

def get_connection():
    import os
    db_url = os.environ.get("DATABASE_URL") or "postgresql://neondb_owner:npg_m2TOBrAkDG3c@ep-polished-sky-ap87bjo1-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    
    # Sanitize env to prevent libpq overrides
    os.environ.pop("PGUSER", None)
    os.environ.pop("PGPASSWORD", None)
    os.environ.pop("PGDATABASE", None)
    os.environ.pop("PGHOST", None)
    os.environ.pop("PGPORT", None)
    return psycopg2.connect(db_url)

def standardize_platforms(conn):
    cur = conn.cursor()

    platform_map = {
        'udemy': 'Udemy',
        'coursera': 'Coursera',
        'edx': 'edX',
        'skillshare': 'Skillshare'
    }

    for key, value in platform_map.items():
        cur.execute("""
            UPDATE course
            SET platform = %s
            WHERE platform ILIKE %s;
        """, (value, f"%{key}%"))

    conn.commit()
    cur.close()

def insert_dataframe(df, table_name):
    conn = get_connection()
    cur = conn.cursor()

    for _, row in df.iterrows():
        columns = list(row.index)
        values = []
        for v in row.values:
            if v == "" or pd.isna(v):
                values.append(None)
            elif hasattr(v, "item"):
                values.append(v.item())
            else:
                values.append(v)
        query = f"""
        INSERT INTO {table_name} ({",".join(columns)})
        VALUES ({",".join(["%s"]*len(values))})
        ON CONFLICT DO NOTHING
        """

        cur.execute(query, values)

    conn.commit()
    if table_name == "course":
        standardize_platforms(conn)

    cur.close()
    conn.close()
# if __name__ == "__main__":
#     from pipeline.data_pipeline import load_and_normalize
#     from entity_builder.entity_builder import build_entities

#     print("Loading normalized data...")
#     df = load_and_normalize()

#     print("Building entities...")
#     course_df, skill_df, course_skill_df = build_entities(df)

#     print("Inserting into DB...")

#     insert_dataframe(course_df, "course")
#     insert_dataframe(skill_df, "skill")
#     insert_dataframe(course_skill_df, "course_skill")

#     print("Data successfully inserted!")
