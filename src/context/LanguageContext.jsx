import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translationEngine, SUPPORTED_LANGUAGES, translateText } from '../services/translationEngine';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || localStorage.getItem('crop-dairy-lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    localStorage.setItem('crop-dairy-lang', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = 'ltr';
    translationEngine.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = useCallback((code) => {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (langObj) {
      setCurrentLanguage(code);
      localStorage.setItem('language', code);
      localStorage.setItem('crop-dairy-lang', code);
      translationEngine.setLanguage(code);
    }
  }, []);

  /**
   * Centralized translate method supporting nested key paths e.g. t("welcome.message") or t("sidebar.home")
   * @param {string} key 
   * @param {Object|string} [params] 
   * @param {string} [fallbackText] 
   */
  const translate = useCallback((key, params = {}, fallbackText = '') => {
    return translationEngine.translate(key, params, fallbackText);
  }, [currentLanguage]);

  // Alias `t` to `translate` for shorthand use
  const t = translate;

  const getCurrentLanguage = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    language: currentLanguage,
    setLanguage,
    changeLanguage: setLanguage,
    translate,
    t,
    getCurrentLanguage,
    languages: SUPPORTED_LANGUAGES,
    translateText: (text, sourceLang = 'en') => translateText(text, sourceLang, currentLanguage)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
