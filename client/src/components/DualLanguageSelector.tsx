import React from 'react';
import { getTranslation } from '../translations';
import './DualLanguageSelector.css';

interface DualLanguageSelectorProps {
  uiLanguage: string;
  cvLanguage: string;
  onUiLanguageChange: (language: string) => void;
  onCvLanguageChange: (language: string) => void;
}

export const DualLanguageSelector: React.FC<DualLanguageSelectorProps> = ({
  uiLanguage,
  cvLanguage,
  onUiLanguageChange,
  onCvLanguageChange,
}) => {
  const t = getTranslation(uiLanguage);

  return (
    <div className="dual-language-selector">
      <div className="language-group">
        <label>{t.languageSelector.uiLanguage}:</label>
        <select value={uiLanguage} onChange={(e) => onUiLanguageChange(e.target.value)}>
          <option value="en">🇬🇧 English</option>
          <option value="da">🇩🇰 Dansk</option>
        </select>
      </div>

      <div className="language-divider">|</div>

      <div className="language-group">
        <label>{t.languageSelector.cvLanguage}:</label>
        <select value={cvLanguage} onChange={(e) => onCvLanguageChange(e.target.value)}>
          <option value="en">🇬🇧 English</option>
          <option value="da">🇩🇰 Dansk</option>
        </select>
      </div>
    </div>
  );
};
