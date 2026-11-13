// רצועת הפעילויות: בחירת פעילות משנה בבת אחת את הציון, ההסבר, חלון הזמן והטבלה.
// מתי נוגעים: כשמוסיפים פעילות (גם ב-src/data/beaches.ts ובקובצי הטקסטים).
import { useEffect, useRef } from 'react';
import { Icons as LucideIcons } from './icons';
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
  const stripRef = useRef<HTMLDivElement>(null);

  // הפעילות הנבחרת נגללת לתוך הרצועה (רק אופקית, בלי להזיז את העמוד)
  useEffect(() => {
    const strip = stripRef.current;
    const button = strip?.querySelector<HTMLElement>(`#activity-${selectedActivity}`);
    if (!strip || !button) return;
    const s = strip.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    const delta = b.left < s.left ? b.left - s.left - 8 : b.right > s.right ? b.right - s.right + 8 : 0;
    if (delta) strip.scrollBy({ left: delta });
  }, [selectedActivity]);

  return (
    <div ref={stripRef} role="group" aria-label={t('activity.label')} className="flex overflow-x-auto pt-2 pb-4 px-1 gap-3 no-scrollbar">
      {ACTIVITIES.map((activity) => {
        const IconComponent = (LucideIcons as any)[activity.icon] || LucideIcons.HelpCircle;
        const active = selectedActivity === activity.id;
        return (
          <button
            key={activity.id}
            id={`activity-${activity.id}`}
            aria-pressed={active}
            onClick={() => onSelect(activity.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 border-2 ${
              active
                ? 'bg-sea-700 text-white border-sea-700 shadow-xl shadow-sea-500/30 scale-105 z-10'
                : 'bg-white/90 backdrop-blur-md text-slate-700 border-transparent hover:bg-white hover:border-sea-100'
            }`}
          >
            <div className={`p-3 rounded-2xl ${active ? 'bg-white/20' : 'bg-sea-50 text-sea-500'}`}>
              <IconComponent size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${active ? 'text-white' : 'text-slate-700'}`}>
              {t(`activity.${activity.id}`)}
            </span>
          </button>
        );
      })}

      {onOpenPreferences && (
        <button
          onClick={onOpenPreferences}
          className="flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 bg-white/90 backdrop-blur-md text-slate-700 border-2 border-dashed border-slate-200 hover:bg-white hover:border-slate-300 group"
        >
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-slate-500">
            <LucideIcons.ClipboardEdit size={24} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t('activity.preferences')}</span>
        </button>
      )}
    </div>
  );
}
