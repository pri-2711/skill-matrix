import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
from collections import Counter
import atexit

def _safe_quit(d):
    if not d: return
    try:
        d.service.stop()
    except Exception:
        pass
    try:
        d.quit()
    except Exception:
        pass

# ---------- STEP 3: SKILL NORMALIZATION ----------
SKILL_MAP = {
    "AI / Machine Learning": [
        "ai", "artificial intelligence", "machine learning", "deep learning",
        "llm", "generative ai", "gen ai", "nlp", "computer vision", "prompt engineering"
    ],
    "Data Science": [
        "data science", "data analytics", "data analysis", "analytics",
        "data visualization", "power bi", "tableau", "statistics"
    ],
    "Cloud Computing": [
        "cloud", "aws", "azure", "gcp", "google cloud", "devops",
        "kubernetes", "docker", "cloud computing"
    ],
    "Cybersecurity": [
        "cybersecurity", "cyber security", "security", "network security",
        "ethical hacking", "penetration testing", "information security"
    ],
    "Web Development": [
        "web development", "web dev", "react", "node", "javascript",
        "frontend", "backend", "full stack", "full-stack"
    ],
    "Finance / Fintech": [
        "finance", "trading", "investment", "fintech", "blockchain",
        "cryptocurrency", "financial modeling"
    ],
    "Digital Marketing": [
        "marketing", "digital marketing", "seo", "social media",
        "content marketing", "growth hacking"
    ],
    "Project Management": [
        "project management", "agile", "scrum", "product management",
        "pmp", "jira"
    ],
    "UX / Design": [
        "ux", "ui", "user experience", "design", "figma", "product design"
    ],
    "Sales / Communication": [
        "sales", "communication", "negotiation", "leadership",
        "soft skills", "public speaking"
    ],
}

def normalize_skills(text: str) -> list[str]:
    """Return list of canonical skill names found in `text`."""
    text_lower = text.lower()
    found = []
    for skill, keywords in SKILL_MAP.items():
        for kw in keywords:
            if kw in text_lower:
                found.append(skill)
                break   # one match per skill category is enough
    return found

# ---------- STEP 4: AI OVERVIEW ----------
def extract_ai_overview(driver) -> list[str]:
    skills = []

    # Try to expand the AI Overview if it's collapsed
    try:
        show_more = driver.find_elements(
            By.XPATH,
            "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',"
            "'abcdefghijklmnopqrstuvwxyz'), 'show more')]"
        )
        for btn in show_more[:2]:
            driver.execute_script("arguments[0].click();", btn)
            time.sleep(1)
    except Exception:
        pass

    # Selectors that tend to wrap AI Overview content
    ai_selectors = [
        "//div[contains(@class,'ILfuVd')]",          # AI overview body
        "//div[contains(@class,'WaN4rf')]",           # AI overview item
        "//div[contains(@data-attrid,'overview')]",   # attribute-based
        "//div[contains(@jscontroller,'')][@data-ved]",
        "//block-component",                          # newer AI overview tag
        "//div[contains(@class,'Ft1l2b')]",           # another common wrapper
    ]

    for selector in ai_selectors:
        try:
            elements = driver.find_elements(By.XPATH, selector)
            for el in elements[:20]:
                text = el.text.strip()
                if 40 < len(text) < 2000:
                    found = normalize_skills(text)
                    if found:
                        skills.extend(found)
        except Exception:
            continue

    if skills:
        print(f"✅ AI Overview matched {len(skills)} skill references")
    return skills


# ---------- STEP 5: PEOPLE ALSO ASK ----------
def extract_paa(driver) -> list[str]:
    skills = []

    paa_selectors = [
        "//div[@jsname='Cpkphb']",                        # older
        "//div[contains(@class,'related-question-pair')]", # mid
        "//div[@data-q]",                                  # attribute q = question
        "//div[contains(@class,'g') and .//span[@jscontroller]]",
    ]

    questions_found = []
    for selector in paa_selectors:
        try:
            qs = driver.find_elements(By.XPATH, selector)
            if qs:
                questions_found = qs[:5]
                break
        except Exception:
            continue

    for q in questions_found:
        try:
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", q)
            time.sleep(0.4)
            driver.execute_script("arguments[0].click();", q)
            time.sleep(random.uniform(1.2, 2))
        except Exception:
            continue

    # After expanding, collect all PAA answer text
    answer_selectors = [
        "//div[contains(@class,'related-question-pair')]",
        "//div[@jsname='yEVEwb']",
        "//div[contains(@class,'wDYxhc')]",
    ]
    for selector in answer_selectors:
        try:
            answers = driver.find_elements(By.XPATH, selector)
            for ans in answers[:8]:
                text = ans.text.strip()
                if text:
                    skills.extend(normalize_skills(text))
        except Exception:
            continue

    if skills:
        print(f"✅ PAA matched {len(skills)} skill references")
    return skills


# ---------- STEP 6: FULL PAGE SCAN (WEIGHTED) ----------
def extract_full_page(driver) -> list[str]:
    skills = []
    try:
        body_text = driver.find_element(By.TAG_NAME, "body").text
        # Score each line individually so repeated mentions count
        for line in body_text.split("\n"):
            line = line.strip()
            if 3 <= len(line.split()) <= 15:   # meaningful phrase length
                skills.extend(normalize_skills(line))
        print(f"✅ Full page scan matched {len(skills)} skill references")
    except Exception as e:
        print(f"⚠️  Full page scan failed: {e}")
    return skills


# ---------- MAIN FUNCTION ----------
def get_trending_skills() -> list[str]:
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Use undetected-chromedriver's native headless mode to prevent taskbar icon
    driver = uc.Chrome(options=options, headless=True, use_subprocess=True)
    atexit.register(lambda: _safe_quit(driver))

    try:
        time.sleep(2)
        driver.get("https://www.google.com")
        time.sleep(random.uniform(2, 4))
        
        try:
            search_box = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.NAME, "q"))
            )
        except Exception:
            search_box = driver.find_element(By.NAME, "q")
            
        query = "top trending skills to learn 2025"
        for ch in query:
            search_box.send_keys(ch)
            time.sleep(random.uniform(0.08, 0.2))
            
        search_box.send_keys(Keys.RETURN)
        time.sleep(random.uniform(2, 4))
        
        for scroll in [300, 600, 900]:
            driver.execute_script(f"window.scrollBy(0, {scroll});")
            time.sleep(0.8)
            
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        
        all_skills: list[str] = []
        ai_skills = extract_ai_overview(driver)
        paa_skills = extract_paa(driver)
        
        if ai_skills:
            all_skills.extend(ai_skills * 3)
        if paa_skills:
            all_skills.extend(paa_skills * 2)
            
        if len(Counter(all_skills).keys()) < 5:
            all_skills.extend(extract_full_page(driver))
            
        if all_skills:
            counter = Counter(all_skills)
            return [skill for skill, _ in counter.most_common(5)]
            
        return []
        
    finally:
        _safe_quit(driver)

if __name__ == "__main__":
    print("🔥 Top Trending Skills:")
    print(get_trending_skills())