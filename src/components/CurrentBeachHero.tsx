// כרטיס הציון במסך הראשי: ציון, הסבר, חלון זמן וארבעת הנתונים של השעה הנוכחית.
// אם אין ציון (חסר נתון קריטי) מוצג "אין מספיק מידע". במצב mock מוצגת תגית "נתוני דוגמה".
// מתי נוגעים: כשמשנים את מבנה הכרטיס.
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { Beach, ActivityId, BeachRecommendation, ScoreStatus } from '../types';
import { formatValue } from '../lib/formatValue';
import { beachCity, beachName } from '../data/beaches';
import { useI18n } from '../i18n/I18nProvider';
import ScoreRing from './ScoreRing';

interface CurrentBeachHeroProps {
  beach: Beach;
  recommendation: BeachRecommendation | null;
  isMock: boolean;
  selectedActivity: ActivityId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShowDetails: () => void;
}

export const STATUS_TEXT: Record<ScoreStatus, string> = {
  excellent: 'text-emerald-700', good: 'text-sea-700', fair: 'text-amber-700', poor: 'text-rose-700',
};

export default function CurrentBeachHero({ beach, recommendation, isMock, selectedActivity, isFavorite, onToggleFavorite, onShowDetails }: CurrentBeachHeroProps) {
  const { t, lang } = useI18n();
  const f = beach.forecast;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-8 text-start">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="text-slate-600 font-bold text-[11px] uppercase tracking-widest mb-1">{beachCity(beach, lang)}</div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{beachName(beach, lang)}</h1>
            <button
              onClick={onToggleFavorite}
              aria-label={t(isFavorite ? 'aria.favoriteRemove' : 'aria.favoriteAdd')}
              aria-pressed={isFavorite}
              className={`min-w-11 min-h-11 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LucideIcons.Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </div>
          {isFavorite && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
              <LucideIcons.Heart size={10} fill="currentColor" aria-hidden="true" />
              <span className="text-[11px] font-black leading-none">{t('hero.favoriteBadge')}</span>
            </div>
          )}
        </div>
        <button
          onClick={onShowDetails}
          aria-label={t('aria.openDetails')}
          className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center text-slate-600 border border-white/50 shadow-sm hover:bg-white transition-colors"
        >
          <LucideIcons.Maximize2 size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 border border-white/80 shadow-2xl shadow-slate-200/40">
        {isMock && (
          <div data-testid="card-mock-badge" className="mb-4 inline-block text-[11px] font-bold text-slate-800 bg-sand-200 px-2 py-0.5 rounded-full">
            {t('dataBadge.mock')}
          </div>
        )}
        {recommendation ? (
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex-1 order-2 md:order-1 text-center md:text-start">
              <div className="flex flex-col gap-1 mb-6">
                <h2 data-testid="hero-score" className="text-xl font-black text-slate-900">
                  {t('hero.vibe', { activity: t(`activity.${selectedActivity}`), score: recommendation.score })}
                </h2>
                <div className={`text-sm font-black uppercase tracking-widest ${STATUS_TEXT[recommendation.status]}`}>
                  {t(`status.${recommendation.status}`)}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">{recommendation.headline}</h3>
              <p data-testid="hero-explanation" className="text-slate-700 text-lg font-medium leading-relaxed mb-2">{recommendation.shortExplanation}</p>
              {recommendation.confidence === 'partial' && (
                <p data-testid="hero-partial" className="text-sm font-bold text-amber-800 mb-2">{t('summary.partial')}</p>
              )}
              <div className="mt-6 inline-flex items-center gap-3 bg-amber-50 rounded-2xl px-5 py-3 border border-amber-100">
                <LucideIcons.Clock className="text-amber-700" size={18} aria-hidden="true" />
                <div className="text-start">
                  <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">{t('window.label')}</div>
                  <div data-testid="hero-window" className="text-sm font-black text-amber-800 leading-none">
                    {recommendation.bestTimeWindow ? <bdi>{recommendation.bestTimeWindow}</bdi> : t('window.none')}
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <ScoreRing score={recommendation.score} status={recommendation.status} label={t('hero.scoreLabel')} />
            </div>
          </div>
        ) : (
          <div data-testid="score-insufficient" className="text-center py-6">
            <h2 className="text-2xl font-black text-slate-900 mb-2">{t('score.insufficient')}</h2>
            <p className="text-slate-700 font-medium">{t('score.insufficientHint')}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
          <HeroStat testId="hero-airTemperature" icon="Thermometer" label={t('param.air')} value={formatValue('temperature', f.temperature, lang)} />
          <HeroStat testId="hero-waterTemperature" icon="Droplets" label={t('param.water')} value={formatValue('temperature', f.waterTemp, lang)} />
          <HeroStat testId="hero-waveHeight" icon="Waves" label={t('param.waves')} value={formatValue('waveHeight', f.waveHeight, lang)} />
          <HeroStat testId="hero-windSpeed" icon="Wind" label={t('param.wind')} value={formatValue('windSpeed', f.windSpeed, lang)} />
        </div>
      </div>
    </motion.div>
  );
}

function HeroStat({ icon, label, value, testId }: { icon: string; label: string; value: string; testId: string }) {
  const Icon = (LucideIcons as any)[icon];
  return (
    <div className="bg-white/50 p-4 rounded-3xl text-center border border-white flex flex-col items-center">
      <div className="text-sea-600 mb-2"><Icon size={18} aria-hidden="true" /></div>
      <div data-testid={testId} className="text-sm font-black text-slate-800 whitespace-nowrap">{value}</div>
      <div className="text-[11px] font-black text-slate-600 mt-0.5">{label}</div>
    </div>
  );
}
