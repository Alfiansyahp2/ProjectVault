import os
import re
from typing import Dict, Any, List, Optional
import pypdf

# Month mapping for Indonesian and English
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

# Technical ontology for skills extraction
TECH_ONTOLOGY = [
    # Languages
    "python", "javascript", "typescript", "php", "golang", "go", "java", "c#", "c++", "sql", "html", "css",
    # Frontend frameworks & styling
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "angular", "tailwind", "tailwindcss", "bootstrap",
    # Backend frameworks
    "laravel", "codeigniter", "fastapi", "flask", "django", "node.js", "nodejs", "express", "nest.js", "nestjs", "odoo",
    # Databases & BaaS
    "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "appwrite", "firebase", "supabase",
    # DevOps, Tools & Infra
    "docker", "git", "github", "linux", "nginx", "rest api", "graphql", "microservices", "ci/cd",
    # AI & Data
    "machine learning", "deep learning", "ai", "pandas", "numpy", "data analysis", "seo", "qa", "etl"
]

# Known job board portals
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

def clean_extracted_text(text: str) -> str:
    """Normalize common PDF text artifacts, broken split words, and irregular spacing."""
    text = re.sub(r'(\b[a-zA-Z])\s+([a-zA-Z]{2,}\b)', r'\1\2', text)
    text = re.sub(r'Full\s*-\s*Stack', 'Full Stack', text, flags=re.IGNORECASE)
    text = re.sub(r'Back\s*-\s*end', 'Backend', text, flags=re.IGNORECASE)
    text = re.sub(r'Front\s*-\s*end', 'Frontend', text, flags=re.IGNORECASE)
    text = re.sub(r'Mid\s*-\s*Level', 'Mid-Level', text, flags=re.IGNORECASE)
    return text

def extract_date(text: str) -> Optional[str]:
    """Extract and normalize application date from Indonesian or English date strings."""
    pattern = r'(\d{1,2})\s+([a-zA-Z]+)\s+(202[0-9])'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    for m in matches:
        day_str, month_str, year_str = m.group(1), m.group(2).lower(), m.group(3)
        if month_str in MONTHS_MAP:
            day = int(day_str)
            month = MONTHS_MAP[month_str]
            return f"{year_str}-{month}-{day:02d}"
    return None

def extract_portal(text: str) -> str:
    """Classify the job source portal mentioned in the document."""
    text_lower = text.lower()
    for portal_name, keywords in PORTALS:
        for kw in keywords:
            if kw in text_lower:
                return portal_name
    return "Direct / Other"

def clean_company_name(name: str) -> str:
    """Clean company name by removing address details, applicant names, and extra symbols."""
    # Remove applicant suffixes
    name = re.sub(r'[-_]?\s*alfiansyah.*$', '', name, flags=re.IGNORECASE).strip()
    # Remove address parts (Jln., Jl., Jalan, No., Gedung, Lantai)
    name = re.split(r'\b(?:jln\.?|jl\.?|jalan|gedung|lantai|no\.\s*\d+)\b', name, flags=re.IGNORECASE)[0].strip(' ,.-')
    # Remove prefixes
    name = re.sub(r'^(?:hrd\s*(?:[/,&]\s*tim\s*rekrutmen)?\s*|panitia\s*rekrutmen\s*pjlp\s*|yth\.?\s*)', '', name, flags=re.IGNORECASE).strip(' ,.-')
    return name

def extract_company(text: str, filename: str) -> str:
    """Multi-strategy entity recognition for company name."""
    # 1. From filename (standard in structured project directories)
    base = os.path.splitext(os.path.basename(filename))[0]
    fn_clean = re.sub(r'^(?:surat\s*lamaran\s*[-_]?\s*|cover\s*letter\s*[-_]?\s*)', '', base, flags=re.IGNORECASE).strip()
    fn_clean = clean_company_name(fn_clean)
    if fn_clean and len(fn_clean) > 2:
        return fn_clean

    # 2. From document header (under 'Kepada Yth.')
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for i, line in enumerate(lines):
        if 'kepada yth' in line.lower():
            for j in range(i + 1, min(i + 5, len(lines))):
                candidate = lines[j]
                if any(x in candidate.lower() for x in ['pt', 'cv', 'sdn bhd', 'tbk', 'group', 'indonesia', 'tech', 'studio', 'pens', 'politeknik', 'universitas', 'sekolah']):
                    cand = clean_company_name(candidate)
                    if cand and len(cand) > 3:
                        return cand
                if 'hrd ' in candidate.lower():
                    cand = clean_company_name(candidate)
                    if len(cand) > 2:
                        return cand

    # 3. Look for contextual 'di PT ...' or 'at [Company]'
    di_match = re.search(r'\b(?:di|at)\s+(PT\.?\s+[A-Z][a-zA-Z0-9\s]+|CV\.?\s+[A-Z][a-zA-Z0-9\s]+|[A-Z][a-zA-Z0-9\s]+(?:Sdn\s+Bhd|Tbk|Inc|Corp|Group))', text)
    if di_match:
        cand = clean_company_name(di_match.group(1))
        if cand:
            return cand

    return "Perusahaan"

def clean_job_title(title: str) -> str:
    """Clean extracted job title from noise words and formatting artifacts."""
    title = re.sub(r'\b(?:dengan\s+hormat|yang\s+dibuka|sebagaimana|pada\s+portal|di\s+tempat)\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\(PJLP\)', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+', ' ', title).strip(' ,.-()')
    return title

def extract_job_title(text: str) -> str:
    """Extract target job title using contextual sliding windows and role ontology."""
    # Check 'Perihal: Lamaran Pekerjaan - ...'
    perihal_m = re.search(r'Perihal:\s*Lamaran\s*Pekerjaan\s*-\s*([^\n\r]+)', text, re.IGNORECASE)
    if perihal_m:
        cand = clean_job_title(perihal_m.group(1))
        if len(cand) > 2 and len(cand) < 60:
            return cand

    # Contextual regex patterns
    patterns = [
        r'(?:mengajukan\s+diri\s+sebagai|melamar\s+sebagai)\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk)',
        r'posisi\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk|dalam)',
        r'position\s+of\s+([A-Za-z0-9\s/&_-]+?)\s+(?:at|in|with)',
        r'interest\s+in\s+the\s+([A-Za-z0-9\s/&_-]+?)\s+position',
        r'melamar\s+sebagai\s+([A-Za-z0-9\s/&_-]+?)(?:\s+di|\s+pada|\.|\,)'
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            cand = clean_job_title(m.group(1))
            if len(cand) > 2 and len(cand) < 50 and not cand.lower().startswith('yang'):
                return cand

    # Role ontology scanning across opening paragraphs
    first_block = " ".join(text.split()[:250]).lower()
    common_roles = [
        ("Full Stack Developer", ["full stack developer", "fullstack developer", "full stack web developer", "fullstack web developer"]),
        ("Software Engineer", ["software engineer"]),
        ("Backend Developer", ["back-end developer", "backend developer", "back end developer"]),
        ("Frontend Developer", ["front-end developer", "frontend developer", "front end developer"]),
        ("IT Software Staff", ["staff it software", "it development staff", "it developer staff", "staf it"]),
        ("Programmer", ["programmer", "junior programmer", "middle programmer"]),
        ("Mobile Developer", ["mobile developer", "mobile developer staff", "android developer"]),
        ("IT Support", ["it tech support", "it support"]),
        ("Web Developer", ["web developer", "web application developer"])
    ]
    for role_name, synonyms in common_roles:
        for syn in synonyms:
            if syn in first_block:
                return role_name

    return "Software Engineer"

def extract_skills(text: str) -> List[str]:
    """Extract technical keywords based on taxonomy ontology matching."""
    text_lower = text.lower()
    detected = []
    for skill in TECH_ONTOLOGY:
        pat = r'(?<![a-zA-Z0-9_-])' + re.escape(skill) + r'(?![a-zA-Z0-9_-])'
        if re.search(pat, text_lower):
            detected.append(skill)
    return list(dict.fromkeys(detected))

def generate_extractive_summary(company: str, role: str, date: Optional[str], portal: str, skills: List[str]) -> str:
    """AI extractive summary combining entity anchors and skill focal points."""
    skills_part = f" dengan penekanan pada stack {', '.join(skills[:4])}" if skills else ""
    date_part = f" tertanggal {date}" if date else ""
    return f"Lamaran untuk posisi {role} di {company}{date_part} via {portal}{skills_part}."

def parse_pdf_document(filepath: str) -> Dict[str, Any]:
    """
    Main Local NLP Pipeline:
    1. Extracts raw text from PDF with layout awareness.
    2. Cleans text artifacts.
    3. Runs entity recognition for Company, Job Title, Date, Portal, and Skills.
    4. Generates extractive AI summary.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    reader = pypdf.PdfReader(filepath)
    raw_text = "\n".join([page.extract_text() or "" for page in reader.pages])
    cleaned_text = clean_extracted_text(raw_text)

    company = extract_company(cleaned_text, filepath)
    job_title = extract_job_title(cleaned_text)
    applied_date = extract_date(cleaned_text) or "2026-01-01"
    portal = extract_portal(cleaned_text)
    skills = extract_skills(cleaned_text)
    summary = generate_extractive_summary(company, job_title, applied_date, portal, skills)

    # Relative path for portable storage
    rel_path = filepath.replace("\\", "/")

    return {
        "file_name": os.path.basename(filepath),
        "file_path": rel_path,
        "company_name": company,
        "job_title": job_title,
        "applied_date": applied_date,
        "source_portal": portal,
        "key_skills": skills,
        "summary": summary,
        "status": "Applied",
        "cover_letter_preview": cleaned_text[:350].strip()
    }

def scan_all_resumes(base_dir: str = "data") -> List[Dict[str, Any]]:
    """Scan all resume / cover letter PDFs in directory recursively and parse them."""
    results = []
    if not os.path.exists(base_dir):
        return results

    for root, _, files in os.walk(base_dir):
        for f in files:
            if f.lower().endswith(".pdf") and not f.startswith("CV_"):
                full_path = os.path.join(root, f)
                try:
                    item = parse_pdf_document(full_path)
                    results.append(item)
                except Exception as e:
                    print(f"Warning: Failed to parse {full_path}: {e}")

    # Sort descending by applied_date
    results.sort(key=lambda x: x["applied_date"], reverse=True)
    return results
