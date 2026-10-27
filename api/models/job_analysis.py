from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from .project import ProjectItem

class AnalyzeJobRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = "Perusahaan"
    job_description: str
    projects: List[ProjectItem] = Field(default_factory=list)
    applicant_name: Optional[str] = "Pelamar"
    tone: Optional[str] = "profesional"  # "profesional", "antusias", "ringkas", "teknikal"
    language: Optional[str] = "id"  # "id" atau "en"

class MatchedProject(BaseModel):
    project: ProjectItem
    match_score: int
    matched_skills: List[str]
    relevance_reason: str

class GenerateCoverLetterRequest(BaseModel):
    applicant_name: Optional[str] = "Pelamar"
    job_title: str
    company_name: Optional[str] = "Perusahaan"
    top_projects: List[MatchedProject] = Field(default_factory=list)
    detected_skills: List[str] = Field(default_factory=list)
    tone: Optional[str] = "profesional"
    language: Optional[str] = "id"

class AnalyzeJobResponse(BaseModel):
    job_title: str
    company_name: str
    overall_match_percentage: int
    match_tier: str = "Peluang Kuat"
    match_summary: str = ""
    detected_skills: List[str] = Field(default_factory=list)
    categorized_skills: Dict[str, List[str]] = Field(default_factory=dict)
    skill_gaps: List[str] = Field(default_factory=list)
    matched_projects: List[MatchedProject] = Field(default_factory=list)
    interview_tips: List[str] = Field(default_factory=list)
    cover_letter_draft: str
    ai_prompt_context: str
