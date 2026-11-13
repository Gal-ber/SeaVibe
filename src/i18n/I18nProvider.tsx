// מספק לכל המסכים את השפה הנוכחית ואת הפונקציה t לתרגום.
// מעדכן את lang ו-dir של העמוד, כך שכל העמוד עובר בבת אחת ל-RTL או ל-LTR.
// מתי נוגעים: כמעט אף פעם.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialLang, Lang, LANGS, saveLang, translate } from './translate';

interface I18n {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = LANGS[lang].dir;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    saveLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<I18n>(
    () => ({ lang, dir, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, dir, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
