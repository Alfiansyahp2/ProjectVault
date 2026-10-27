import { JobApplication, ApplicationStatus } from '@/lib/types';

export interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  initialData?: JobApplication | null;
}

export interface ApplicationFormData {
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string;
  jobLink: string;
  salaryRange: string;
  notes: string;
  jobDescription: string;
  coverLetter: string;
}

export interface ApplicationFormProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  hasAutoFilled: boolean;
}

export interface LocalResumeFile {
  name: string;
  path: string;
  size: number;
  folder: string;
}

export interface ApplicationParserPanelProps {
  isParsing: boolean;
  parsedResult: any;
  parseSuccessMsg: string | null;
  parseErrorMsg: string | null;
  ocrProgress?: number | null;
  ocrStatus?: string | null;
  localFiles: LocalResumeFile[];
  selectedLocalFile: string;
  setSelectedLocalFile: (path: string) => void;
  onFileUpload: (file: File) => void;
  onLocalFileParse: (path: string) => void;
  onRawTextParse: (text: string, sourceHint?: string) => void;
  onImageOcrParse: (fileOrBlob: File | Blob) => void;
  onResetParsed: () => void;
}

