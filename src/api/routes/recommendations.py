import sys
import os
import json
import re
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

CACHE_FILE = os.path.join(os.path.dirname(__file__), "trending_cache.json")
import random
FALLBACK_SKILLS_POOL = [
    "AI / Machine Learning", "Data Science", "Web Development", 
    "Cloud Computing", "Cybersecurity", "Project Management", 
    "Digital Marketing", "UX / Design", "Finance / Fintech",
    "Machine Learning", "Software Engineering", "UI/UX Design"
]
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

    # Scale down scores to be within [0.0, 1.0] only if the maximum score is above 1.0
    max_score = df["final_score"].max()
    if max_score > 1.0:
        df["final_score"] = df["final_score"] / max_score
    df["final_score"] = df["final_score"].clip(0.0, 1.0)

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

# ── GET /api/trendy-courses ───────────────────────────────
@recommendations_bp.route("/api/trendy-courses", methods=["GET"])
def get_trendy_courses():
    try:
        refresh = request.args.get("refresh", "").lower() == "true"
        
        trending_skills = []
        # Try loading from cache first if not explicitly refreshing
        if not refresh and os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r") as f:
                    trending_skills = json.load(f)
            except:
                pass
                
        # If we need to fetch (refresh requested or no valid cache)
        if refresh or not trending_skills:
            try:
                from recommender.trendyCourse import get_trending_skills
                fetched = get_trending_skills()
                if fetched and len(fetched) > 0:
                    trending_skills = fetched
                    # Save to cache
                    with open(CACHE_FILE, "w") as f:
                        json.dump(trending_skills, f)
            except Exception as e:
                print(f"Scraping failed: {e}")
                
        # If STILL empty (e.g., scrape failed and no cache existed), use fallback
        if not trending_skills:
            trending_skills = random.sample(FALLBACK_SKILLS_POOL, min(5, len(FALLBACK_SKILLS_POOL)))
            # Save fallback to cache so we have something
            try:
                with open(CACHE_FILE, "w") as f:
                    json.dump(trending_skills, f)
            except:
                pass

        conn = get_connection()
        cur = conn.cursor()
        
        courses = []
        for skill in trending_skills:
            cur.execute("""
                SELECT c.course_id, c.course_title, c.platform, c.level, c.url, c.rating, s.skill_name
                FROM course c
                JOIN course_skill cs ON c.course_id = cs.course_id
                JOIN skill s ON cs.skill_id = s.skill_id
                WHERE s.skill_name ILIKE %s
                  AND c.url IS NOT NULL AND c.url != ''
                ORDER BY c.rating DESC NULLS LAST
                LIMIT 2
            """, ('%' + skill + '%',))
            rows = cur.fetchall()
            for row in rows:
                courses.append({
                    "course_id": row[0],
                    "course_title": row[1],
                    "platform": row[2],
                    "level": row[3],
                    "url": row[4],
                    "rating": float(row[5]) if row[5] else None,
                    "matched_skill": row[6] # using the DB matched skill name
                })

        cur.close()
        conn.close()

        # Remove duplicates
        unique_courses = []
        seen_ids = set()
        for c in courses:
            if c["course_id"] not in seen_ids:
                seen_ids.add(c["course_id"])
                unique_courses.append(c)

        return jsonify({"courses": unique_courses}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── GET /api/market-trends ──────────────────────────────────
@recommendations_bp.route("/api/market-trends", methods=["GET"])
def get_market_trends():
    try:
        goal = request.args.get("goal", "").strip()
        if not goal:
            return jsonify({"error": "goal query parameter is required"}), 400

        refresh = request.args.get("refresh", "").lower() == "true"
        
        # Load local taxonomy profile as base
        from recommender.market_trends_data import map_goal_to_domain
        base_profile = map_goal_to_domain(goal)
        
        import copy
        profile = copy.deepcopy(base_profile)
        
        # Check cache or scrape
        MARKET_TRENDS_CACHE = os.path.join(os.path.dirname(__file__), "market_trends_cache.json")
        cache_data = {}
        if os.path.exists(MARKET_TRENDS_CACHE):
            try:
                with open(MARKET_TRENDS_CACHE, "r") as f:
                    cache_data = json.load(f)
            except:
                pass
                
        scraped_data = None
        goal_cache_key = goal.lower()
        
        if not refresh and goal_cache_key in cache_data:
            scraped_data = cache_data[goal_cache_key]
        else:
            try:
                from recommender.market_trends_scraper import scrape_market_trends
                scraped_res = scrape_market_trends(goal)
                if scraped_res and scraped_res.get("scraped"):
                    scraped_data = scraped_res
                    cache_data[goal_cache_key] = scraped_res
                    with open(MARKET_TRENDS_CACHE, "w") as f:
                        json.dump(cache_data, f)
            except Exception as e:
                print(f"Scraper error: {e}")
                
        # Merge scraped values if available
        if scraped_data:
            if scraped_data.get("salary"):
                profile["salary_range"] = scraped_data["salary"]
            if scraped_data.get("growth"):
                profile["growth"] = scraped_data["growth"]
            if scraped_data.get("skills"):
                scraped_skills = scraped_data["skills"]
                base_skills = profile.get("skills", [])
                
                blended = []
                for s in scraped_skills:
                    if s.lower() not in [x.lower() for x in blended]:
                        blended.append(s)
                for s in base_skills:
                    if s.lower() not in [x.lower() for x in blended]:
                        blended.append(s)
                profile["skills"] = blended[:8]
                
        # Get user skills from database
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT skill_name FROM user_skill")
        user_skill_rows = cur.fetchall()
        cur.close()
        conn.close()
        
        user_skills = []
        for row in user_skill_rows:
            raw_skill = row[0]
            m = re.match(r"^(.+?)\s*\[.*\]$", raw_skill)
            cleaned = (m.group(1) if m else raw_skill).lower().strip()
            user_skills.append(cleaned)
            
        category = profile.get("category", "Tech / Dev")
        skills_list = profile.get("skills", [])
        
        skill_colors = ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#db2777", "#9333ea"]
        in_demand_skills = []
        for i, sk in enumerate(skills_list):
            demand_val = max(55, 95 - i * 5)
            color = skill_colors[i % len(skill_colors)]
            
            is_ai = any(kw in sk.lower() for kw in ["ai", "deep learning", "llm", "generative", "pytorch"])
            gr = "+120%" if is_ai else f"+{random.randint(15, 45)}%"
            
            in_demand_skills.append({
                "skill": sk,
                "demand": demand_val,
                "category": category,
                "growth": gr,
                "color": color
            })
            
        matched_skills_data = []
        missing_skills_data = []
        
        for sk_item in in_demand_skills:
            sk_name = sk_item["skill"].lower()
            has_skill = False
            for u_sk in user_skills:
                if u_sk in sk_name or sk_name in u_sk:
                    has_skill = True
                    break
            
            if has_skill:
                matched_skills_data.append(sk_item)
            else:
                missing_skills_data.append(sk_item)
                
        match_percentage = 0
        if in_demand_skills:
            match_percentage = round((len(matched_skills_data) / len(in_demand_skills)) * 100)
            
        sal_str = profile.get("salary_range", "₹8–22 LPA")
        salary_digits = re.findall(r'(\d+)', sal_str)
        if len(salary_digits) >= 2:
            base_salary_min = int(salary_digits[0])
            base_salary_max = int(salary_digits[1])
        elif len(salary_digits) == 1:
            base_salary_min = int(salary_digits[0])
            base_salary_max = int(base_salary_min * 1.5)
        else:
            base_salary_min = 8
            base_salary_max = 20
            
        role_variations = [
            f"Lead {goal}",
            f"Senior {goal}",
            f"{goal} Specialist",
            f"Associate {goal}"
        ]
        
        role_grads = [
            "from-purple-500 to-indigo-600",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-teal-500",
            "from-orange-500 to-red-500"
        ]
        
        top_roles = []
        for i, r_title in enumerate(role_variations):
            inc_min = int(base_salary_min * (1.3 - i * 0.2))
            inc_max = int(base_salary_max * (1.3 - i * 0.2))
            low = max(3, inc_min)
            high = max(low + 2, inc_max)
            top_roles.append({
                "role": r_title,
                "salary": f"₹{low}–{high} LPA",
                "growth": f"+{random.randint(18, 48)}%",
                "openings": f"{random.randint(2, 18)}K+",
                "hot": i == 0 or i == 1,
                "grad": role_grads[i % len(role_grads)]
            })
            
        colors = {
            "Tech / Dev": "blue",
            "Business": "orange",
            "Science": "green",
            "Design": "purple"
        }
        icons = {
            "Tech / Dev": "💻",
            "Business": "💼",
            "Science": "🧬",
            "Design": "🎨"
        }
        
        career_path = {
            "path": goal,
            "icon": icons.get(category, "💻"),
            "color": colors.get(category, "blue"),
            "steps": profile.get("roadmap", []),
            "salary": profile.get("salary_range", "₹8–22 LPA"),
            "time": "8–12 months",
            "demand": "Very High" if int(profile.get("growth", "+30%").replace("+","").replace("%","")) > 30 else "High"
        }
        
        stat_cards = [
            { "icon_type": "briefcase", "label": f"Total {category} Jobs", "value": profile.get("openings", "30K+") },
            { "icon_type": "trending", "label": "YoY Hiring Growth", "value": profile.get("growth", "+28%") },
            { "icon_type": "dollar", "label": "Avg. Base Salary", "value": f"₹{int((base_salary_min + base_salary_max)/2)} LPA" },
            { "icon_type": "zap", "label": "Fastest Growing Skill", "value": skills_list[0] if skills_list else "Analytics" }
        ]
        
        response_payload = {
            "goal": goal,
            "category": category,
            "domain": profile.get("domain", "General Industry"),
            "salary_range": profile.get("salary_range", "₹8–20 LPA"),
            "growth": profile.get("growth", "+25%"),
            "openings": profile.get("openings", "10K+"),
            "stat_cards": stat_cards,
            "in_demand_skills": in_demand_skills,
            "top_roles": top_roles,
            "career_path": career_path,
            "sectors": profile.get("sectors", []),
            "user_skill_gap": {
                "match_percentage": match_percentage,
                "matched_skills": [sk["skill"] for sk in matched_skills_data],
                "missing_skills": missing_skills_data
            }
        }
        
        return jsonify(response_payload), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
