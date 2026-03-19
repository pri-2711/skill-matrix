import sys
import os
import json

from flask import Blueprint, request, jsonify
from src.api.config import get_connection

# Add project root to path so recommender module is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from recommender.course_recommender import (
    fetch_courses_from_db,
    normalize_skills,
    extract_keywords,
    compute_domain_scores,
    IMPORTANT_PHRASES,
)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

recommendations_bp = Blueprint("recommendations", __name__)


# ── POST /api/recommendations ───────────────────────────────
@recommendations_bp.route("/api/recommendations", methods=["POST"])
def get_recommendations():
    """
    Body: { "current_skills": "Python, SQL", "goal": "Data Scientist", "top_k": 5 }
    Returns a ranked list of recommended courses.
    """
    data = request.get_json()
    if not data or not data.get("goal"):
        return jsonify({"error": "goal is required"}), 400

    current_skills = data.get("current_skills", "")
    goal = data["goal"]
    top_k = data.get("top_k", 5)

    # --- reuse recommender logic ---
    df = fetch_courses_from_db()
    if df.empty:
        return jsonify({"recommendations": [], "message": "No courses in database"}), 200

    user_skills = normalize_skills(current_skills)

    df["combined_text"] = df["course_title"] + " " + df["description"] + " " + df["skills"]

    vectorizer = TfidfVectorizer(
        stop_words="english", max_features=5000, ngram_range=(1, 3), min_df=2
    )
    course_vectors = vectorizer.fit_transform(df["combined_text"])
    goal_vector = vectorizer.transform([goal])

    df["goal_score"] = cosine_similarity(goal_vector, course_vectors)[0]
    df["skills_set"] = df["skills"].apply(normalize_skills)

    top_goal_courses = df.sort_values("goal_score", ascending=False).head(10)
    goal_skills = set().union(*top_goal_courses["skills_set"])
    missing_skills = goal_skills - user_skills

    df["missing_skill_score"] = df["skills_set"].apply(lambda s: len(s & missing_skills))
    df["known_skill_overlap"] = df["skills_set"].apply(lambda s: len(s & user_skills))
    df = compute_domain_scores(df, goal)

    goal_keywords = extract_keywords(goal)
    df["keyword_overlap"] = df["combined_text"].apply(
        lambda text: len(goal_keywords & extract_keywords(text))
    )
    df["phrase_match"] = df["combined_text"].apply(
        lambda text: any(p in text.lower() for p in IMPORTANT_PHRASES)
    )

    df["final_score"] = (
        0.30 * df["goal_score"]
        + 0.25 * df["missing_skill_score"]
        + 0.15 * df["domain_score"]
        + 0.10 * df["keyword_overlap"]
        + 0.10 * df["phrase_match"]
        - 0.10 * df["known_skill_overlap"]
    )

    # Boost score significantly if the goal keywords are present in the course title
    goal_words = extract_keywords(goal)
    if goal_words:
        df["title_boost"] = df["course_title"].apply(
            lambda title: len(extract_keywords(title) & goal_words) / len(goal_words)
        )
        # Add up to 0.4 bonus for exact/partial title matches
        df["final_score"] += 0.40 * df["title_boost"]

    # Sort, drop duplicates by course_title, take top K
    recommended = df.sort_values("final_score", ascending=False).drop_duplicates(subset=["course_title"], keep="first").head(top_k)

    results = []
    for _, row in recommended.iterrows():
        results.append({
            "course_id": int(row["course_id"]),
            "course_title": row["course_title"],
            "platform": row["platform"],
            "level": row["level"],
            "url": row["url"],
            "skills": row["skills"],
            "score": round(float(row["final_score"]), 4),
        })

    return jsonify({"recommendations": results}), 200
