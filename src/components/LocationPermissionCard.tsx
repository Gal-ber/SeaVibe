/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface LocationPermissionCardProps {
  beachName: string;
  onEnable: () => void;
  onDismiss: () => void;
}

export default function LocationPermissionCard({ beachName, onEnable, onDismiss }: LocationPermissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
      dir="rtl"
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sea-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sea-500/20">
          <LucideIcons.MapPin size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 mb-1">רוצה שנציג את החוף הקרוב אליך?</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">אתה רואה כרגע את <span className="text-sea-600 font-bold">{beachName}</span>. אפשר גישה למיקום כדי שנוכל להציג לך המלצות מותאמות אישית לפי איפה שאתה נמצא.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mr-16">
        <button 
          onClick={onEnable}
          className="flex-1 py-3 bg-sea-600 text-white text-xs font-black rounded-xl shadow-lg shadow-sea-600/20 active:scale-95 transition-all"
        >
          אפשר מיקום
        </button>
        <button 
          onClick={onDismiss}
          className="flex-1 py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
        >
          לא עכשיו
        </button>
      </div>
      <p className="text-[10px] text-slate-300 font-medium text-center italic">ניתן לשנות זאת בכל רגע בהגדרות המכשיר</p>
    </motion.div>
  );
}
