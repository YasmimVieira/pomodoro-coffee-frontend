import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pt from './pt';
import en from './en';
import es from './es';
import it from './it';

export const SUPPORTED_LANGS = ['pt', 'en', 'es', 'it'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

export const LANG_META: Record<Lang, { flag: string; label: string }> = {
  pt: { flag: '🇧🇷', label: 'Português' },
  en: { flag: '🇺🇸', label: 'English' },
  es: { flag: '🇪🇸', label: 'Español' },
  it: { flag: '🇮🇹', label: 'Italiano' },
};

const LANG_KEY = 'pomodoro.language';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'pt';
const defaultLng: Lang = (SUPPORTED_LANGS as readonly string[]).includes(deviceLang)
  ? (deviceLang as Lang)
  : 'pt';

i18next.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
    it: { translation: it },
  },
  lng: defaultLng,
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export async function loadSavedLanguage() {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) {
      await i18next.changeLanguage(saved);
    }
  } catch {}
}

export async function setLanguage(lang: Lang) {
  await i18next.changeLanguage(lang);
  AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
}

export default i18next;
