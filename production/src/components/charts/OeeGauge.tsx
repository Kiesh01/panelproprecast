import React from 'react';

interface OeeGaugeProps {
  overall: number; // 0 to 100
  availability: number; // 0 to 100
  performance: number; // 0 to 100
  quality: number; // 0 to 100
}

export const OeeGauge: React.FC<OeeGaugeProps> = ({ overall, availability, performance, quality }) => {
  // Semi-circle arc: from angle -180 deg to 0 deg
  const radius = 70;
  const strokeWidth = 12;
  const cx = 90;
  const cy = 85;

  const circumference = Math.PI * radius; // Half-circle circumference
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, overall)) / 100) * circumference;

  let gaugeColor = '#10b981'; // Green for >= 75% (World class is ~85%)
  if (overall < 60) gaugeColor = '#f43f5e';
  else if (overall < 75) gaugeColor = '#f59e0b';

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <div className="relative flex items-center justify-center">
        <svg width="180" height="105" viewBox="0 0 180 105" className="overflow-visible select-none">
          {/* Background Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />

          {/* Value Display */}
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            className="text-2xl font-bold fill-slate-100 font-mono tracking-tight"
          >
            {overall.toFixed(1)}%
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            className="text-[11px] font-sans font-medium fill-slate-400 uppercase tracking-wider"
          >
            Line OEE
          </text>
        </svg>
      </div>

      {/* Sub-components: Availability, Performance, Quality */}
      <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-800 text-center font-mono">
        <div>
          <span className="block text-[10px] text-slate-400 font-sans uppercase">Avail</span>
          <span className="text-xs font-semibold text-slate-200">{availability.toFixed(1)}%</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-sans uppercase">Perf</span>
          <span className="text-xs font-semibold text-slate-200">{performance.toFixed(1)}%</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-sans uppercase">Qual</span>
          <span className={`text-xs font-semibold ${quality >= 97 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {quality.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
