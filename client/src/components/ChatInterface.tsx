import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/cv';
import './ChatInterface.css';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onGenerateResume: () => void;
  isLoading: boolean;
  suggestedPrompts?: string[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onGenerateResume,
  isLoading,
  suggestedPrompts = []
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const defaultSuggestions = [
    "Make my experience sound more impressive",
    "Add more technical keywords for ATS",
    "Tailor this for a senior role",
    "Shorten my summary to 2 sentences"
  ];

  const prompts = suggestedPrompts.length > 0 ? suggestedPrompts : defaultSuggestions;

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h3>💬 Let's improve your CV</h3>
            <p>Ask me anything or use a suggestion below:</p>
            <div className="suggested-prompts">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  className="prompt-chip"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && !isLoading && (
        <div className="quick-actions">
          <span>Quick actions:</span>
          {prompts.slice(0, 3).map((prompt, index) => (
            <button
              key={index}
              className="quick-action-chip"
              onClick={() => handleSuggestedPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to improve your CV, or request specific changes..."
          rows={1}
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading}>
          Send
        </button>
      </form>

      <div className="generate-section">
        <button
          className="generate-button"
          onClick={onGenerateResume}
          disabled={isLoading}
        >
          ✨ Generate Optimized Resume
        </button>
        <p className="generate-hint">
          Ready to create your enhanced resume? Click above!
        </p>
      </div>
    </div>
  );
};
