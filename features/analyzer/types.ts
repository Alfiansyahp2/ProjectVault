export interface JobAnalyzerFormData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  language: 'id' | 'en';
  tone: string;
}

export type StudioTab = 'all' | 'match' | 'cover_letter' | 'prompt';
