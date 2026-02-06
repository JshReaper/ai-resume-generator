import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { CvSummary } from './components/CvSummary';
import { ChatInterface } from './components/ChatInterface';
import { DualLanguageSelector } from './components/DualLanguageSelector';
import { ResumeTemplate, TemplateSelector } from './components/ResumeTemplates';
import { CoverLetter } from './components/CoverLetter';
import { ResumeEditor } from './components/ResumeEditor';
import { cvService } from './services/api';
import { CvUploadResponse, ChatMessage, ParsedCvData } from './types/cv';
import { ResumeResponse } from './types/resume';
import { exportResumeToPdf } from './utils/pdfExport';
import { getTranslation } from './translations';
import './App.css';

type AppStep = 'upload' | 'refine' | 'result';

function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Language and preferences
  const [uiLanguage, setUiLanguage] = useState<string>('en');
  const [cvLanguage, setCvLanguage] = useState<string>('en');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  // Derive country code from CV language
  const countryCode = useMemo(() => {
    return cvLanguage === 'da' ? 'DK' : 'US';
  }, [cvLanguage]);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCvData | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Target job state
  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Result state
  const [enhancedResume, setEnhancedResume] = useState<ResumeResponse | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get translations
  const t = getTranslation(uiLanguage);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cvService.uploadFile(file, cvLanguage, countryCode);
      handleUploadSuccess(result);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextPaste = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cvService.uploadText(text, cvLanguage, countryCode);
      handleUploadSuccess(result);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (result: CvUploadResponse) => {
    setSessionId(result.sessionId);
    setParsedData(result.parsedData);
    setAiSummary(result.aiSummary);
    setImprovements(result.suggestedImprovements);
    setStep('refine');
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId) return;

    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const result = await cvService.chat(
        sessionId,
        message,
        targetJob || undefined,
        jobDescription || undefined,
        cvLanguage
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.message }]);

      if (result.updatedCvData) {
        setParsedData(result.updatedCvData);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await cvService.generateResume({
        sessionId,
        targetJobTitle: targetJob || undefined,
        targetJobDescription: jobDescription || undefined,
        language: cvLanguage,
        countryCode,
        template: selectedTemplate,
      });
      setEnhancedResume(result);
      setStep('result');
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error('Error:', err);
    if (err.code === 'ERR_NETWORK') {
      setError('Cannot connect to the API. Make sure the backend is running.');
    } else {
      setError(err.response?.data || 'Something went wrong. Please try again.');
    }
  };

  const handleStartOver = () => {
    setStep('upload');
    setSessionId(null);
    setParsedData(null);
    setAiSummary('');
    setImprovements([]);
    setChatMessages([]);
    setEnhancedResume(null);
    setTargetJob('');
    setJobDescription('');
    setError(null);
  };

  const handleExportPdf = () => {
    if (!parsedData || !enhancedResume) return;

    const filename = `resume-${parsedData.fullName?.replace(/\s+/g, '-') || 'download'}.pdf`;
    exportResumeToPdf({
      cvData: parsedData,
      resumeData: enhancedResume,
      language: cvLanguage,
      filename
    });
  };

  const handleEditResume = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedCvData: ParsedCvData, updatedResumeData: ResumeResponse) => {
    setParsedData(updatedCvData);
    setEnhancedResume(updatedResumeData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>{t.header.title}</h1>
          <p>{t.header.subtitle}</p>
        </div>
        <div className="header-actions">
          <DualLanguageSelector
            uiLanguage={uiLanguage}
            cvLanguage={cvLanguage}
            onUiLanguageChange={setUiLanguage}
            onCvLanguageChange={setCvLanguage}
          />
          {step !== 'upload' && (
            <button className="start-over-btn" onClick={handleStartOver}>
              {t.header.startOver}
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="upload-step">
            <div className="step-intro">
              <h2>{t.upload.stepTitle}</h2>
              <p>{t.upload.stepDescription}</p>
            </div>
            <FileUpload
              onFileSelect={handleFileSelect}
              onTextPaste={handleTextPaste}
              isLoading={isLoading}
              language={uiLanguage}
            />
          </div>
        )}

        {/* Step 2: Refine */}
        {step === 'refine' && parsedData && (
          <div className="refine-step">
            <div className="step-intro">
              <h2>{t.refine.stepTitle}</h2>
              <p>{t.refine.stepDescription}</p>
            </div>

            {/* Template Selection */}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />

            {/* Target Job Section */}
            <div className="target-job-section">
              <h3>{t.refine.targetJob}</h3>
              <p>{t.refine.targetJobDescription}</p>
              <div className="target-inputs">
                <input
                  type="text"
                  placeholder={t.refine.jobTitlePlaceholder}
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                />
                <textarea
                  placeholder={t.refine.jobDescPlaceholder}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="refine-layout">
              <div className="refine-sidebar">
                <CvSummary
                  parsedData={parsedData}
                  aiSummary={aiSummary}
                  improvements={improvements}
                />
              </div>
              <div className="refine-main">
                <ChatInterface
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onGenerateResume={handleGenerateResume}
                  isLoading={isLoading}
                  suggestedPrompts={improvements.slice(0, 4)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && enhancedResume && parsedData && (
          <div className="result-step">
            {isEditing ? (
              <ResumeEditor
                cvData={parsedData}
                resumeData={enhancedResume}
                language={cvLanguage}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <>
                <div className="step-intro">
                  <h2>{t.result.stepTitle}</h2>
                  <p>{t.result.stepDescription}</p>
                </div>

                <div className="result-content">
                  <ResumeTemplate
                    cvData={parsedData}
                    resumeData={enhancedResume}
                    template={selectedTemplate}
                    language={cvLanguage}
                  />
                </div>

                <div className="result-actions">
                  <button className="btn-secondary" onClick={() => setStep('refine')}>
                    {t.result.backButton}
                  </button>
                  <button className="btn-accent" onClick={handleEditResume}>
                    ✏️ Edit Resume
                  </button>
                  <button className="btn-primary" onClick={handleExportPdf}>
                    {t.result.downloadButton}
                  </button>
                  <button className="btn-accent" onClick={() => setShowCoverLetter(true)}>
                    {t.result.coverLetterButton}
                  </button>
                </div>

                <div className="skills-legend">
                  <p>
                    <span className="legend-item">
                      <span className="skill-tag">Your Skills</span>
                      {t.result.existingSkills}
                    </span>
                    <span className="legend-item">
                      <span className="skill-tag suggested">New Skills</span>
                      {t.result.suggestedSkills}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Cover Letter Modal */}
      {showCoverLetter && sessionId && (
        <CoverLetter
          sessionId={sessionId}
          language={cvLanguage}
          onClose={() => setShowCoverLetter(false)}
        />
      )}

      <footer className="app-footer">
        <p>{t.footer.text}</p>
      </footer>
    </div>
  );
}

export default App;
