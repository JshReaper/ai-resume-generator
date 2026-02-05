# Frontend Integration Guide

Quick copy-paste code snippets to complete the frontend integration.

## 1. Language Selector Component

Create `client/src/components/LanguageSelector.tsx`:

```typescript
import React from 'react';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <div className="language-selector">
      <label htmlFor="language">Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        <option value="en">🇬🇧 English</option>
        <option value="da">🇩🇰 Dansk</option>
      </select>
    </div>
  );
};
```

Create `client/src/components/LanguageSelector.css`:

```css
.language-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.language-selector label {
  font-weight: 500;
  color: #333;
}

.language-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.language-selector select:focus {
  outline: none;
  border-color: #5b21b6;
  box-shadow: 0 0 0 3px rgba(91, 33, 182, 0.1);
}
```

## 2. PDF Export Utility

Create `client/src/utils/pdfExport.ts`:

```typescript
import html2pdf from 'html2pdf.js';

export const exportResumeToPdf = (filename: string = 'resume.pdf') => {
  const element = document.getElementById('resume-content');

  if (!element) {
    console.error('Resume content element not found');
    return;
  }

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};

export const exportCoverLetterToPdf = (filename: string = 'cover-letter.pdf') => {
  const element = document.getElementById('cover-letter-content');

  if (!element) {
    console.error('Cover letter content element not found');
    return;
  }

  const opt = {
    margin: [1, 1, 1, 1],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};
```

## 3. Cover Letter Component

Create `client/src/components/CoverLetter.tsx`:

```typescript
import React, { useState } from 'react';
import { cvService } from '../services/api';
import { CoverLetterResponse } from '../types/cv';
import { exportCoverLetterToPdf } from '../utils/pdfExport';
import './CoverLetter.css';

interface CoverLetterProps {
  sessionId: string;
  language: string;
  onClose: () => void;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({
  sessionId,
  language,
  onClose,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState<CoverLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!jobTitle || !companyName) {
      setError('Job title and company name are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await cvService.generateCoverLetter({
        sessionId,
        jobTitle,
        companyName,
        jobDescription,
        language,
      });
      setCoverLetter(result);
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportCoverLetterToPdf(`cover-letter-${companyName}.pdf`);
  };

  return (
    <div className="cover-letter-modal">
      <div className="cover-letter-container">
        <div className="cover-letter-header">
          <h2>✉️ Generate Cover Letter</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {!coverLetter ? (
          <div className="cover-letter-form">
            <div className="form-group">
              <label htmlFor="jobTitle">Job Title *</label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tech Corp"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here (optional but recommended)"
                rows={8}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : '✨ Generate Cover Letter'}
            </button>
          </div>
        ) : (
          <div className="cover-letter-result">
            <div className="cover-letter-actions">
              <button className="export-button" onClick={handleExport}>
                📄 Download PDF
              </button>
              <button className="edit-button" onClick={() => setCoverLetter(null)}>
                ← Edit Details
              </button>
            </div>

            <div id="cover-letter-content" className="cover-letter-content">
              <p>{coverLetter.salutation},</p>

              {coverLetter.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <p>{coverLetter.closing},</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

Create `client/src/components/CoverLetter.css`:

```css
.cover-letter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.cover-letter-container {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.cover-letter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.cover-letter-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
  color: #333;
}

.cover-letter-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5b21b6;
  box-shadow: 0 0 0 3px rgba(91, 33, 182, 0.1);
}

.error-message {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  margin-bottom: 20px;
}

.generate-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cover-letter-result {
  padding: 30px;
}

.cover-letter-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.export-button,
.edit-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-button {
  background: #10b981;
  color: white;
  border: none;
}

.export-button:hover {
  background: #059669;
}

.edit-button {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.edit-button:hover {
  border-color: #999;
  color: #333;
}

.cover-letter-content {
  background: white;
  padding: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  line-height: 1.8;
  font-size: 14px;
  color: #333;
}

.cover-letter-content p {
  margin-bottom: 16px;
}

.cover-letter-content p:last-child {
  margin-bottom: 0;
}
```

## 4. Updated App.tsx (Key Changes)

Add imports:
```typescript
import { LanguageSelector } from './components/LanguageSelector';
import { ResumeTemplate, TemplateSelector } from './components/ResumeTemplates';
import { CoverLetter } from './components/CoverLetter';
import { exportResumeToPdf } from './utils/pdfExport';
```

Add state:
```typescript
const [language, setLanguage] = useState<string>('en');
const [countryCode, setCountryCode] = useState<string>('DK');
const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
const [showCoverLetter, setShowCoverLetter] = useState(false);
```

Update handlers to pass language:
```typescript
const handleFileSelect = async (file: File) => {
  setIsLoading(true);
  try {
    const result = await cvService.uploadFile(file, language, countryCode);
    setSessionId(result.sessionId);
    setCvData(result.parsedData);
    setAiSummary(result.aiSummary);
    setStep('refine');
  } catch (error) {
    // handle error
  } finally {
    setIsLoading(false);
  }
};

const handleSendMessage = async (message: string) => {
  setIsLoading(true);
  try {
    const response = await cvService.chat(
      sessionId!,
      message,
      targetJobTitle,
      targetJobDescription,
      language
    );
    setMessages([...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: response.message }
    ]);
  } finally {
    setIsLoading(false);
  }
};

const handleGenerateResume = async () => {
  setIsLoading(true);
  try {
    const result = await cvService.generateResume({
      sessionId: sessionId!,
      targetJobTitle,
      targetJobDescription,
      language,
      countryCode,
      template: selectedTemplate,
    });
    setResumeData(result);
    setStep('result');
  } finally {
    setIsLoading(false);
  }
};

const handleExportPdf = () => {
  exportResumeToPdf(`resume-${cvData?.fullName || 'download'}.pdf`);
};
```

## 5. Quick Test Checklist

- [ ] Language selector shows at top of app
- [ ] Upload CV with Danish language selected
- [ ] AI responds in Danish
- [ ] Select different templates
- [ ] Generate resume with selected template
- [ ] Download PDF button works
- [ ] PDF contains resume with correct template
- [ ] Open cover letter modal
- [ ] Generate cover letter
- [ ] Download cover letter PDF
- [ ] Phone number formatted correctly
- [ ] No duplicate skills (existing vs suggested shown separately)

## Need Help?

Check `IMPLEMENTATION-STATUS.md` for detailed status and architecture info.

All backend features are ready - just wire up the UI!
