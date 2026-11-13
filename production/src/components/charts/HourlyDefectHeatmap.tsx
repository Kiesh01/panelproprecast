import React, { useState } from 'react';
import { DailyLog } from '../../types/production';
import { calculateHourlyDefectRate } from '../../utils/analytics';

interface HourlyDefectHeatmapProps {
  recentLogs: DailyLog[];
}

export const HourlyDefectHeatmap: React.FC<HourlyDefectHeatmapProps> = ({ recentLogs }) => {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; hour: number; rate: number; count: number } | null>(null);

  // Take the last 7 logged days
  const displayLogs = recentLogs.slice(0, 7).reverse();
  const operationalHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  function getColor(rate: number, count: number): string {
    if (count === 0 && rate === 0) return '#1e293b'; // Slate 800 - nominal
    if (rate < 2.0) return '#065f46'; // Deep emerald
    if (rate <= 3.0) return '#047857'; // Emerald
    if (rate <= 4.0) return '#d97706'; // Amber
    if (rate <= 5.5) return '#ea580c'; // Orange
    return '#dc2626'; // Red - severe
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-medium text-slate-300">
          Hourly Defect Rate Matrix (Past 7 Days · Mon–Sat 07:30–17:00)
        </span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-slate-400">Low</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-800 inline-block" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
          <span className="text-slate-400">Critical (&gt;5%)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] border border-slate-800 rounded-lg p-2.5 bg-slate-900/40">
          {/* Header Row: Hours */}
          <div className="grid grid-cols-[80px_repeat(10,1fr)] gap-1 mb-1 text-[10px] text-slate-400 font-mono text-center">
            <span className="text-left font-sans text-slate-400">Date</span>
            <span title="07:30 - 08:30">07:30</span>
            <span title="08:30 - 09:30">08:30</span>
            <span title="09:30 - 10:30">09:30</span>
            <span title="10:30 - 11:30">10:30</span>
            <span title="11:30 - 12:30">11:30</span>
            <span title="12:30 - 13:30 (Midday)">12:30</span>
            <span title="13:30 - 14:30">13:30</span>
            <span title="14:30 - 15:30">14:30</span>
            <span title="15:30 - 16:30">15:30</span>
            <span title="16:30 - 17:00 (Final)">16:30</span>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-1">
            {displayLogs.map(log => {
              const dayLabel = new Date(log.date + 'T12:00:00Z').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
              });

              return (
                <div key={log.date} className="grid grid-cols-[80px_repeat(10,1fr)] gap-1 items-center">
                  <span className="text-[11px] font-mono text-slate-400 truncate">{dayLabel}</span>
                  {operationalHours.map(h => {
                    const record = log.hourly.find(r => r.hour === h);
                    const rate = record ? calculateHourlyDefectRate(record) : 0;
                    const count = record ? record.defectiveSlabs + record.defectiveChannels : 0;
                    const bg = record ? getColor(rate, count) : '#0f172a';

                    return (
                      <div
                        key={h}
                        onMouseEnter={() => setHoveredCell({ date: log.date, hour: h, rate, count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ backgroundColor: bg }}
                        className="h-6 rounded-xs cursor-pointer flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-110 hover:z-10 shadow-xs"
                      >
                        {record && count > 0 && (
                          <span className="text-white/90 drop-shadow-xs font-semibold">{rate.toFixed(0)}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hoveredCell && (
        <div className="mt-2 text-xs font-mono text-slate-300 flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          <span>{hoveredCell.date} at {hoveredCell.hour}:00</span>
          <span>·</span>
          <span>Defect Rate: <strong className={hoveredCell.rate >= 4 ? 'text-rose-400' : 'text-emerald-400'}>{hoveredCell.rate.toFixed(2)}%</strong></span>
          <span>·</span>
          <span>Defect Units: <strong>{hoveredCell.count} pcs</strong></span>
        </div>
      )}
    </div>
  );
};
