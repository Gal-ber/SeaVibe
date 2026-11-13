// חלון "פרטיות ותנאים": מה נשמר, מה לא, מקור הנתונים, ושהציון אינו אישור בטיחות.
// נפתח מקישור בתחתית המסך הראשי ומסך הפתיחה. מתי נוגעים: כשמשתנה מה שנשמר או נשלח.
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useBackToClose } from '../lib/useBackToClose';

const SECTIONS = ['device', 'location', 'reports', 'tracking', 'data'];

export default function PrivacyInfo() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useBackToClose(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="min-h-11 px-3 text-xs font-bold text-slate-700 underline underline-offset-4">
        {t('privacy.link')}
      </button>
      {open && (
        <div className="safe-area fixed inset-0 z-[200] bg-slate-900/40 flex items-end sm:items-center justify-center" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-5 text-start"
          >
            <h2 id="privacy-title" className="text-2xl font-black text-slate-900">{t('privacy.title')}</h2>
            {SECTIONS.map((s) => (
              <section key={s}>
                <h3 className="font-extrabold text-slate-900 mb-1">{t(`privacy.${s}.title`)}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{t(`privacy.${s}.body`)}</p>
              </section>
            ))}
            <p className="text-sm font-bold text-slate-800 bg-slate-50 rounded-2xl p-4 border border-slate-200">{t('disclaimer')}</p>
            <button ref={closeRef} onClick={close} className="w-full min-h-11 py-3 bg-sea-700 text-white rounded-2xl font-extrabold">
              {t('privacy.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
