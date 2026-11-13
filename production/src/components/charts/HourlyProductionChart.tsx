import React, { useState } from 'react';
import { HourlyRecord, PlantSettings } from '../../types/production';
import { calculateHourlyDefectRate } from '../../utils/analytics';
import { formatHour } from '../../utils/dataGenerator';

interface HourlyProductionChartProps {
  hourly: HourlyRecord[];
  settings: PlantSettings;
}

export const HourlyProductionChart: React.FC<HourlyProductionChartProps> = ({ hourly, settings }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    slabs: true,
    channels: true,
    moulds: true,
    defectRate: true,
  });

  if (!hourly || hourly.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-800 rounded-lg">
        <p className="text-sm font-medium">No hourly production logged for this date.</p>
        <p className="text-xs text-slate-500 mt-1">Use "Log Hour" or "Batch Fill" to record production data.</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 960;
  const height = 300;
  const padLeft = 56;
  const padRight = 56;
  const padTop = 24;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Max volume calculation for left Y-axis
  const maxStackVolume = Math.max(
    ...hourly.map(h => {
      let sum = 0;
      if (activeLayers.slabs) sum += h.slabsProduced;
      if (activeLayers.channels) sum += h.roadChannelsProduced;
      return Math.max(sum, activeLayers.moulds ? h.mouldsProduced : 0);
    }),
    120
  );
  // Round up to nice number
  const yMax = Math.ceil(maxStackVolume / 50) * 50;

  // Max defect rate for right Y-axis (capped at least 8%)
  const maxDefectInSet = Math.max(...hourly.map(h => calculateHourlyDefectRate(h)), settings.warningDefectRatePercent);
  const rightYMax = Math.ceil(Math.max(maxDefectInSet * 1.25, 8));

  const barCount = hourly.length;
  const barSlotWidth = plotWidth / barCount;
  const barWidth = Math.max(12, Math.min(32, barSlotWidth * 0.55));

  // Points for defect rate polyline
  const defectPoints = hourly.map((h, i) => {
    const rate = calculateHourlyDefectRate(h);
    const x = padLeft + i * barSlotWidth + barSlotWidth / 2;
    const y = padTop + plotHeight - (rate / rightYMax) * plotHeight;
    return { x, y, rate, record: h, index: i };
  });

  const defectLinePath = defectPoints.length > 0
    ? `M ${defectPoints[0].x} ${defectPoints[0].y} ` + defectPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Points for moulds line
  const mouldPoints = hourly.map((h, i) => {
    const x = padLeft + i * barSlotWidth + barSlotWidth / 2;
    const y = padTop + plotHeight - (h.mouldsProduced / yMax) * plotHeight;
    return { x, y, val: h.mouldsProduced };
  });

  const mouldLinePath = mouldPoints.length > 0
    ? `M ${mouldPoints[0].x} ${mouldPoints[0].y} ` + mouldPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Reference lines
  const targetDefectY = padTop + plotHeight - (settings.maxDefectRatePercent / rightYMax) * plotHeight;
  const warningDefectY = padTop + plotHeight - (settings.warningDefectRatePercent / rightYMax) * plotHeight;

  return (
    <div className="w-full">
      {/* Legend & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveLayers(p => ({ ...p, slabs: !p.slabs }))}
            className={`flex items-center gap-1.5 transition-opacity ${activeLayers.slabs ? 'opacity-100' : 'opacity-40 line-through'}`}
          >
            <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
            <span className="text-slate-300">Slabs (Units)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayers(p => ({ ...p, channels: !p.channels }))}
            className={`flex items-center gap-1.5 transition-opacity ${activeLayers.channels ? 'opacity-100' : 'opacity-40 line-through'}`}
          >
            <span className="w-3 h-3 rounded-xs bg-teal-400 inline-block" />
            <span className="text-slate-300">Road Channels</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayers(p => ({ ...p, moulds: !p.moulds }))}
            className={`flex items-center gap-1.5 transition-opacity ${activeLayers.moulds ? 'opacity-100' : 'opacity-40 line-through'}`}
          >
            <span className="w-3 h-1 bg-amber-400 inline-block" />
            <span className="text-slate-300">Mould Cycles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayers(p => ({ ...p, defectRate: !p.defectRate }))}
            className={`flex items-center gap-1.5 transition-opacity ${activeLayers.defectRate ? 'opacity-100' : 'opacity-40 line-through'}`}
          >
            <span className="w-3 h-0.5 bg-rose-400 inline-block border-t border-rose-400" />
            <span className="text-rose-400 font-semibold">Defect Rate % (Right Axis)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 border-t border-dashed border-emerald-500 inline-block" />
            Target: &le; {settings.maxDefectRatePercent}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 border-t border-dashed border-amber-500 inline-block" />
            Warn: &ge; {settings.warningDefectRatePercent}%
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[640px] text-slate-400 select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Horizontal Gridlines */}
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
                  strokeDasharray={pct === 0 ? undefined : '2 3'}
                />
                {/* Left Y Axis Label (Volume) */}
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-500 font-mono"
                >
                  {valLeft}
                </text>
                {/* Right Y Axis Label (Defect Rate %) */}
                <text
                  x={width - padRight + 8}
                  y={y + 4}
                  textAnchor="start"
                  className="text-[10px] fill-rose-400/80 font-mono"
                >
                  {valRight}%
                </text>
              </g>
            );
          })}

          {/* Reference Defect Lines */}
          {activeLayers.defectRate && (
            <>
              <line
                x1={padLeft}
                y1={targetDefectY}
                x2={width - padRight}
                y2={targetDefectY}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <line
                x1={padLeft}
                y1={warningDefectY}
                x2={width - padRight}
                y2={warningDefectY}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.7"
              />
            </>
          )}

          {/* Stacked Production Bars (Slabs + Road Channels) */}
          {hourly.map((h, i) => {
            const xCenter = padLeft + i * barSlotWidth + barSlotWidth / 2;
            const xBar = xCenter - barWidth / 2;

            const slabVal = activeLayers.slabs ? h.slabsProduced : 0;
            const channelVal = activeLayers.channels ? h.roadChannelsProduced : 0;

            const slabHeight = (slabVal / yMax) * plotHeight;
            const channelHeight = (channelVal / yMax) * plotHeight;

            const slabY = padTop + plotHeight - slabHeight;
            const channelY = slabY - channelHeight;

            const isHovered = hoveredIdx === i;

            return (
              <g
                key={h.id || i}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Background highlight bar for hover */}
                <rect
                  x={xCenter - barSlotWidth / 2}
                  y={padTop}
                  width={barSlotWidth}
                  height={plotHeight}
                  fill={isHovered ? 'rgba(56, 189, 248, 0.06)' : 'transparent'}
                />

                {/* Slabs Bar (Bottom) */}
                {slabVal > 0 && (
                  <rect
                    x={xBar}
                    y={slabY}
                    width={barWidth}
                    height={slabHeight}
                    fill="#0284c7"
                    className="transition-all hover:brightness-110"
                    rx={channelVal === 0 ? 2 : 0}
                  />
                )}

                {/* Road Channels Bar (Top of Stack) */}
                {channelVal > 0 && (
                  <rect
                    x={xBar}
                    y={channelY}
                    width={barWidth}
                    height={channelHeight}
                    fill="#14b8a6"
                    className="transition-all hover:brightness-110"
                    rx={2}
                  />
                )}

                {/* Hour X-Axis Label */}
                <text
                  x={xCenter}
                  y={height - padBottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered ? 'fill-sky-400 font-semibold' : 'fill-slate-400'
                  }`}
                >
                  {formatHour(h.hour).split(' - ')[0]}
                </text>
              </g>
            );
          })}

          {/* Mould Cycles Line */}
          {activeLayers.moulds && (
            <path
              d={mouldLinePath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.85"
            />
          )}

          {/* Mould Data Point Dots */}
          {activeLayers.moulds &&
            mouldPoints.map((p, idx) => (
              <circle
                key={`mould-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 4 : 2.5}
                fill="#fbbf24"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            ))}

          {/* Defect Rate % Polyline */}
          {activeLayers.defectRate && (
            <path
              d={defectLinePath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Defect Data Point Nodes */}
          {activeLayers.defectRate &&
            defectPoints.map(p => {
              const isWarning = p.rate >= settings.warningDefectRatePercent;
              const isTargetOk = p.rate <= settings.maxDefectRatePercent;
              const nodeColor = isWarning ? '#ef4444' : isTargetOk ? '#10b981' : '#f59e0b';

              return (
                <g key={`defect-${p.index}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === p.index ? 5.5 : 3.5}
                    fill={nodeColor}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="cursor-pointer"
                  />
                  {hoveredIdx === p.index && (
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="text-[11px] font-mono font-bold fill-rose-300 drop-shadow"
                    >
                      {p.rate.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIdx !== null && hourly[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-xs text-xs font-sans min-w-[210px]"
            style={{
              left: `${Math.min(
                Math.max(16, (defectPoints[hoveredIdx]?.x || 100) - 105),
                width - 230
              )}px`,
              top: '10px',
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-100">{formatHour(hourly[hoveredIdx].hour)}</span>
              <span className="text-[11px] text-slate-400 font-mono">{hourly[hoveredIdx].shift.split(' ')[0]}</span>
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-sky-400">
                <span className="font-sans text-slate-400">Slabs:</span>
                <span className="font-semibold">{hourly[hoveredIdx].slabsProduced} pcs</span>
              </div>
              <div className="flex justify-between items-center text-teal-300">
                <span className="font-sans text-slate-400">Road Channels:</span>
                <span className="font-semibold">{hourly[hoveredIdx].roadChannelsProduced} pcs</span>
              </div>
              <div className="flex justify-between items-center text-amber-300">
                <span className="font-sans text-slate-400">Mould Cycles:</span>
                <span className="font-semibold">{hourly[hoveredIdx].mouldsProduced} cyc</span>
              </div>
              <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex justify-between items-center">
                <span className="font-sans text-slate-400">Defects:</span>
                <span className="font-semibold text-rose-400">
                  {hourly[hoveredIdx].defectiveSlabs + hourly[hoveredIdx].defectiveChannels} pcs (
                  {calculateHourlyDefectRate(hourly[hoveredIdx])}%)
                </span>
              </div>
              {hourly[hoveredIdx].primaryDefectReason !== 'None' && (
                <div className="flex justify-between items-center text-[11px] pt-0.5">
                  <span className="font-sans text-slate-400">Primary Flaw:</span>
                  <span className="text-amber-400 font-sans">{hourly[hoveredIdx].primaryDefectReason}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
        <span>Units / Hour (Left Axis)</span>
        <span>Defect % Rate (Right Axis)</span>
      </div>
    </div>
  );
};
