import React from 'react';
import { ParsedCvData } from '../types/cv';
import './CvSummary.css';

interface CvSummaryProps {
  parsedData: ParsedCvData;
  aiSummary: string;
  improvements: string[];
}

export const CvSummary: React.FC<CvSummaryProps> = ({ parsedData, aiSummary, improvements }) => {
  return (
    <div className="cv-summary">
      <div className="summary-header">
        <h2>📋 CV Analysis</h2>
      </div>

      {/* AI Summary */}
      <div className="ai-summary-card">
        <h3>🤖 AI Summary</h3>
        <p>{aiSummary}</p>
      </div>

      {/* Extracted Info */}
      <div className="extracted-info">
        <div className="info-row">
          <span className="label">Name:</span>
          <span className="value">{parsedData.fullName || 'Not detected'}</span>
        </div>
        <div className="info-row">
          <span className="label">Email:</span>
          <span className="value">{parsedData.email || 'Not detected'}</span>
        </div>
        {parsedData.phone && (
          <div className="info-row">
            <span className="label">Phone:</span>
            <span className="value">{parsedData.phone}</span>
          </div>
        )}
      </div>

      {/* Work Experience Count */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{parsedData.workExperiences.length}</span>
          <span className="stat-label">Jobs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{parsedData.educations.length}</span>
          <span className="stat-label">Education</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{parsedData.skills.length}</span>
          <span className="stat-label">Skills</span>
        </div>
      </div>

      {/* Skills */}
      {parsedData.skills.length > 0 && (
        <div className="skills-section">
          <h4>Detected Skills</h4>
          <div className="skills-list">
            {parsedData.skills.slice(0, 10).map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
            {parsedData.skills.length > 10 && (
              <span className="skill-tag more">+{parsedData.skills.length - 10} more</span>
            )}
          </div>
        </div>
      )}

      {/* Suggested Improvements */}
      {improvements.length > 0 && (
        <div className="improvements-section">
          <h4>💡 Suggested Improvements</h4>
          <ul>
            {improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
