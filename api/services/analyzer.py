"""
Analyzer Orchestration Service:
Coordinates skill extraction, portfolio matching, interview preparation, and draft generation.
"""
from typing import List
from ..config import KEYWORD_SYNONYMS
from ..models.job_analysis import AnalyzeJobRequest, AnalyzeJobResponse, MatchedProject
from .prompt_builder import build_ai_prompt
from .cover_letter_generator import generate_cover_letter
from .match_engine import (
    extract_keywords_from_text,
    calculate_project_match,
    generate_interview_tips,
)

# Re-exports for 100% backwards compatibility
__all__ = [
    "analyze_job_posting",
    "generate_cover_letter",
    "extract_keywords_from_text",
    "calculate_project_match",
    "generate_interview_tips",
]

def analyze_job_posting(payload: AnalyzeJobRequest) -> AnalyzeJobResponse:
    """Core analysis orchestrator: extracts skills, ranks matching projects, and crafts drafts."""
    # 1. Extract skills from job description & group into taxonomy
    detected_skills, categorized_skills = extract_keywords_from_text(payload.job_description)
    
    # 2. Match each project
    matched_projects: List[MatchedProject] = []
    all_user_skills: List[str] = []
    
    for proj in payload.projects:
        score, matched_kw, reason, breakdown = calculate_project_match(
            project=proj,
            job_desc=payload.job_description,
            job_skills=detected_skills,
            job_title=payload.job_title
        )
        matched_projects.append(MatchedProject(
            project=proj,
            match_score=score,
            matched_skills=matched_kw,
            relevance_reason=reason,
            score_breakdown=breakdown
        ))
        for t in proj.technologies:
            all_user_skills.append(t.lower())
            
    # Sort projects by score descending
    matched_projects.sort(key=lambda x: x.match_score, reverse=True)
    
    # 3. Identify skill gaps
    all_user_skills_set = set(all_user_skills)
    skill_gaps = []
    for skill in detected_skills:
        skill_lower = skill.lower()
        canonical_job = KEYWORD_SYNONYMS.get(skill_lower, skill_lower)
        is_covered = any(
            canonical_job == KEYWORD_SYNONYMS.get(us, us) or canonical_job in us or us in canonical_job
            for us in all_user_skills_set
        )
        if not is_covered:
            skill_gaps.append(skill)
            
    # 4. Overall match percentage & Match Tier
    if detected_skills:
        covered_count = len(detected_skills) - len(skill_gaps)
        coverage_ratio = covered_count / max(len(detected_skills), 1)
        base_match = int(coverage_ratio * 70)
        
        # Bonus from top projects quality
        if matched_projects:
            top_score = matched_projects[0].match_score
            base_match += int((top_score / 100) * 25)
            
        overall_match = min(98, max(25, base_match))
    elif matched_projects:
        overall_match = matched_projects[0].match_score
    else:
        overall_match = 50
        
    # Match Tier & Summary
    if overall_match >= 82:
        match_tier = "Sangat Cocok (High Match)"
        match_summary = f"Portofolio Anda sangat selaras dengan {payload.job_title}. Pengalaman proyek Anda mencakup sebagian besar teknologi kunci yang dibutuhkan."
    elif overall_match >= 65:
        match_tier = "Peluang Kuat (Strong Match)"
        match_summary = f"Profil Anda memiliki peluang kompetitif tinggi untuk {payload.job_title}. Portofolio membuktikan kemampuan inti dengan beberapa skill gap minor."
    elif overall_match >= 45:
        match_tier = "Potensial dengan Penyesuaian (Moderate)"
        match_summary = f"Anda memiliki fondasi yang cukup untuk {payload.job_title}. Disarankan untuk menonjolkan kecepatan belajar dan proyek terdekat."
    else:
        match_tier = "Tantangan Portofolio (Low Match)"
        match_summary = f"Kriteria posisi {payload.job_title} memerlukan beberapa teknologi baru. Sorot kemampuan adaptasi dan fundamental rekayasa perangkat lunak Anda."

    # 5. Top Projects & Cover Letter
    top_projects = matched_projects[:3] if matched_projects else []
    cover_letter = generate_cover_letter(
        applicant_name=payload.applicant_name or "Pelamar",
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan",
        top_projects=top_projects,
        detected_skills=detected_skills,
        tone=payload.tone or "profesional",
        language=payload.language or "id"
    )
    
    # 6. Interview Tips & Strategies
    interview_tips = generate_interview_tips(
        top_projects=top_projects,
        detected_skills=detected_skills,
        skill_gaps=skill_gaps,
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan"
    )
    
    # 7. Generate AI Mega Prompt
    ai_prompt = build_ai_prompt(
        applicant_name=payload.applicant_name or "Pelamar",
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan",
        job_desc=payload.job_description,
        projects=payload.projects
    )
    
    return AnalyzeJobResponse(
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan",
        overall_match_percentage=overall_match,
        match_tier=match_tier,
        match_summary=match_summary,
        detected_skills=detected_skills,
        categorized_skills=categorized_skills,
        skill_gaps=skill_gaps,
        matched_projects=matched_projects,
        interview_tips=interview_tips,
        cover_letter_draft=cover_letter,
        ai_prompt_context=ai_prompt
    )
