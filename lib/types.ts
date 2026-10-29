export interface Project {
  id: string;
  title: string;
  role: string;
  category: string;
  technologies: string[];
  description: string;
  achievements?: string;
  repo_url?: string;
  demo_url?: string;
  date?: string;
  createdAt?: string;
}

export type ApplicationStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  applied_date: string;
  source_portal?: string;
  summary?: string;
  key_skills?: string[];
  file_path?: string;
  job_link?: string;
  salary_range?: string;
  notes?: string;
  job_description?: string;
  cover_letter?: string;
  matched_project_ids?: string[];
  createdAt?: string;
}

export interface ScoreBreakdown {
  tech_stack: number;
  description: number;
  role_domain: number;
  complexity: number;
}

export interface MatchedProject {
  project: Project;
  match_score: number;
  matched_skills: string[];
  relevance_reason: string;
  score_breakdown?: ScoreBreakdown;
}

export interface AnalysisResult {
  job_title: string;
  company_name: string;
  overall_match_percentage: number;
  match_tier?: string;
  match_summary?: string;
  detected_skills: string[];
  categorized_skills?: Record<string, string[]>;
  skill_gaps: string[];
  matched_projects: MatchedProject[];
  interview_tips?: string[];
  cover_letter_draft: string;
  ai_prompt_context: string;
}

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  projectsCollectionId: string;
  applicationsCollectionId: string;
  isEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  headline: string;
  bio?: string;
}
