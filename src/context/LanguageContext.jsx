import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Static catalogs
import enCatalog from '../i18n/catalog/en.json';
import taCatalog from '../i18n/catalog/ta.json';
import hiCatalog from '../i18n/catalog/hi.json';

const catalogs = { en: enCatalog, ta: taCatalog, hi: hiCatalog };

const LANGUAGE_REGISTRY = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', translationSupported: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', translationSupported: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', translationSupported: true },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('crop-dairy-lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('crop-dairy-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, fallback) => {
    const catalog = catalogs[language] || catalogs.en;
    return catalog[key] || catalogs.en[key] || fallback || key;
  }, [language]);

  const changeLanguage = useCallback((code) => {
    const lang = LANGUAGE_REGISTRY.find(l => l.code === code);
    if (lang) setLanguage(code);
  }, []);

  const getCurrentLanguage = useCallback(() => {
    return LANGUAGE_REGISTRY.find(l => l.code === language) || LANGUAGE_REGISTRY[0];
  }, [language]);

  const value = {
    language,
    t,
    changeLanguage,
    getCurrentLanguage,
    languages: LANGUAGE_REGISTRY,
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
