from fastapi import APIRouter, HTTPException
from ..models.job_analysis import AnalyzeJobRequest, AnalyzeJobResponse
from ..models.project import MasterPromptRequest
from ..services.analyzer import analyze_job_posting
from ..services.prompt_builder import build_master_prompt

router = APIRouter(tags=["Job Analysis & Matching"])

@router.post("/api/py/analyze-job", response_model=AnalyzeJobResponse)
def analyze_job(payload: AnalyzeJobRequest):
    """Analyze a job posting, rank matching projects, and generate tailored cover letter."""
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Deskripsi lowongan tidak boleh kosong.")
    return analyze_job_posting(payload)

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
