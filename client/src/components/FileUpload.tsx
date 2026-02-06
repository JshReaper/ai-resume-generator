import React, { useState, useRef, useCallback } from 'react';
import { getTranslation } from '../translations';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextPaste: (text: string) => void;
  isLoading: boolean;
  language: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextPaste, isLoading, language }) => {
  const t = getTranslation(language);
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
        <h3>{t.fileUpload.analyzingTitle}</h3>
        <p>{t.fileUpload.analyzingText}</p>
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
              <h3>{t.fileUpload.dropHere}</h3>
              <p>{t.fileUpload.orClick}</p>
              <span className="file-types">{t.fileUpload.supports}</span>
            </div>
          </div>

          <div className="upload-divider">
            <span>{t.fileUpload.or}</span>
          </div>

          <button
            className="text-paste-button"
            onClick={() => setShowTextInput(true)}
          >
            <span className="paste-icon">📋</span>
            {t.fileUpload.pasteButton}
          </button>
        </>
      ) : (
        <div className="text-input-section">
          <button
            className="back-button"
            onClick={() => setShowTextInput(false)}
          >
            {t.fileUpload.backButton}
          </button>
          <h3>{t.fileUpload.pasteTitle}</h3>
          <p className="hint">{t.fileUpload.pasteHint}</p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={t.fileUpload.placeholder + `

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
BS Computer Science - University of Technology (2018)`}
            rows={15}
          />
          <div className="text-submit-row">
            <span className="char-count">
              {pastedText.length} {t.fileUpload.characters}
              {pastedText.length > 0 && pastedText.length < 50 && ` (${t.fileUpload.minimum})`}
            </span>
            <button
              className="submit-text-button"
              onClick={handleTextSubmit}
              disabled={pastedText.trim().length < 50}
            >
              {t.fileUpload.analyzeButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
