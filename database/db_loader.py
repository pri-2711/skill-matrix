import psycopg2
import pandas as pd

def get_connection():
    return psycopg2.connect(
        dbname="skill_matrix",
        user="postgres",
        password="postgres123",
        host="localhost",
        port="5432"
    )


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
