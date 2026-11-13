// רצועת הפעילויות: בחירת פעילות משנה בבת אחת את הציון, ההסבר, חלון הזמן והטבלה.
// מתי נוגעים: כשמוסיפים פעילות (גם ב-src/data/beaches.ts ובקובצי הטקסטים).
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ACTIVITIES } from '../data/beaches';
import { ActivityId } from '../types';
import { useI18n } from '../i18n/I18nProvider';

interface ActivitySelectorProps {
  selectedActivity: ActivityId;
  onSelect: (id: ActivityId) => void;
  onOpenPreferences?: () => void;
}

export default function ActivitySelector({ selectedActivity, onSelect, onOpenPreferences }: ActivitySelectorProps) {
  const { t } = useI18n();
  return (
    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
      {ACTIVITIES.map((activity, index) => {
        const IconComponent = (LucideIcons as any)[activity.icon] || LucideIcons.HelpCircle;
        const active = selectedActivity === activity.id;
        return (
          <motion.button
            key={activity.id}
            id={`activity-${activity.id}`}
            aria-pressed={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(activity.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 border-2 ${
              active
                ? 'bg-sea-600 text-white border-sea-600 shadow-xl shadow-sea-500/30 scale-105 z-10'
                : 'bg-white/70 backdrop-blur-md text-slate-600 border-transparent hover:bg-white hover:border-sea-100'
            }`}
          >
            <div className={`p-3 rounded-2xl ${active ? 'bg-white/20' : 'bg-sea-50 text-sea-500'}`}>
              <IconComponent size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${active ? 'text-white' : 'text-slate-500'}`}>
              {t(`activity.${activity.id}`)}
            </span>
          </motion.button>
        );
      })}

      {onOpenPreferences && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ACTIVITIES.length * 0.05 }}
          onClick={onOpenPreferences}
          className="flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 bg-white/40 backdrop-blur-md text-slate-500 border-2 border-dashed border-slate-200 hover:bg-white hover:border-slate-300 group"
        >
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-slate-500">
            <LucideIcons.ClipboardEdit size={24} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t('activity.preferences')}</span>
        </motion.button>
      )}
    </div>
  );
}
