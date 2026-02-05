import React from 'react';
import { ResumeRequest, ResumeResponse } from '../types/resume';
import './ResumePreview.css';

interface ResumePreviewProps {
  originalData: ResumeRequest;
  enhancedData: ResumeResponse;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ originalData, enhancedData }) => {
  return (
    <div className="resume-preview">
      <div className="preview-header">
        <h1>{originalData.fullName}</h1>
        <div className="contact-info">
          <span>{originalData.email}</span>
          {originalData.phone && <span>{originalData.phone}</span>}
          {originalData.linkedIn && (
            <a href={originalData.linkedIn} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* AI Generated Summary */}
      <section className="preview-section">
        <h2>Professional Summary</h2>
        <p className="summary-text">{enhancedData.generatedSummary}</p>
      </section>

      {/* Enhanced Work Experience */}
      {enhancedData.enhancedExperiences.length > 0 && (
        <section className="preview-section">
          <h2>Work Experience</h2>
          {enhancedData.enhancedExperiences.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <div>
                  <h3>{exp.jobTitle}</h3>
                  <span className="company">{exp.company}</span>
                </div>
                <span className="dates">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <ul className="responsibilities">
                {exp.enhancedResponsibilities.map((resp, respIndex) => (
                  <li key={respIndex}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {originalData.educations.length > 0 && (
        <section className="preview-section">
          <h2>Education</h2>
          {originalData.educations.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <div>
                  <h3>{edu.degree}{edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}</h3>
                  <span className="institution">{edu.institution}</span>
                </div>
                <span className="year">{edu.graduationYear}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills - Combined original + suggested */}
      <section className="preview-section">
        <h2>Skills</h2>
        <div className="skills-container">
          {originalData.skills.map((skill) => (
            <span key={skill} className="skill-badge">{skill}</span>
          ))}
          {enhancedData.suggestedSkills.map((skill) => (
            <span key={skill} className="skill-badge suggested">{skill}</span>
          ))}
        </div>
      </section>

      {/* Keywords for ATS */}
      {enhancedData.keywords.length > 0 && (
        <section className="preview-section keywords-section">
          <h2>ATS Keywords</h2>
          <p className="keywords-hint">These keywords were identified to help your resume pass ATS screening:</p>
          <div className="keywords-container">
            {enhancedData.keywords.map((keyword) => (
              <span key={keyword} className="keyword-badge">{keyword}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
