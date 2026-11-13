/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ACTIVITIES } from '../data/beaches';
import { ActivityId } from '../types';
import * as LucideIcons from 'lucide-react';

interface ActivitySelectorProps {
  selectedActivity: ActivityId;
  onSelect: (id: ActivityId) => void;
  onOpenPreferences?: () => void;
}

export default function ActivitySelector({ selectedActivity, onSelect, onOpenPreferences }: ActivitySelectorProps) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth" dir="rtl">
      {ACTIVITIES.map((activity, index) => {
        const IconComponent = (LucideIcons as any)[activity.icon] || LucideIcons.HelpCircle;

        return (
          <motion.button
            key={activity.id}
            id={`activity-${activity.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(activity.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 border-2 ${
              selectedActivity === activity.id
                ? 'bg-sea-600 text-white border-sea-600 shadow-xl shadow-sea-500/30 scale-105 z-10'
                : 'bg-white/70 backdrop-blur-md text-slate-600 border-transparent hover:bg-white hover:border-sea-100'
            }`}
          >
            <div className={`p-3 rounded-2xl ${selectedActivity === activity.id ? 'bg-white/20' : 'bg-sea-50 text-sea-500'}`}>
              <IconComponent size={24} strokeWidth={selectedActivity === activity.id ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${selectedActivity === activity.id ? 'text-white' : 'text-slate-500'}`}>
              {activity.label}
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
          className="flex-shrink-0 flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] transition-all duration-300 bg-white/40 backdrop-blur-md text-slate-400 border-2 border-dashed border-slate-200 hover:bg-white hover:border-slate-300 group"
        >
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 group-hover:text-slate-400">
            <LucideIcons.ClipboardEdit size={24} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">התאמת העדפות</span>
        </motion.button>
      )}
    </div>
  );
}
