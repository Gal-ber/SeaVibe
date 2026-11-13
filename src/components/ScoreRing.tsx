// טבעת הציון העגולה. הציון מוצג גם כמספר וגם כמילה (לא רק בצבע).
import { motion, useReducedMotion } from 'motion/react';
import { ScoreStatus } from '../types';

const RING_COLOR: Record<ScoreStatus, string> = {
  excellent: 'text-emerald-500', good: 'text-sea-500', fair: 'text-amber-500', poor: 'text-rose-500',
};
const CIRCUMFERENCE = 377;

export default function ScoreRing({ score, status, label }: { score: number; status: ScoreStatus; label: string }) {
  const reduced = useReducedMotion();
  const target = CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100;
  return (
    <div className="relative">
      <svg className="w-32 h-32 -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100/60" />
        <motion.circle
          initial={{ strokeDashoffset: reduced ? target : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: target }}
          transition={{ duration: reduced ? 0 : 1.5, ease: 'easeOut' }}
          cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          className={RING_COLOR[status]}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-900">{score}</span>
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
