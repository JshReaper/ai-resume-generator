import React, { useState, useRef, useCallback } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextPaste: (text: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextPaste, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validExtensions = ['.pdf', '.docx'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  };

  const handleTextSubmit = () => {
    if (pastedText.trim().length > 50) {
      onTextPaste(pastedText.trim());
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="upload-loading">
        <div className="loading-spinner"></div>
        <h3>Analyzing your CV...</h3>
        <p>Our AI is extracting and parsing your information</p>
      </div>
    );
  }

  return (
    <div className="file-upload-container">
      {!showTextInput ? (
        <>
          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="dropzone-content">
              <div className="upload-icon">📄</div>
              <h3>Drop your CV here</h3>
              <p>or click to browse</p>
              <span className="file-types">Supports PDF & DOCX</span>
            </div>
          </div>

          <div className="upload-divider">
            <span>or</span>
          </div>

          <button
            className="text-paste-button"
            onClick={() => setShowTextInput(true)}
          >
            <span className="paste-icon">📋</span>
            Paste from LinkedIn or text
          </button>
        </>
      ) : (
        <div className="text-input-section">
          <button
            className="back-button"
            onClick={() => setShowTextInput(false)}
          >
            ← Back to file upload
          </button>
          <h3>Paste your CV content</h3>
          <p className="hint">Copy your LinkedIn profile, existing resume text, or any career information</p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your CV/LinkedIn content here...

Example:
John Doe
Software Engineer at Tech Company

About
Experienced software developer with 5+ years...

Experience
Senior Developer - Tech Corp (2020 - Present)
• Led development of microservices architecture
• Mentored team of 5 junior developers

Education
BS Computer Science - University of Technology (2018)"
            rows={15}
          />
          <div className="text-submit-row">
            <span className="char-count">
              {pastedText.length} characters
              {pastedText.length > 0 && pastedText.length < 50 && ' (minimum 50)'}
            </span>
            <button
              className="submit-text-button"
              onClick={handleTextSubmit}
              disabled={pastedText.trim().length < 50}
            >
              Analyze Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
