import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en'],
  interpolation: {
    escapeValue: false, // React already escapes strings
  },
});

export default i18n;
