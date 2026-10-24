import re
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Job & Project Tracker Analysis API",
    description="Python engine for job analysis, project matching, and AI cover letter generation",
    version="1.0.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str
    role: Optional[str] = "Developer"
    category: Optional[str] = "General"
    technologies: List[str] = Field(default_factory=list)
    description: str
    achievements: Optional[str] = ""
    repo_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    date: Optional[str] = ""

class AnalyzeJobRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = "Perusahaan"
    job_description: str
    projects: List[ProjectItem] = Field(default_factory=list)
    applicant_name: Optional[str] = "Pelamar"
    tone: Optional[str] = "profesional"  # "profesional", "antusias", "ringkas"
    language: Optional[str] = "id"  # "id" atau "en"

class MatchedProject(BaseModel):
    project: ProjectItem
    match_score: int
    matched_skills: List[str]
    relevance_reason: str

class AnalyzeJobResponse(BaseModel):
    job_title: str
    company_name: str
    overall_match_percentage: int
    detected_skills: List[str]
    skill_gaps: List[str]
    matched_projects: List[MatchedProject]
    cover_letter_draft: str
    ai_prompt_context: str

class MasterPromptRequest(BaseModel):
    applicant_name: str
    headline_role: Optional[str] = "Software Engineer / Professional"
    projects: List[ProjectItem] = Field(default_factory=list)
    custom_notes: Optional[str] = ""

# Tech skills taxonomy for keyword extraction
TECH_KEYWORDS = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css", "r",
    # Frontend
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "angular", "svelte", "tailwind", "tailwindcss", "bootstrap", "sass", "redux", "zustand",
    # Backend
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "nest.js", "nestjs", "laravel", "spring boot", "asp.net", "graphql", "rest api", "grpc",
    # Databases & Backend-as-a-Service
    "appwrite", "firebase", "supabase", "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "prisma", "typeorm", "elasticsearch",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "gcp", "google cloud", "azure", "vercel", "github actions", "gitlab ci", "terraform", "ci/cd", "linux", "nginx",
    # Data & AI
    "machine learning", "deep learning", "ai", "pandas", "numpy", "pytorch", "tensorflow", "scikit-learn", "data analysis", "bigquery", "pyspark", "power bi", "tableau",
    # Tools & Methodologies
    "git", "github", "jira", "agile", "scrum", "microservices", "unit testing", "jest", "cypress", "system design"
]

def extract_keywords_from_text(text: str) -> List[str]:
    """Extract detected technical keywords and skills from text."""
    text_lower = text.lower()
    detected = []
    
    for kw in TECH_KEYWORDS:
        # Use regex to match exact word boundary
        pattern = r'(?<![a-zA-Z0-9_-])' + re.escape(kw) + r'(?![a-zA-Z0-9_-])'
        if re.search(pattern, text_lower):
            detected.append(kw)
            
    # Also extract extra capital words or acronyms (like ETL, API, UI, UX, SEO)
    extra_terms = ["ui", "ux", "seo", "etl", "qa", "tdd", "ddd", "saas", "llm"]
    for term in extra_terms:
        if term not in detected and re.search(r'\b' + term + r'\b', text_lower):
            detected.append(term.upper())
            
    return list(dict.fromkeys(detected))

def calculate_project_match(project: ProjectItem, job_desc: str, job_skills: List[str]) -> tuple[int, List[str], str]:
    """Calculate matching score between a project and the job."""
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
    """Generate a high-conversion, proof-backed cover letter."""
    
    if language == "en":
        greeting = f"Dear Hiring Team at {company_name},"
        intro = f"I am writing to express my strong interest in the {job_title} position at {company_name}. With my hands-on background and proven project delivery, I am confident in bringing immediate value to your team."
        
        proj_bullets = []
        for mp in top_projects[:3]:
            p = mp.project
            tech_str = ", ".join(p.technologies) if p.technologies else "modern technologies"
            metric = f" ({p.achievements})" if p.achievements else ""
            proj_bullets.append(f"- **{p.title}** ({p.role}): Built using {tech_str}. {p.description}{metric}")
            
        proj_section = "\n".join(proj_bullets)
        
        closing = (
            f"Given your requirements in {', '.join(detected_skills[:5]) if detected_skills else 'these core areas'}, "
            f"my hands-on experience allows me to ramp up quickly and solve real-world problems.\n\n"
            f"I would welcome the opportunity to discuss how my skillset aligns with {company_name}'s goals. "
            f"Thank you for your time and consideration.\n\nSincerely,\n{applicant_name}"
        )
        return f"{greeting}\n\n{intro}\n\nHere are relevant projects that demonstrate my qualifications:\n{proj_section}\n\n{closing}"
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
            
        proj_section = "\n\n".join(proj_bullets)
        
        skills_highlight = f", khususnya dalam pemanfaatan {', '.join(detected_skills[:5])}" if detected_skills else ""
        
        closing = (
            f"Dengan latar belakang pengalaman praktis tersebut{skills_highlight}, "
            f"saya siap beradaptasi dengan cepat dan berkolaborasi secara produktif bersama {company_name}.\n\n"
            f"Saya sangat antusias untuk berdiskusi lebih lanjut mengenai bagaimana portofolio dan keahlian saya dapat mendukung target perusahaan Anda. "
            f"Terima kasih atas waktu dan kesempatan yang diberikan.\n\n"
            f"Hormat saya,\n{applicant_name}"
        )
        return f"{greeting}\n\n{intro}\n\nBerikut beberapa proyek terkait yang membuktikan kompetensi saya:\n\n{proj_section}\n\n{closing}"

def build_ai_prompt(
    applicant_name: str,
    job_title: str,
    company_name: str,
    job_desc: str,
    projects: List[ProjectItem]
) -> str:
    """Build a master prompt to paste into external AI chat so it never forgets context."""
    projects_summary = []
    for i, p in enumerate(projects, 1):
        techs = ", ".join(p.technologies) if p.technologies else "N/A"
        achieve = f" | Pencapaian: {p.achievements}" if p.achievements else ""
        projects_summary.append(
            f"{i}. [{p.title}] (Peran: {p.role})\n"
            f"   - Teknologi: {techs}\n"
            f"   - Deskripsi: {p.description}{achieve}"
        )
        
    projects_block = "\n".join(projects_summary) if projects_summary else "Belum ada proyek yang dicatat."
    
    prompt = (
        f"### SYSTEM INSTRUCTION / KONTEKS UTAMA KANDIDAT\n"
        f"Nama Pelamar: {applicant_name}\n"
        f"Posisi yang Dituju: {job_title} di {company_name}\n\n"
        f"--- DAFTAR RIWAYAT PROYEK RESMI KANDIDAT (JANGAN PERNAH LUPAKAN INI) ---\n"
        f"{projects_block}\n\n"
        f"--- DESKRIPSI LOWONGAN PEKERJAAN ---\n"
        f"{job_desc.strip()}\n\n"
        f"--- TUGAS ANDA ---\n"
        f"Sebagai konsultan karir AI pribadi saya, gunakan HANYA fakta dan proyek nyata di atas untuk membantu saya:\n"
        f"1. Mempersiapkan simulasi pertanyaan interview untuk posisi ini.\n"
        f"2. Memoles surat lamaran dan poin CV agar 100% selaras dengan syarat lowongan.\n"
        f"3. Jangan mengarang proyek baru; selalu kaitkan jawaban dengan daftar proyek saya di atas."
    )
    return prompt

# API Endpoints
@app.get("/api/py/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Job & Project Tracker Analysis API",
        "runtime": "Python (FastAPI)"
    }

@app.post("/api/py/analyze-job", response_model=AnalyzeJobResponse)
def analyze_job(payload: AnalyzeJobRequest):
    """Analyze a job posting, rank matching projects, and generate tailored cover letter."""
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Deskripsi lowongan tidak boleh kosong.")
        
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

@app.post("/api/py/master-prompt")
def generate_master_prompt(payload: MasterPromptRequest):
    """Generate a master system prompt containing all portfolio projects."""
    projects_summary = []
    for i, p in enumerate(payload.projects, 1):
        techs = ", ".join(p.technologies) if p.technologies else "N/A"
        achieve = f" | Hasil/Metrik: {p.achievements}" if p.achievements else ""
        links = []
        if p.repo_url: links.append(f"Repo: {p.repo_url}")
        if p.demo_url: links.append(f"Demo: {p.demo_url}")
        link_str = f" ({', '.join(links)})" if links else ""
        
        projects_summary.append(
            f"{i}. [{p.title}] - Peran: {p.role}{link_str}\n"
            f"   - Kategori: {p.category}\n"
            f"   - Teknologi: {techs}\n"
            f"   - Deskripsi: {p.description}{achieve}"
        )
        
    projects_block = "\n\n".join(projects_summary) if projects_summary else "Belum ada proyek yang dicatat."
    notes_block = f"\nCatatan Tambahan: {payload.custom_notes}" if payload.custom_notes else ""
    
    prompt = (
        f"### PROFIL & DATABASE RESMI PORTOFOLIO SAYA\n"
        f"Nama: {payload.applicant_name}\n"
        f"Fokus / Peran Utama: {payload.headline_role}{notes_block}\n\n"
        f"### RIWAYAT PROYEK YANG PERNAH SAYA KERJAKAN:\n"
        f"{projects_block}\n\n"
        f"--- PETUNJUK UNTUK AI ---\n"
        f"Mulai sekarang dalam sesi chat ini, jadilah asisten karir saya. Setiap kali saya menanyakan tentang pembuatan CV, surat lamaran (cover letter), atau persiapan wawancara teknis, RUJUKLAH selalu proyek-proyek nyata di atas sebagai bukti portofolio saya. Jangan pernah membuat-buat proyek fiktif."
    )
    
    return {"master_prompt": prompt}
