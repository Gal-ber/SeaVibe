// תרגום: מחזיר את הטקסט לפי מפתח ושפה מקובצי config/texts/*.json.
// כדי להוסיף שפה שלישית: מוסיפים קובץ טקסטים ושורה ב-LANGS. אין צורך לשנות קוד אחר.
// מתי נוגעים: רק כשמוסיפים שפה.
import he from '../../config/texts/he.json';
import en from '../../config/texts/en.json';

export const LANGS = { he: { texts: he as Record<string, string>, dir: 'rtl' }, en: { texts: en as Record<string, string>, dir: 'ltr' } } as const;
export type Lang = keyof typeof LANGS;

const STORAGE_KEY = 'seavibes_lang';

export function translate(lang: Lang, key: string, vars: Record<string, string | number> = {}): string {
  const template = LANGS[lang].texts[key] ?? LANGS.he.texts[key] ?? key;
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), template);
}

// שפה שמורה, אחרת לפי שפת הדפדפן (עברית אם הדפדפן בעברית, אחרת אנגלית)
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'he' || saved === 'en') return saved;
  } catch {
    // אחסון לא זמין: ממשיכים לפי הדפדפן
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('he') ? 'he' : 'en';
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // אחסון לא זמין: הבחירה תחזיק רק עד סגירת הדף
  }
}
