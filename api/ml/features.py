import os
import re
from typing import List

STOP_WORDS = {
    "lampiran", "perihal", "surat", "lamaran", "pekerjaan", "kandidat",
    "pelamar", "resume", "cv", "portofolio", "portfolio", "indonesia",
    "surabaya", "jakarta", "dengan", "hormat", "yth", "kepada", "berdasarkan",
    "informasi", "lowongan", "jobstreet", "linkedin", "glints"
}

GENERIC_HINTS = {
    "teks salinan", "pasted text", "teks mentah", "teks masukan",
    "cli text input", "screenshot", "tangkapan layar", "image",
    "gambar", "virtual", "unknown", "document", "dokumen",
    "surat lamaran", "surat_lamaran", "surat-lamaran",
    "cover letter", "cover_letter", "cover-letter",
    "test", "sample", "test_sample", "test-sample"
}

LEGAL_SUFFIXES = ("pt", "pt.", "cv", "cv.", "inc", "corp", "tbk", "ltd", "technologies", "studio", "group")

def is_generic_filename(name: str) -> bool:
    """Check if filename is a placeholder or generic text indicator."""
    if not name:
        return True
    nl = name.strip().lower()
    if nl in GENERIC_HINTS or nl.startswith(('virtual/', 'gambar:', 'tmp_', 'tmp-', 'test_', 'test-')):
        return True
    if re.search(r'\b(?:screenshot|screencapture|screen_shot|tangkapan\s*layar|scan_\d+)\b', nl):
        return True
    return False

def normalize_text(text: str) -> str:
    """Normalize whitespace, punctuation artifacts, and address splices."""
    text = re.split(r'\b(?:jln\.?|jl\.?|jalan|gedung|lantai|no\.\s*\d+|di\s+[A-Za-z]+|at\s+[A-Za-z]+)\b', text, flags=re.IGNORECASE)[0]
    return re.sub(r'\s+', ' ', text).strip(' ,.-:;')

def extract_company_candidates(text: str, filename: str = "") -> List[str]:
    """Extract potential company name candidates using structural patterns."""
    candidates = []
    scan_text = (text or "")[:12000]
    lines = [l.strip() for l in scan_text.split('\n') if l.strip()]

    # 1. Filename candidate only if not generic
    if filename and not is_generic_filename(filename):
        base = os.path.splitext(os.path.basename(filename))[0]
        cleaned_fn = re.sub(r'^(?:surat\s*lamaran\s*[-_]?\s*|cover\s*letter\s*[-_]?\s*)', '', base, flags=re.IGNORECASE)
        cleaned_fn = re.sub(r'[-_]?\s*alfiansyah.*$', '', cleaned_fn, flags=re.IGNORECASE).strip()
        cleaned_fn = normalize_text(cleaned_fn)
        if len(cleaned_fn) > 2 and not is_generic_filename(cleaned_fn):
            candidates.append(cleaned_fn)

    # 2. Legal entity pattern matches
    pt_matches = re.findall(
        r'\b(?:PT\.?\s+[A-Z][a-zA-Z0-9\s,&-]{2,35}|CV\.?\s+[A-Z][a-zA-Z0-9\s,&-]{2,35}|[A-Z][a-zA-Z0-9\s]{2,30}\s+(?:Sdn\s+Bhd|Tbk|Inc|Corp|Group|Technologies|Studio))\b',
        scan_text
    )
    for m in pt_matches:
        cand = normalize_text(m)
        if len(cand) > 3:
            candidates.append(cand)

    # 3. Lines following salutations
    for i, line in enumerate(lines[:20]):
        line_l = line.lower()
        if any(cue in line_l for cue in ["kepada yth", "yth.", "hrd", "rekrutmen"]):
            for j in range(i + 1, min(i + 4, len(lines))):
                subline = normalize_text(lines[j])
                if len(subline) > 2 and len(subline.split()) <= 6:
                    candidates.append(subline)

    # 4. Sequences starting with 'di' or 'at'
    di_matches = re.findall(r'\b(?:di|at)\s+([A-Z][A-Za-z0-9\s,&-]{3,35})\b', scan_text)
    for m in di_matches:
        cand = normalize_text(m)
        if len(cand) > 3 and len(cand.split()) <= 5:
            candidates.append(cand)

    deduped = []
    seen = set()
    for c in candidates:
        c_clean = normalize_text(c)
        c_lower = c_clean.lower()
        if len(c_clean) >= 3 and c_lower not in seen and c_lower not in STOP_WORDS:
            seen.add(c_lower)
            deduped.append(c_clean)

    return deduped

def featurize_company_candidate(candidate: str, text: str, filename: str = "") -> List[float]:
    """Compute 10 numerical features for a company candidate."""
    cand_lower = candidate.lower()
    text_lower = text.lower()
    text_len = max(len(text), 1)

    norm_char_len = min(len(candidate), 60) / 60.0
    words = candidate.split()
    norm_word_count = min(len(words), 10) / 10.0
    has_legal = 1.0 if any(cand_lower.startswith(s + " ") or cand_lower.endswith(" " + s) or s in words for s in LEGAL_SUFFIXES) else 0.0

    idx = text_lower.find(cand_lower)
    pos_ratio = (idx / text_len) if idx >= 0 else 1.0

    alpha_chars = [c for c in candidate if c.isalpha()]
    upper_chars = [c for c in alpha_chars if c.isupper()]
    uppercase_ratio = (len(upper_chars) / len(alpha_chars)) if alpha_chars else 0.0

    preceded = 0.0
    if idx > 0:
        ctx = text_lower[max(0, idx - 60):idx]
        if any(h in ctx for h in ["yth", "kepada", "hrd", "rekrutmen", "di ", "at ", "pt "]):
            preceded = 1.0

    matches_fn = 0.0
    if filename and not is_generic_filename(filename):
        fn_clean = os.path.splitext(os.path.basename(filename))[0].lower()
        if cand_lower in fn_clean or fn_clean in cand_lower:
            matches_fn = 1.0

    has_stopword = 1.0 if any(w in STOP_WORDS for w in words) else 0.0
    is_all_caps = 1.0 if (len(candidate) >= 3 and candidate.isupper()) else 0.0
    in_header = 1.0 if (0 <= idx < 350) else 0.0

    return [norm_char_len, norm_word_count, has_legal, pos_ratio, uppercase_ratio, preceded, matches_fn, has_stopword, is_all_caps, in_header]

def extract_role_candidates(text: str) -> List[str]:
    """Extract potential target job title candidates from document text."""
    cands = []
    scan_text = (text or "")[:12000]
    # 1. Perihal pattern (stop strictly at newline or period)
    m = re.search(r'Perihal:\s*Lamaran\s*Pekerjaan\s*[-–—]?\s*([^\n\r.]+)', scan_text, re.IGNORECASE)
    if m:
        cands.append(m.group(1).strip())

    # 2. Posisi / melamar / mengajukan diri
    patterns = [
        r'(?:posisi|sebagai|lowongan)\s+([A-Za-z0-9\s/&_-]{3,45}?)\s+(?:di\s+|pada\s+|sebagaimana|untuk)',
        r'\b(Full\s*Stack\s+(?:Developer|Engineer|Programmer))\b',
        r'\b(Back\s*[-–—]?\s*End\s+(?:Developer|Engineer|Programmer))\b',
        r'\b(Front\s*[-–—]?\s*End\s+(?:Developer|Engineer|Programmer))\b',
        r'\b(Software\s+(?:Engineer|Developer))\b',
        r'\b(Junior\s+Programmer|Middle\s+Programmer|Programmer)\b',
        r'\b(Mobile\s+Developer|Android\s+Developer|Flutter\s+Developer)\b'
    ]
    for p in patterns:
        for match in re.finditer(p, scan_text, re.IGNORECASE):
            cands.append(match.group(1).strip())

    res, seen = [], set()
    for c in cands:
        clean = re.sub(r'[\(\)]', '', c).strip(' ,.-')
        if len(clean) > 2 and clean.lower() not in seen:
            seen.add(clean.lower())
            res.append(clean)
    return res

def featurize_role_candidate(cand: str, text: str) -> List[float]:
    """Compute 7 numerical features for a job title candidate."""
    cand_l = cand.lower()
    text_l = text.lower()
    idx = text_l.find(cand_l)
    text_len = max(len(text), 1)

    pos_ratio = (idx / text_len) if idx >= 0 else 1.0
    in_perihal = 1.0 if (0 <= idx < 250 and 'perihal' in text_l[:idx]) else 0.0

    ctx_before = text_l[max(0, idx - 50):idx] if idx >= 0 else ""
    preceded_posisi = 1.0 if any(k in ctx_before for k in ['posisi', 'sebagai', 'melamar', 'pada']) else 0.0

    ctx_past = text_l[max(0, idx - 80):idx] if idx >= 0 else ""
    is_past = 1.0 if any(k in ctx_past for k in ['pengalaman', 'rekam jejak', 'bekerja di', 'sevima']) else 0.0

    has_role_kw = 1.0 if any(k in cand_l for k in ['developer', 'engineer', 'programmer', 'staff', 'lead', 'specialist']) else 0.0
    words = len(cand.split())
    norm_words = min(words, 8) / 8.0
    in_first_lines = 1.0 if (0 <= idx < 400) else 0.0

    return [pos_ratio, in_perihal, preceded_posisi, is_past, has_role_kw, norm_words, in_first_lines]
