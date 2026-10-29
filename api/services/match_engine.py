import re
from typing import List, Tuple, Dict
from ..config import TECH_KEYWORDS, CATEGORIZED_TAXONOMY, KEYWORD_SYNONYMS
from ..models.project import ProjectItem
from ..models.job_analysis import MatchedProject, ScoreBreakdown

# Bobot Ilmiah AHP (Analytic Hierarchy Process) - Consistency Ratio CR = 0.0023 < 0.10
AHP_WEIGHTS: Dict[str, float] = {
    "tech_stack": 0.37,   # C1: Core Tech Stack Alignment
    "description": 0.28,  # C2: Feature & Context Relevance
    "role_domain": 0.20,  # C3: Role & Architecture Alignment
    "complexity": 0.15,   # C4: Complexity & Quality Proof
}

def extract_keywords_from_text(text: str) -> Tuple[List[str], Dict[str, List[str]]]:
    """
    Extract detected technical keywords and skills from text and group by taxonomy category.
    Returns:
        (detected_skills_list, categorized_skills_dict)
    """
    text_lower = text.lower()
    detected_raw = []
    
    # 1. Regex search for all known taxonomy keywords
    for kw in TECH_KEYWORDS:
        pattern = r'(?<![a-zA-Z0-9_#+.-])' + re.escape(kw) + r'(?![a-zA-Z0-9_#+.-])'
        if re.search(pattern, text_lower):
            normalized = KEYWORD_SYNONYMS.get(kw, kw)
            detected_raw.append(normalized)
            
    # Additional high-signal general keywords
    extra_terms = ["ui", "ux", "seo", "etl", "qa", "tdd", "ddd", "saas", "llm", "rag", "ci/cd", "rest api"]
    for term in extra_terms:
        if term not in detected_raw and re.search(r'\b' + re.escape(term) + r'\b', text_lower):
            detected_raw.append(term.upper())
            
    detected_skills = list(dict.fromkeys(detected_raw))
    
    # 2. Group into categories
    categorized: Dict[str, List[str]] = {}
    for cat_name, cat_keywords in CATEGORIZED_TAXONOMY.items():
        cat_matches = []
        cat_keywords_lower = [k.lower() for k in cat_keywords]
        for skill in detected_skills:
            skill_lower = skill.lower()
            if skill_lower in cat_keywords_lower or any(skill_lower == KEYWORD_SYNONYMS.get(k, k) for k in cat_keywords_lower):
                cat_matches.append(skill)
        if cat_matches:
            categorized[cat_name] = list(dict.fromkeys(cat_matches))
            
    return detected_skills, categorized

def calculate_project_match(
    project: ProjectItem,
    job_desc: str,
    job_skills: List[str],
    job_title: str = ""
) -> Tuple[int, List[str], str, ScoreBreakdown]:
    """
    Menghitung skor kecocokan proyek terhadap lowongan menggunakan metode Hibrida AHP-SAW.
    Mengembalikan: (final_score, matched_skills, relevance_reason, score_breakdown)
    """
    job_desc_lower = job_desc.lower()
    proj_skills = [t.lower() for t in project.technologies]
    
    # 1. Kriteria C1: Core Tech Stack Alignment (Bobot 37%)
    matched_skills = []
    for skill in job_skills:
        skill_lower = skill.lower()
        canonical_job = KEYWORD_SYNONYMS.get(skill_lower, skill_lower)
        found = False
        for ps in proj_skills:
            canonical_ps = KEYWORD_SYNONYMS.get(ps, ps)
            if canonical_job == canonical_ps or canonical_job in ps or ps in canonical_job:
                matched_skills.append(skill)
                found = True
                break
        if not found and skill_lower in project.description.lower():
            matched_skills.append(skill)
            
    matched_skills = list(dict.fromkeys(matched_skills))
    
    if job_skills:
        ratio = len(matched_skills) / max(len(job_skills), 1)
        r_tech = min(1.0, ratio * 1.25)
    else:
        r_tech = 0.55
        
    # 2. Kriteria C2: Feature & Context Relevance (Bobot 28%)
    combined_proj = f"{project.title} {project.category or ''} {project.description}".lower()
    words = re.findall(r'\b[a-z]{4,}\b', job_desc_lower)
    domain_overlap = sum(1 for w in words if w in combined_proj)
    r_desc = min(1.0, max(0.20, domain_overlap / 12.0))
    
    # 3. Kriteria C3: Role & Architecture Alignment (Bobot 20%)
    role_tokens = [
        "frontend", "backend", "fullstack", "mobile", "devops", "cloud",
        "data", "machine learning", "ai", "lead", "senior", "engineer", "developer", "architect"
    ]
    job_title_lower = job_title.lower()
    proj_role_lower = (project.role or "").lower()
    proj_title_lower = project.title.lower()
    
    role_token_matches = sum(
        1 for token in role_tokens
        if token in job_title_lower and (token in proj_role_lower or token in proj_title_lower)
    )
    
    if role_token_matches >= 2 or (job_title_lower and job_title_lower in proj_role_lower):
        r_role = 1.0
    elif role_token_matches == 1:
        r_role = 0.85
    elif project.category and project.category.lower() in job_title_lower:
        r_role = 0.70
    else:
        r_role = 0.40
        
    # 4. Kriteria C4: Complexity & Quality Proof (Bobot 15%)
    r_qual = 0.35
    if project.achievements:
        achieve_text = project.achievements.strip().lower()
        has_numbers = bool(re.search(r'\d+', achieve_text))
        has_percentage = "%" in achieve_text
        has_keywords = any(kw in achieve_text for kw in [
            "meningkat", "optimasi", "reduksi", "hemat", "efisiensi", "skala", "users", "transaksi", "kecepatan"
        ])
        if has_percentage or (has_numbers and has_keywords):
            r_qual = 0.85
        elif has_numbers or len(achieve_text) > 20:
            r_qual = 0.65
        else:
            r_qual = 0.50
            
    if project.repo_url:
        r_qual += 0.10
    if project.demo_url:
        r_qual += 0.10
    r_qual = min(1.0, r_qual)
    
    # Agregasi Linier Model SAW dengan Bobot AHP
    saw_score = (
        (AHP_WEIGHTS["tech_stack"] * r_tech) +
        (AHP_WEIGHTS["description"] * r_desc) +
        (AHP_WEIGHTS["role_domain"] * r_role) +
        (AHP_WEIGHTS["complexity"] * r_qual)
    ) * 100.0
    
    final_score = int(min(98, max(20, round(saw_score))))
    
    breakdown = ScoreBreakdown(
        tech_stack=round(r_tech * 100.0, 1),
        description=round(r_desc * 100.0, 1),
        role_domain=round(r_role * 100.0, 1),
        complexity=round(r_qual * 100.0, 1),
    )
    
    # Formulasi narasi alasan relevansi
    reasons = []
    if matched_skills:
        reasons.append(f"Stack selaras ({', '.join(matched_skills[:3])})")
    if r_role >= 0.70:
        reasons.append(f"Peran relevan ({project.role or 'Engineer'})")
    if r_qual >= 0.75 and project.achievements:
        snippet = project.achievements.strip()
        if len(snippet) > 60:
            snippet = snippet[:57] + "..."
        reasons.append(f"Metrik nyata: '{snippet}'")
    elif project.category:
        reasons.append(f"Kategori domain {project.category}")
        
    reason_str = " | ".join(reasons) if reasons else "Portofolio relevan dengan pengembangan rekayasa perangkat lunak."
    
    return final_score, matched_skills, reason_str, breakdown

def generate_interview_tips(
    top_projects: List[MatchedProject],
    detected_skills: List[str],
    skill_gaps: List[str],
    job_title: str,
    company_name: str
) -> List[str]:
    """Generate high-impact talking points and interview strategies based on analysis."""
    tips = []
    
    # Tip 1: Top Project Proof
    if top_projects:
        best_proj = top_projects[0].project
        best_tech = ", ".join(best_proj.technologies[:3]) if best_proj.technologies else "modern stack"
        metric_str = f" dan tekankan metrik hasil: '{best_proj.achievements}'" if best_proj.achievements else ""
        tips.append(
            f"Sorot proyek '{best_proj.title}' sebagai bukti utama saat wawancara. Ceritakan bagaimana Anda mengimplementasikan {best_tech}{metric_str} untuk membuktikan kesiapan menangani tanggung jawab {job_title}."
        )
        
    # Tip 2: Addressing Skill Gaps confidently
    if skill_gaps:
        top_gap = skill_gaps[0]
        related_skills = [s for s in detected_skills if s != top_gap][:2]
        related_str = f" fondasi di {', '.join(related_skills)} dan" if related_skills else ""
        tips.append(
            f"Strategi Gap ({top_gap}): Jika interviewer menanyakan pengalaman di {top_gap}, jawablah dengan jujur namun proaktif: 'Meskipun di proyek sebelumnya saya lebih fokus pada{related_str} ekosistem terkait, arsitektur dasar dan pola kerjanya serupa, dan saya terbukti mampu menguasai tools baru secara produktif dalam hitungan hari.'"
        )
    else:
        tips.append(
            "Portofolio Anda mencakup seluruh keahlian teknis yang dibutuhkan lowongan ini. Fokuskan narasi wawancara pada kualitas kode, efisiensi arsitektur, dan kepemilikan solusi bisnis."
        )
        
    # Tip 3: High-Value Reverse Interview Question
    tips.append(
        f"Pertanyaan bernilai tinggi untuk Anda tanyakan ke tim {company_name}: 'Bagaimana roadmap teknis dan tantangan skalabilitas terbesar yang sedang dihadapi tim engineering {company_name} dalam 6-12 bulan ke depan?'"
    )
    
    return tips
