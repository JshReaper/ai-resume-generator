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
    exportCoverLetterToPdf(`cover-letter-${companyName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="cover-letter-modal" onClick={onClose}>
      <div className="cover-letter-container" onClick={(e) => e.stopPropagation()}>
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
