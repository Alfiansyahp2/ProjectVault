from typing import List, Optional
from pydantic import BaseModel, Field

class ResumeItem(BaseModel):
    file_name: str
    file_path: str
    company_name: str
    job_title: str
    applied_date: str
    source_portal: str
    key_skills: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = "applied"
    cover_letter_preview: Optional[str] = ""
    cover_letter: Optional[str] = ""

class ParseSinglePdfRequest(BaseModel):
    file_path: str

class ExportResumesRequest(BaseModel):
    base_dir: Optional[str] = "data"
    output_path: Optional[str] = "data/parsed_applications.json"

class ParseRawTextRequest(BaseModel):
    text: str
    source_hint: Optional[str] = "Pasted Text"

