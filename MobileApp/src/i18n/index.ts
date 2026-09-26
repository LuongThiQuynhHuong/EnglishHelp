import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation';
import vi from './vi/translation';

const i18n = createInstance();

// Resources are bundled so language changes never require network access.
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
