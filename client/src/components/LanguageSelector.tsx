import React from 'react';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <div className="language-selector">
      <label htmlFor="language">Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        <option value="en">🇬🇧 English</option>
        <option value="da">🇩🇰 Dansk</option>
      </select>
    </div>
  );
};
