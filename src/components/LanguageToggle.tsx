// כפתור החלפת השפה (עב | EN). קבוע בראש המסך, מחליף בבת אחת בלי טעינה מחדש.
// מתי נוגעים: כשמוסיפים שפה שלישית (מוסיפים כפתור).
import { useI18n } from '../i18n/I18nProvider';
import { Lang } from '../i18n/translate';

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'he', label: 'lang.name.he' },
  { lang: 'en', label: 'lang.name.en' },
];

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('lang.label')} className="inline-flex rounded-full bg-white/70 backdrop-blur-md border border-white/60 p-0.5 shadow-sm">
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          lang={o.lang}
          onClick={() => setLang(o.lang)}
          aria-pressed={lang === o.lang}
          className={`min-w-11 min-h-11 px-3 rounded-full text-sm font-black transition-colors ${lang === o.lang ? 'bg-sea-700 text-white' : 'text-slate-700 hover:bg-white'}`}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}
