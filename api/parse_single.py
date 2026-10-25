import os
import re
import sys
import json
import pypdf

MONTHS_MAP = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
    'january': '01', 'february': '02', 'march': '03',
    'august': '08', 'october': '10', 'december': '12'
}

TECH_KEYWORDS = [
    "Next.js", "React", "Vue", "TypeScript", "JavaScript", "Python", "PHP",
    "Laravel", "Lumen", "Django", "FastAPI", "Go", "Golang", "Flutter", "Dart",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Node.js", "Express",
    "Tailwind", "Bootstrap", "Git", "REST API", "GraphQL", "Algolia", "Prisma",
    "Linux", "Nginx", "GitHub", "Unit Testing", "Microservices", "Playwright"
]

PORTALS = [
    ("Jobstreet", ["jobstreet", "job street"]),
    ("LinkedIn", ["linkedin", "linked in"]),
    ("Glints", ["glints"]),
    ("Kalibrr", ["kalibrr"]),
    ("KitaLulus", ["kitalulus", "kita lulus"]),
    ("Dealls", ["dealls"]),
    ("Karir.com", ["karir.com", "karir com"]),
    ("Disnaker", ["disnaker"]),
    ("Instagram", ["instagram", "loker_surabaya", "lokersby", "@loker"]),
    ("Website Perusahaan", ["website resmi", "portal karir", "career page", "careers."])
]

def clean_extracted_text(text: str) -> str:
    text = re.sub(r'(\b[a-zA-Z])\s+([a-zA-Z]{2,}\b)', r'\1\2', text)
    text = re.sub(r'Full\s*-\s*Stack', 'Full Stack', text, flags=re.IGNORECASE)
    text = re.sub(r'Back\s*-\s*end', 'Backend', text, flags=re.IGNORECASE)
    text = re.sub(r'Front\s*-\s*end', 'Frontend', text, flags=re.IGNORECASE)
    return text

def extract_date(text: str, filepath: str) -> str:
    pattern = r'(\d{1,2})\s+([a-zA-Z]+)\s+(202[0-9])'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    for m in matches:
        d, mon, y = m.group(1), m.group(2).lower(), m.group(3)
        if mon in MONTHS_MAP:
            return f"{y}-{MONTHS_MAP[mon]}-{int(d):02d}"
    return "2026-10-25"

def extract_portal(text: str) -> str:
    tl = text.lower()
    for name, kws in PORTALS:
        if any(k in tl for k in kws):
            return name
    return "Direct / Job Portal"

def clean_company_name(name: str) -> str:
    name = re.sub(r'[-_]?\s*alfiansyah.*$', '', name, flags=re.IGNORECASE).strip()
    name = re.split(r'\b(?:jln\.?|jl\.?|jalan|gedung|lantai|no\.\s*\d+)\b', name, flags=re.IGNORECASE)[0].strip(' ,.-')
    name = re.sub(r'^(?:hrd\s*(?:[/,&]\s*tim\s*rekrutmen)?\s*|panitia\s*rekrutmen\s*pjlp\s*|yth\.?\s*)', '', name, flags=re.IGNORECASE).strip(' ,.-')
    return name

def extract_company(text: str, filepath: str) -> str:
    base = os.path.splitext(os.path.basename(filepath))[0]
    fn = re.sub(r'^(?:surat\s*lamaran\s*[-_]?\s*|cover\s*letter\s*[-_]?\s*)', '', base, flags=re.IGNORECASE).strip()
    fn = clean_company_name(fn)
    if fn and len(fn) > 2:
        return fn

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for i, line in enumerate(lines):
        if 'kepada yth' in line.lower():
            for j in range(i + 1, min(i + 5, len(lines))):
                cand = lines[j]
                if any(x in cand.lower() for x in ['pt', 'cv', 'sdn bhd', 'tbk', 'group', 'indonesia', 'tech', 'studio', 'pens', 'politeknik', 'universitas']):
                    c = clean_company_name(cand)
                    if c and len(c) > 3:
                        return c

    return "Perusahaan"

def clean_job_title(title: str) -> str:
    title = re.sub(r'\b(?:dengan\s+hormat|yang\s+dibuka|sebagaimana|pada\s+portal|di\s+tempat)\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\(PJLP\)', '', title, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', title).strip(' ,.-()')

def extract_job_title(text: str) -> str:
    pm = re.search(r'Perihal:\s*Lamaran\s*Pekerjaan\s*-\s*([^\n\r]+)', text, re.IGNORECASE)
    if pm:
        c = clean_job_title(pm.group(1))
        if len(c) > 2:
            return c

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
            c = clean_job_title(m.group(1))
            if len(c) > 2 and len(c) < 50 and not c.lower().startswith('yang'):
                return c

    fb = " ".join(text.split()[:250]).lower()
    for role, syns in [
        ("Full Stack Developer", ["full stack developer", "fullstack developer", "full stack web developer"]),
        ("Software Engineer", ["software engineer"]),
        ("Backend Developer", ["back-end developer", "backend developer", "back end developer"]),
        ("Frontend Developer", ["front-end developer", "frontend developer"]),
        ("Mobile Developer", ["mobile developer", "android developer"]),
        ("IT Support / Staff", ["it tech support", "staff it", "staf it", "it support"])
    ]:
        if any(s in fb for s in syns):
            return role

    return "Software Engineer"

def extract_skills(text: str) -> list:
    tl = text.lower()
    detected = []
    for s in TECH_KEYWORDS:
        pat = r'(?<![a-zA-Z0-9_-])' + re.escape(s.lower()) + r'(?![a-zA-Z0-9_-])'
        if re.search(pat, tl):
            detected.append(s)
    return list(dict.fromkeys(detected))

def parse_pdf(filepath: str):
    reader = pypdf.PdfReader(filepath)
    raw_text = "\n".join([page.extract_text() or "" for page in reader.pages])
    cleaned_text = clean_extracted_text(raw_text)

    company = extract_company(cleaned_text, filepath)
    job_title = extract_job_title(cleaned_text)
    applied_date = extract_date(cleaned_text, filepath)
    portal = extract_portal(cleaned_text)
    skills = extract_skills(cleaned_text)

    skills_str = ", ".join(skills[:4]) if skills else "Web & Software Stack"
    summary = f"Lamaran posisi {job_title} di {company} via {portal} ({skills_str})."

    rel_path = filepath.replace("\\", "/")
    filename = os.path.basename(filepath)

    return {
        "file_name": filename,
        "file_path": rel_path,
        "company_name": company,
        "job_title": job_title,
        "status": "applied",
        "applied_date": applied_date,
        "source_portal": portal,
        "key_skills": skills,
        "summary": summary,
        "cover_letter": cleaned_text.strip(),
        "cover_letter_preview": cleaned_text[:350].strip()
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(json.dumps({"error": f"File not found: {filepath}"}))
        sys.exit(1)

    try:
        data = parse_pdf(filepath)
        print(json.dumps(data, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
