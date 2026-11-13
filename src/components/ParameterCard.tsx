/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LucideIcons from 'lucide-react';
import React from 'react';
import { SelectedParameter } from '../types';

interface ParameterCardProps {
  id: SelectedParameter;
  label: string;
  value: string;
  icon: string;
  isSelected: boolean;
  onClick: (id: SelectedParameter) => void;
  key?: React.Key;
}

export default function ParameterCard({ id, label, value, icon, isSelected, onClick }: ParameterCardProps) {
  const Icon = (LucideIcons as any)[icon];

  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-shrink-0 w-28 p-4 rounded-3xl border-2 transition-all text-start ${
        isSelected
          ? 'bg-sea-600 border-sea-600 text-white shadow-lg shadow-sea-200 ring-4 ring-sea-500/10'
          : 'bg-white border-slate-100 text-slate-600 hover:border-sea-200'
      }`}
    >
      <div className={`mb-3 w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-sea-50 text-sea-500'}`}>
        <Icon size={18} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isSelected ? 'text-white/70' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className="text-sm font-extrabold block truncate">{value}</span>
    </button>
  );
}
