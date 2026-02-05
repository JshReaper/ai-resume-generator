import React from 'react';
import { ResumeResponse } from '../types/resume';
import { ParsedCvData } from '../types/cv';
import { getTranslation } from '../translations';
import './ResumeTemplates.css';

interface ResumeTemplateProps {
  cvData: ParsedCvData;
  resumeData: ResumeResponse;
  template: string;
  language: string;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ cvData, resumeData, template, language }) => {
  const className = `resume-template resume-${template}`;
  const t = getTranslation(language);

  return (
    <div className={className} id="resume-content">
      <div className="resume-header">
        <h1>{cvData.fullName}</h1>
        <div className="contact-info">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.linkedIn && <span>{cvData.linkedIn}</span>}
        </div>
      </div>

      {resumeData.generatedSummary && (
        <section className="resume-section">
          <h2>{t.template.professionalSummary}</h2>
          <p>{resumeData.generatedSummary}</p>
        </section>
      )}

      {resumeData.enhancedExperiences.length > 0 && (
        <section className="resume-section">
          <h2>{t.template.experience}</h2>
          {resumeData.enhancedExperiences.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <h3>{exp.jobTitle}</h3>
                <span className="company">{exp.company}</span>
              </div>
              <div className="experience-dates">
                {exp.startDate} - {exp.endDate || t.template.present}
              </div>
              <ul className="responsibilities">
                {exp.enhancedResponsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {cvData.educations.length > 0 && (
        <section className="resume-section">
          <h2>{t.template.education}</h2>
          {cvData.educations.map((edu, index) => (
            <div key={index} className="education-item">
              <h3>{edu.degree}</h3>
              <span className="institution">{edu.institution}</span>
              {edu.graduationYear && <span className="year"> • {edu.graduationYear}</span>}
              {edu.fieldOfStudy && <span className="field"> • {edu.fieldOfStudy}</span>}
            </div>
          ))}
        </section>
      )}

      {(resumeData.existingSkills.length > 0 || resumeData.suggestedSkills.length > 0) && (
        <section className="resume-section">
          <h2>{t.template.skills}</h2>
          <div className="skills-container">
            {resumeData.existingSkills.map((skill, index) => (
              <span key={`existing-${index}`} className="skill-tag">{skill}</span>
            ))}
            {resumeData.suggestedSkills.map((skill, index) => (
              <span key={`suggested-${index}`} className="skill-tag suggested">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {resumeData.keywords.length > 0 && (
        <section className="resume-section keywords-section">
          <h2>{t.template.keywords}</h2>
          <div className="keywords-container">
            {resumeData.keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
    { id: 'classic', name: 'Classic', description: 'Traditional professional look' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and focused' },
  ];

  return (
    <div className="template-selector">
      <h3>Choose Template</h3>
      <div className="template-options">
        {templates.map((template) => (
          <button
            key={template.id}
            className={`template-option ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="template-preview-box">
              <div className={`template-preview template-preview-${template.id}`}>
                <div className="preview-lines">
                  <div className="line header"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
            </div>
            <div className="template-info">
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
