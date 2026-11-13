// כרטיס בקשת מיקום במסך הראשי. לא חוסם את המסך, ואפשר לסגור אותו.
// מתי נוגעים: שלב 3ג (מיקום אמיתי).
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nProvider';

interface LocationPermissionCardProps {
  beachName: string;
  onEnable: () => void;
  onDismiss: () => void;
}

export default function LocationPermissionCard({ beachName, onEnable, onDismiss }: LocationPermissionCardProps) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sea-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sea-500/20">
          <LucideIcons.MapPin size={24} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 mb-1">{t('location.title')}</h4>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">{t('location.body', { beach: beachName })}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 ms-16">
        <button onClick={onEnable} className="flex-1 min-h-11 py-3 bg-sea-600 text-white text-xs font-black rounded-xl shadow-lg shadow-sea-600/20 active:scale-95 transition-all">
          {t('location.enable')}
        </button>
        <button onClick={onDismiss} className="flex-1 min-h-11 py-3 text-slate-600 text-xs font-bold hover:text-slate-800 transition-colors">
          {t('location.notNow')}
        </button>
      </div>
      <p className="text-[10px] text-slate-500 font-medium text-center">{t('location.note')}</p>
    </motion.div>
  );
}
