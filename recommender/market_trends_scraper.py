import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
import re
import atexit
from collections import Counter

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

# Universal Skills Pool across Dev, Business, Science, and Design
ALL_SKILL_KEYWORDS = {
    # Business / Management
    "Product Management": ["product management", "product roadmap", "user stories", "agile", "scrum", "product strategy"],
    "Financial Analysis": ["financial analysis", "valuation", "excel", "financial modeling", "portfolio management", "accounting"],
    "Sales & Marketing": ["seo", "digital marketing", "google analytics", "growth hacking", "sales strategy", "content marketing", "copywriting"],
    "Project Management": ["project management", "pmp", "jira", "operations", "risk management", "budgeting"],
    # Science / Analytics
    "Data Science": ["python", "machine learning", "data analytics", "r programming", "pandas", "numpy", "statistics", "data science"],
    "Bioinformatics": ["bioinformatics", "genomics", "dna sequencing", "biostatistics", "molecular biology", "blast", "phyton"],
    "Environmental Science": ["environmental science", "gis", "sustainability", "climate modeling", "impact assessment", "ecology"],
    # Design / Creative
    "UI/UX Design": ["figma", "ui/ux", "user research", "wireframing", "prototyping", "adobe illustrator", "photoshop", "interaction design"],
    "Content Strategy": ["content writing", "copywriting", "technical writing", "branding", "storytelling", "social media"],
    # Tech / Dev
    "Frontend Development": ["react", "next.js", "typescript", "javascript", "tailwind css", "html5", "css3", "vue", "angular"],
    "Backend Development": ["node.js", "express", "python", "django", "java", "spring boot", "postgresql", "mongodb", "graphql", "rest apis"],
    "DevOps & Cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "terraform", "linux", "bash"],
    "AI & Deep Learning": ["deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "llms", "generative ai", "prompt engineering"]
}

def parse_salaries(text):
    """Dynamically parses salary ranges (e.g. ₹8-20 LPA or 12,00,000) from scraped text."""
    # Pattern 1: Look for LPA ranges like 8-22 LPA or ₹10-25 LPA
    lpa_matches = re.findall(r'(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|Lacs?)', text, re.IGNORECASE)
    if lpa_matches:
        # Get the range that has the highest upper limit or just the first occurrence
        low, high = lpa_matches[0]
        return f"₹{low}–{high} LPA"
    
    # Pattern 2: Single LPA values
    single_lpa = re.findall(r'(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|Lacs?)', text, re.IGNORECASE)
    if single_lpa:
        val = float(single_lpa[0])
        # Generate a standard range around this value
        return f"₹{max(3, int(val*0.7))}–{int(val*1.4)} LPA"
        
    return None

def parse_growth(text):
    """Extracts YoY growth rates (e.g., +28% or 35% growth) from text."""
    growth_matches = re.findall(r'(\+?\s*\d+\s*%)\s*(?:growth|increase|yoy|rise|demand)', text, re.IGNORECASE)
    if growth_matches:
        return growth_matches[0].strip().replace(" ", "")
    
    percent_matches = re.findall(r'growth\s*(?:of|is)?\s*(\+?\s*\d+\s*%)', text, re.IGNORECASE)
    if percent_matches:
        return percent_matches[0].strip().replace(" ", "")

    return None

def extract_skills_from_text(text):
    """Counts matching skill taxonomy words from text."""
    text_lower = text.lower()
    matched_skills = []
    for skill_name, keywords in ALL_SKILL_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched_skills.append(kw.title() if len(kw) > 3 else kw.upper())
    return matched_skills

def scrape_market_trends(career_goal: str) -> dict:
    """
    Launches headlessly, searches Google for target career goal trends,
    and returns a parsed dict of dynamic stats, salaries, and growth.
    """
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = None
    try:
        try:
            driver = uc.Chrome(options=options, headless=True, use_subprocess=True, version_main=148)
        except Exception:
            driver = uc.Chrome(options=options, headless=True, use_subprocess=True)
        atexit.register(lambda: _safe_quit(driver))
        
        time.sleep(1.5)
        driver.get("https://www.google.com")
        time.sleep(random.uniform(1, 2.5))
        
        try:
            search_box = WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.NAME, "q"))
            )
        except Exception:
            search_box = driver.find_element(By.NAME, "q")
            
        # Search query: Goal salary growth demand trends 2026 India
        query = f"{career_goal} salary trends growth demand 2026 India"
        for ch in query:
            search_box.send_keys(ch)
            time.sleep(random.uniform(0.05, 0.12))
            
        search_box.send_keys(Keys.RETURN)
        time.sleep(random.uniform(2, 3.5))
        
        # Scroll slightly to trigger PAA and AI Overviews
        driver.execute_script("window.scrollBy(0, 400);")
        time.sleep(1)
        
        body_text = ""
        try:
            body_text = driver.find_element(By.TAG_NAME, "body").text
        except Exception:
            pass
            
        # 1. Parse Salary
        salary = parse_salaries(body_text)
        
        # 2. Parse Growth
        growth = parse_growth(body_text)
        
        # 3. Parse Skills
        skills = extract_skills_from_text(body_text)
        top_skills = [s for s, _ in Counter(skills).most_common(6)]
        
        return {
            "scraped": True,
            "salary": salary,
            "growth": growth,
            "skills": top_skills,
            "raw_len": len(body_text)
        }
        
    except Exception as e:
        print(f"Scraper error for '{career_goal}': {e}")
        return {
            "scraped": False,
            "error": str(e),
            "salary": None,
            "growth": None,
            "skills": []
        }
    finally:
        _safe_quit(driver)

if __name__ == "__main__":
    print("Testing scraper for 'Bioinformatician'...")
    res = scrape_market_trends("Bioinformatician")
    print("Result:", res)
