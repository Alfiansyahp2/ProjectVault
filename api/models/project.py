from typing import List, Optional
from pydantic import BaseModel, Field

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

class MasterPromptRequest(BaseModel):
    applicant_name: str
    headline_role: Optional[str] = "Software Engineer / Professional"
    projects: List[ProjectItem] = Field(default_factory=list)
    custom_notes: Optional[str] = ""
