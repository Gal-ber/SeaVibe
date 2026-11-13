/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityId } from '../types';

interface FieldReportActionsProps {
  activityLabel: string;
  onSubmit: (isAccurate: boolean, reason?: string) => void;
}

export default function FieldReportActions({ activityLabel, onSubmit }: FieldReportActionsProps) {
  const [step, setStep] = useState<'initial' | 'reasons' | 'thanks'>('initial');
  const [selection, setSelection] = useState<boolean | null>(null);

  const positiveReasons = ['🌊 גלים טובים', '💨 רוח נוחה', '☀️ מזג אוויר טוב', '👨‍👩‍👧‍👦 מתאים למשפחה'];
  const negativeReasons = ['🌊 הגלים לא מתאימים', '💨 הרוח מפריעה', '🌡️ חם מדי', '⚠️ תנאים לא נוחים'];

  const handleInitialClick = (isAccurate: boolean) => {
    setSelection(isAccurate);
    setStep('reasons');
  };

  const handleReasonClick = (reason: string) => {
    if (selection !== null) {
      onSubmit(selection, reason);
      setStep('thanks');
    }
  };

  const handleSkip = () => {
    if (selection !== null) {
      onSubmit(selection);
      setStep('thanks');
    }
  };

  return (
    <div className="bg-white border-2 border-sea-100 rounded-[2rem] p-6 shadow-sm overflow-hidden" dir="rtl">
      <AnimatePresence mode="wait">
        {step === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-4"
          >
            <h3 className="font-extrabold text-slate-800 text-lg">האם זה באמת מתאים עכשיו?</h3>
            <p className="text-xs text-slate-400">היית בשיחה? עזור לנו לדייק את ההמלצה ל{activityLabel}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleInitialClick(true)}
                className="py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <span>👍 מתאים</span>
              </button>
              <button
                onClick={() => handleInitialClick(false)}
                className="py-3 px-4 rounded-2xl bg-rose-50 text-rose-700 font-bold border border-rose-100 flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
              >
                <span>👎 לא מתאים</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'reasons' && (
          <motion.div
            key="reasons"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800">למה {selection ? 'מתאים' : 'לא מתאים'}?</h3>
              <button onClick={handleSkip} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">דלג</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(selection ? positiveReasons : negativeReasons).map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReasonClick(reason)}
                  className="p-3 text-right text-xs font-bold text-slate-600 bg-slate-50 rounded-xl border border-slate-100 hover:border-sea-200 hover:bg-white transition-all"
                >
                  {reason}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'thanks' && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-3"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <LucideIcons.Check size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 truncate">תודה! הדיווח שלך עוזר לדייק.</h3>
            <p className="text-xs text-slate-400">העדכון שלך נוסף לסיכום הדיווחים מהשטח.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
