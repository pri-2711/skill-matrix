import argparse
import psycopg2
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DB_CONFIG = {
    "host": "localhost",
    "database": "skill_matrix",
    "user": "postgres",
    "password": "maansi27",
    "port": 5432
}


DOMAIN_KEYWORDS = {
    "tech": {
        "system", "design", "backend", "frontend", "fullstack",
        "api", "microservices", "database", "sql", "nosql",
        "cloud", "aws", "azure", "gcp",
        "docker", "kubernetes", "devops",
        "distributed", "scalability", "architecture",
        "software", "engineering", "programming", "coding",
        "python", "java", "c++", "javascript",
        "machine", "learning", "ai", "data", "analytics"
    },
    "data_science": {
        "data", "analysis", "analytics", "statistics",
        "machine learning", "deep learning", "nlp",
        "regression", "classification", "python", "pandas",
        "numpy", "visualization", "powerbi", "tableau"
    },
    "business": {
        "management", "finance", "marketing", "strategy",
        "business", "entrepreneurship", "sales",
        "operations", "accounting", "economics"
    },
    "design": {
        "ui", "ux", "figma", "adobe", "photoshop",
        "illustrator", "graphic", "visual", "branding"
    },
    "cooking": {
        "cake", "baking", "cooking", "recipe",
        "food", "kitchen", "chef", "dessert"
    },
    "health": {
        "fitness", "yoga", "workout", "nutrition",
        "diet", "wellness", "exercise"
    },
    "finance": {
        "investment", "trading", "stocks", "mutual",
        "portfolio", "banking", "financial"
    },
    "language": {
        "english", "communication", "speaking",
        "writing", "grammar", "ielts", "toefl"
    }
}

# Important phrases (boost accuracy)
IMPORTANT_PHRASES = [
    "system design", "machine learning", "data science",
    "web development", "cloud computing", "deep learning"
]


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


def clean_text(text):
    return re.sub(r"[^a-zA-Z0-9 ]", " ", text.lower())


def extract_keywords(text):
    return set(clean_text(text).split())



def compute_domain_scores(df, goal):
    goal_words = extract_keywords(goal)

    # score goal against each domain
    domain_weights = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        domain_weights[domain] = len(goal_words & keywords)

    # normalize weights
    total = sum(domain_weights.values()) + 1e-6
    domain_weights = {k: v / total for k, v in domain_weights.items()}

    # compute course domain score
    def course_domain_score(text):
        words = extract_keywords(text)
        score = 0
        for domain, keywords in DOMAIN_KEYWORDS.items():
            overlap = len(words & keywords)
            score += overlap * domain_weights[domain]
        return score

    df["domain_score"] = df["combined_text"].apply(course_domain_score)

    # normalize
    df["domain_score"] = df["domain_score"] / (df["domain_score"].max() + 1e-6)

    return df



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--current-skills")
    parser.add_argument("--goal")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    df = fetch_courses_from_db()
    print(f"\nTotal courses loaded: {len(df)}")

    current_skills = args.current_skills or input("Enter current skills: ")
    goal = args.goal or input("Enter career goal: ")

    user_skills = normalize_skills(current_skills)


    df["combined_text"] = (
        df["course_title"] + " " +
        df["description"] + " " +
        df["skills"]
    )


    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 3),
        min_df=2
    )

    course_vectors = vectorizer.fit_transform(df["combined_text"])
    goal_vector = vectorizer.transform([goal])

    df["goal_score"] = cosine_similarity(goal_vector, course_vectors)[0]

    df["skills_set"] = df["skills"].apply(normalize_skills)

    top_goal_courses = df.sort_values("goal_score", ascending=False).head(10)
    goal_skills = set().union(*top_goal_courses["skills_set"])

    missing_skills = goal_skills - user_skills

    df["missing_skill_score"] = df["skills_set"].apply(
        lambda s: len(s & missing_skills)
    )

    df["known_skill_overlap"] = df["skills_set"].apply(
        lambda s: len(s & user_skills)
    )

    df = compute_domain_scores(df, goal)


    goal_keywords = extract_keywords(goal)

    df["keyword_overlap"] = df["combined_text"].apply(
        lambda text: len(goal_keywords & extract_keywords(text))
    )

    df["phrase_match"] = df["combined_text"].apply(
        lambda text: any(p in text.lower() for p in IMPORTANT_PHRASES)
    )


    df["final_score"] = (
        0.35 * df["goal_score"] +
        0.25 * df["missing_skill_score"] +
        0.20 * df["domain_score"] +
        0.15 * df["keyword_overlap"] +
        0.15 * df["phrase_match"] -
        0.10 * df["known_skill_overlap"]
    )


    recommended = df.sort_values(by="final_score", ascending=False).head(args.top_k)

    print("\nRecommended Courses:\n")
    for _, row in recommended.iterrows():
        print(row["course_title"])
        print("Platform :", row["platform"])
        print("Level    :", row["level"])
        print("Score    :", round(row["final_score"], 4))
        print("-" * 60)


if __name__ == "__main__":
    main()