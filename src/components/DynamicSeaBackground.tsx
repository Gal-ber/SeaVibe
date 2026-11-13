/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// רקע הים המונפש מאחורי המסכים: הצבעים משתנים לפי השעה ומצב הים.
// בהפחתת תנועה הגלים עומדים במקום. מתי נוגעים: כשמשנים את המראה של הרקע.

import { motion, useReducedMotion } from 'motion/react';
import { BackgroundState } from '../types';

interface DynamicSeaBackgroundProps {
  state: BackgroundState;
}

export default function DynamicSeaBackground({ state }: DynamicSeaBackgroundProps) {
  // We use CSS gradients and motion for an elegant, lightweight feel.
  
  const getBackgroundStyles = () => {
    switch (state) {
      case 'calm_sunny_day':
        return 'bg-gradient-to-b from-sky-400 via-sky-200 to-sea-100';
      case 'wavy_sunny_day':
        return 'bg-gradient-to-b from-sky-500 via-sky-300 to-sea-200';
      case 'calm_cloudy_day':
        return 'bg-gradient-to-b from-slate-400 via-slate-300 to-slate-200';
      case 'sunset_sea':
        return 'bg-gradient-to-b from-orange-400 via-rose-300 to-indigo-400';
      case 'night_calm':
        return 'bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-900';
      case 'windy_day':
        return 'bg-gradient-to-b from-sky-600 via-slate-200 to-slate-300';
      case 'rough_sea_day':
        return 'bg-gradient-to-b from-slate-600 via-slate-500 to-blue-300';
      default:
        return 'bg-sky-100';
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-1000 ${getBackgroundStyles()}`}>
      <div className="absolute inset-0 opacity-30">
         {/* Animated Wave Layers */}
         <WaveLayer speed={15} color="rgba(255,255,255,0.2)" height="30%" y="70%" />
         <WaveLayer speed={20} color="rgba(255,255,255,0.15)" height="25%" y="75%" />
         <WaveLayer speed={25} color="rgba(255,255,255,0.1)" height="20%" y="80%" />
      </div>

      {state === 'sunset_sea' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-orange-100 blur-3xl"
        />
      )}

      {state === 'night_calm' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
      )}
    </div>
  );
}

function WaveLayer({ speed, color, height, y }: { speed: number, color: string, height: string, y: string }) {
  // הפחתת תנועה: הגלים ברקע עומדים במקום
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ x: '-10%' }}
      animate={reduced ? { x: '-10%' } : { x: '10%' }}
      transition={{
        duration: speed,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
      className="absolute left-0 right-0"
      style={{
        backgroundColor: color,
        height,
        top: y,
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        width: '120%',
        marginLeft: '-10%'
      }}
    />
  );
}
