import psycopg2
import pandas as pd

def get_connection():
    return psycopg2.connect(
        dbname="skill_matrix",
        user="postgres",
        password="maansi27",
        host="localhost",
        port="5432"
    )

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
