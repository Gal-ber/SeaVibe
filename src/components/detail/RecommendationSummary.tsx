// הסיכום בראש מסך הפירוט: ציון, כותרת, חלון זמן והסבר קצר, ותגית "נתוני דוגמה".
import { Icons as LucideIcons } from '../icons';
import { BeachRecommendation, ScoreStatus } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { SCORING } from '../../engine/scoringConfig';

const STATUS_BG: Record<ScoreStatus, string> = {
  excellent: 'bg-emerald-700', good: 'bg-sea-700', fair: 'bg-amber-700', poor: 'bg-rose-700',
};

const STALE_HOURS = 6;

interface Props {
  recommendation: BeachRecommendation | null;
  isMock: boolean;
  generatedAt: string | null;
}

export default function RecommendationSummary({ recommendation, isMock, generatedAt }: Props) {
  const { t, lang } = useI18n();
  // FR-12: במצב אמת מוצג זמן העדכון, ונתון ישן מסומן. במצב mock מוצג "נתוני דוגמה" במקום זמן.
  const updated = !isMock && generatedAt ? new Date(generatedAt) : null;
  const stale = updated ? Date.now() - updated.getTime() > STALE_HOURS * 3600_000 : false;
  return (
    <section className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
      {isMock && (
        <div className="mb-4">
          <span className="inline-block text-[11px] font-bold text-slate-800 bg-sand-200 px-2 py-0.5 rounded-full">{t('dataBadge.mock')}</span>
          <p className="mt-2 text-xs font-medium text-slate-600">{t('detail.basis.mock')}</p>
        </div>
      )}
      {updated && (
        <p data-testid="source-attribution" className="mb-1 text-xs font-bold text-slate-700">{t('source.attribution')}</p>
      )}
      {updated && (
        <p data-testid="source-updated" className={`mb-4 text-xs font-bold ${stale ? 'text-rose-700' : 'text-slate-600'}`}>
          {stale
            ? t('source.stale', { hours: STALE_HOURS })
            : t('source.updated', { time: updated.toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' }) })}
        </p>
      )}
      {!recommendation ? (
        <div className="text-center py-4">
          <h3 className="font-black text-2xl text-slate-900 mb-2">{t('score.insufficient')}</h3>
          <p className="text-slate-700 font-medium">{t('score.insufficientHint')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-6 mb-6">
            <div
              className={`w-20 h-20 shrink-0 rounded-[2rem] flex flex-col items-center justify-center text-white font-black shadow-xl ${STATUS_BG[recommendation.status]}`}
            >
              <span className="text-3xl leading-none">{recommendation.score}</span>
              <span className="text-[10px] mt-1">{t(`status.${recommendation.status}`)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-2xl text-slate-900 mb-1 leading-tight">{recommendation.headline}</h3>
              <div className="flex items-center gap-2 text-slate-700">
                <LucideIcons.Clock size={14} className="text-amber-700" aria-hidden="true" />
                <span className="text-sm font-black">
                  {t('window.label')}: {recommendation.bestTimeWindow ? <bdi>{recommendation.bestTimeWindow}</bdi> : t('window.none')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed text-lg ps-4 border-s-2 border-slate-200">{recommendation.shortExplanation}</p>
          {!SCORING.calibrated && <p className="mt-4 text-xs font-bold text-slate-700">{t('score.experimental')}</p>}
        </>
      )}
    </section>
  );
}
