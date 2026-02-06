export interface Translations {
  header: {
    title: string;
    subtitle: string;
    startOver: string;
  };
  upload: {
    stepTitle: string;
    stepDescription: string;
  };
  refine: {
    stepTitle: string;
    stepDescription: string;
    targetJob: string;
    targetJobDescription: string;
    jobTitlePlaceholder: string;
    jobDescPlaceholder: string;
  };
  result: {
    stepTitle: string;
    stepDescription: string;
    backButton: string;
    downloadButton: string;
    coverLetterButton: string;
    existingSkills: string;
    suggestedSkills: string;
  };
  languageSelector: {
    uiLanguage: string;
    cvLanguage: string;
  };
  footer: {
    text: string;
  };
  template: {
    professionalSummary: string;
    experience: string;
    education: string;
    skills: string;
    keywords: string;
    present: string;
  };
  fileUpload: {
    dropHere: string;
    orClick: string;
    supports: string;
    or: string;
    pasteButton: string;
    backButton: string;
    pasteTitle: string;
    pasteHint: string;
    placeholder: string;
    characters: string;
    minimum: string;
    analyzeButton: string;
    analyzingTitle: string;
    analyzingText: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    header: {
      title: 'AI Resume Generator',
      subtitle: 'Upload your CV and let AI do the heavy lifting',
      startOver: 'Start Over'
    },
    upload: {
      stepTitle: 'Step 1: Upload Your CV',
      stepDescription: 'Upload your existing resume or paste your LinkedIn profile. Our AI will analyze it and help you create an optimized version.'
    },
    refine: {
      stepTitle: 'Step 2: Review & Refine',
      stepDescription: "We've analyzed your CV. Chat with AI to make improvements, or go straight to generating your enhanced resume.",
      targetJob: '🎯 Target Position (Optional)',
      targetJobDescription: 'Add a target job to tailor your resume',
      jobTitlePlaceholder: 'Job Title (e.g., Senior Software Engineer)',
      jobDescPlaceholder: 'Paste job description here for ATS optimization...'
    },
    result: {
      stepTitle: '✨ Your Enhanced Resume',
      stepDescription: "Here's your AI-optimized resume, ready to impress!",
      backButton: '← Back to Edit',
      downloadButton: '📄 Download PDF',
      coverLetterButton: '✉️ Generate Cover Letter',
      existingSkills: 'Skills from your CV',
      suggestedSkills: 'AI-recommended additions'
    },
    languageSelector: {
      uiLanguage: 'Interface',
      cvLanguage: 'CV Output'
    },
    footer: {
      text: 'Built with .NET, React & Ollama | 100% Local AI - Your data never leaves your machine'
    },
    template: {
      professionalSummary: 'Professional Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      keywords: 'Keywords',
      present: 'Present'
    },
    fileUpload: {
      dropHere: 'Drop your CV here',
      orClick: 'or click to browse',
      supports: 'Supports PDF & DOCX',
      or: 'or',
      pasteButton: 'Paste from LinkedIn or text',
      backButton: '← Back to file upload',
      pasteTitle: 'Paste your CV content',
      pasteHint: 'Copy your LinkedIn profile, existing resume text, or any career information',
      placeholder: 'Paste your CV/LinkedIn content here...',
      characters: 'characters',
      minimum: 'minimum 50',
      analyzeButton: 'Analyze Content',
      analyzingTitle: 'Analyzing your CV...',
      analyzingText: 'Our AI is extracting and parsing your information'
    }
  },
  da: {
    header: {
      title: 'AI CV Generator',
      subtitle: 'Upload dit CV og lad AI gøre det tunge arbejde',
      startOver: 'Start Forfra'
    },
    upload: {
      stepTitle: 'Trin 1: Upload Dit CV',
      stepDescription: 'Upload dit eksisterende CV eller indsæt din LinkedIn-profil. Vores AI vil analysere det og hjælpe dig med at skabe en optimeret version.'
    },
    refine: {
      stepTitle: 'Trin 2: Gennemgå & Forfin',
      stepDescription: 'Vi har analyseret dit CV. Chat med AI for at lave forbedringer, eller gå direkte til at generere dit forbedrede CV.',
      targetJob: '🎯 Målstilling (Valgfri)',
      targetJobDescription: 'Tilføj et måljob for at skræddersy dit CV',
      jobTitlePlaceholder: 'Jobtitel (f.eks., Senior Software Engineer)',
      jobDescPlaceholder: 'Indsæt jobbeskrivelse her for ATS-optimering...'
    },
    result: {
      stepTitle: '✨ Dit Forbedrede CV',
      stepDescription: 'Her er dit AI-optimerede CV, klar til at imponere!',
      backButton: '← Tilbage til Redigering',
      downloadButton: '📄 Download PDF',
      coverLetterButton: '✉️ Generer Følgebrev',
      existingSkills: 'Færdigheder fra dit CV',
      suggestedSkills: 'AI-anbefalede tilføjelser'
    },
    languageSelector: {
      uiLanguage: 'Grænseflade',
      cvLanguage: 'CV Sprog'
    },
    footer: {
      text: 'Bygget med .NET, React & Ollama | 100% Lokal AI - Dine data forlader aldrig din maskine'
    },
    template: {
      professionalSummary: 'faglig profil',
      experience: 'Erfaring',
      education: 'Uddannelse',
      skills: 'Færdigheder',
      keywords: 'Nøgleord',
      present: 'Nu'
    },
    fileUpload: {
      dropHere: 'Slip dit CV her',
      orClick: 'eller klik for at gennemse',
      supports: 'Understøtter PDF & DOCX',
      or: 'eller',
      pasteButton: 'Indsæt fra LinkedIn eller tekst',
      backButton: '← Tilbage til filupload',
      pasteTitle: 'Indsæt dit CV-indhold',
      pasteHint: 'Kopier din LinkedIn-profil, eksisterende CV-tekst eller karriereinformation',
      placeholder: 'Indsæt dit CV/LinkedIn-indhold her...',
      characters: 'tegn',
      minimum: 'minimum 50',
      analyzeButton: 'Analyser Indhold',
      analyzingTitle: 'Analyserer dit CV...',
      analyzingText: 'Vores AI udtrækker og parser dine informationer'
    }
  }
};

export const getTranslation = (language: string): Translations => {
  return translations[language] || translations.en;
};
