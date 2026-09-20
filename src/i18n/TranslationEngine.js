/**
 * Central Translation Engine for Crop Dairy Platform
 * Inspired by AI4Bharat IndicTrans2 Specifications
 * 
 * Features:
 * - Multilingual Support for Major Indian Languages
 * - Instant in-memory translation key lookup
 * - Fallback Chain: Selected Language -> Key -> English (en) -> Fallback -> Key
 * - Parameter Interpolation: {param} replacement
 * - Dynamic AI4Bharat IndicTrans2 Neural MT Pipeline simulation for dynamic text
 */

import enCatalog from './catalog/en.json';
import hiCatalog from './catalog/hi.json';
import taCatalog from './catalog/ta.json';
import teCatalog from './catalog/te.json';
import knCatalog from './catalog/kn.json';
import mlCatalog from './catalog/ml.json';
import mrCatalog from './catalog/mr.json';
import bnCatalog from './catalog/bn.json';
import guCatalog from './catalog/gu.json';
import paCatalog from './catalog/pa.json';

// Catalogs Map
const CATALOGS = {
  en: enCatalog,
  hi: hiCatalog,
  ta: taCatalog,
  te: teCatalog,
  kn: knCatalog,
  ml: mlCatalog,
  mr: mrCatalog,
  bn: bnCatalog,
  gu: guCatalog,
  pa: paCatalog
};

// Registered Indian Languages Registry (AI4Bharat IndicTrans2 Supported)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'கன்னடம் / ಕನ್ನಡ', script: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', flag: '🇮🇳' }
];

export class TranslationEngine {
  constructor(defaultLang = 'en') {
    this.currentLang = defaultLang;
  }

  setLanguage(langCode) {
    if (CATALOGS[langCode]) {
      this.currentLang = langCode;
      return true;
    }
    return false;
  }

  getLanguage() {
    return this.currentLang;
  }

  /**
   * Translates a key with fallback and parameter interpolation
   * @param {string} key 
   * @param {Object} [params] e.g. { name: 'Ramesh' }
   * @param {string} [fallback] 
   */
  translate(key, params = {}, fallback = '') {
    if (!key) return '';

    const langCatalog = CATALOGS[this.currentLang] || CATALOGS.en;
    let template = langCatalog[key] || CATALOGS.en[key] || fallback || key;

    // Parameter Interpolation {varName}
    if (typeof template === 'string' && params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        const val = params[paramKey];
        template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), val);
      });
    }

    return template;
  }

  /**
   * AI4Bharat IndicTrans2 Neural MT simulation for dynamic content (e.g. AI Assistant responses)
   * @param {string} text 
   * @param {string} targetLang 
   */
  async indicTranslate(text, targetLang = this.currentLang) {
    if (!text || targetLang === 'en') return text;
    // Fast in-catalog lookup if text matches a key or value
    const matchKey = Object.keys(CATALOGS.en).find(k => CATALOGS.en[k] === text);
    if (matchKey) {
      return this.translate(matchKey);
    }
    return text;
  }
}

// Singleton Engine Instance
export const translationEngine = new TranslationEngine();
