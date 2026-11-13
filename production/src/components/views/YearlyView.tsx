import React, { useState } from 'react';
import { TrendingDown, Calendar, Layers } from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import { calculateYearSummary } from '../../utils/analytics';
import { YearlyComparisonChart } from '../charts/YearlyComparisonChart';

interface YearlyViewProps {
  allLogs: Record<string, DailyLog>;
  settings: PlantSettings;
}

export const YearlyView: React.FC<YearlyViewProps> = ({ allLogs, settings }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const currentYearSummary = calculateYearSummary(selectedYear, allLogs, settings);
  const priorYearSummary = calculateYearSummary(selectedYear - 1, allLogs, settings);

  // Year-over-year deltas
  const yoyVolumeDelta = priorYearSummary.totalProduced > 0
    ? Number((((currentYearSummary.totalProduced - priorYearSummary.totalProduced) / priorYearSummary.totalProduced) * 100).toFixed(1))
    : 0;

  const yoyDefectDelta = Number((currentYearSummary.averageDefectRate - priorYearSummary.averageDefectRate).toFixed(2));

  // Compute Quarterly Aggregates
  const quarterly = [
    { name: 'Q1 (Jan - Mar)', slabs: 0, channels: 0, moulds: 0, defects: 0 },
    { name: 'Q2 (Apr - Jun)', slabs: 0, channels: 0, moulds: 0, defects: 0 },
    { name: 'Q3 (Jul - Sep)', slabs: 0, channels: 0, moulds: 0, defects: 0 },
    { name: 'Q4 (Oct - Dec)', slabs: 0, channels: 0, moulds: 0, defects: 0 },
  ];

  currentYearSummary.monthlyBreakdown.forEach((m, idx) => {
    const qIdx = Math.floor(idx / 3);
    quarterly[qIdx].slabs += m.slabs;
    quarterly[qIdx].channels += m.channels;
    quarterly[qIdx].moulds += m.moulds;
    quarterly[qIdx].defects += m.defects;
  });

  const annualTargetVolume = 500000;
  const annualProgressPct = Math.min(100, Math.round((currentYearSummary.totalProduced / annualTargetVolume) * 100));

  return (
    <div className="space-y-6">
      {/* Yearly Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-sky-400" />
          <span className="text-sm font-semibold text-slate-100">Annual Production Review:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {[2026, 2025].map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedYear === yr
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr} Operating Year
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">YoY Volume:</span>
          <span className={`font-bold ${yoyVolumeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {yoyVolumeDelta >= 0 ? '+' : ''}{yoyVolumeDelta}%
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">Quality Defect Delta:</span>
          <span className={`font-bold ${yoyDefectDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {yoyDefectDelta <= 0 ? '' : '+'}{yoyDefectDelta}%
          </span>
        </div>
      </div>

      {/* Annual Milestone Progress Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex justify-between items-center mb-2 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">
              {selectedYear} Annual Plant Throughput Milestone
            </span>
          </div>
          <span className="font-mono text-slate-300 font-bold">
            {currentYearSummary.totalProduced.toLocaleString()} / {annualTargetVolume.toLocaleString()} units ({annualProgressPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${annualProgressPct}%` }}
          />
        </div>
      </div>

      {/* Annual Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Annual Slabs Produced</span>
          <p className="text-2xl font-bold font-mono text-sky-400">
            {currentYearSummary.totalSlabs.toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-slate-500 mt-2 block">
            Share: {Math.round((currentYearSummary.totalSlabs / (currentYearSummary.totalProduced || 1)) * 100)}% of total volume
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Annual Road Channels</span>
          <p className="text-2xl font-bold font-mono text-teal-300">
            {currentYearSummary.totalChannels.toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-slate-500 mt-2 block">
            Share: {Math.round((currentYearSummary.totalChannels / (currentYearSummary.totalProduced || 1)) * 100)}% of total volume
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Annual Average Defect Rate</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-slate-100">
              {currentYearSummary.averageDefectRate}%
            </p>
            {yoyDefectDelta < 0 && (
              <span className="flex items-center text-xs text-emerald-400 font-mono font-semibold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {Math.abs(yoyDefectDelta)}% YoY gain
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-2 block">
            Total Scrapped: {currentYearSummary.totalDefects.toLocaleString()} units
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Mould Cycles Run</span>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {currentYearSummary.totalMoulds.toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-slate-500 mt-2 block">
            Est. Scrap Cost: ${currentYearSummary.estimatedScrapCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 12-Month Grouped Bar Chart */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              12-Month Comparative Output & Defect Trajectory ({selectedYear})
            </h2>
            <p className="text-xs text-slate-400">
              Monthly breakdown for Slabs, Road Channels, and Mould cycles with quality compliance line
            </p>
          </div>
        </div>
        <YearlyComparisonChart yearSummary={currentYearSummary} settings={settings} />
      </div>

      {/* Quarterly Breakdown Grid */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Quarterly Performance Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarterly.map(q => {
            const qTotal = q.slabs + q.channels;
            const qRate = qTotal > 0 ? Number(((q.defects / qTotal) * 100).toFixed(2)) : 0;
            const isOk = qRate <= settings.maxDefectRatePercent;

            return (
              <div key={q.name} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="font-semibold text-xs text-slate-200">{q.name}</span>
                  <span className={`text-xs font-mono font-bold ${isOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {qRate}% Defect
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-sky-400">
                    <span className="font-sans text-slate-400 text-[11px]">Slabs:</span>
                    <span>{q.slabs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-teal-300">
                    <span className="font-sans text-slate-400 text-[11px]">Road Channels:</span>
                    <span>{q.channels.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span className="font-sans text-slate-400 text-[11px]">Mould Cycles:</span>
                    <span>{q.moulds.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 flex justify-between text-slate-300">
                    <span className="font-sans text-slate-400 text-[11px]">Total Volume:</span>
                    <span className="font-bold text-white">{qTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
