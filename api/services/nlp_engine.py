import os
import re
from typing import Dict, Any, List, Optional
import pypdf

from ..config import MONTHS_MAP, TECH_KEYWORDS, PORTALS, KEYWORD_SYNONYMS
from ..models.resume import ResumeItem
from .text_cleaner import clean_extracted_text, is_generic_or_screenshot_hint

def extract_date(text: str) -> Optional[str]:
    """Extract and normalize application date from Indonesian or English date strings."""
    pattern = r'(\d{1,2})\s+([a-zA-Z]+)\s+(202[0-9])'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    for m in matches:
        day_str, month_str, year_str = m.group(1), m.group(2).lower(), m.group(3)
        if month_str in MONTHS_MAP:
            return f"{year_str}-{MONTHS_MAP[month_str]}-{int(day_str):02d}"
    return None

def extract_portal(text: str) -> str:
    """Classify the job source portal mentioned in the document."""
    text_lower = text.lower()
    for portal_name, keywords in PORTALS:
        for kw in keywords:
            if kw in text_lower:
                return portal_name
    return "Direct / Other"

def clean_company_name(name: str, applicant_name: Optional[str] = None) -> str:
    """Clean company name by removing address details, applicant names, and extra symbols."""
    target_applicant = applicant_name or os.getenv('APPLICANT_NAME', '').strip()
    if target_applicant:
        name = re.sub(rf'[-_]?\s*{re.escape(target_applicant)}.*$', '', name, flags=re.IGNORECASE).strip()

    name = re.sub(r'[-_]?\s*(?:cv|resume|portfolio|portofolio|kandidat|pelamar|applicant|candidate|surat\s*lamaran).*$', '', name, flags=re.IGNORECASE).strip()
    name = re.sub(r'[-_]?\s*alfiansyah.*$', '', name, flags=re.IGNORECASE).strip()
    name = re.split(r'\b(?:jln\.?|jl\.?|jalan|gedung|lantai|no\.\s*\d+)\b', name, flags=re.IGNORECASE)[0].strip(' ,.-')
    name = re.sub(r'^(?:hrd\s*(?:[/,&]\s*tim\s*rekrutmen)?\s*|panitia\s*rekrutmen\s*pjlp\s*|yth\.?\s*)', '', name, flags=re.IGNORECASE).strip(' ,.-')
    return name

def extract_company(text: str, filename: str) -> str:
    """Multi-strategy entity recognition for company name."""
    base = os.path.splitext(os.path.basename(filename))[0] if filename else ""
    if not is_generic_or_screenshot_hint(base):
        fn_clean = re.sub(r'^(?:surat\s*lamaran\s*[-_]?\s*|cover\s*letter\s*[-_]?\s*)', '', base, flags=re.IGNORECASE).strip()
        fn_clean = clean_company_name(fn_clean)
        if fn_clean and len(fn_clean) > 2 and not is_generic_or_screenshot_hint(fn_clean):
            return fn_clean

    pt_match = re.search(r'\b(PT\.?\s+[A-Z][a-zA-Z0-9\s,&-]{2,35}|CV\.?\s+[A-Z][a-zA-Z0-9\s,&-]{2,35}|[A-Z][a-zA-Z0-9\s]{2,30}\s+(?:Sdn\s+Bhd|Tbk|Inc|Corp|Group|Technologies|Studio))\b', text)
    if pt_match:
        matched_str = pt_match.group(1).split('.')[0] if not pt_match.group(1).startswith(('PT.', 'CV.')) else pt_match.group(1)
        if '.' in matched_str[3:]:
            matched_str = matched_str[:3] + matched_str[3:].split('.')[0]
        cand = clean_company_name(matched_str)
        if cand and len(cand) > 3:
            return cand

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for i, line in enumerate(lines):
        if 'kepada yth' in line.lower():
            for j in range(i + 1, min(i + 5, len(lines))):
                candidate = lines[j]
                if any(x in candidate.lower() for x in ['pt', 'cv', 'sdn bhd', 'tbk', 'group', 'indonesia', 'tech', 'studio']):
                    cand = clean_company_name(candidate)
                    if cand and len(cand) > 3:
                        return cand
                if 'hrd ' in candidate.lower():
                    cand = clean_company_name(candidate)
                    if len(cand) > 2:
                        return cand

    di_match = re.search(r'\b(?:di|at)\s+(PT\.?\s+[A-Z][a-zA-Z0-9\s]+|CV\.?\s+[A-Z][a-zA-Z0-9\s]+|[A-Z][a-zA-Z0-9\s]+(?:Sdn\s+Bhd|Tbk|Inc|Corp|Group))', text)
    if di_match:
        cand = clean_company_name(di_match.group(1))
        if cand:
            return cand

    if any(k in text.lower() for k in ["formulir data kandidat", "formulir lamaran", "microsoft forms", "google forms"]):
        return "Perusahaan (Formulir Lowongan)"

    return "Perusahaan"

def clean_job_title(title: str) -> str:
    """Clean extracted job title from noise words and formatting artifacts."""
    title = re.sub(r'\b(?:dengan\s+hormat|yang\s+dibuka|sebagaimana|pada\s+portal|di\s+tempat)\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\(PJLP\)', '', title, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', title).strip(' ,.-()')

def extract_job_title(text: str) -> str:
    """Extract target job title using contextual sliding windows, role ontology, and evidence."""
    perihal_m = re.search(r'Perihal:\s*Lamaran\s*Pekerjaan\s*-\s*([^\n\r]+)', text, re.IGNORECASE)
    if perihal_m:
        cand = clean_job_title(perihal_m.group(1))
        if len(cand) > 2 and len(cand) < 60:
            return cand

    patterns = [
        r'\b(Back\s*[-–—]?\s*End\s+(?:Developer|Engineer|Programmer))\b',
        r'\b(Front\s*[-–—]?\s*End\s+(?:Developer|Engineer|Programmer))\b',
        r'\b(Full\s*[-–—]?\s*Stack\s+(?:Developer|Engineer|Programmer))\b',
        r'(?:mengajukan\s+diri\s+sebagai|melamar\s+sebagai)\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk)',
        r'posisi\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk|dalam)',
        r'\*\s*Required\s*\n+([A-Za-z0-9\s/&_-]{3,45})\n+(?:[A-Z][a-zA-Z\s]+,|Full\s*time|IDR|Rp)'
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            cand = clean_job_title(m.group(1))
            if len(cand) > 2 and len(cand) < 50 and not cand.lower().startswith(('yang', 'formulir', 'surabaya', 'jakarta')):
                cand = re.sub(r'Back\s*[-–—]?\s*End', 'Backend', cand, flags=re.IGNORECASE)
                cand = re.sub(r'Front\s*[-–—]?\s*End', 'Frontend', cand, flags=re.IGNORECASE)
                cand = re.sub(r'Full\s*[-–—]?\s*Stack', 'Full Stack', cand, flags=re.IGNORECASE)
                return cand

    first_block = " ".join(text.split()[:250]).lower()
    common_roles = [
        ("Full Stack Developer", ["full stack developer", "fullstack developer", "full stack web developer"]),
        ("Backend Developer", ["backend developer", "back-end developer", "back end developer"]),
        ("Frontend Developer", ["frontend developer", "front-end developer", "front end developer"]),
        ("Software Engineer", ["software engineer"]),
        ("Programmer", ["programmer", "junior programmer", "middle programmer"]),
        ("Mobile Developer", ["mobile developer", "mobile developer staff", "android developer"]),
    ]
    for role_name, synonyms in common_roles:
        for syn in synonyms:
            if syn in first_block:
                return role_name

    text_lower = text.lower()
    scores = {"Backend Developer": 0, "Frontend Developer": 0, "Full Stack Developer": 0}
    for cue in ["backend", "back-end", "application's backend", "application backend", "php", "laravel", "codeigniter", "ci/laravel", "node.js", "mysql", "sql"]:
        if cue in text_lower:
            scores["Backend Developer"] += 1
    for cue in ["frontend", "front-end", "application's frontend", "ui/ux", "react", "vue", "tailwind", "css"]:
        if cue in text_lower:
            scores["Frontend Developer"] += 1

    best_role, best_score = max(scores.items(), key=lambda x: x[1])
    return best_role if best_score >= 2 else "Software Engineer"

def extract_skills(text: str) -> List[str]:
    """Extract technical keywords based on taxonomy ontology with false-positive prevention."""
    text_lower = text.lower()
    text_for_skills = re.sub(r'\b(?:east|west|central|north|south|pulau|provinsi)\s+java\b', 'loc_region', text_lower)
    text_for_skills = re.sub(r'\bjava\s+(?:timur|barat|tengah)\b', 'loc_region', text_for_skills)

    detected = []
    for skill in TECH_KEYWORDS:
        if skill in ("r", "c"):
            pat = r'\b(?:bahasa\s+' + re.escape(skill) + r'|' + re.escape(skill) + r'\s+(?:programming|language|studio))\b'
        elif skill == "go":
            pat = r'\b(?:golang|go\s+(?:language|programming|developer|engineer))\b'
        else:
            pat = r'(?<![a-zA-Z0-9_-])' + re.escape(skill) + r'(?![a-zA-Z0-9_-])'

        if re.search(pat, text_for_skills):
            detected.append(KEYWORD_SYNONYMS.get(skill, skill))

    return list(dict.fromkeys(detected))

def extract_job_metadata(text: str) -> Dict[str, Optional[str]]:
    """Extract salary, location, and employment type from job posting text."""
    loc_match = re.search(r'(?m)^([A-Za-z\s]+,\s*(?:East|West|Central|North|South)?\s*[A-Za-z\s]+)$', text)
    location = loc_match.group(1).strip() if loc_match else None

    type_match = re.search(r'\b(Full\s*time|Part\s*time|Contract|Internship|Freelance)\s*[-–—]?\s*(WFO|WFH|Hybrid|Remote)?\b', text, re.IGNORECASE)
    job_type = type_match.group(0).strip() if type_match else None

    salary_match = re.search(r'\b(?:IDR|Rp\.?)\s*[\d\.\,]+\s*[-–—]\s*(?:IDR|Rp\.?)?\s*[\d\.\,]+(?:\s*(?:per\s*month|per\s*bulan|/\s*bulan|/\s*month))?\b', text, re.IGNORECASE)
    salary_range = salary_match.group(0).strip() if salary_match else None

    return {"location": location, "job_type": job_type, "salary_range": salary_range}

def generate_extractive_summary(company: str, role: str, date: Optional[str], portal: str, skills: List[str], meta: Dict[str, Optional[str]]) -> str:
    """AI extractive summary combining entity anchors, location, salary, and skill focal points."""
    details = []
    if meta.get("location"):
        details.append(f"lokasi {meta['location']}")
    if meta.get("job_type"):
        details.append(meta['job_type'])
    if meta.get("salary_range"):
        details.append(f"gaji {meta['salary_range']}")

    extra_info = f" ({', '.join(details)})" if details else ""
    skills_part = f" dengan penekanan pada stack {', '.join(skills[:5])}" if skills else ""
    date_part = f" tertanggal {date}" if date else ""
    return f"Lamaran untuk posisi {role} di {company}{extra_info}{date_part} via {portal}{skills_part}."

def parse_raw_text(raw_text: str, source_hint: str = "Teks Mentah", filepath: str = "") -> Dict[str, Any]:
    """Parse raw text into a structured application dictionary."""
    cleaned_text = clean_extracted_text(raw_text or "")

    company = extract_company(cleaned_text, source_hint)
    job_title = extract_job_title(cleaned_text)
    applied_date = extract_date(cleaned_text) or "2026-01-01"
    portal = extract_portal(cleaned_text)
    skills = extract_skills(cleaned_text)
    meta = extract_job_metadata(cleaned_text)
    summary = generate_extractive_summary(company, job_title, applied_date, portal, skills, meta)

    rel_path = filepath.replace("\\", "/") if filepath else f"virtual/{source_hint}"

    return {
        "file_name": source_hint,
        "file_path": rel_path,
        "company_name": company,
        "job_title": job_title,
        "applied_date": applied_date,
        "source_portal": portal,
        "key_skills": skills,
        "location": meta.get("location"),
        "salary_range": meta.get("salary_range"),
        "job_type": meta.get("job_type"),
        "summary": summary,
        "status": "applied",
        "cover_letter_preview": cleaned_text[:350].strip(),
        "cover_letter": cleaned_text.strip()
    }

def parse_pdf_document(filepath: str) -> Dict[str, Any]:
    """Parse a single PDF document into a structured application dictionary."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    reader = pypdf.PdfReader(filepath)
    raw_text = "\n".join([page.extract_text() or "" for page in reader.pages])
    return parse_raw_text(raw_text, source_hint=os.path.basename(filepath), filepath=filepath)

def scan_all_resumes(base_dir: str = "data") -> List[Dict[str, Any]]:
    """Recursively scan all resume PDFs in base_dir and parse them."""
    results = []
    if not os.path.exists(base_dir):
        return results

    for root, _, files in os.walk(base_dir):
        for f in files:
            if f.lower().endswith(".pdf") and not f.startswith("CV_"):
                full_path = os.path.join(root, f)
                try:
                    results.append(parse_pdf_document(full_path))
                except Exception as e:
                    print(f"Warning: Failed to parse {full_path}: {e}")

    results.sort(key=lambda x: x["applied_date"], reverse=True)
    return results
