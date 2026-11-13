import React, { useState } from 'react';
import { DailyLog, PlantSettings } from '../../types/production';
import { calculateDaySummary } from '../../utils/analytics';

interface MonthlyTrendChartProps {
  yearMonth: string; // 'YYYY-MM'
  allLogs: Record<string, DailyLog>;
  settings: PlantSettings;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ yearMonth, allLogs, settings }) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build array of all days in the month
  const daysData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${yearMonth}-${dayNum.toString().padStart(2, '0')}`;
    const log = allLogs[dateStr];

    if (log && log.hourly.length > 0) {
      const summary = calculateDaySummary(log, settings);
      return {
        dayNum,
        dateStr,
        hasData: true,
        summary,
      };
    }

    return {
      dayNum,
      dateStr,
      hasData: false,
      summary: null,
    };
  });

  const width = 960;
  const height = 280;
  const padLeft = 56;
  const padRight = 56;
  const padTop = 24;
  const padBottom = 36;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const validDays = daysData.filter(d => d.hasData && d.summary);
  const maxVolume = Math.max(...validDays.map(d => d.summary!.totalProduced), settings.targetDailySlabs + settings.targetDailyChannels, 2000);
  const yMax = Math.ceil(maxVolume / 500) * 500;

  const maxDefectRate = Math.max(...validDays.map(d => d.summary!.defectRate), 6);
  const rightYMax = Math.ceil(maxDefectRate * 1.25);

  const slotWidth = plotWidth / daysInMonth;
  const barWidth = Math.max(6, Math.min(20, slotWidth * 0.7));

  // Build defect rate line points
  const linePoints = daysData
    .map((d, i) => {
      if (!d.hasData || !d.summary) return null;
      const x = padLeft + i * slotWidth + slotWidth / 2;
      const y = padTop + plotHeight - (d.summary.defectRate / rightYMax) * plotHeight;
      return { x, y, day: d };
    })
    .filter(Boolean) as { x: number; y: number; day: (typeof daysData)[0] }[];

  const linePath = linePoints.length > 0
    ? `M ${linePoints[0].x} ${linePoints[0].y} ` + linePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const targetLineY = padTop + plotHeight - (settings.maxDefectRatePercent / rightYMax) * plotHeight;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-500 rounded-xs inline-block" />
            <span className="text-slate-300">Daily Slabs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-teal-400 rounded-xs inline-block" />
            <span className="text-slate-300">Daily Road Channels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400 inline-block border-t border-rose-400" />
            <span className="text-rose-400 font-semibold">Defect Rate % (Right Axis)</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Target Defect: &le; {settings.maxDefectRatePercent}%
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[640px] select-none"
          onMouseLeave={() => setHoveredDay(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + plotHeight * (1 - pct);
            const valLeft = Math.round(yMax * pct);
            const valRight = (rightYMax * pct).toFixed(1);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
                <text x={padLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
                  {valLeft}
                </text>
                <text x={width - padRight + 8} y={y + 4} textAnchor="start" className="text-[10px] fill-rose-400/80 font-mono">
                  {valRight}%
                </text>
              </g>
            );
          })}

          {/* Target line */}
          <line
            x1={padLeft}
            y1={targetLineY}
            x2={width - padRight}
            y2={targetLineY}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Daily stacked bars */}
          {daysData.map((d, i) => {
            const xCenter = padLeft + i * slotWidth + slotWidth / 2;
            const xBar = xCenter - barWidth / 2;
            const isHovered = hoveredDay === d.dayNum;

            if (!d.hasData || !d.summary) {
              return (
                <g key={d.dayNum} onMouseEnter={() => setHoveredDay(d.dayNum)}>
                  <rect
                    x={xCenter - slotWidth / 2}
                    y={padTop}
                    width={slotWidth}
                    height={plotHeight}
                    fill={isHovered ? 'rgba(56, 189, 248, 0.05)' : 'transparent'}
                  />
                  {d.dayNum % 2 !== 0 && (
                    <text x={xCenter} y={height - padBottom + 14} textAnchor="middle" className="text-[9px] fill-slate-600 font-mono">
                      {d.dayNum}
                    </text>
                  )}
                </g>
              );
            }

            const sH = (d.summary.totalSlabs / yMax) * plotHeight;
            const cH = (d.summary.totalChannels / yMax) * plotHeight;
            const sY = padTop + plotHeight - sH;
            const cY = sY - cH;

            return (
              <g key={d.dayNum} onMouseEnter={() => setHoveredDay(d.dayNum)} className="cursor-pointer">
                <rect
                  x={xCenter - slotWidth / 2}
                  y={padTop}
                  width={slotWidth}
                  height={plotHeight}
                  fill={isHovered ? 'rgba(56, 189, 248, 0.08)' : 'transparent'}
                />

                {/* Slabs */}
                <rect x={xBar} y={sY} width={barWidth} height={sH} fill="#0284c7" rx={cH === 0 ? 1 : 0} />
                {/* Channels */}
                <rect x={xBar} y={cY} width={barWidth} height={cH} fill="#14b8a6" rx={1} />

                {/* Day label */}
                {(d.dayNum % 2 !== 0 || isHovered) && (
                  <text
                    x={xCenter}
                    y={height - padBottom + 14}
                    textAnchor="middle"
                    className={`text-[9.5px] font-mono ${isHovered ? 'fill-sky-400 font-bold' : 'fill-slate-400'}`}
                  >
                    {d.dayNum}
                  </text>
                )}
              </g>
            );
          })}

          {/* Defect rate polyline */}
          <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Line points */}
          {linePoints.map(p => {
            const isTargetOk = p.day.summary!.defectRate <= settings.maxDefectRatePercent;
            const isWarning = p.day.summary!.defectRate >= settings.warningDefectRatePercent;
            const nodeFill = isWarning ? '#ef4444' : isTargetOk ? '#10b981' : '#f59e0b';
            return (
              <circle
                key={p.day.dayNum}
                cx={p.x}
                cy={p.y}
                r={hoveredDay === p.day.dayNum ? 5 : 2.5}
                fill={nodeFill}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredDay !== null && (
          (() => {
            const dayItem = daysData[hoveredDay - 1];
            if (!dayItem || !dayItem.hasData || !dayItem.summary) return null;
            const pt = linePoints.find(p => p.day.dayNum === hoveredDay);
            const xPos = pt ? pt.x : padLeft + (hoveredDay - 1) * slotWidth;

            return (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-sans min-w-[200px]"
                style={{
                  left: `${Math.min(Math.max(10, xPos - 100), width - 210)}px`,
                  top: '12px',
                }}
              >
                <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-100">{dayItem.dateStr}</span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      dayItem.summary.defectRate <= settings.maxDefectRatePercent ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {dayItem.summary.defectRate}% Defect
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-sky-400">
                    <span className="font-sans text-slate-400">Slabs:</span>
                    <span>{dayItem.summary.totalSlabs.toLocaleString()} pcs</span>
                  </div>
                  <div className="flex justify-between text-teal-300">
                    <span className="font-sans text-slate-400">Road Channels:</span>
                    <span>{dayItem.summary.totalChannels.toLocaleString()} pcs</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span className="font-sans text-slate-400">Mould Cycles:</span>
                    <span>{dayItem.summary.totalMoulds.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex justify-between text-rose-400 font-bold">
                    <span className="font-sans text-slate-400">Total Defects:</span>
                    <span>{dayItem.summary.totalDefects} units</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-0.5">
                    <span className="font-sans text-slate-400">Scrap Cost:</span>
                    <span>${dayItem.summary.scrapCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
