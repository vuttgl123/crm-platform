import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';
import { storageAdapter } from '@/services/storageAdapter';

const initialLocale = storageAdapter.getLocale() || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    vi: { translation: viTranslation },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes strings
  },
});

export default i18n;
