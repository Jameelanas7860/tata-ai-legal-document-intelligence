import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations, SUPPORTED_LANGUAGES } from '../i18n/translations';

const I18nContext = createContext(null);
const STORAGE_KEY = 'ldi_language';

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch {
    // ignore
  }
  return 'English';
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    }
  }, []);

  const t = useMemo(() => {
    const dict = translations[language] || translations.English;
    return (key) => dict[key] ?? translations.English[key] ?? key;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
