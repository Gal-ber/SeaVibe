// כפתורי דיווח שטח: "מתאים / לא מתאים", ואז סיבה מתוך רשימה קבועה (בלי טקסט חופשי).
// הסיבה נשמרת כמפתח (reason.*). מתי נוגעים: שלב 3ג (כללי דיווח).
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n/I18nProvider';

interface FieldReportActionsProps {
  activityLabel: string;
  onSubmit: (isAccurate: boolean, reason?: string) => void;
}

const POSITIVE = ['reason.goodWaves', 'reason.goodWind', 'reason.goodWeather', 'reason.family'];
const NEGATIVE = ['reason.badWaves', 'reason.badWind', 'reason.tooHot', 'reason.uncomfortable'];

export default function FieldReportActions({ activityLabel, onSubmit }: FieldReportActionsProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<'initial' | 'reasons' | 'thanks'>('initial');
  const [selection, setSelection] = useState<boolean | null>(null);

  const finish = (reason?: string) => {
    if (selection === null) return;
    onSubmit(selection, reason);
    setStep('thanks');
  };

  return (
    <div className="bg-white border-2 border-sea-100 rounded-[2rem] p-6 shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'initial' && (
          <motion.div key="initial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">{t('reports.question')}</h3>
            <p className="text-xs text-slate-600">{t('reports.prompt', { activity: activityLabel })}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => { setSelection(true); setStep('reasons'); }} className="min-h-11 py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                {t('reports.yes')}
              </button>
              <button onClick={() => { setSelection(false); setStep('reasons'); }} className="min-h-11 py-3 px-4 rounded-2xl bg-rose-50 text-rose-800 font-bold border border-rose-100 hover:bg-rose-100 transition-colors">
                {t('reports.no')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'reasons' && (
          <motion.div key="reasons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800">{t(selection ? 'reports.whyYes' : 'reports.whyNo')}</h3>
              <button onClick={() => finish()} className="min-h-11 px-3 text-xs font-bold text-slate-600 hover:text-slate-800">{t('reports.skip')}</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(selection ? POSITIVE : NEGATIVE).map((reason) => (
                <button key={reason} onClick={() => finish(reason)} className="min-h-11 p-3 text-start text-xs font-bold text-slate-700 bg-slate-50 rounded-xl border border-slate-100 hover:border-sea-200 hover:bg-white transition-all">
                  {t(reason)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'thanks' && (
          <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-3" role="status">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <LucideIcons.Check size={24} aria-hidden="true" />
            </div>
            <h3 className="font-extrabold text-slate-800">{t('reports.thanks')}</h3>
            <p className="text-xs text-slate-600">{t('reports.thanksNote')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
