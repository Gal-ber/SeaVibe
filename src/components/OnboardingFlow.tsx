// מסך הפתיחה: ארבעה שלבים (חופים, מיקום, פעילויות, סיום). אין חשבון, הכול נשמר במכשיר.
// מתי נוגעים: שלב 3ג (מיקום אמיתי, דילוג בכל שלב).
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { BEACHES, ACTIVITIES, beachCity, beachName } from '../data/beaches';
import { ActivityId } from '../types';
import { useI18n } from '../i18n/I18nProvider';
import LanguageToggle from './LanguageToggle';

interface OnboardingFlowProps {
  initialFavorites?: string[];
  initialActivities?: ActivityId[];
  onComplete: (data: { favorites: string[]; favoriteActivities: ActivityId[]; locationPermission: boolean }) => void;
}

const optionClass = (selected: boolean) =>
  `min-h-11 p-4 rounded-2xl border-2 transition-all ${selected ? 'border-sea-500 bg-sea-50 text-sea-800' : 'border-slate-100 bg-white text-slate-700 hover:border-sea-200'}`;

export default function OnboardingFlow({ onComplete, initialFavorites = [], initialActivities = [] }: OnboardingFlowProps) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [activities, setActivities] = useState<ActivityId[]>(initialActivities);

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const finish = (locationPermission: boolean) => onComplete({ favorites, favoriteActivities: activities, locationPermission });
  const next = () => setStep(step + 1);
  const back = () => (step > 1 ? setStep(step - 1) : onComplete({ favorites: initialFavorites, favoriteActivities: initialActivities, locationPermission: false }));

  const steps = [
    {
      key: 'beaches',
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto no-scrollbar pb-4">
          {BEACHES.map((beach) => (
            <button key={beach.id} aria-pressed={favorites.includes(beach.id)} onClick={() => setFavorites(toggle(favorites, beach.id))} className={`${optionClass(favorites.includes(beach.id))} text-start flex items-center justify-between`}>
              <span>
                <span className="block font-extrabold">{beachName(beach, lang)}</span>
                <span className="block text-[11px] text-slate-600">{beachCity(beach, lang)}</span>
              </span>
              {favorites.includes(beach.id) && <LucideIcons.CheckCircle2 className="text-sea-600" size={20} aria-hidden="true" />}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: 'location',
      render: () => (
        <div className="flex flex-col items-center py-8 space-y-8">
          <div className="w-20 h-20 bg-sea-50 rounded-full flex items-center justify-center text-sea-600">
            <LucideIcons.MapPin size={40} aria-hidden="true" />
          </div>
          <div className="w-full space-y-3">
            <button onClick={() => finish(true)} className="w-full min-h-11 py-4 bg-sea-700 text-white rounded-2xl font-extrabold shadow-lg shadow-sea-200">
              {t('onboarding.location.allow')}
            </button>
            <button onClick={next} className="w-full min-h-11 py-4 text-slate-600 font-bold hover:text-slate-800">
              {t('onboarding.location.later')}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'activities',
      render: () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACTIVITIES.map((activity) => (
            <button key={activity.id} aria-pressed={activities.includes(activity.id)} onClick={() => setActivities(toggle(activities, activity.id))} className={`${optionClass(activities.includes(activity.id))} text-center flex flex-col items-center gap-2`}>
              <span className={`p-2 rounded-xl ${activities.includes(activity.id) ? 'bg-sea-100' : 'bg-slate-50'}`}>
                {React.createElement((LucideIcons as any)[activity.icon], { size: 20, 'aria-hidden': true })}
              </span>
              <span className="text-xs font-bold">{t(`activity.${activity.id}`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: 'done',
      render: () => (
        <div className="flex flex-col items-center py-12 space-y-8">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <LucideIcons.Check size={48} aria-hidden="true" />
          </div>
          <button onClick={() => finish(false)} className="w-full min-h-11 py-4 bg-sea-700 text-white rounded-2xl font-extrabold shadow-lg shadow-sea-200">
            {t('onboarding.done.cta')}
          </button>
        </div>
      ),
    },
  ];
  const current = steps[step - 1];
  const canContinue = !(step === 1 && favorites.length === 0);

  return (
    <div className="safe-area fixed inset-0 z-50 bg-white flex flex-col p-6 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-xl mx-auto flex flex-col flex-1">
        <div className="flex justify-between items-center mb-8 gap-3">
          <div className="flex items-center gap-4">
            <button onClick={back} aria-label={t('nav.back')} className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
              <LucideIcons.ArrowRight size={20} className="ltr:rotate-180" aria-hidden="true" />
            </button>
            <div className="flex gap-1" aria-hidden="true">
              {steps.map((s, i) => (
                <div key={s.key} className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? 'w-6 bg-sea-500' : 'w-2 bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {step < 4 && step !== 2 && (
              <button onClick={next} disabled={!canContinue} className={`min-h-11 px-2 text-sea-700 font-extrabold text-sm ${canContinue ? '' : 'opacity-40'}`}>
                {t('onboarding.next')}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{t(`onboarding.${current.key}.title`)}</h1>
            <p className="text-slate-600 font-medium mb-8 text-lg">{t(`onboarding.${current.key}.subtitle`)}</p>
            {current.render()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
