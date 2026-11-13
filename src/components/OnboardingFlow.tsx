/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { BEACHES, ACTIVITIES } from '../data/beaches';
import { ActivityId } from '../types';

interface OnboardingFlowProps {
  initialFavorites?: string[];
  initialActivities?: ActivityId[];
  onComplete: (data: {
    favorites: string[];
    favoriteActivities: ActivityId[];
    locationPermission: boolean;
  }) => void;
}

export default function OnboardingFlow({ onComplete, initialFavorites = [], initialActivities = [] }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>(initialFavorites);
  const [selectedActivities, setSelectedActivities] = useState<ActivityId[]>(initialActivities);

  const toggleFavorite = (id: string) => {
    setSelectedFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleActivity = (id: ActivityId) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(Math.max(1, step - 1));

  const steps = [
    {
      id: 'beaches',
      title: "בחר את החופים שלך",
      subtitle: "שמור את החופים והמרינות שאתה אוהב כדי לגשת אליהם מהר",
      render: () => (
        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
          {BEACHES.map(beach => (
            <button
              key={beach.id}
              onClick={() => toggleFavorite(beach.id)}
              className={`p-4 rounded-2xl border-2 transition-all text-right flex items-center justify-between ${
                selectedFavorites.includes(beach.id)
                  ? 'border-sea-500 bg-sea-50 text-sea-700'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-sea-200'
              }`}
            >
              <div>
                <div className="font-extrabold">{beach.name}</div>
                <div className="text-[10px] opacity-60">{beach.city}</div>
              </div>
              {selectedFavorites.includes(beach.id) && <LucideIcons.CheckCircle2 className="text-sea-500" size={20} />}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'location',
      title: "אפשר מיקום",
      subtitle: "כך נוכל להציג לך את החוף הקרוב אליך ואת הווייב שלו בזמן אמת",
      render: () => (
        <div className="flex flex-col items-center py-8 space-y-8">
          <div className="w-20 h-20 bg-sea-50 rounded-full flex items-center justify-center text-sea-500">
            <LucideIcons.MapPin size={40} />
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                onComplete({ 
                  favorites: selectedFavorites, 
                  favoriteActivities: selectedActivities, 
                  locationPermission: true 
                });
              }}
              className="w-full py-4 bg-sea-600 text-white rounded-2xl font-extrabold shadow-lg shadow-sea-200"
            >
              אפשר מיקום
            </button>
            <button
              onClick={nextStep}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600"
            >
              אולי אחר כך
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'activities',
      title: "מה אתה אוהב לעשות בים?",
      subtitle: "נשתמש בזה כדי להציג המלצות שמתאימות לך",
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITIES.map(activity => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                selectedActivities.includes(activity.id)
                  ? 'border-sea-500 bg-sea-50 text-sea-700'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-sea-200'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedActivities.includes(activity.id) ? 'bg-sea-100' : 'bg-slate-50'}`}>
                {(LucideIcons as any)[activity.icon] && React.createElement((LucideIcons as any)[activity.icon], { size: 20 })}
              </div>
              <div className="text-xs font-bold">{activity.label}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'done',
      title: "SeaVibe מוכן",
      subtitle: "מעכשיו תוכל לראות במהירות מה הווייב של הים היום",
      render: () => (
        <div className="flex flex-col items-center py-12 space-y-8">
           <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 relative">
             <LucideIcons.Check size={48} />
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 rounded-full bg-emerald-100 -z-10"
             />
           </div>
           <button
              onClick={() => onComplete({ 
                favorites: selectedFavorites, 
                favoriteActivities: selectedActivities, 
                locationPermission: false 
              })}
              className="w-full py-4 bg-sea-600 text-white rounded-2xl font-extrabold shadow-lg shadow-sea-200"
            >
              בוא נבדוק את הים
            </button>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={step > 1 ? prevStep : () => onComplete({
              favorites: initialFavorites,
              favoriteActivities: initialActivities,
              locationPermission: false
            })}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LucideIcons.ArrowRight size={20} />
          </button>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? 'w-6 bg-sea-500' : 'w-2 bg-slate-100'}`} 
              />
            ))}
          </div>
        </div>
        {step < 4 && step !== 2 && (
           <button 
             onClick={nextStep} 
             disabled={step === 1 && selectedFavorites.length === 0}
             className={`text-sea-600 font-extrabold text-sm ${step === 1 && selectedFavorites.length === 0 ? 'opacity-30' : ''}`}
           >
             המשך
           </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col justify-center"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{currentStep.title}</h1>
          <p className="text-slate-400 font-medium mb-8 text-lg">{currentStep.subtitle}</p>
          {currentStep.render()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
