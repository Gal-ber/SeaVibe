/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HourlyForecast, SelectedParameter } from '../types';
import { motion } from 'motion/react';
import { formatValue, unavailable } from '../lib/formatValue';
import { useI18n } from '../i18n/I18nProvider';
import { Lang } from '../i18n/translate';

// הטבלה השעתית: כל שעות היום מאותה סדרה שממנה נלקחים ערכי הכרטיס. השורה של עכשיו מסומנת.

interface HourlyForecastTableProps {
  data: HourlyForecast[];
  scores: { time: string; score: number | null }[];
  selectedParameter: SelectedParameter;
  currentTime: string | null;
}

export default function HourlyForecastTable({ data, scores, selectedParameter, currentTime }: HourlyForecastTableProps) {
  const { t, lang } = useI18n();
  const getColumns = () => {
    const baseCols = [
      { id: 'time', label: t('table.time') },
      { id: 'score', label: t('table.score') },
      { id: 'airTemperature', label: t('param.airTemperature') },
      { id: 'waterTemperature', label: t('param.waterTemperature') },
      { id: 'wind', label: t('param.wind') },
      { id: 'waveHeight', label: t('param.waveHeight') },
    ];

    // Reorder: selected first (after time)
    // שעה וציון קבועים בהתחלה, אחריהם העמודה שנבחרה, ואז השאר
    const selectedCol = baseCols.find(c => c.id === selectedParameter)!;
    const otherCols = baseCols.filter(c => c.id !== 'time' && c.id !== 'score' && c.id !== selectedParameter);
    return [baseCols[0], baseCols[1], selectedCol, ...otherCols];
  };

  const columns = getColumns();

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={`px-4 py-4 text-start text-[11px] font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-100 ${
                    col.id === selectedParameter ? 'text-sea-600 bg-sea-50/30' : ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(rowIndex, 10) * 0.03 }}
                key={row.time}
                data-testid={row.time === currentTime ? 'current-hour-row' : undefined}
                className={`hover:bg-slate-50/50 transition-colors ${row.time === currentTime ? 'bg-amber-50' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-4 text-sm whitespace-nowrap border-b border-slate-50 ${
                      col.id === selectedParameter ? 'font-extrabold text-sea-700 bg-sea-50/10' : 'text-slate-600 font-medium'
                    }`}
                  >
                    {col.id === 'score'
                      ? <span data-testid="cell-score" className="font-extrabold text-slate-800">{scores.find(s => s.time === row.time)?.score ?? unavailable(lang)}</span>
                      : renderCellValue(row, col, row.time === currentTime, lang, t)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCellValue(row: HourlyForecast, col: { id: string }, isNow: boolean, lang: Lang, t: (k: string) => string) {
  switch (col.id) {
    case 'time':
      return (
        <span className="font-bold text-slate-600">
          <bdi>{row.time}</bdi>
          {isNow && <span className="ms-2 text-amber-700">{t('table.now')}</span>}
        </span>
      );
    case 'airTemperature':
      return <span data-testid="cell-airTemperature">{formatValue('temperature', row.airTemperature, lang)}</span>;
    case 'waterTemperature':
      return <span data-testid="cell-waterTemperature">{formatValue('temperature', row.waterTemperature, lang)}</span>;
    case 'wind':
      return (
        <div className="flex flex-col">
          <span>{row.windDirection ? t(`compass.${row.windDirection}`) : unavailable(lang)}</span>
          <span data-testid="cell-windSpeed" className="text-[11px] font-bold text-slate-600">{formatValue('windSpeed', row.windSpeed, lang)}</span>
        </div>
      );
    case 'waveHeight':
      return <span data-testid="cell-waveHeight">{formatValue('waveHeight', row.waveHeight, lang)}</span>;
    default:
      return null;
  }
}
