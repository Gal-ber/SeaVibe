/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface HourlyInsightProps {
  insight: string;
}

export default function HourlyInsight({ insight }: HourlyInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={insight}
      className="bg-sea-50/50 border border-sea-100 rounded-3xl p-5 flex gap-4 items-start"
      dir="rtl"
    >
      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-sea-500 shrink-0">
        <LucideIcons.Sparkles size={20} />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-sea-600 uppercase tracking-widest block">תובנה מהירה</span>
        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
            "{insight}"
        </p>
      </div>
    </motion.div>
  );
}
