import os
import re
import pandas as pd

RAW_DATA_PATH = "D:/MINOR-PROJECT/skill_matrix/data/raw"
REVIEW_OUTPUT = "D:/MINOR-PROJECT/skill_matrix/data/temp_review/temp_normalized_df.xlsx"


COLUMN_ALIASES = {
    "course_title": ["course name", "course title", "title", "name", "course"],
    "description": ["description", "summary", "course description"],
    "skills": ["skills", "associatedskills", "associated skills", "what you learn"],
    "url": ["url", "course url", "link"],
    "level": ["level", "difficulty", "course level"],
    "platform": ["platform", "provider", "site", "organization", "institution"],
    "rating": ["rating", "ratings"],
    "review_count": ["reviewcount", "review count", "num_reviews"],
    "duration": ["duration", "content_duration"]
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
    for alias in aliases:
        if alias in df.columns:
            return df[alias]
    return pd.Series([""] * len(df))


def normalize_skills(text):
    if not isinstance(text, str):
        return ""

    text = re.sub(r"[\[\]\{\}\'\"]", "", text)

    parts = re.split(r"[,\|;/]+", text.lower())

    clean_parts = []

    for p in parts:
        p = p.strip()

        #Remove anything containing review
        if "review" in p:
            continue

        #Remove rating words
        if "star" in p:
            continue

        #Remove number-heavy tokens
        if re.search(r"\d", p):
            continue

        #Remove very short junk
        if len(p) <= 2:
            continue

        p = re.sub(r"\s+", " ", p)

        if p:
            clean_parts.append(p)

    return ", ".join(sorted(set(clean_parts)))
def parse_number(val):
    if not isinstance(val, str):
        return val

    val = val.lower().replace(",", "").strip()

    # Remove words
    val = re.sub(r"[a-z\s]", "", val)

    try:
        if "k" in val:
            num = float(val.replace("k", ""))
            result = int(num * 1000)

        elif "m" in val:
            num = float(val.replace("m", ""))
            result = int(num * 1_000_000)

        elif val.endswith("+"):
            result = int(val.replace("+", ""))

        else:
            result = int(val)

        # Reject unrealistic values (> 1 billion)
        if result > 1_000_000_000:
            return None

        return result

    except:
        return None



def load_and_normalize():
    all_courses = []

    for file in os.listdir(RAW_DATA_PATH):
        path = os.path.join(RAW_DATA_PATH, file)

        if file.lower().endswith(".csv"):
            df = pd.read_csv(path)
        elif file.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(path)
        else:
            continue

        df = normalize_column_names(df)

        unified = pd.DataFrame({
            "course_title": get_column(df, COLUMN_ALIASES["course_title"]),
            "description": get_column(df, COLUMN_ALIASES["description"]),
            "skills": get_column(df, COLUMN_ALIASES["skills"]),
            "url": get_column(df, COLUMN_ALIASES["url"]),
            "level": get_column(df, COLUMN_ALIASES["level"]),
            "platform": get_column(df, COLUMN_ALIASES["platform"]),
            "rating": get_column(df, COLUMN_ALIASES["rating"]),
            "review_count": get_column(df, COLUMN_ALIASES["review_count"]),
            "duration": get_column(df, COLUMN_ALIASES["duration"])
        })

        unified["platform"] = unified["platform"].replace("", os.path.splitext(file)[0])
        unified = unified.fillna("")
        unified["skills"] = unified["skills"].apply(normalize_skills)

        # --- Numeric Cleaning ---
        unified["review_count"] = unified["review_count"].apply(parse_number)
        unified["rating"] = pd.to_numeric(unified["rating"], errors="coerce")
        unified["rating"] = unified["rating"].apply(normalize_rating)
        unified["duration_minutes"] = unified["duration"].apply(convert_to_minutes)
        all_courses.append(unified)

    if not all_courses:
        raise ValueError("No datasets found in raw folder")

    return pd.concat(all_courses, ignore_index=True)


def preview_dataframe(df, rows=10):
    print("\nPreview of Normalized Data:\n")
    print(df.head(rows))
    print("\nShape:", df.shape)
    print("\nColumns:", df.columns.tolist())


def export_for_review(df):
    os.makedirs(os.path.dirname(REVIEW_OUTPUT), exist_ok=True)
    df.to_excel(REVIEW_OUTPUT, index=False, engine="openpyxl")
    print(f"\nNormalized data exported to:\n{REVIEW_OUTPUT}")

import re

def convert_to_minutes(duration_str):
    if not isinstance(duration_str, str) or duration_str.strip() == "":
        return 0

    duration_str = duration_str.lower()

    # ---- CASE 1: QUESTIONS ----
    if "question" in duration_str:
        q_match = re.search(r'\d+', duration_str)
        if q_match:
            questions = int(q_match.group())
            return questions * 2   # 2 mins per question

    hours = 0
    minutes = 0

    # ---- CASE 2: HOURS ----
    hr_match = re.search(r'(\d+(\.\d+)?)[^\d]*(h|hr|hrs|hour|hours)', duration_str)
    if hr_match:
        hours = float(hr_match.group(1))

    # ---- CASE 3: MINUTES ----
    min_match = re.search(r'(\d+)\s*(m|min|mins|minute|minutes)', duration_str)
    if min_match:
        minutes = int(min_match.group(1))

    # ---- CASE 4: FALLBACK ----
    if hours == 0 and minutes == 0:
        num_match = re.search(r'\d+(\.\d+)?', duration_str)
        if num_match:
            val = float(num_match.group())
            if '.' in num_match.group():
                return int(val * 60)
            else:
                return int(val)

    return int(hours * 60 + minutes)
def normalize_rating(val):
    if val is None:
        return None

    try:
        val = float(val)

        # Already valid rating
        if val > 1:
            return round(val, 2)

        # Scaled but unrealistic → stretch
        elif 0 <= val <= 1:
            return round(2.5 + val * 2.5, 2)

    except:
        return None

    return None

# Standalone test run
# if __name__ == "__main__":
#     print("Running normalization pipeline...\n")

#     df = load_and_normalize()

#     preview_dataframe(df)

#     export_for_review(df)

#     print("\nNormalization complete. Review Excel before moving forward.")
