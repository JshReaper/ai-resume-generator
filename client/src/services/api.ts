import axios from 'axios';
import { ResumeRequest, ResumeResponse } from '../types/resume';
import { CvUploadResponse, ChatResponse, GenerateRequest, CoverLetterRequest, CoverLetterResponse, JobPostingResult } from '../types/cv';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5260';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resumeService = {
  generateResume: async (request: ResumeRequest): Promise<ResumeResponse> => {
    const response = await api.post<ResumeResponse>('/api/resume/generate', request);
    return response.data;
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      await api.get('/api/resume/health');
      return true;
    } catch {
      return false;
    }
  },
};

export const cvService = {
  uploadFile: async (file: File, language: string = 'en', countryCode: string = 'DK'): Promise<CvUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<CvUploadResponse>(
      `/api/cv/upload?language=${language}&countryCode=${countryCode}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  uploadText: async (text: string, language: string = 'en', countryCode: string = 'DK'): Promise<CvUploadResponse> => {
    const response = await api.post<CvUploadResponse>('/api/cv/upload-text', {
      text,
      language,
      countryCode,
    });
    return response.data;
  },

  chat: async (
    sessionId: string,
    message: string,
    targetJobTitle?: string,
    targetJobDescription?: string,
    language: string = 'en'
  ): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/cv/chat', {
      sessionId,
      message,
      targetJobTitle,
      targetJobDescription,
      language,
    });
    return response.data;
  },

  generateResume: async (request: GenerateRequest): Promise<ResumeResponse> => {
    const response = await api.post<ResumeResponse>('/api/cv/generate', request);
    return response.data;
  },

  generateCoverLetter: async (request: CoverLetterRequest): Promise<CoverLetterResponse> => {
    const response = await api.post<CoverLetterResponse>('/api/cv/cover-letter', request);
    return response.data;
  },

  fetchJobPosting: async (url: string): Promise<JobPostingResult> => {
    const response = await api.post<JobPostingResult>('/api/cv/fetch-job', { url });
    return response.data;
  },
};

export default api;
