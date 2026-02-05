export interface ParsedCvData {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  summary?: string;
  workExperiences: ParsedWorkExperience[];
  educations: ParsedEducation[];
  skills: string[];
}

export interface ParsedWorkExperience {
  jobTitle?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string[];
}

export interface ParsedEducation {
  degree?: string;
  institution?: string;
  graduationYear?: string;
  fieldOfStudy?: string;
}

export interface CvUploadResponse {
  sessionId: string;
  extractedText: string;
  parsedData: ParsedCvData;
  aiSummary: string;
  suggestedImprovements: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  targetJobTitle?: string;
  targetJobDescription?: string;
  language?: string; // "en" or "da"
  countryCode?: string; // For phone formatting
}

export interface ChatResponse {
  message: string;
  updatedCvData?: ParsedCvData;
  generatedResume?: import('./resume').ResumeResponse;
  isComplete: boolean;
}

export interface GenerateRequest {
  sessionId: string;
  targetJobTitle?: string;
  targetJobDescription?: string;
  additionalInstructions?: string;
  language?: string; // "en" or "da"
  countryCode?: string; // For phone formatting
  template?: string; // "modern", "classic", "minimal"
}

export interface CoverLetterRequest {
  sessionId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  language?: string; // "en" or "da"
}

export interface CoverLetterResponse {
  salutation: string;
  content: string;
  closing: string;
}
