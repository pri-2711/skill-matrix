import os
import re
import sys
import argparse
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity



DATA_FOLDER = r"C:\Users\Dell\OneDrive\Desktop\Minor"
POWERBI_OUTPUT = r"C:\Users\Dell\OneDrive\Desktop\Minor\powerbi_courses_output.csv"




COLUMN_ALIASES = {
    "course_title": [
        "course name", "course title", "title", "name"
    ],
    "short_description": [
        "description", "summary", "short description", "course description"
    ],
    "skills": [
        "skills", "associatedskills", "associated skills", "what you learn"
    ],
    "url": [
        "url", "course url", "link"
    ],
    "course_level": [
        "level", "difficulty", "course level"
    ],
    "platform": [
        "platform", "provider", "site"
    ]
}



def normalize_column_names(df):
    df.columns = (
        df.columns
        .str.lower()
        .str.strip()
        .str.replace("_", " ")
    )
    return df


def get_column(df, aliases):
    for col in aliases:
        if col in df.columns:
            return df[col]
    return pd.Series([""] * len(df))


def normalize_skills(text):
    if not isinstance(text, str):
        return set()
    parts = re.split(r"[,\|;/]+", text.lower())
    return {p.strip() for p in parts if p.strip()}




def load_all_datasets(folder):
    all_courses = []

    print(" Scanning folder:", folder)

    for file in os.listdir(folder):
        path = os.path.join(folder, file)

        if file.lower().endswith(".csv"):
            print(" Loading CSV:", file)
            df = pd.read_csv(path)

        elif file.lower().endswith((".xlsx", ".xls")):
            print(" Loading Excel:", file)
            df = pd.read_excel(path)

        else:
            continue

        df = normalize_column_names(df)

        unified = pd.DataFrame({
            "course_title": get_column(df, COLUMN_ALIASES["course_title"]),
            "short_description": get_column(df, COLUMN_ALIASES["short_description"]),
            "skills": get_column(df, COLUMN_ALIASES["skills"]),
            "url": get_column(df, COLUMN_ALIASES["url"]),
            "course_level": get_column(df, COLUMN_ALIASES["course_level"]),
            "platform": get_column(df, COLUMN_ALIASES["platform"])
        })

        unified["platform"] = unified["platform"].replace("", os.path.splitext(file)[0])
        unified = unified.fillna("")

        all_courses.append(unified)

    if not all_courses:
        print(" No datasets loaded.")
        sys.exit(1)

    return pd.concat(all_courses, ignore_index=True)




def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--current-skills")
    parser.add_argument("--goal")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    df = load_all_datasets(DATA_FOLDER)
    print(f"\n Total courses loaded: {len(df)}")

    current_skills = args.current_skills or input("Enter current skills: ")
    goal = args.goal or input("Enter career goal: ")

    user_skills = normalize_skills(current_skills)

    df["combined_text"] = (
        df["course_title"] + " " +
        df["short_description"] + " " +
        df["skills"]
    )

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=3000,
        ngram_range=(1, 2)
    )

    course_vectors = vectorizer.fit_transform(df["combined_text"])

    goal_text = goal + " " + " ".join(user_skills)
    goal_vector = vectorizer.transform([goal_text])

    df["goal_score"] = cosine_similarity(goal_vector, course_vectors)[0]
    df["skills_set"] = df["skills"].apply(normalize_skills)

    top_goal_courses = df.sort_values("goal_score", ascending=False).head(10)
    goal_skills = set().union(*top_goal_courses["skills_set"])
    missing_skills = goal_skills - user_skills

    df["missing_skill_score"] = df["skills_set"].apply(
        lambda s: len(s & missing_skills)
    )

    candidates = df[df["missing_skill_score"] > 0]

    if candidates.empty:
        candidates = df.sort_values("goal_score", ascending=False)
    else:
        candidates = candidates.sort_values(
            by=["missing_skill_score", "goal_score"],
            ascending=[False, False]
        )

    recommended = candidates.head(args.top_k)

    

    os.makedirs(os.path.dirname(POWERBI_OUTPUT), exist_ok=True)

    powerbi_df = df[[
        "course_title",
        "platform",
        "course_level",
        "goal_score",
        "missing_skill_score",
        "skills",
        "url"
    ]].sort_values("goal_score", ascending=False)

    powerbi_df.to_csv(POWERBI_OUTPUT, index=False)

    print("\n Power BI dataset exported to:")
    print(POWERBI_OUTPUT)

    

    print("\n Recommended Courses:\n")
    for _, row in recommended.iterrows():
        print(row["course_title"])
        print(" Platform :", row["platform"])
        print(" Level    :", row["course_level"])
        print(" Relevance:", round(row["goal_score"], 4))
        print("-" * 60)


if __name__ == "__main__":
    main()