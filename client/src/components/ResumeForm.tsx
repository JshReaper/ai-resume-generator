import React, { useState } from 'react';
import { ResumeRequest, WorkExperience, Education } from '../types/resume';
import './ResumeForm.css';

interface ResumeFormProps {
  onSubmit: (data: ResumeRequest) => void;
  isLoading: boolean;
}

const emptyWorkExperience: WorkExperience = {
  jobTitle: '',
  company: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  responsibilities: [''],
};

const emptyEducation: Education = {
  degree: '',
  institution: '',
  graduationYear: '',
  fieldOfStudy: '',
};

export const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ResumeRequest>({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    summary: '',
    workExperiences: [{ ...emptyWorkExperience }],
    educations: [{ ...emptyEducation }],
    skills: [],
    targetJobTitle: '',
    targetJobDescription: '',
  });

  const [skillInput, setSkillInput] = useState('');

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Work Experience handlers
  const handleWorkChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    setFormData(prev => {
      const updated = [...prev.workExperiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workExperiences: updated };
    });
  };

  const handleResponsibilityChange = (workIndex: number, respIndex: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.workExperiences];
      const responsibilities = [...updated[workIndex].responsibilities];
      responsibilities[respIndex] = value;
      updated[workIndex] = { ...updated[workIndex], responsibilities };
      return { ...prev, workExperiences: updated };
    });
  };

  const addResponsibility = (workIndex: number) => {
    setFormData(prev => {
      const updated = [...prev.workExperiences];
      updated[workIndex] = {
        ...updated[workIndex],
        responsibilities: [...updated[workIndex].responsibilities, ''],
      };
      return { ...prev, workExperiences: updated };
    });
  };

  const removeResponsibility = (workIndex: number, respIndex: number) => {
    setFormData(prev => {
      const updated = [...prev.workExperiences];
      const responsibilities = updated[workIndex].responsibilities.filter((_, i) => i !== respIndex);
      updated[workIndex] = { ...updated[workIndex], responsibilities };
      return { ...prev, workExperiences: updated };
    });
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, { ...emptyWorkExperience, responsibilities: [''] }],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index),
    }));
  };

  // Education handlers
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => {
      const updated = [...prev.educations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educations: updated };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...prev.educations, { ...emptyEducation }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  // Skills handlers
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty responsibilities
    const cleanedData = {
      ...formData,
      workExperiences: formData.workExperiences.map(exp => ({
        ...exp,
        responsibilities: exp.responsibilities.filter(r => r.trim() !== ''),
      })),
    };
    onSubmit(cleanedData);
  };

  return (
    <form className="resume-form" onSubmit={handleSubmit}>
      {/* Personal Information */}
      <section className="form-section">
        <h2>Personal Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleBasicChange}
              required
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleBasicChange}
              required
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleBasicChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="form-group">
            <label htmlFor="linkedIn">LinkedIn</label>
            <input
              type="url"
              id="linkedIn"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleBasicChange}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="summary">Professional Summary (optional - AI will generate one)</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleBasicChange}
            rows={3}
            placeholder="Brief overview of your professional background..."
          />
        </div>
      </section>

      {/* Target Job */}
      <section className="form-section">
        <h2>Target Position</h2>
        <p className="section-hint">Help the AI tailor your resume to a specific job</p>
        <div className="form-group">
          <label htmlFor="targetJobTitle">Target Job Title</label>
          <input
            type="text"
            id="targetJobTitle"
            name="targetJobTitle"
            value={formData.targetJobTitle}
            onChange={handleBasicChange}
            placeholder="Senior Software Engineer"
          />
        </div>
        <div className="form-group">
          <label htmlFor="targetJobDescription">Job Description (paste the job posting)</label>
          <textarea
            id="targetJobDescription"
            name="targetJobDescription"
            value={formData.targetJobDescription}
            onChange={handleBasicChange}
            rows={4}
            placeholder="Paste the job description here to optimize your resume for ATS..."
          />
        </div>
      </section>

      {/* Work Experience */}
      <section className="form-section">
        <h2>Work Experience</h2>
        {formData.workExperiences.map((exp, workIndex) => (
          <div key={workIndex} className="experience-card">
            <div className="card-header">
              <h3>Position {workIndex + 1}</h3>
              {formData.workExperiences.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeWorkExperience(workIndex)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => handleWorkChange(workIndex, 'jobTitle', e.target.value)}
                  required
                  placeholder="Software Developer"
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleWorkChange(workIndex, 'company', e.target.value)}
                  required
                  placeholder="Tech Company Inc."
                />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => handleWorkChange(workIndex, 'startDate', e.target.value)}
                  required
                  placeholder="Jan 2020"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => handleWorkChange(workIndex, 'endDate', e.target.value)}
                  disabled={exp.isCurrent}
                  placeholder={exp.isCurrent ? 'Present' : 'Dec 2023'}
                />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={exp.isCurrent}
                  onChange={(e) => handleWorkChange(workIndex, 'isCurrent', e.target.checked)}
                />
                I currently work here
              </label>
            </div>
            <div className="form-group">
              <label>Responsibilities / Achievements</label>
              {exp.responsibilities.map((resp, respIndex) => (
                <div key={respIndex} className="responsibility-row">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(workIndex, respIndex, e.target.value)}
                    placeholder="Describe what you did..."
                  />
                  {exp.responsibilities.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-small"
                      onClick={() => removeResponsibility(workIndex, respIndex)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn-add-small"
                onClick={() => addResponsibility(workIndex)}
              >
                + Add Responsibility
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addWorkExperience}>
          + Add Work Experience
        </button>
      </section>

      {/* Education */}
      <section className="form-section">
        <h2>Education</h2>
        {formData.educations.map((edu, index) => (
          <div key={index} className="experience-card">
            <div className="card-header">
              <h3>Education {index + 1}</h3>
              {formData.educations.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeEducation(index)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Degree *</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  required
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Institution *</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  required
                  placeholder="University of Technology"
                />
              </div>
              <div className="form-group">
                <label>Graduation Year *</label>
                <input
                  type="text"
                  value={edu.graduationYear}
                  onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                  required
                  placeholder="2020"
                />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addEducation}>
          + Add Education
        </button>
      </section>

      {/* Skills */}
      <section className="form-section">
        <h2>Skills</h2>
        <div className="skills-input-row">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Type a skill and press Enter"
          />
          <button type="button" className="btn-add-small" onClick={addSkill}>
            Add
          </button>
        </div>
        <div className="skills-list">
          {formData.skills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)}>×</button>
            </span>
          ))}
        </div>
      </section>

      {/* Submit */}
      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Enhancing your resume...
          </>
        ) : (
          'Generate Enhanced Resume'
        )}
      </button>
    </form>
  );
};
