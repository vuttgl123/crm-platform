import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';
import { storageAdapter } from '@/services/storageAdapter';

const initialLocale = storageAdapter.getLocale() || 'vi';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: viTranslation },
    en: { translation: enTranslation },
  },
  lng: initialLocale,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false, // React already escapes strings
  },
});

export default i18n;
