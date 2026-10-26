from fastapi import APIRouter, HTTPException
from ..models.job_analysis import AnalyzeJobRequest, AnalyzeJobResponse, GenerateCoverLetterRequest
from ..models.project import MasterPromptRequest
from ..services.analyzer import analyze_job_posting, generate_cover_letter
from ..services.prompt_builder import build_master_prompt

router = APIRouter(tags=["Job Analysis & Matching"])

@router.post("/api/py/analyze-job", response_model=AnalyzeJobResponse)
def analyze_job(payload: AnalyzeJobRequest):
    """Analyze a job posting, rank matching projects, and generate tailored cover letter."""
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Deskripsi lowongan tidak boleh kosong.")
    return analyze_job_posting(payload)

@router.post("/api/py/generate-cover-letter")
def create_cover_letter(payload: GenerateCoverLetterRequest):
    """Generate or re-tone a cover letter draft instantly without re-analyzing."""
    letter = generate_cover_letter(
        applicant_name=payload.applicant_name or "Pelamar",
        job_title=payload.job_title,
        company_name=payload.company_name or "Perusahaan",
        top_projects=payload.top_projects,
        detected_skills=payload.detected_skills,
        tone=payload.tone or "profesional",
        language=payload.language or "id"
    )
    return {"cover_letter": letter}

@router.post("/api/py/master-prompt")
def generate_master_prompt(payload: MasterPromptRequest):
    """Generate a master system prompt containing all portfolio projects."""
    prompt = build_master_prompt(
        applicant_name=payload.applicant_name,
        headline_role=payload.headline_role or "Software Engineer / Professional",
        projects=payload.projects,
        custom_notes=payload.custom_notes or ""
    )
    return {"master_prompt": prompt}
