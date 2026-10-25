import os
import re
import sys
import json
import pypdf
from datetime import datetime

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
    "Laravel", "Lumen", "Django", "FastAPI", "Golang", "Flutter", "Dart",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Node.js", "Express",
    "Tailwind", "Bootstrap", "Git", "REST API", "GraphQL", "Algolia", "Prisma"
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
        day_str, month_str, year_str = m.group(1), m.group(2).lower(), m.group(3)
        if month_str in MONTHS_MAP:
            day = int(day_str)
            month = MONTHS_MAP[month_str]
            return f"{year_str}-{month}-{day:02d}"
    try:
        mtime = os.path.getmtime(filepath)
        return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    except Exception:
        return "2026-07-01"

def extract_portal(text: str) -> str:
    text_lower = text.lower()
    for portal_name, keywords in PORTALS:
        for kw in keywords:
            if kw in text_lower:
                return portal_name
    return "Direct / Job Portal"

def clean_company_name(name: str, applicant_name: str = None) -> str:
    target_applicant = applicant_name or os.getenv('APPLICANT_NAME', '').strip()
    if target_applicant:
        name = re.sub(rf'[-_]?\s*{re.escape(target_applicant)}.*$', '', name, flags=re.IGNORECASE).strip()
    name = re.sub(r'[-_]?\s*(?:cv|resume|portfolio|portofolio|kandidat|pelamar|applicant|candidate|surat\s*lamaran).*$', '', name, flags=re.IGNORECASE).strip()
    name = re.sub(r'[-_]?\s*alfiansyah.*$', '', name, flags=re.IGNORECASE).strip()
    name = re.split(r'\b(?:jln\.?|jl\.?|jalan|gedung|lantai|no\.\s*\d+)\b', name, flags=re.IGNORECASE)[0].strip(' ,.-')
    name = re.sub(r'^(?:hrd\s*(?:[/,&]\s*tim\s*rekrutmen)?\s*|panitia\s*rekrutmen\s*pjlp\s*|yth\.?\s*)', '', name, flags=re.IGNORECASE).strip(' ,.-')
    return name

def extract_company(text: str, filepath: str) -> str:
    base = os.path.splitext(os.path.basename(filepath))[0]
    fn_clean = re.sub(r'^(?:surat\s*lamaran\s*[-_]?\s*|cover\s*letter\s*[-_]?\s*)', '', base, flags=re.IGNORECASE).strip()
    fn_clean = clean_company_name(fn_clean)
    target_applicant = os.getenv('APPLICANT_NAME', '').strip().lower()
    is_applicant_token = bool(target_applicant and (target_applicant in fn_clean.lower() or target_applicant.replace(' ', '') in fn_clean.lower()))
    is_generic_token = fn_clean.lower() in ('kandidat', 'pelamar', 'resume', 'cv') or 'alfiansyah' in fn_clean.lower()

    if fn_clean and len(fn_clean) > 2 and not (is_applicant_token or is_generic_token):
        return fn_clean

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for i, line in enumerate(lines):
        if 'kepada yth' in line.lower():
            for j in range(i + 1, min(i + 5, len(lines))):
                candidate = lines[j]
                if any(x in candidate.lower() for x in ['pt', 'cv', 'sdn bhd', 'tbk', 'group', 'indonesia', 'tech', 'studio', 'pens', 'politeknik', 'universitas', 'sekolah']):
                    cand = clean_company_name(candidate)
                    if cand and len(cand) > 3:
                        return cand
    return fn_clean or "Perusahaan"

def clean_job_title(title: str) -> str:
    title = re.sub(r'\b(?:dengan\s+hormat|yang\s+dibuka|sebagaimana|pada\s+portal|di\s+tempat)\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\(PJLP\)', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+', ' ', title).strip(' ,.-()')
    return title

def extract_job_title(text: str) -> str:
    perihal_m = re.search(r'Perihal:\s*Lamaran\s*Pekerjaan\s*-\s*([^\n\r]+)', text, re.IGNORECASE)
    if perihal_m:
        cand = clean_job_title(perihal_m.group(1))
        if len(cand) > 2 and len(cand) < 60:
            return cand

    patterns = [
        r'(?:mengajukan\s+diri\s+sebagai|melamar\s+sebagai)\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk)',
        r'posisi\s+([A-Za-z0-9\s/&_-]+?)\s+(?:di\s+|pada\s+|sebagaimana|untuk|dalam)',
        r'position\s+of\s+([A-Za-z0-9\s/&_-]+?)\s+(?:at|in|with)',
        r'melamar\s+sebagai\s+([A-Za-z0-9\s/&_-]+?)(?:\s+di|\s+pada|\.|\,)'
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            cand = clean_job_title(m.group(1))
            if len(cand) > 2 and len(cand) < 50 and not cand.lower().startswith('yang'):
                return cand

    first_block = " ".join(text.split()[:250]).lower()
    common_roles = [
        ("Full Stack Developer", ["full stack developer", "fullstack developer", "full stack web developer"]),
        ("Backend Developer", ["backend developer", "back-end developer"]),
        ("Frontend Developer", ["frontend developer", "front-end developer"]),
        ("Software Engineer", ["software engineer"]),
        ("IT Software Staff", ["staff it software", "it developer staff", "staf it"]),
        ("Programmer", ["programmer", "junior programmer"]),
        ("Mobile Developer", ["mobile developer", "android developer"]),
        ("Web Developer", ["web developer"])
    ]
    for role_name, synonyms in common_roles:
        for syn in synonyms:
            if syn in first_block:
                return role_name

    return "Software Engineer"

def extract_skills(text: str) -> list:
    text_lower = text.lower()
    detected = []
    for skill in TECH_KEYWORDS:
        if skill.lower() in ("r", "c"):
            pat = r'\b(?:bahasa\s+' + re.escape(skill.lower()) + r'|' + re.escape(skill.lower()) + r'\s+(?:programming|language|studio))\b'
        elif skill.lower() == "go":
            pat = r'\b(?:golang|go\s+(?:language|programming|developer|engineer))\b'
        else:
            pat = r'(?<![a-zA-Z0-9_-])' + re.escape(skill.lower()) + r'(?![a-zA-Z0-9_-])'
        if re.search(pat, text_lower):
            detected.append(skill)
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

    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', os.path.splitext(filename)[0]).strip('_').lower()
    app_id = f"app_{safe_name[:40]}_{applied_date.replace('-', '')}"

    return {
        "id": app_id,
        "company_name": company,
        "job_title": job_title,
        "status": "applied",
        "applied_date": applied_date,
        "source_portal": portal,
        "key_skills": skills,
        "summary": summary,
        "file_path": rel_path,
        "file_name": filename,
        "cover_letter": cleaned_text.strip(),
        "cover_letter_preview": cleaned_text[:350].strip(),
        "notes": f"Diimpor dari berkas: {filename} | Portal: {portal}",
        "createdAt": f"{applied_date}T00:00:00.000Z"
    }

def get_all_pdf_files():
    scan_folders = [
        os.path.join("data", "resume"),
        os.path.join("data", "resume", "New folder")
    ]
    all_files = []
    seen = set()
    for folder in scan_folders:
        if os.path.exists(folder):
            for f in sorted(os.listdir(folder)):
                if f.lower().endswith(".pdf") and not f.startswith("CV_"):
                    full_p = os.path.join(folder, f)
                    norm_k = os.path.abspath(full_p).lower()
                    if norm_k not in seen:
                        seen.add(norm_k)
                        all_files.append(full_p)
    return all_files

def main():
    json_path = os.path.join("data", "parsed_applications.json")
    all_files = get_all_pdf_files()

    parsed = []
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                parsed = json.load(f)
        except Exception:
            parsed = []

    # Map parsed files by normalized filename and rel_path
    parsed_files = set()
    for item in parsed:
        fn = item.get("file_name") or os.path.basename(item.get("file_path", ""))
        if fn:
            parsed_files.add(fn.lower())

    unparsed_files = [f for f in all_files if os.path.basename(f).lower() not in parsed_files]

    arg = sys.argv[1] if len(sys.argv) > 1 else "--status"

    if arg == "--status":
        out = {
            "totalFiles": len(all_files),
            "parsedCount": len(parsed),
            "unparsedCount": len(unparsed_files),
            "unparsedFiles": [os.path.basename(f) for f in unparsed_files[:10]]
        }
        print(json.dumps(out, indent=2))
        return

    if arg == "--reset":
        limit = 25
        if len(sys.argv) > 2:
            try:
                limit = int(sys.argv[2])
            except Exception:
                limit = 25
        
        reset_items = []
        for f in all_files[:limit]:
            try:
                reset_items.append(parse_pdf(f))
            except Exception:
                pass
        reset_items.sort(key=lambda x: x["applied_date"], reverse=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(reset_items, f, indent=2, ensure_ascii=False)
        out = {
            "success": True,
            "message": f"Reset antrean ke {len(reset_items)} berkas awal.",
            "totalFiles": len(all_files),
            "parsedCount": len(reset_items),
            "unparsedCount": len(all_files) - len(reset_items)
        }
        print(json.dumps(out, indent=2))
        return

    # Parse batch: e.g. --batch-size 5
    batch_size = 5
    if arg == "--batch-size" and len(sys.argv) > 2:
        val = sys.argv[2]
        if val.lower() == "all":
            batch_size = len(unparsed_files)
        else:
            try:
                batch_size = int(val)
            except Exception:
                batch_size = 5
    elif arg.startswith("--batch-size="):
        val = arg.split("=")[1]
        if val.lower() == "all":
            batch_size = len(unparsed_files)
        else:
            try:
                batch_size = int(val)
            except Exception:
                batch_size = 5

    files_to_parse = unparsed_files[:batch_size]

    if not files_to_parse:
        out = {
            "success": True,
            "message": "Semua berkas resume telah selesai di-parse!",
            "batchProcessed": 0,
            "newlyParsed": [],
            "totalParsed": len(parsed),
            "unparsedCount": 0
        }
        print(json.dumps(out, indent=2))
        return

    newly_parsed = []
    for filepath in files_to_parse:
        try:
            item = parse_pdf(filepath)
            newly_parsed.append(item)
        except Exception as e:
            print(f"Error parsing {filepath}: {e}", file=sys.stderr)

    # Append to parsed applications
    updated_all = newly_parsed + parsed
    seen_ids = set()
    deduped = []
    for it in updated_all:
        if it["id"] not in seen_ids:
            seen_ids.add(it["id"])
            deduped.append(it)

    deduped.sort(key=lambda x: x["applied_date"], reverse=True)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(deduped, f, indent=2, ensure_ascii=False)

    remaining_unparsed = len(all_files) - len(deduped)

    out = {
        "success": True,
        "message": f"Berhasil mem-parse {len(newly_parsed)} berkas resume baru!",
        "batchProcessed": len(newly_parsed),
        "newlyParsed": newly_parsed,
        "totalParsed": len(deduped),
        "unparsedCount": max(0, remaining_unparsed)
    }
    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()
