// כרטיס בקשת מיקום במסך הראשי. לא חוסם את המסך, ואפשר לסגור אותו.
// הבקשה לדפדפן נשלחת רק אחרי לחיצה. מציג "מאתר מיקום", סירוב או כישלון בעברית פשוטה.
// מתי נוגעים: כשמשנים את ניסוח בקשת המיקום.
import { Icons as LucideIcons } from './icons';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nProvider';

export type LocationState = 'idle' | 'requesting' | 'denied' | 'unavailable';

interface LocationPermissionCardProps {
  beachName: string;
  state: LocationState;
  onEnable: () => void;
  onDismiss: () => void;
}

export default function LocationPermissionCard({ beachName, state, onEnable, onDismiss }: LocationPermissionCardProps) {
  const { t } = useI18n();
  const failed = state === 'denied' || state === 'unavailable';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sea-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sea-500/20">
          <LucideIcons.MapPin size={24} aria-hidden="true" />
        </div>
        <div className="flex-1" role="status">
          <h4 className="text-sm font-black text-slate-800 mb-1">{t('location.title')}</h4>
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            {failed ? t(state === 'denied' ? 'location.denied' : 'location.unavailable') : t('location.body', { beach: beachName })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 ms-16">
        {!failed && (
          <button onClick={onEnable} disabled={state === 'requesting'} className="flex-1 min-h-11 py-3 bg-sea-700 text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-70">
            {t(state === 'requesting' ? 'location.requesting' : 'location.enable')}
          </button>
        )}
        <button onClick={onDismiss} className="flex-1 min-h-11 py-3 text-slate-700 text-xs font-bold hover:text-slate-900 transition-colors">
          {t('location.notNow')}
        </button>
      </div>
      <p className="text-[11px] text-slate-600 font-medium text-center">{t('location.note')}</p>
    </motion.div>
  );
}
