"""
Configuration and domain taxonomies for Job & Project Tracker NLP Engine.
"""

# Tech skills taxonomy for keyword extraction and matching
TECH_KEYWORDS = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go language", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css", "r language", "r programming",
    # Frontend
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "angular", "svelte", "tailwind", "tailwindcss", "bootstrap", "sass", "redux", "zustand",
    # Backend
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "nest.js", "nestjs", "laravel", "codeigniter", "spring boot", "asp.net", "odoo", "graphql", "rest api", "grpc",
    # Databases & BaaS
    "appwrite", "firebase", "supabase", "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "prisma", "typeorm", "elasticsearch",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "gcp", "google cloud", "azure", "vercel", "github actions", "gitlab ci", "terraform", "ci/cd", "linux", "nginx",
    # Data & AI
    "machine learning", "deep learning", "ai", "pandas", "numpy", "pytorch", "tensorflow", "scikit-learn", "data analysis", "bigquery", "pyspark", "power bi", "tableau",
    # Tools & Methodologies
    "git", "github", "jira", "agile", "scrum", "microservices", "unit testing", "jest", "cypress", "system design"
]

# Month name mapping for Indonesian and English temporal normalization
MONTHS_MAP = {
    'januari': '01', 'january': '01', 'jan': '01',
    'februari': '02', 'february': '02', 'feb': '02',
    'maret': '03', 'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05', 'may': '05',
    'juni': '06', 'june': '06', 'jun': '06',
    'juli': '07', 'july': '07', 'jul': '07',
    'agustus': '08', 'august': '08', 'ags': '08', 'aug': '08',
    'september': '09', 'sept': '09', 'sep': '09',
    'oktober': '10', 'october': '10', 'okt': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'december': '12', 'des': '12', 'dec': '12'
}

# Source portal classification rules
PORTALS = [
    ("Jobstreet", ["jobstreet", "job street", "j obstreet"]),
    ("LinkedIn", ["linkedin", "linked in"]),
    ("Glints", ["glints"]),
    ("Kalibrr", ["kalibrr"]),
    ("Karirlink", ["karirlink", "karir link"]),
    ("Tech in Asia", ["tech in asia"]),
    ("Dealls", ["dealls"]),
    ("Career Website", ["website resmi", "situs resmi", "career site"]),
    ("Direct / Email", ["email", "surel"])
]
