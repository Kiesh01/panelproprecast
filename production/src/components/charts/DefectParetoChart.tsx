import React, { useState } from 'react';
import { DefectReason, HourlyRecord } from '../../types/production';
import { calculateDefectPareto } from '../../utils/analytics';

interface DefectParetoChartProps {
  hourly: HourlyRecord[];
}

export const DefectParetoChart: React.FC<DefectParetoChartProps> = ({ hourly }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = calculateDefectPareto(hourly);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
        <p className="text-sm font-medium">Zero defects recorded in this time range.</p>
        <p className="text-xs text-emerald-400 mt-1">100% first-pass quality compliance.</p>
      </div>
    );
  }

  const width = 520;
  const height = 240;
  const padLeft = 48;
  const padRight = 48;
  const padTop = 20;
  const padBottom = 50;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const maxCount = Math.max(...data.map(d => d.count), 10);
  const yMax = Math.ceil(maxCount / 5) * 5;

  const barCount = data.length;
  const slotWidth = plotWidth / barCount;
  const barWidth = Math.max(16, Math.min(42, slotWidth * 0.6));

  // Cumulative line points
  const points = data.map((d, i) => {
    const x = padLeft + i * slotWidth + slotWidth / 2;
    const y = padTop + plotHeight - (d.cumulativePercentage / 100) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const pareto80Y = padTop + plotHeight - (80 / 100) * plotHeight;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <span className="font-medium text-slate-300">Root Cause Frequency & Cumulative %</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500/80 rounded-xs inline-block" />
            <span>Defect Count</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            <span>Cumulative %</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-0.5 border-t border-dashed border-slate-600 inline-block" />
            80% Line
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[380px] select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + plotHeight * (1 - pct);
            const valLeft = Math.round(yMax * pct);
            const valRight = Math.round(100 * pct);
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
                <text x={padLeft - 6} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
                  {valLeft}
                </text>
                <text x={width - padRight + 6} y={y + 4} textAnchor="start" className="text-[10px] fill-amber-400 font-mono">
                  {valRight}%
                </text>
              </g>
            );
          })}

          {/* 80% Pareto rule guideline */}
          <line
            x1={padLeft}
            y1={pareto80Y}
            x2={width - padRight}
            y2={pareto80Y}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.8"
          />

          {/* Frequency Bars */}
          {data.map((d, i) => {
            const xCenter = padLeft + i * slotWidth + slotWidth / 2;
            const xBar = xCenter - barWidth / 2;
            const barH = (d.count / yMax) * plotHeight;
            const yBar = padTop + plotHeight - barH;
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.reason} onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer">
                <rect
                  x={xBar}
                  y={yBar}
                  width={barWidth}
                  height={barH}
                  fill={isHovered ? '#f43f5e' : '#e11d48'}
                  rx={2}
                  className="transition-all"
                />
                {/* Short reason label truncated */}
                <text
                  x={xCenter}
                  y={height - padBottom + 14}
                  textAnchor="end"
                  transform={`rotate(-25, ${xCenter}, ${height - padBottom + 14})`}
                  className={`text-[9.5px] font-sans ${isHovered ? 'fill-rose-300 font-semibold' : 'fill-slate-400'}`}
                >
                  {d.reason}
                </text>
              </g>
            );
          })}

          {/* Cumulative line */}
          <path d={linePath} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />

          {/* Cumulative points */}
          {points.map((p, idx) => (
            <circle
              key={`pt-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 5 : 3}
              fill="#fbbf24"
              stroke="#0f172a"
              strokeWidth="2"
            />
          ))}
        </svg>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 border border-slate-700 p-2.5 rounded-md shadow-xl text-xs font-sans min-w-[170px]"
            style={{
              left: `${Math.min(Math.max(10, points[hoveredIdx].x - 85), width - 180)}px`,
              top: '10px',
            }}
          >
            <p className="font-semibold text-rose-300 mb-1">{data[hoveredIdx].reason}</p>
            <div className="space-y-0.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Defects:</span>
                <span className="font-bold">{data[hoveredIdx].count} units</span>
              </div>
              <div className="flex justify-between">
                <span>Share:</span>
                <span>{data[hoveredIdx].percentage}%</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Cumulative:</span>
                <span>{data[hoveredIdx].cumulativePercentage}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
