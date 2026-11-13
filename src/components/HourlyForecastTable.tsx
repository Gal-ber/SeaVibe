/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HourlyForecast, SelectedParameter } from '../types';
import { motion } from 'motion/react';

interface HourlyForecastTableProps {
  data: HourlyForecast[];
  selectedParameter: SelectedParameter;
}

export default function HourlyForecastTable({ data, selectedParameter }: HourlyForecastTableProps) {
  const getColumns = () => {
    const baseCols = [
      { id: 'time', label: 'שעה' },
      { id: 'airTemperature', label: 'טמפ׳ אוויר', unit: '°C' },
      { id: 'waterTemperature', label: 'טמפ׳ מים', unit: '°C' },
      { id: 'wind', label: 'רוח', isWind: true },
      { id: 'waveHeight', label: 'גובה גלים', unit: 'מ׳' },
    ];

    // Reorder: selected first (after time)
    if (selectedParameter === 'wind') {
      return [
        baseCols[0],
        baseCols[3],
        baseCols[1],
        baseCols[2],
        baseCols[4],
      ];
    }
    
    const selectedIndex = baseCols.findIndex(c => c.id === selectedParameter);
    const selectedCol = baseCols[selectedIndex];
    const otherCols = baseCols.filter((_, i) => i !== 0 && i !== selectedIndex);
    
    return [baseCols[0], selectedCol, ...otherCols];
  };

  const columns = getColumns();

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm" dir="rtl">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 ${
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
                transition={{ delay: rowIndex * 0.05 }}
                key={row.time}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-4 text-sm border-b border-slate-50 ${
                      col.id === selectedParameter ? 'font-extrabold text-sea-700 bg-sea-50/10' : 'text-slate-600 font-medium'
                    }`}
                  >
                    {renderCellValue(row, col)}
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

function renderCellValue(row: HourlyForecast, col: any) {
  switch (col.id) {
    case 'time':
      return <span className="font-bold text-slate-400">{row.time}</span>;
    case 'airTemperature':
      return <span>{row.airTemperature}{col.unit}</span>;
    case 'waterTemperature':
      return <span>{row.waterTemperature}{col.unit}</span>;
    case 'wind':
      return (
        <div className="flex flex-col">
          <span>{row.windDirection}</span>
          <span className="text-[10px] font-bold text-slate-400">{row.windSpeed} קמ״ש</span>
        </div>
      );
    case 'waveHeight':
      return <span>{row.waveHeight} {col.unit}</span>;
    default:
      return null;
  }
}
