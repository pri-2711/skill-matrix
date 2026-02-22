import argparse
import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DB_CONFIG = {
    "host": "localhost",
    "database": "skill_matrix",
    "user": "postgres",
    "password": "postgres123",
    "port": 5432
}

def fetch_courses_from_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    query = """
    SELECT 
        c.course_id,
        c.course_title,
        c.description,
        c.level,
        c.platform,
        c.url,
        STRING_AGG(s.skill_name, ', ') AS skills
    FROM course c
    LEFT JOIN course_skill cs ON c.course_id = cs.course_id
    LEFT JOIN skill s ON cs.skill_id = s.skill_id
    GROUP BY c.course_id
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    columns = [desc[0] for desc in cursor.description]
    df = pd.DataFrame(rows, columns=columns)

    cursor.close()
    conn.close()

    return df.fillna("")


def normalize_skills(text):
    if not isinstance(text, str):
        return set()
    return {s.strip().lower() for s in text.split(",") if s.strip()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--current-skills")
    parser.add_argument("--goal")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    df = fetch_courses_from_db()
    print(f"\nTotal courses loaded from DB: {len(df)}")

    current_skills = args.current_skills or input("Enter current skills: ")
    goal = args.goal or input("Enter career goal: ")

    user_skills = normalize_skills(current_skills)

    # Build course text
    df["combined_text"] = (
        df["course_title"] + " " +
        df["description"] + " " +
        df["skills"]
    )

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=3000,
        ngram_range=(1, 2)
    )

    course_vectors = vectorizer.fit_transform(df["combined_text"])

    # IMPORTANT CHANGE:
    # Use ONLY goal for similarity
    goal_vector = vectorizer.transform([goal])

    df["goal_score"] = cosine_similarity(goal_vector, course_vectors)[0]
    df["skills_set"] = df["skills"].apply(normalize_skills)

    # Find skills needed for goal
    top_goal_courses = df.sort_values("goal_score", ascending=False).head(10)
    goal_skills = set().union(*top_goal_courses["skills_set"])

    # Detect missing skills
    missing_skills = goal_skills - user_skills

    df["missing_skill_score"] = df["skills_set"].apply(
        lambda s: len(s & missing_skills)
    )

    # Penalize known skills
    df["known_skill_overlap"] = df["skills_set"].apply(
        lambda s: len(s & user_skills)
    )

    candidates = df[df["missing_skill_score"] > 0]

    if candidates.empty:
        candidates = df.sort_values("goal_score", ascending=False)
    else:
        candidates = candidates.sort_values(
            by=["missing_skill_score", "goal_score", "known_skill_overlap"],
            ascending=[False, False, True]
        )

    recommended = candidates.head(args.top_k)

    print("\nRecommended Courses:\n")
    for _, row in recommended.iterrows():
        print(row["course_title"])
        print("Platform :", row["platform"])
        print("Level    :", row["level"])
        print("Relevance:", round(row["goal_score"], 4))
        print("-" * 60)

if __name__ == "__main__":
    main()