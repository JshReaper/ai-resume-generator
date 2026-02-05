import { translations, getTranslation, Translations } from './translations';

describe('Translations', () => {
  describe('Translation completeness', () => {
    it('has translations for both English and Danish', () => {
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('da');
    });

    it('English and Danish have same structure', () => {
      const enKeys = getAllKeys(translations.en);
      const daKeys = getAllKeys(translations.da);

      expect(enKeys.sort()).toEqual(daKeys.sort());
    });

    it('has all required sections', () => {
      const requiredSections = [
        'header',
        'upload',
        'refine',
        'result',
        'languageSelector',
        'footer',
        'template'
      ];

      requiredSections.forEach(section => {
        expect(translations.en).toHaveProperty(section);
        expect(translations.da).toHaveProperty(section);
      });
    });

    it('header section has all required keys', () => {
      const requiredKeys = ['title', 'subtitle', 'startOver'];

      requiredKeys.forEach(key => {
        expect(translations.en.header).toHaveProperty(key);
        expect(translations.da.header).toHaveProperty(key);
      });
    });

    it('template section has all required keys', () => {
      const requiredKeys = [
        'professionalSummary',
        'experience',
        'education',
        'skills',
        'keywords',
        'present'
      ];

      requiredKeys.forEach(key => {
        expect(translations.en.template).toHaveProperty(key);
        expect(translations.da.template).toHaveProperty(key);
      });
    });

    it('all translation values are non-empty strings', () => {
      const enValues = getAllValues(translations.en);
      const daValues = getAllValues(translations.da);

      enValues.forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });

      daValues.forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getTranslation', () => {
    it('returns English translations for "en"', () => {
      const result = getTranslation('en');
      expect(result).toBe(translations.en);
    });

    it('returns Danish translations for "da"', () => {
      const result = getTranslation('da');
      expect(result).toBe(translations.da);
    });

    it('returns English translations for unknown language', () => {
      const result = getTranslation('fr');
      expect(result).toBe(translations.en);
    });

    it('returned translations have correct type', () => {
      const result = getTranslation('en');

      expect(result).toHaveProperty('header');
      expect(result).toHaveProperty('upload');
      expect(result).toHaveProperty('refine');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('languageSelector');
      expect(result).toHaveProperty('footer');
      expect(result).toHaveProperty('template');
    });
  });

  describe('Template translations', () => {
    it('Danish template translations are different from English', () => {
      expect(translations.da.template.professionalSummary).not.toBe(
        translations.en.template.professionalSummary
      );
      expect(translations.da.template.experience).not.toBe(
        translations.en.template.experience
      );
      expect(translations.da.template.education).not.toBe(
        translations.en.template.education
      );
      expect(translations.da.template.skills).not.toBe(
        translations.en.template.skills
      );
      expect(translations.da.template.present).not.toBe(
        translations.en.template.present
      );
    });

    it('Present is translated correctly', () => {
      expect(translations.en.template.present).toBe('Present');
      expect(translations.da.template.present).toBe('Nu');
    });
  });
});

// Helper functions
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function getAllValues(obj: any): string[] {
  let values: string[] = [];

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      values = values.concat(getAllValues(obj[key]));
    } else if (typeof obj[key] === 'string') {
      values.push(obj[key]);
    }
  }

  return values;
}
