"""
Configuration and domain taxonomies for Job & Project Tracker NLP Engine.
"""

# Categorized domain taxonomy for Job & Project Tracker NLP Engine
CATEGORIZED_TAXONOMY = {
    "Languages": [
        "python", "javascript", "typescript", "golang", "go", "java", "kotlin", "swift", "rust",
        "c++", "c#", "php", "ruby", "sql", "html", "css", "bash", "shell", "dart"
    ],
    "Frontend": [
        "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "nuxt.js", "angular",
        "svelte", "sveltekit", "tailwind", "tailwindcss", "bootstrap", "sass", "scss",
        "redux", "zustand", "react query", "tanstack query", "vite", "webpack", "micro-frontends"
    ],
    "Backend": [
        "node.js", "nodejs", "node js", "express", "fastapi", "django", "flask", "nest.js", "nestjs",
        "laravel", "codeigniter", "ci", "yii", "spring boot", "asp.net", ".net core", "gin", "fiber",
        "graphql", "rest api", "restful api", "grpc", "microservices", "websockets", "celery", "rabbitmq", "kafka"
    ],
    "Databases & Cache": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "supabase", "firebase",
        "appwrite", "prisma", "drizzle", "typeorm", "elasticsearch", "cassandra", "dynamodb", "neo4j"
    ],
    "Cloud & DevOps": [
        "docker", "kubernetes", "aws", "amazon web services", "gcp", "google cloud", "azure",
        "vercel", "github actions", "gitlab ci", "ci/cd", "terraform", "ansible", "nginx",
        "linux", "serverless", "cloud run", "cloud functions", "s3", "ec2"
    ],
    "AI & Data": [
        "machine learning", "deep learning", "ai", "artificial intelligence", "llm", "large language models",
        "rag", "langchain", "llamaindex", "pytorch", "tensorflow", "scikit-learn", "pandas",
        "numpy", "bigquery", "pyspark", "spark", "data analysis", "data engineering", "power bi", "tableau"
    ],
    "Mobile": [
        "flutter", "react native", "android", "ios", "swiftui", "jetpack compose"
    ],
    "Architecture & Quality": [
        "clean architecture", "tdd", "ddd", "oop", "object-oriented programming", "unit testing", "jest",
        "cypress", "playwright", "data structure", "data workflow", "agile", "scrum", "jira", "git",
        "github", "gitlab", "system design"
    ]
}

# Synonyms for normalization
KEYWORD_SYNONYMS = {
    "go language": "golang",
    "go": "golang",
    "react.js": "react",
    "nextjs": "next.js",
    "vue.js": "vue",
    "nuxt.js": "nuxt",
    "tailwindcss": "tailwind",
    "nodejs": "node.js",
    "node js": "node.js",
    "nestjs": "nest.js",
    "postgres": "postgresql",
    "google cloud": "gcp",
    "amazon web services": "aws",
    "artificial intelligence": "ai",
    "large language models": "llm",
    "restful api": "rest api",
    "object-oriented programming": "oop",
    "object oriented programming": "oop",
    "ci": "codeigniter",
}

# Flattened list of all keywords for fast regex matching
_all_keywords = []
for kw_list in CATEGORIZED_TAXONOMY.values():
    _all_keywords.extend(kw_list)
TECH_KEYWORDS = list(dict.fromkeys([k.lower() for k in _all_keywords]))

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
    ("Microsoft Forms", ["microsoft forms", "forms.cloud.microsoft", "forms.office.com", "microsoft 365", "formulir data kandidat"]),
    ("Google Forms", ["google forms", "forms.gle", "docs.google.com/forms"]),
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
