export interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: string;
  fieldOfStudy?: string;
}

export interface ResumeRequest {
  fullName: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  summary?: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: string[];
  targetJobTitle?: string;
  targetJobDescription?: string;
}

export interface EnhancedWorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  enhancedResponsibilities: string[];
}

export interface ResumeResponse {
  generatedSummary: string;
  enhancedExperiences: EnhancedWorkExperience[];
  existingSkills: string[]; // Skills from original CV
  suggestedSkills: string[]; // New skills to add
  keywords: string[];
  formattedResume?: string;
  template?: string; // "modern", "classic", "minimal"
}
