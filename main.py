from pipeline.data_pipeline import load_and_normalize, preview_dataframe
from entity_builder.entity_builder import build_entities
from database.db_loader import insert_dataframe
from database.schema_manager import ensure_schema
def run_pipeline():
    print("Step 1: Ensuring DB Schema...")
    ensure_schema()

    print("Step 2: Loading and Normalizing...")
    df = load_and_normalize()

    print("Step 3: Building Entities...")
    course_df, skill_df, course_skill_df = build_entities(df)

    print("Step 4: Inserting into Database...")
    insert_dataframe(course_df, "course")
    insert_dataframe(skill_df, "skill")
    insert_dataframe(course_skill_df, "course_skill")

    print("Pipeline Completed Successfully!")

if __name__ == "__main__":
    run_pipeline()
