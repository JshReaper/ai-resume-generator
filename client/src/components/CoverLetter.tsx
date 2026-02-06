import React, { useState } from 'react';
import { cvService } from '../services/api';
import { CoverLetterResponse } from '../types/cv';
import { exportCoverLetterToPdf } from '../utils/pdfExport';
import './CoverLetter.css';

interface CoverLetterProps {
  sessionId: string;
  language: string;
  onClose: () => void;
  initialJobTitle?: string;
  initialJobDescription?: string;
}

type ViewMode = 'form' | 'preview' | 'edit' | 'chat';

export const CoverLetter: React.FC<CoverLetterProps> = ({
  sessionId,
  language,
  onClose,
  initialJobTitle = '',
  initialJobDescription = '',
}) => {
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // Edit mode state
  const [editedContent, setEditedContent] = useState('');

  // Chat mode state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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
      setEditedContent(`${result.salutation}\n\n${result.content}\n\n${result.closing}`);
      setViewMode('preview');
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!coverLetter) return;

    const content = viewMode === 'edit' ? editedContent : `${coverLetter.salutation}\n\n${coverLetter.content}\n\n${coverLetter.closing}`;

    exportCoverLetterToPdf(
      content,
      language,
      `cover-letter-${companyName.replace(/\s+/g, '-')}.pdf`
    );
  };

  const handleEditMode = () => {
    if (coverLetter) {
      setEditedContent(`${coverLetter.salutation}\n\n${coverLetter.content}\n\n${coverLetter.closing}`);
      setViewMode('edit');
    }
  };

  const handleSaveEdit = () => {
    // Update cover letter with edited content
    const parts = editedContent.split('\n\n');
    if (coverLetter && parts.length >= 3) {
      setCoverLetter({
        ...coverLetter,
        salutation: parts[0],
        content: parts.slice(1, -1).join('\n\n'),
        closing: parts[parts.length - 1],
      });
    }
    setViewMode('preview');
  };

  const handleChatMode = () => {
    setViewMode('chat');
    if (chatHistory.length === 0 && coverLetter) {
      setChatHistory([
        {
          role: 'assistant',
          content: `I've generated your cover letter for ${jobTitle} at ${companyName}. What would you like me to adjust?`,
        },
      ]);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !coverLetter) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      // Use the chat endpoint to refine the cover letter
      const chatRequest = `I need you to modify the following cover letter based on this request: "${userMessage}"\n\nCurrent cover letter:\n${coverLetter.salutation}\n\n${coverLetter.content}\n\n${coverLetter.closing}\n\nPlease provide the updated cover letter in the same format (salutation, content, closing).`;

      const response = await cvService.chat(
        sessionId,
        chatRequest,
        jobTitle,
        jobDescription,
        language
      );

      const assistantMessage = response.message;
      setChatHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      // Try to parse the response to update the cover letter
      // This is a simple heuristic - in production you'd want a dedicated endpoint
      const lines = assistantMessage.split('\n\n');
      if (lines.length >= 3) {
        setCoverLetter({
          ...coverLetter,
          salutation: lines[0],
          content: lines.slice(1, -1).join('\n\n'),
          closing: lines[lines.length - 1],
        });
        setEditedContent(assistantMessage);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const suggestedPrompts = [
    'Make it more formal and professional',
    'Add more enthusiasm and personality',
    'Focus more on my technical skills',
    'Keep it concise and to one page',
    'Emphasize my leadership experience',
  ];

  return (
    <div className="cover-letter-modal" onClick={onClose}>
      <div className="cover-letter-container" onClick={(e) => e.stopPropagation()}>
        <div className="cover-letter-header">
          <h2>✉️ Cover Letter Generator</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {viewMode === 'form' && (
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
        )}

        {viewMode === 'preview' && coverLetter && (
          <div className="cover-letter-result">
            <div className="cover-letter-actions">
              <button className="secondary-button" onClick={() => setViewMode('form')}>
                ← Back to Form
              </button>
              <button className="edit-button" onClick={handleEditMode}>
                ✏️ Edit Text
              </button>
              <button className="chat-button" onClick={handleChatMode}>
                💬 Chat to Refine
              </button>
              <button className="export-button" onClick={handleExport}>
                📄 Download PDF
              </button>
            </div>

            <div className="cover-letter-content">
              <p>{coverLetter.salutation},</p>

              {coverLetter.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <p>{coverLetter.closing},</p>
            </div>
          </div>
        )}

        {viewMode === 'edit' && (
          <div className="cover-letter-edit">
            <div className="cover-letter-actions">
              <button className="secondary-button" onClick={() => setViewMode('preview')}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>

            <div className="edit-instructions">
              <p>✏️ Edit your cover letter below. Make any changes you need before downloading.</p>
            </div>

            <textarea
              className="cover-letter-editor"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={20}
              placeholder="Your cover letter content..."
            />
          </div>
        )}

        {viewMode === 'chat' && coverLetter && (
          <div className="cover-letter-chat">
            <div className="cover-letter-actions">
              <button className="secondary-button" onClick={() => setViewMode('preview')}>
                ← Back to Preview
              </button>
              <button className="export-button" onClick={handleExport}>
                📄 Download PDF
              </button>
            </div>

            <div className="chat-container">
              <div className="chat-preview">
                <h3>Current Cover Letter</h3>
                <div className="cover-letter-content-small">
                  <p>{coverLetter.salutation},</p>
                  {coverLetter.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  <p>{coverLetter.closing},</p>
                </div>
              </div>

              <div className="chat-panel">
                <h3>💬 Refine with AI</h3>

                <div className="chat-messages">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="chat-message assistant">
                      <div className="message-avatar">🤖</div>
                      <div className="message-content typing">Thinking...</div>
                    </div>
                  )}
                </div>

                <div className="suggested-prompts">
                  <p>Quick suggestions:</p>
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="suggested-prompt"
                      onClick={() => {
                        setChatMessage(prompt);
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="chat-input">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                    placeholder="Tell me how to improve the cover letter..."
                    rows={3}
                    disabled={isChatLoading}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendChat}
                    disabled={!chatMessage.trim() || isChatLoading}
                  >
                    {isChatLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
