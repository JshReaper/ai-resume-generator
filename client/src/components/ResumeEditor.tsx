import React, { useState } from 'react';
import { ParsedCvData } from '../types/cv';
import { ResumeResponse, EnhancedWorkExperience } from '../types/resume';
import { getTranslation } from '../translations';
import './ResumeEditor.css';

interface ResumeEditorProps {
  cvData: ParsedCvData;
  resumeData: ResumeResponse;
  language: string;
  onSave: (updatedCvData: ParsedCvData, updatedResumeData: ResumeResponse) => void;
  onCancel: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  cvData,
  resumeData,
  language,
  onSave,
  onCancel,
}) => {
  const t = getTranslation(language);

  // Editable state
  const [fullName, setFullName] = useState(cvData.fullName || '');
  const [email, setEmail] = useState(cvData.email || '');
  const [phone, setPhone] = useState(cvData.phone || '');
  const [linkedIn, setLinkedIn] = useState(cvData.linkedIn || '');
  const [summary, setSummary] = useState(resumeData.generatedSummary || '');
  const [experiences, setExperiences] = useState<EnhancedWorkExperience[]>(
    resumeData.enhancedExperiences || []
  );
  const [existingSkills, setExistingSkills] = useState<string[]>(
    resumeData.existingSkills || []
  );
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>(
    resumeData.suggestedSkills || []
  );

  const handleExperienceChange = (
    index: number,
    field: keyof EnhancedWorkExperience,
    value: string | string[]
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const updated = [...experiences];
    const updatedResponsibilities = [...updated[expIndex].enhancedResponsibilities];
    updatedResponsibilities[respIndex] = value;
    updated[expIndex] = { ...updated[expIndex], enhancedResponsibilities: updatedResponsibilities };
    setExperiences(updated);
  };

  const addResponsibility = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].enhancedResponsibilities.push('');
    setExperiences(updated);
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].enhancedResponsibilities.splice(respIndex, 1);
    setExperiences(updated);
  };

  const handleSkillChange = (type: 'existing' | 'suggested', index: number, value: string) => {
    if (type === 'existing') {
      const updated = [...existingSkills];
      updated[index] = value;
      setExistingSkills(updated);
    } else {
      const updated = [...suggestedSkills];
      updated[index] = value;
      setSuggestedSkills(updated);
    }
  };

  const addSkill = (type: 'existing' | 'suggested') => {
    if (type === 'existing') {
      setExistingSkills([...existingSkills, '']);
    } else {
      setSuggestedSkills([...suggestedSkills, '']);
    }
  };

  const removeSkill = (type: 'existing' | 'suggested', index: number) => {
    if (type === 'existing') {
      const updated = [...existingSkills];
      updated.splice(index, 1);
      setExistingSkills(updated);
    } else {
      const updated = [...suggestedSkills];
      updated.splice(index, 1);
      setSuggestedSkills(updated);
    }
  };

  const handleSave = () => {
    const updatedCvData: ParsedCvData = {
      ...cvData,
      fullName,
      email,
      phone,
      linkedIn,
    };

    const updatedResumeData: ResumeResponse = {
      ...resumeData,
      generatedSummary: summary,
      enhancedExperiences: experiences,
      existingSkills: existingSkills.filter(s => s.trim() !== ''),
      suggestedSkills: suggestedSkills.filter(s => s.trim() !== ''),
    };

    onSave(updatedCvData, updatedResumeData);
  };

  return (
    <div className="resume-editor">
      <div className="editor-header">
        <h2>✏️ Edit Your Resume</h2>
        <p>Make any corrections before downloading your PDF</p>
      </div>

      <div className="editor-content">
        {/* Contact Information */}
        <section className="editor-section">
          <h3>Contact Information</h3>
          <div className="editor-field">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="editor-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="editor-field">
            <label>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+45 12 34 56 78"
            />
          </div>
          <div className="editor-field">
            <label>LinkedIn</label>
            <input
              type="text"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
        </section>

        {/* Professional Summary */}
        <section className="editor-section">
          <h3>{t.template.professionalSummary}</h3>
          <div className="editor-field">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Professional summary..."
            />
          </div>
        </section>

        {/* Experience */}
        <section className="editor-section">
          <h3>{t.template.experience}</h3>
          {experiences.map((exp, expIndex) => (
            <div key={expIndex} className="experience-editor">
              <div className="editor-field">
                <label>Job Title</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) =>
                    handleExperienceChange(expIndex, 'jobTitle', e.target.value)
                  }
                />
              </div>
              <div className="editor-field">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    handleExperienceChange(expIndex, 'company', e.target.value)
                  }
                />
              </div>
              <div className="editor-field-row">
                <div className="editor-field">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) =>
                      handleExperienceChange(expIndex, 'startDate', e.target.value)
                    }
                    placeholder="Jan 2020"
                  />
                </div>
                <div className="editor-field">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) =>
                      handleExperienceChange(expIndex, 'endDate', e.target.value)
                    }
                    placeholder={t.template.present}
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="editor-field">
                <label>Responsibilities</label>
                {exp.enhancedResponsibilities.map((resp, respIndex) => (
                  <div key={respIndex} className="responsibility-row">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) =>
                        handleResponsibilityChange(expIndex, respIndex, e.target.value)
                      }
                      placeholder="Bullet point..."
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeResponsibility(expIndex, respIndex)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => addResponsibility(expIndex)}
                >
                  + Add Responsibility
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="editor-section">
          <h3>{t.template.skills}</h3>

          <div className="skills-editor">
            <div className="skills-group">
              <h4>{t.result.existingSkills}</h4>
              {existingSkills.map((skill, index) => (
                <div key={index} className="skill-row">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange('existing', index, e.target.value)}
                    placeholder="Skill name"
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeSkill('existing', index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={() => addSkill('existing')}
              >
                + Add Skill
              </button>
            </div>

            <div className="skills-group">
              <h4>{t.result.suggestedSkills}</h4>
              {suggestedSkills.map((skill, index) => (
                <div key={index} className="skill-row">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange('suggested', index, e.target.value)}
                    placeholder="Skill name"
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeSkill('suggested', index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={() => addSkill('suggested')}
              >
                + Add Skill
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="editor-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};
