// חיפוש חוף בעברית או באנגלית, בלי תלות בניקוד ובגרשיים. שדה ריק מציג את המועדפים.
// אין תוצאה: הודעה ורשימת החופים הנתמכים (לא ממציאים חוף). נסגר ב-Esc, בבחירה ובלחיצה מחוץ.
// מתי נוגעים: כשמשנים את התנהגות החיפוש. הניקוי של הטקסט נמצא ב-src/data/beaches.ts.
import React, { useEffect, useId, useRef, useState } from 'react';
import { Icons as LucideIcons } from './icons';
import { BEACHES, beachCity, beachName, searchActivity, searchBeaches } from '../data/beaches';
import { ActivityId, BeachInfo } from '../types';
import { translate } from '../i18n/translate';
import { useI18n } from '../i18n/I18nProvider';

interface BeachSearchProps {
  onSelect: (beachId: string) => void;
  favorites: string[];
  onToggleFavorite: (beachId: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  // חיפוש פעילות: מדרג את החופים הנתמכים לפי הציון שלהם לפעילות
  rankBeaches: (activity: ActivityId) => { beach: BeachInfo; score: number | null }[];
  onSelectActivity: (activity: ActivityId) => void;
}

export default function BeachSearch({ onSelect, favorites, onToggleFavorite, inputRef, rankBeaches, onSelectActivity }: BeachSearchProps) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  const hasQuery = query.trim().length > 0;
  const beachResults = hasQuery ? searchBeaches(query) : [];
  const activityHit = hasQuery && beachResults.length === 0 ? searchActivity(query, (id, l) => translate(l, `activity.${id}`)) : null;
  const ranked = activityHit ? rankBeaches(activityHit) : [];
  const results: BeachInfo[] = hasQuery ? (activityHit ? ranked.map((r) => r.beach) : beachResults) : BEACHES.filter((b) => favorites.includes(b.id));
  const showList = open && (hasQuery || results.length > 0);

  const choose = (id: string) => {
    if (activityHit) onSelectActivity(activityHit);
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  const row = (beach: BeachInfo) => (
    <li key={beach.id} className="border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <button onClick={() => choose(beach.id)} className="flex-1 min-h-11 p-4 flex items-center gap-4 text-start">
        <span className="w-10 h-10 rounded-xl bg-sea-50 flex items-center justify-center text-sea-600">
          <LucideIcons.MapPin size={20} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-extrabold text-slate-800">{beachName(beach, lang)}</span>
          <span className="block text-[11px] font-bold text-slate-600">{beachCity(beach, lang)}</span>
        </span>
        {activityHit && (
          <span data-testid="ranked-score" className="ms-auto text-lg font-black text-sea-800">
            {ranked.find((r) => r.beach.id === beach.id)?.score ?? t('value.unavailable')}
          </span>
        )}
      </button>
      <button
        onClick={() => onToggleFavorite(beach.id)}
        aria-label={t(favorites.includes(beach.id) ? 'aria.favoriteRemove' : 'aria.favoriteAdd')}
        aria-pressed={favorites.includes(beach.id)}
        className={`min-w-11 min-h-11 me-2 rounded-full flex items-center justify-center ${favorites.includes(beach.id) ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <LucideIcons.Heart size={20} fill={favorites.includes(beach.id) ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </li>
  );

  return (
    <div ref={boxRef} className="relative z-20" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <div className={`flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-3xl px-5 py-3 border-2 transition-all ${open ? 'border-sea-500 bg-white ring-4 ring-sea-500/10' : 'border-white/50 shadow-sm'}`}>
        <LucideIcons.Search className="text-slate-500" size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={t('search.label')}
          aria-expanded={showList}
          aria-controls={listId}
          placeholder={t('search.placeholder')}
          className="bg-transparent border-none outline-none flex-1 min-h-11 text-slate-800 font-bold placeholder:text-slate-500 placeholder:font-medium"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {showList && (
        <div id={listId} className="mt-3 lg:absolute lg:top-full lg:inset-x-0 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[50vh] overflow-y-auto no-scrollbar">
          {!hasQuery && <p className="px-5 pt-5 pb-2 text-[11px] font-black text-slate-600 uppercase tracking-widest">{t('search.favorites')}</p>}
          {activityHit && (
            <p data-testid="ranked-heading" className="px-5 pt-5 pb-2 text-[11px] font-black text-slate-600 uppercase tracking-widest">
              {t('search.rankedFor', { activity: t(`activity.${activityHit}`) })}
            </p>
          )}
          {results.length > 0 ? (
            <ul>{results.map(row)}</ul>
          ) : (
            <div data-testid="search-empty">
              <p className="px-5 pt-5 text-slate-700 font-bold">{t('search.noResults')}</p>
              <p className="px-5 pt-2 pb-2 text-[11px] font-black text-slate-600">{t('search.supported')}</p>
              <ul>{BEACHES.map(row)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
