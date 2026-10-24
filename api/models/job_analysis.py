from typing import List, Optional
from pydantic import BaseModel, Field
from .project import ProjectItem

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
