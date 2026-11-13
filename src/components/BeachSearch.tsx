/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Beach } from '../types';
import { BEACHES } from '../data/beaches';

interface BeachSearchProps {
  onSelect: (beachId: string) => void;
  favorites: string[];
  onToggleFavorite: (beachId: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function BeachSearch({ onSelect, favorites, onToggleFavorite, inputRef }: BeachSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const results = query.trim() 
    ? BEACHES.filter(b => 
        b.name.includes(query) || 
        b.city.includes(query)
      ) 
    : isFocused ? BEACHES.filter(b => favorites.includes(b.id)) : [];

  return (
    <div className="relative z-20" dir="rtl">
      <div className={`flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-3xl px-5 py-4 border-2 transition-all ${isFocused ? 'border-sea-500 bg-white ring-4 ring-sea-500/10' : 'border-white/50 shadow-sm'}`}>
        <LucideIcons.Search className="text-slate-400" size={20} />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="חפש חוף, מרינה או אזור"
          className="bg-transparent border-none outline-none flex-1 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>

      {isFocused && (results.length > 0 || query) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[60vh] overflow-y-auto no-scrollbar">
          {!query && favorites.length > 0 && (
             <div className="px-5 pt-5 pb-2">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <LucideIcons.Heart size={12} className="text-rose-500" />
                 המועדפים שלך
               </h4>
             </div>
          )}
          {results.length > 0 ? (
            results.map(beach => (
              <div 
                key={beach.id}
                className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors"
                onMouseDown={() => onSelect(beach.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sea-50 flex items-center justify-center text-sea-500">
                    <LucideIcons.Anchor size={20} />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800">{beach.name}</div>
                    <div className="text-[10px] font-bold text-slate-400">{beach.city}</div>
                  </div>
                </div>
                <button 
                   onMouseDown={(e) => {
                     e.stopPropagation();
                     onToggleFavorite(beach.id);
                   }}
                   className={`p-2 rounded-full transition-colors ${favorites.includes(beach.id) ? 'text-rose-500' : 'text-slate-300 hover:text-slate-400'}`}
                >
                  <LucideIcons.Heart size={20} fill={favorites.includes(beach.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 font-bold">לא נמצאו תוצאות</div>
          )}
        </div>
      )}
    </div>
  );
}
