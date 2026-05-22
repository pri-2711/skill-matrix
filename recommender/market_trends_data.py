# Multi-Domain Taxonomy Database for Tech, Business, Science, and Design Careers

DOMAIN_MAPS = {
    "AI / Machine Learning": {
        "domain": "AI / Machine Learning",
        "category": "Tech / Dev",
        "salary_range": "₹12–28 LPA",
        "growth": "+45%",
        "openings": "18K+",
        "skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Generative AI", "NLP", "Prompt Engineering"],
        "roadmap": ["Python & Math Foundations", "Supervised/Unsupervised ML", "Deep Neural Networks", "MLOps & Cloud Platforms", "LLMs & Reinforcement Learning"],
        "sectors": [
            {"domain": "Autonomous Tech", "jobs": 15000},
            {"domain": "Generative SaaS", "jobs": 45000},
            {"domain": "FinTech Analytics", "jobs": 28000},
            {"domain": "Health Diagnostics", "jobs": 20000}
        ]
    },
    "Software & Web Development": {
        "domain": "Software & Web Development",
        "category": "Tech / Dev",
        "salary_range": "₹8–22 LPA",
        "growth": "+22%",
        "openings": "65K+",
        "skills": ["JavaScript", "React / Next.js", "TypeScript", "Node.js", "SQL & NoSQL", "CSS / Tailwind", "REST APIs", "Git"],
        "roadmap": ["HTML, CSS & JS Basics", "Modern Frontend Frameworks", "Database & Server-Side Logic", "System Architecture & API Design", "CI/CD & Hosting"],
        "sectors": [
            {"domain": "E-Commerce", "jobs": 62000},
            {"domain": "SaaS Products", "jobs": 78000},
            {"domain": "Digital Consulting", "jobs": 42000},
            {"domain": "EdTech Systems", "jobs": 31000}
        ]
    },
    "DevOps & Cloud Architecture": {
        "domain": "DevOps & Cloud Architecture",
        "category": "Tech / Dev",
        "salary_range": "₹9–26 LPA",
        "growth": "+35%",
        "openings": "22K+",
        "skills": ["AWS / GCP", "Docker", "Kubernetes", "Linux", "CI/CD (Jenkins/GitHub Actions)", "Terraform", "Bash / Python scripting"],
        "roadmap": ["Linux & Network Engineering", "Containerization (Docker)", "Orchestration (Kubernetes)", "Infrastructure as Code", "Continuous Integration Pipelines"],
        "sectors": [
            {"domain": "Financial Tech", "jobs": 32000},
            {"domain": "Logistics & IoT", "jobs": 18000},
            {"domain": "Cloud Platforms", "jobs": 55000},
            {"domain": "Cybersecurity SaaS", "jobs": 14000}
        ]
    },
    "Business & Management": {
        "domain": "Business & Management",
        "category": "Business",
        "salary_range": "₹10–25 LPA",
        "growth": "+18%",
        "openings": "40K+",
        "skills": ["Product Management", "Agile / Scrum", "Jira", "Market Analysis", "Strategic Planning", "Stakeholder Communication", "SQL"],
        "roadmap": ["Market & Customer Research", "Agile Methodologies & Tools", "Product Roadmaps & Metrics", "Venture Growth Strategy", "Leadership & Cross-functional Sync"],
        "sectors": [
            {"domain": "Consumer Apps", "jobs": 25000},
            {"domain": "Enterprise Software", "jobs": 38000},
            {"domain": "Venture Capital", "jobs": 8000},
            {"domain": "Retail & E-commerce", "jobs": 30000}
        ]
    },
    "Finance & Investment": {
        "domain": "Finance & Investment",
        "category": "Business",
        "salary_range": "₹12–30 LPA",
        "growth": "+20%",
        "openings": "25K+",
        "skills": ["Financial Analysis", "Financial Modeling", "Excel & VBA", "Valuation", "Portfolio Management", "Blockchain", "Python"],
        "roadmap": ["Core Accounting & Excel", "Corporate Financial Valuation", "Investment Strategies", "Quantitative Risk Models", "Cryptocurrency & Decentralized Web"],
        "sectors": [
            {"domain": "Investment Banking", "jobs": 14000},
            {"domain": "Venture Funds", "jobs": 9000},
            {"domain": "Fintech Disruptors", "jobs": 35000},
            {"domain": "Corporate Accounting", "jobs": 28000}
        ]
    },
    "Marketing & Sales": {
        "domain": "Marketing & Sales",
        "category": "Business",
        "salary_range": "₹6–18 LPA",
        "growth": "+25%",
        "openings": "50K+",
        "skills": ["SEO / SEM", "Growth Hacking", "Google Analytics", "Content Strategy", "Social Media Marketing", "Copywriting", "Sales Funnels"],
        "roadmap": ["Marketing Psychology & Basics", "Search Engine Optimization & Ads", "Web Analytics & Data Models", "Growth Experiments", "Brand Strategy & Communications"],
        "sectors": [
            {"domain": "D2C Brands", "jobs": 42000},
            {"domain": "Media & Agency", "jobs": 31000},
            {"domain": "B2B Tech SaaS", "jobs": 28000},
            {"domain": "E-Learning", "jobs": 19000}
        ]
    },
    "Science, Healthcare & Analytics": {
        "domain": "Science, Healthcare & Analytics",
        "category": "Science",
        "salary_range": "₹8–24 LPA",
        "growth": "+30%",
        "openings": "15K+",
        "skills": ["Data Science", "Python / R", "Genomics", "Biostatistics", "Data Visualization", "GIS Mapping", "Climate Modeling", "Excel"],
        "roadmap": ["Advanced Statistics & Math", "Programming for Scientists (Python/R)", "Domain Analytics (Genomics/GIS)", "Research Methodologies", "Impact Reporting & Presentation"],
        "sectors": [
            {"domain": "Bioinformatics", "jobs": 12000},
            {"domain": "Pharmaceutical R&D", "jobs": 24000},
            {"domain": "Climate Tech & Agri", "jobs": 16000},
            {"domain": "Clinical Studies", "jobs": 11000}
        ]
    },
    "Creative & Design": {
        "domain": "Creative & Design",
        "category": "Design",
        "salary_range": "₹7–20 LPA",
        "growth": "+28%",
        "openings": "30K+",
        "skills": ["Figma", "UI/UX", "User Research", "Wireframing", "Adobe Illustrator", "Photoshop", "Typography", "Interaction Design"],
        "roadmap": ["Design Principles & Typography", "Wireframing & Prototyping (Figma)", "User Testing & Interaction Rules", "Brand Style Architecture", "Technical Asset Delivery"],
        "sectors": [
            {"domain": "App Agencies", "jobs": 22000},
            {"domain": "Game Development", "jobs": 15000},
            {"domain": "E-commerce Fronts", "jobs": 34000},
            {"domain": "Corporate Branding", "jobs": 18000}
        ]
    }
}

def map_goal_to_domain(goal: str) -> dict:
    """
    Parses a free-form career goal and maps it to a standard domain structure.
    If no matches occur, defaults to 'Software & Web Development'.
    """
    goal_lower = goal.lower()
    
    # 1. AI & Machine Learning
    if any(k in goal_lower for k in ["ai", "ml", "machine learning", "deep learning", "nlp", "llm", "neural", "computer vision", "generative"]):
        return DOMAIN_MAPS["AI / Machine Learning"]
        
    # 2. Science & Healthcare Analytics
    if any(k in goal_lower for k in ["science", "scientist", "bio", "healthcare", "genomic", "medical", "researcher", "climate", "environment", "analytic", "statistic"]):
        return DOMAIN_MAPS["Science, Healthcare & Analytics"]

    # 3. Cloud / DevOps
    if any(k in goal_lower for k in ["cloud", "devops", "sre", "kubernetes", "docker", "sysadmin", "infrastructure"]):
        return DOMAIN_MAPS["DevOps & Cloud Architecture"]

    # 4. Design / UX
    if any(k in goal_lower for k in ["design", "ui", "ux", "creative", "artist", "illustrator", "photoshop", "animator", "graphic"]):
        return DOMAIN_MAPS["Creative & Design"]

    # 5. Finance
    if any(k in goal_lower for k in ["finance", "financial", "investment", "trader", "banking", "accountant", "portfolio", "valua"]):
        return DOMAIN_MAPS["Finance & Investment"]

    # 6. Marketing
    if any(k in goal_lower for k in ["marketing", "seo", "sales", "social media", "copywrit", "ads", "growth"]):
        return DOMAIN_MAPS["Marketing & Sales"]

    # 7. Business
    if any(k in goal_lower for k in ["product", "project", "manager", "business", "agile", "scrum", "lead", "consult", "strategy", "operations"]):
        return DOMAIN_MAPS["Business & Management"]
        
    # Default fallback
    return DOMAIN_MAPS["Software & Web Development"]
