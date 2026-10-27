import re
from typing import List, Tuple, Dict
from ..config import TECH_KEYWORDS, CATEGORIZED_TAXONOMY, KEYWORD_SYNONYMS
from ..models.project import ProjectItem
from ..models.job_analysis import MatchedProject

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
            # Normalize to canonical synonym if available
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
) -> Tuple[int, List[str], str]:
    """
    Calculate a sophisticated multi-factor matching score between a portfolio project and a job.
    Weights:
        - Technical Stack Alignment: 45%
        - Role & Title Relevance: 25%
        - Quantifiable Achievements & Metrics: 15%
        - Domain & Text Context: 15%
    """
    job_desc_lower = job_desc.lower()
    proj_skills = [t.lower() for t in project.technologies]
    
    # 1. Match Skills (considering synonyms)
    matched_skills = []
    for skill in job_skills:
        skill_lower = skill.lower()
        canonical_job_skill = KEYWORD_SYNONYMS.get(skill_lower, skill_lower)
        
        found = False
        for ps in proj_skills:
            canonical_ps = KEYWORD_SYNONYMS.get(ps, ps)
            if canonical_job_skill == canonical_ps or canonical_job_skill in ps or ps in canonical_job_skill:
                matched_skills.append(skill)
                found = True
                break
                
        if not found and skill_lower in project.description.lower():
            matched_skills.append(skill)
            
    matched_skills = list(dict.fromkeys(matched_skills))
    
    # Factor A: Technical Stack Score (0 - 45)
    stack_score = 0
    if job_skills:
        ratio = len(matched_skills) / max(len(job_skills), 1)
        stack_score = int(min(45, ratio * 55))
    else:
        stack_score = 25
        
    # Factor B: Role & Title Semantic Overlap (0 - 25)
    role_score = 0
    role_tokens = ["frontend", "backend", "fullstack", "mobile", "devops", "cloud", "data", "machine learning", "ai", "lead", "senior", "engineer", "developer", "architect"]
    job_title_lower = job_title.lower()
    proj_role_lower = (project.role or "").lower()
    
    # Title matching
    for token in role_tokens:
        if token in job_title_lower and (token in proj_role_lower or token in project.title.lower()):
            role_score += 12
            
    if not role_score and (job_title_lower in proj_role_lower or proj_role_lower in job_title_lower):
        role_score = 20
    role_score = min(25, role_score)
    
    # Factor C: Measurable Achievements & Metrics (0 - 15)
    metric_score = 0
    if project.achievements:
        achieve_text = project.achievements.strip()
        has_numbers = bool(re.search(r'\d+', achieve_text))
        has_percentage = "%" in achieve_text
        has_keywords = any(kw in achieve_text.lower() for kw in ["meningkat", "optimasi", "reduksi", "hemat", "efisiensi", "skala", "users", "transaksi", "kecepatan"])
        
        if has_percentage or (has_numbers and has_keywords):
            metric_score = 15
        elif has_numbers or len(achieve_text) > 20:
            metric_score = 10
        else:
            metric_score = 5
            
    # Factor D: Domain & Keyword Context Overlap (0 - 15)
    context_score = 0
    combined_proj = f"{project.title} {project.category} {project.description}".lower()
    domain_overlap = 0
    for word in re.findall(r'\b[a-z]{4,}\b', job_desc_lower):
        if word in combined_proj:
            domain_overlap += 1
    context_score = min(15, domain_overlap)
    
    total_raw = stack_score + role_score + metric_score + context_score
    final_score = min(98, max(20, total_raw))
    
    # Formulate contextual evidence reason
    reasons = []
    if matched_skills:
        reasons.append(f"Stack selaras ({', '.join(matched_skills[:3])})")
    if role_score >= 12:
        reasons.append(f"Peran relevan sebagai {project.role or 'Engineer'}")
    if metric_score >= 10:
        snippet = project.achievements.strip()
        if len(snippet) > 60:
            snippet = snippet[:57] + "..."
        reasons.append(f"Metrik nyata: '{snippet}'")
    elif project.category:
        reasons.append(f"Kategori domain {project.category}")
        
    reason_str = " | ".join(reasons) if reasons else "Portofolio relevan dengan pengembangan rekayasa perangkat lunak."
    
    return final_score, matched_skills, reason_str

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
