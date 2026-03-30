import pandas as pd


def build_entities(df):

    # ----------------------------
    # 1. COURSE ENTITY
    # ----------------------------
    course_df = df[[
        "course_title",
        "description",
        "url",
        "level",
        "platform",
        "rating",
        "review_count",
        "duration_minutes"
    ]].copy()

    # Remove duplicate courses
    course_df = course_df.drop_duplicates()

    # Assign course_id
    course_df.reset_index(drop=True, inplace=True)
    course_df["course_id"] = (course_df.index + 1).astype(int)


    # ----------------------------
    # 2. SKILL ENTITY
    # ----------------------------
    all_skills = set()

    for skill_str in df["skills"]:
        if isinstance(skill_str, str):
            skills = [s.strip() for s in skill_str.split(",") if s.strip()]
            all_skills.update(skills)

    skill_df = pd.DataFrame({
        "skill_name": sorted(all_skills)
    })

    skill_df.reset_index(drop=True, inplace=True)
    skill_df["skill_id"] = (skill_df.index + 1).astype(int)


    # ----------------------------
    # 3. COURSE_SKILL RELATION
    # ----------------------------
    skill_map = dict(zip(skill_df.skill_name, skill_df.skill_id))
    course_map = dict(zip(course_df.course_title, course_df.course_id))

    rows = []

    for _, row in df.iterrows():
        course_title = row["course_title"]

        if isinstance(row["skills"], str):
            for skill in row["skills"].split(","):
                skill = skill.strip()
                if skill:
                    rows.append({
                        "course_id": course_map[course_title],
                        "skill_id": skill_map[skill]
                    })

    course_skill_df = pd.DataFrame(rows).drop_duplicates()

    

    return course_df, skill_df, course_skill_df

# if __name__ == "__main__":
#     from pipeline.data_pipeline import load_and_normalize

#     print("Loading normalized data...")
#     df = load_and_normalize()

#     print("Building relational entities...")
#     course_df, skill_df, course_skill_df = build_entities(df)

#     print("\nCOURSE ENTITY:")
#     print(course_df.head())
#     print("Shape:", course_df.shape)

#     print("\nSKILL ENTITY:")
#     print(skill_df.head())
#     print("Shape:", skill_df.shape)

#     print("\nCOURSE_SKILL RELATION:")
#     print(course_skill_df.head())
#     print("Shape:", course_skill_df.shape)
