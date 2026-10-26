import re
from typing import List, Tuple, Dict
from ..config import TECH_KEYWORDS, CATEGORIZED_TAXONOMY, KEYWORD_SYNONYMS
from ..models.project import ProjectItem
from ..models.job_analysis import AnalyzeJobRequest, AnalyzeJobResponse, MatchedProject
from .prompt_builder import build_ai_prompt

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

def generate_cover_letter(
    applicant_name: str,
    job_title: str,
    company_name: str,
    top_projects: List[MatchedProject],
    detected_skills: List[str],
    tone: str = "profesional",
    language: str = "id"
) -> str:
    """
    Generate tailored, high-converting cover letter drafts in various tones and languages.
    Tones supported:
        - profesional: Formal, authoritative, metric & architecture focused
        - antusias: Energetic, high-ownership, passion for product vision
        - ringkas: Crisp, bullet-driven, scannable for busy recruiters
        - teknikal: In-depth engineering, systems design & stack trade-offs
    """
    tone = (tone or "profesional").lower()
    language = (language or "id").lower()
    
    # ------------------ ENGLISH TEMPLATES ------------------
    if language == "en":
        if tone == "ringkas":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "core stack"
                metric = f" -> {p.achievements}" if p.achievements else ""
                bullets.append(f"• **{p.title}** ({tech}): {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "• Proven track record in building and deploying production-grade systems."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I am writing to express my focused interest in the **{job_title}** position. With hands-on experience across {', '.join(detected_skills[:4]) if detected_skills else 'software engineering'}, "
                f"here is concrete proof of how I deliver measurable impact:\n\n"
                f"{bullet_block}\n\n"
                f"I am eager to bring this same engineering rigor to {company_name}. I look forward to connecting and discussing how my background aligns with your roadmap.\n\n"
                f"Best regards,\n{applicant_name}"
            )
            
        elif tone == "antusias":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "modern technologies"
                metric = f" (Key Achievement: {p.achievements})" if p.achievements else ""
                bullets.append(f"- **{p.title}**: Engineered using {tech}. {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "I thrive on building scalable, reliable software that solves real user problems."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I was genuinely excited to discover the **{job_title}** opening at **{company_name}**. "
                f"Your engineering mission strongly resonates with my passion for building high-quality, impactful digital products.\n\n"
                f"Throughout my engineering journey, I have focused on solving real-world challenges through clean code and reliable architecture. "
                f"A few key projects that highlight my capabilities include:\n\n"
                f"{bullet_block}\n\n"
                f"With my strong background in {', '.join(detected_skills[:5]) if detected_skills else 'software development'}, "
                f"I am ready to hit the ground running, collaborate proactively, and help accelerate {company_name}'s product velocity.\n\n"
                f"Thank you very much for considering my application. I would love the chance to discuss how we can build great things together.\n\n"
                f"Warm regards,\n{applicant_name}"
            )
            
        elif tone == "teknikal":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "software stack"
                metric = f" | Quantified outcome: {p.achievements}" if p.achievements else ""
                bullets.append(f"- **{p.title}** [Role: {p.role}]:\n  Stack: {tech}\n  Architecture & Details: {p.description}{metric}")
            bullet_block = "\n\n".join(bullets) if bullets else "- Strong foundation in clean architecture, performance optimization, and reliable API design."
            
            return (
                f"Dear Engineering Hiring Team at {company_name},\n\n"
                f"I am applying for the **{job_title}** position at **{company_name}**. "
                f"Having analyzed your technical requirements for {', '.join(detected_skills[:6]) if detected_skills else 'this role'}, "
                f"I am confident my hands-on background in systems design, maintainable codebase architecture, and robust delivery makes me a strong fit.\n\n"
                f"### Evidence of Technical Execution:\n\n"
                f"{bullet_block}\n\n"
                f"My engineering philosophy emphasizes clean separation of concerns, testability, and resilience. "
                f"I would welcome a deep-dive technical discussion to explore how my architectural practices can support {company_name}'s scalability goals.\n\n"
                f"Sincerely,\n{applicant_name}"
            )
            
        else:
            # tone == "profesional" (Default English)
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "relevant technologies"
                metric = f" ({p.achievements})" if p.achievements else ""
                bullets.append(f"- **{p.title}** ({p.role}): Developed with {tech}. {p.description}{metric}")
            bullet_block = "Relevant projects from my portfolio that demonstrate my capability:\n" + "\n".join(bullets) if bullets else "I bring a track record of reliable software development and problem solving."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I am writing to express my strong interest in the **{job_title}** role at **{company_name}**. "
                f"With a solid track record of architecting, implementing, and shipping robust solutions, I am confident in my ability to deliver immediate value to your organization.\n\n"
                f"{bullet_block}\n\n"
                f"Given your requirements in {', '.join(detected_skills[:5]) if detected_skills else 'key software engineering disciplines'}, "
                f"my practical experience allows me to ramp up quickly, adapt to established team workflows, and drive high-impact results.\n\n"
                f"I welcome the opportunity to discuss how my qualifications align with {company_name}'s objectives. Thank you for your time and consideration.\n\n"
                f"Sincerely,\n{applicant_name}"
            )
            
    # ------------------ BAHASA INDONESIA TEMPLATES ------------------
    else:
        if tone == "ringkas":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "stack utama"
                metric = f" -> {p.achievements}" if p.achievements else ""
                bullets.append(f"• **{p.title}** ({tech}): {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "• Rekam jejak konsisten dalam membangun dan merilis sistem perangkat lunak handal."
            
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya mengajukan lamaran untuk posisi **{job_title}** di **{company_name}**. Dengan kompetensi praktis dalam {', '.join(detected_skills[:4]) if detected_skills else 'rekayasa perangkat lunak'}, "
                f"berikut ringkasan bukti kontribusi nyata dari portofolio saya:\n\n"
                f"{bullet_block}\n\n"
                f"Saya siap membawa etos kerja terarah dan efisiensi eksekusi ini ke tim {company_name}. "
                f"Besar harapan saya untuk dapat berdiskusi lebih lanjut dalam sesi wawancara.\n\n"
                f"Salam hormat,\n{applicant_name}"
            )
            
        elif tone == "antusias":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "teknologi modern"
                metric = f" (Pencapaian: {p.achievements})" if p.achievements else ""
                bullets.append(f"• **{p.title}**: Dibangun menggunakan {tech}. {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "Saya selalu antusias membangun solusi digital yang memberikan nilai nyata bagi pengguna."
            
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya sangat bersemangat saat melihat lowongan untuk posisi **{job_title}** di **{company_name}**. "
                f"Visi dan reputasi {company_name} dalam menciptakan inovasi digital yang berdampak sangat selaras dengan passion saya dalam dunia teknologi.\n\n"
                f"Sepanjang perjalanan membangun berbagai produk digital, saya terbiasa memecahkan masalah kompleks dan bekerja dengan rasa kepemilikan (*ownership*) tinggi. "
                f"Berikut beberapa proyek yang paling membuktikan kesiapan saya:\n\n"
                f"{bullet_block}\n\n"
                f"Dengan keahlian yang terasah pada {', '.join(detected_skills[:5]) if detected_skills else 'bidang ini'}, "
                f"saya siap belajar cepat, berkolaborasi secara proaktif, dan memberikan energi positif bagi pencapaian target tim {company_name}.\n\n"
                f"Terima kasih banyak atas waktu dan kesempatan yang diberikan. Saya sangat antusias untuk berdiskusi lebih lanjut!\n\n"
                f"Salam hangat,\n{applicant_name}"
            )
            
        elif tone == "teknikal":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "teknologi terkait"
                metric = f"\n  Metrik & Dampak: {p.achievements}" if p.achievements else ""
                bullets.append(
                    f"• **{p.title}** (Peran: {p.role})\n"
                    f"  Arsitektur & Stack: {tech}\n"
                    f"  Implementasi: {p.description}.{metric}"
                )
            bullet_block = "\n\n".join(bullets) if bullets else "• Menguasai prinsip clean code, pengujian sistem, dan arsitektur modular yang teruji di lingkungan produksi."
            
            return (
                f"Yth. Engineering Lead & Tim Rekrutmen {company_name},\n\n"
                f"Saya mengajukan diri untuk posisi **{job_title}** di **{company_name}**. "
                f"Berdasarkan analisis spesifikasi teknis lowongan Anda yang memerlukan keahlian {', '.join(detected_skills[:6]) if detected_skills else 'rekayasa perangkat lunak tingkat lanjut'}, "
                f"saya yakin rekam jejak teknis saya dalam merancang sistem yang skalabel, aman, dan mudah di-maintain dapat memperkuat kapabilitas tim Anda.\n\n"
                f"### Bukti Eksekusi Arsitektur & Rekayasa:\n\n"
                f"{bullet_block}\n\n"
                f"Standar rekayasa saya berfokus pada efisiensi pemrosesan, kemudahan kolaborasi tim melalui dokumentasi kode yang rapi, serta pengujian terukur. "
                f"Saya menyambut baik kesempatan untuk mendiskusikan keputusan arsitektural dan solusi teknis yang dapat saya bawa ke proyek-proyek {company_name}.\n\n"
                f"Hormat saya,\n{applicant_name}"
            )
            
        else:
            # tone == "profesional" (Default Indonesian)
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "teknologi terkait"
                achievement_text = f" Hasil nyata: {p.achievements}." if p.achievements else ""
                bullets.append(
                    f"• **{p.title}** (Peran: {p.role})\n"
                    f"  Teknologi: {tech}\n"
                    f"  Uraian: {p.description}.{achievement_text}"
                )
                
            skills_highlight = f", khususnya dalam pemanfaatan {', '.join(detected_skills[:5])}" if detected_skills else ""
            if bullets:
                proj_body = "Berikut beberapa proyek terkait yang membuktikan kompetensi dan kontribusi nyata saya:\n\n" + "\n\n".join(bullets)
                transition = f"Dengan latar belakang pengalaman praktis tersebut{skills_highlight}, "
            else:
                proj_body = (
                    "Sepanjang perjalanan profesional saya, saya telah membangun fondasi yang kokoh dalam "
                    "merancang, mengimplementasikan, serta mengoptimalkan solusi perangkat lunak yang berorientasi hasil."
                )
                transition = f"Dengan dedikasi dan kompetensi teknis tersebut{skills_highlight}, "
                
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya menulis surat ini untuk menyatakan ketertarikan saya terhadap posisi **{job_title}** di **{company_name}**. "
                f"Berdasarkan pengalaman langsung saya dalam menyelesaikan berbagai proyek perangkat lunak dan solusi digital, "
                f"saya yakin dapat memberikan kontribusi nyata bagi perkembangan tim Anda.\n\n"
                f"{proj_body}\n\n"
                f"{transition}"
                f"saya siap beradaptasi dengan cepat dan berkolaborasi secara produktif bersama {company_name}.\n\n"
                f"Saya sangat antusias untuk berdiskusi lebih lanjut mengenai bagaimana portofolio dan keahlian saya dapat mendukung target perusahaan Anda. "
                f"Terima kasih atas waktu dan kesempatan yang diberikan.\n\n"
                f"Hormat saya,\n{applicant_name}"
            )

def analyze_job_posting(payload: AnalyzeJobRequest) -> AnalyzeJobResponse:
    """Core analysis orchestrator: extracts skills, ranks matching projects, and crafts drafts."""
    # 1. Extract skills from job description & group into taxonomy
    detected_skills, categorized_skills = extract_keywords_from_text(payload.job_description)
    
    # 2. Match each project
    matched_projects: List[MatchedProject] = []
    all_user_skills: List[str] = []
    
    for proj in payload.projects:
        score, matched_kw, reason = calculate_project_match(
            project=proj,
            job_desc=payload.job_description,
            job_skills=detected_skills,
            job_title=payload.job_title
        )
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
