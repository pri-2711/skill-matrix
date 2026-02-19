from pipeline.data_pipeline import load_and_normalize, preview_dataframe
from entity_builder.entity_builder import build_entities
from database.db_loader import insert_dataframe


def run_pipeline():

    print("\nStep 1: Loading & Normalizing Data...")
    df = load_and_normalize()
    preview_dataframe(df)

    print("\nStep 2: Building Entities...")
    course_df, skill_df, course_skill_df = build_entities(df)

    print("\nStep 3: Inserting into Database...")
    insert_dataframe(course_df, "course")
    insert_dataframe(skill_df, "skill")
    insert_dataframe(course_skill_df, "course_skill")

    print("\nPipeline executed successfully ...")


if __name__ == "__main__":
    run_pipeline()
