/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LucideIcons from 'lucide-react';
import { FieldReportSummary } from '../types';

interface FieldReportSummaryViewProps {
  summary: FieldReportSummary;
}

export default function FieldReportSummaryView({ summary }: FieldReportSummaryViewProps) {
  const { totalReports, positivePercentage, summaryText, topReasons } = summary;

  return (
    <div className="flex items-start gap-4" dir="rtl">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-sea-50 flex items-center justify-center text-sea-500 overflow-hidden">
           <LucideIcons.MessageSquare size={24} />
           {positivePercentage > 0 && (
             <div 
               className="absolute bottom-0 left-0 right-0 bg-emerald-500/20" 
               style={{ height: `${positivePercentage}%` }}
             />
           )}
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <p className="text-base font-black text-slate-800 leading-snug">
          {summaryText}
        </p>
        
        <div className="flex items-center gap-3">
          {totalReports > 0 && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
              {totalReports} דיווחים
            </span>
          )}
          
          {topReasons.length > 0 && (
            <div className="flex gap-1.5">
              {topReasons.slice(0, 2).map((reason, i) => (
                <span key={i} className="text-[10px] font-black text-sea-600/70">
                  #{reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
