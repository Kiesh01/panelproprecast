import React, { useState } from 'react';
import { PlantSettings, YearSummary } from '../../types/production';

interface YearlyComparisonChartProps {
  yearSummary: YearSummary;
  settings: PlantSettings;
}

export const YearlyComparisonChart: React.FC<YearlyComparisonChartProps> = ({ yearSummary, settings }) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const months = yearSummary.monthlyBreakdown;
  const width = 960;
  const height = 290;
  const padLeft = 60;
  const padRight = 56;
  const padTop = 24;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const maxMonthVolume = Math.max(...months.map(m => Math.max(m.slabs, m.channels, m.moulds)), 25000);
  const yMax = Math.ceil(maxMonthVolume / 5000) * 5000;

  const maxDefect = Math.max(...months.map(m => m.defectRate), 6);
  const rightYMax = Math.ceil(maxDefect * 1.3);

  const monthSlotWidth = plotWidth / 12;
  const subBarWidth = Math.max(6, Math.min(14, monthSlotWidth * 0.22));

  // Line points for monthly defect rate
  const linePoints = months.map((m, i) => {
    const x = padLeft + i * monthSlotWidth + monthSlotWidth / 2;
    const y = padTop + plotHeight - (m.defectRate / rightYMax) * plotHeight;
    return { x, y, m, index: i };
  });

  const linePath = linePoints.length > 0
    ? `M ${linePoints[0].x} ${linePoints[0].y} ` + linePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-500 rounded-xs inline-block" />
            <span className="text-slate-300">Slabs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-teal-400 rounded-xs inline-block" />
            <span className="text-slate-300">Road Channels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-400 rounded-xs inline-block" />
            <span className="text-slate-300">Mould Cycles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400 inline-block border-t border-rose-400" />
            <span className="text-rose-400 font-semibold">Defect Rate % (Right Axis)</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Annual Total: <span className="text-slate-200 font-bold">{yearSummary.totalProduced.toLocaleString()}</span> units
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[640px] select-none"
          onMouseLeave={() => setHoveredMonth(null)}
        >
          {/* Y Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + plotHeight * (1 - pct);
            const valLeft = (Math.round((yMax * pct) / 1000)).toString() + 'k';
            const valRight = (rightYMax * pct).toFixed(1) + '%';
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
                  {valRight}
                </text>
              </g>
            );
          })}

          {/* Grouped Month Bars */}
          {months.map((m, i) => {
            const xSlot = padLeft + i * monthSlotWidth;
            const xCenter = xSlot + monthSlotWidth / 2;
            const isHovered = hoveredMonth === i;

            const slabH = (m.slabs / yMax) * plotHeight;
            const chanH = (m.channels / yMax) * plotHeight;
            const mouldH = (m.moulds / yMax) * plotHeight;

            const slabX = xCenter - subBarWidth * 1.6;
            const chanX = xCenter - subBarWidth * 0.5;
            const mouldX = xCenter + subBarWidth * 0.6;

            return (
              <g key={m.month} onMouseEnter={() => setHoveredMonth(i)} className="cursor-pointer">
                {/* Background hover bar */}
                <rect
                  x={xSlot}
                  y={padTop}
                  width={monthSlotWidth}
                  height={plotHeight}
                  fill={isHovered ? 'rgba(56, 189, 248, 0.08)' : 'transparent'}
                />

                {/* Slabs Bar */}
                <rect
                  x={slabX}
                  y={padTop + plotHeight - slabH}
                  width={subBarWidth}
                  height={slabH}
                  fill="#0284c7"
                  rx={2}
                />

                {/* Channels Bar */}
                <rect
                  x={chanX}
                  y={padTop + plotHeight - chanH}
                  width={subBarWidth}
                  height={chanH}
                  fill="#14b8a6"
                  rx={2}
                />

                {/* Moulds Bar */}
                <rect
                  x={mouldX}
                  y={padTop + plotHeight - mouldH}
                  width={subBarWidth}
                  height={mouldH}
                  fill="#f59e0b"
                  rx={2}
                />

                {/* Month Name */}
                <text
                  x={xCenter}
                  y={height - padBottom + 16}
                  textAnchor="middle"
                  className={`text-[10.5px] font-mono ${isHovered ? 'fill-sky-400 font-bold' : 'fill-slate-400'}`}
                >
                  {m.monthName}
                </text>
              </g>
            );
          })}

          {/* Defect Rate Line */}
          <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {linePoints.map(p => {
            const isTarget = p.m.defectRate <= settings.maxDefectRatePercent;
            return (
              <circle
                key={`p-${p.index}`}
                cx={p.x}
                cy={p.y}
                r={hoveredMonth === p.index ? 5 : 3}
                fill={isTarget ? '#10b981' : '#f43f5e'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredMonth !== null && months[hoveredMonth] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-sans min-w-[210px]"
            style={{
              left: `${Math.min(
                Math.max(10, linePoints[hoveredMonth].x - 105),
                width - 220
              )}px`,
              top: '10px',
            }}
          >
            <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-100">
                {months[hoveredMonth].monthName} {yearSummary.year}
              </span>
              <span
                className={`font-mono font-semibold ${
                  months[hoveredMonth].defectRate <= settings.maxDefectRatePercent
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {months[hoveredMonth].defectRate.toFixed(1)}% Defect
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-sky-400">
                <span className="font-sans text-slate-400">Slabs:</span>
                <span>{months[hoveredMonth].slabs.toLocaleString()} pcs</span>
              </div>
              <div className="flex justify-between text-teal-300">
                <span className="font-sans text-slate-400">Road Channels:</span>
                <span>{months[hoveredMonth].channels.toLocaleString()} pcs</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span className="font-sans text-slate-400">Mould Cycles:</span>
                <span>{months[hoveredMonth].moulds.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-slate-800 flex justify-between text-rose-400">
                <span className="font-sans text-slate-400">Defects:</span>
                <span>{months[hoveredMonth].defects.toLocaleString()} pcs</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
