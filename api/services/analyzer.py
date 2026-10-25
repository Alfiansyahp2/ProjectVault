import re
from typing import List, Tuple
from ..config import TECH_KEYWORDS
from ..models.project import ProjectItem
from ..models.job_analysis import AnalyzeJobRequest, AnalyzeJobResponse, MatchedProject
from .prompt_builder import build_ai_prompt

def extract_keywords_from_text(text: str) -> List[str]:
    """Extract detected technical keywords and skills from text."""
    text_lower = text.lower()
    detected = []
    
    for kw in TECH_KEYWORDS:
        pattern = r'(?<![a-zA-Z0-9_-])' + re.escape(kw) + r'(?![a-zA-Z0-9_-])'
        if re.search(pattern, text_lower):
            detected.append(kw)
            
    extra_terms = ["ui", "ux", "seo", "etl", "qa", "tdd", "ddd", "saas", "llm"]
    for term in extra_terms:
        if term not in detected and re.search(r'\b' + term + r'\b', text_lower):
            detected.append(term.upper())
            
    return list(dict.fromkeys(detected))

def calculate_project_match(project: ProjectItem, job_desc: str, job_skills: List[str]) -> Tuple[int, List[str], str]:
    """Calculate matching score between a candidate's portfolio project and a job."""
    job_desc_lower = job_desc.lower()
    proj_skills = [t.lower() for t in project.technologies]
    
    matched_skills = []
    for skill in job_skills:
        skill_lower = skill.lower()
        if any(skill_lower in ps or ps in skill_lower for ps in proj_skills):
            matched_skills.append(skill)
        elif skill_lower in project.description.lower():
            matched_skills.append(skill)
            
    matched_skills = list(dict.fromkeys(matched_skills))
    
    # Base score
    score = 0
    if job_skills:
        skill_ratio = len(matched_skills) / max(len(job_skills), 1)
        score += int(skill_ratio * 70)
    else:
        score += 40
        
    # Bonus if project title or description mentions keywords from job
    proj_text = f"{project.title} {project.description} {project.role}".lower()
    overlap_count = 0
    for word in re.findall(r'\b\w{4,}\b', job_desc_lower):
        if word in proj_text:
            overlap_count += 1
            
    score += min(20, overlap_count * 2)
    
    # Bonus for quantifiable achievements
    if project.achievements and len(project.achievements.strip()) > 10:
        score += 10
        
    final_score = min(98, max(15, score))
    
    # Generate reason
    if matched_skills:
        reason = f"Menggunakan teknologi yang dibutuhkan: {', '.join(matched_skills[:4])}."
        if project.achievements:
            reason += f" Memiliki bukti hasil nyata: '{project.achievements[:70]}...'."
    else:
        reason = f"Proyek relevan dalam domain {project.category or 'pengembangan software'}."
        
    return final_score, matched_skills, reason

def generate_cover_letter(
    applicant_name: str,
    job_title: str,
    company_name: str,
    top_projects: List[MatchedProject],
    detected_skills: List[str],
    language: str = "id"
) -> str:
    """Generate a high-conversion, proof-backed cover letter draft."""
    if language == "en":
        greeting = f"Dear Hiring Team at {company_name},"
        intro = (
            f"I am writing to express my strong interest in the {job_title} position at {company_name}. "
            f"With my hands-on background and proven project delivery, I am confident in bringing immediate value to your team."
        )
        
        proj_bullets = []
        for mp in top_projects[:3]:
            p = mp.project
            tech_str = ", ".join(p.technologies) if p.technologies else "modern technologies"
            metric = f" ({p.achievements})" if p.achievements else ""
            proj_bullets.append(f"- **{p.title}** ({p.role}): Built using {tech_str}. {p.description}{metric}")
            
        if proj_bullets:
            proj_body = "Here are relevant projects that demonstrate my qualifications:\n" + "\n".join(proj_bullets)
        else:
            proj_body = (
                "Throughout my technical journey, I have cultivated a strong foundation in designing, developing, "
                "and maintaining reliable software applications. I am eager to apply my problem-solving mindset and dedication "
                "to create impactful results for your upcoming initiatives."
            )
        
        closing = (
            f"Given your requirements in {', '.join(detected_skills[:5]) if detected_skills else 'these core areas'}, "
            f"my hands-on experience allows me to ramp up quickly and solve real-world problems.\n\n"
            f"I would welcome the opportunity to discuss how my skillset aligns with {company_name}'s goals. "
            f"Thank you for your time and consideration.\n\nSincerely,\n{applicant_name}"
        )
        return f"{greeting}\n\n{intro}\n\n{proj_body}\n\n{closing}"
    else:
        # Bahasa Indonesia (default)
        greeting = f"Yth. Tim Rekrutmen {company_name},"
        intro = (
            f"Saya menulis surat ini untuk menyatakan ketertarikan saya terhadap posisi **{job_title}** di **{company_name}**. "
            f"Berdasarkan pengalaman langsung saya dalam menyelesaikan berbagai proyek perangkat lunak dan solusi digital, "
            f"saya yakin dapat memberikan kontribusi nyata bagi perkembangan tim Anda."
        )
        
        proj_bullets = []
        for mp in top_projects[:3]:
            p = mp.project
            tech_str = ", ".join(p.technologies) if p.technologies else "teknologi terkait"
            achievement_text = f" Hasil nyata: {p.achievements}." if p.achievements else ""
            proj_bullets.append(
                f"• **{p.title}** (Peran: {p.role})\n"
                f"  Teknologi: {tech_str}\n"
                f"  Uraian: {p.description}.{achievement_text}"
            )
            
        skills_highlight = f", khususnya dalam pemanfaatan {', '.join(detected_skills[:5])}" if detected_skills else ""

        if proj_bullets:
            proj_body = "Berikut beberapa proyek terkait yang membuktikan kompetensi saya:\n\n" + "\n\n".join(proj_bullets)
            transition = f"Dengan latar belakang pengalaman praktis tersebut{skills_highlight}, "
        else:
            proj_body = (
                "Sepanjang perjalanan profesional dan eksplorasi teknis saya, saya telah membangun fondasi yang kokoh dalam "
                "merancang, mengimplementasikan, serta mengoptimalkan solusi perangkat lunak. Saya sangat antusias untuk menerapkan dedikasi, "
                "kemampuan adaptasi cepat, dan etos kerja berorientasi hasil ini demi kesuksesan inisiatif tim Anda."
            )
            transition = f"Dengan komitmen pembelajaran berkelanjutan dan kompetensi teknis tersebut{skills_highlight}, "
        
        closing = (
            f"{transition}"
            f"saya siap beradaptasi dengan cepat dan berkolaborasi secara produktif bersama {company_name}.\n\n"
            f"Saya sangat antusias untuk berdiskusi lebih lanjut mengenai bagaimana portofolio dan keahlian saya dapat mendukung target perusahaan Anda. "
            f"Terima kasih atas waktu dan kesempatan yang diberikan.\n\n"
            f"Hormat saya,\n{applicant_name}"
        )
        return f"{greeting}\n\n{intro}\n\n{proj_body}\n\n{closing}"

def analyze_job_posting(payload: AnalyzeJobRequest) -> AnalyzeJobResponse:
    """Core analysis orchestrator: extracts skills, ranks matching projects, and crafts drafts."""
    # 1. Extract skills from job description
    detected_skills = extract_keywords_from_text(payload.job_description)
    
    # 2. Match each project
    matched_projects: List[MatchedProject] = []
    all_user_skills: List[str] = []
    
    for proj in payload.projects:
        score, matched_kw, reason = calculate_project_match(proj, payload.job_description, detected_skills)
        matched_projects.append(MatchedProject(
            project=proj,
            match_score=score,
            matched_skills=matched_kw,
            relevance_reason=reason
        ))
        for t in proj.technologies:
            all_user_skills.append(t.lower())
            
    # Sort projects by score descending
    matched_projects.sort(key=lambda x: x.match_score, reverse=True)
    
    # 3. Identify skill gaps
    all_user_skills_set = set(all_user_skills)
    skill_gaps = []
    for skill in detected_skills:
        if not any(skill.lower() in us or us in skill.lower() for us in all_user_skills_set):
            skill_gaps.append(skill)
            
    # 4. Overall match percentage
    if detected_skills:
        covered_count = len(detected_skills) - len(skill_gaps)
        overall_match = int((covered_count / len(detected_skills)) * 80)
        if matched_projects and matched_projects[0].match_score > 70:
            overall_match += 15
        overall_match = min(98, max(20, overall_match))
    elif matched_projects:
        overall_match = matched_projects[0].match_score
    else:
        overall_match = 50

    # 5. Generate cover letter draft
    top_projects = matched_projects[:3] if matched_projects else []
    cover_letter = generate_cover_letter(
        applicant_name=payload.applicant_name or "Pelamar",
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan",
        top_projects=top_projects,
        detected_skills=detected_skills,
        language=payload.language or "id"
    )
    
    # 6. Generate AI Mega Prompt
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
        detected_skills=detected_skills,
        skill_gaps=skill_gaps,
        matched_projects=matched_projects,
        cover_letter_draft=cover_letter,
        ai_prompt_context=ai_prompt
    )
