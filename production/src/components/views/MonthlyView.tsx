import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Award, AlertOctagon } from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import { calculateDaySummary, calculateMonthSummary } from '../../utils/analytics';
import { MonthlyTrendChart } from '../charts/MonthlyTrendChart';
import { HourlyDefectHeatmap } from '../charts/HourlyDefectHeatmap';

interface MonthlyViewProps {
  allLogs: Record<string, DailyLog>;
  settings: PlantSettings;
  onSelectDate: (dateStr: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ allLogs, settings, onSelectDate }) => {
  const [selectedYearMonth, setSelectedYearMonth] = useState('2026-10');

  // Available months derived from keys or standard list
  const availableMonths = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' },
    { value: '2025-12', label: 'December 2025' },
    { value: '2025-11', label: 'November 2025' },
  ];

  const monthSummary = calculateMonthSummary(selectedYearMonth, allLogs, settings);

  // Compute Day-of-week averages
  const weekdayTotals = [
    { name: 'Sun', produced: 0, defects: 0, count: 0 },
    { name: 'Mon', produced: 0, defects: 0, count: 0 },
    { name: 'Tue', produced: 0, defects: 0, count: 0 },
    { name: 'Wed', produced: 0, defects: 0, count: 0 },
    { name: 'Thu', produced: 0, defects: 0, count: 0 },
    { name: 'Fri', produced: 0, defects: 0, count: 0 },
    { name: 'Sat', produced: 0, defects: 0, count: 0 },
  ];

  const monthLogs = Object.values(allLogs).filter(l => l.date.startsWith(selectedYearMonth));

  for (const log of monthLogs) {
    const d = new Date(log.date + 'T12:00:00Z');
    const dow = d.getDay();
    const sum = calculateDaySummary(log, settings);
    weekdayTotals[dow].produced += sum.totalProduced;
    weekdayTotals[dow].defects += sum.totalDefects;
    weekdayTotals[dow].count += 1;
  }

  const weekdayStats = weekdayTotals.map(w => {
    const avgVolume = w.count > 0 ? Math.round(w.produced / w.count) : 0;
    const avgDefectRate = w.produced > 0 ? Number(((w.defects / w.produced) * 100).toFixed(2)) : 0;
    return { ...w, avgVolume, avgDefectRate };
  });

  const maxWeekdayVolume = Math.max(...weekdayStats.map(w => w.avgVolume), 1000);

  // Find previous month to calculate trajectory
  const currentIdx = availableMonths.findIndex(m => m.value === selectedYearMonth);
  const handlePrevMonth = () => {
    if (currentIdx < availableMonths.length - 1) {
      setSelectedYearMonth(availableMonths[currentIdx + 1].value);
    }
  };
  const handleNextMonth = () => {
    if (currentIdx > 0) {
      setSelectedYearMonth(availableMonths[currentIdx - 1].value);
    }
  };

  const isMonthTargetOk = monthSummary.averageDefectRate <= settings.maxDefectRatePercent;

  return (
    <div className="space-y-6">
      {/* Month Navigation & Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIdx >= availableMonths.length - 1}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <select
            value={selectedYearMonth}
            onChange={e => setSelectedYearMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-100 focus:outline-hidden focus:border-sky-500"
          >
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentIdx <= 0}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Logged Operating Days: <span className="text-slate-200 font-bold">{monthSummary.daysLogged}</span> days
        </div>
      </div>

      {/* Monthly Scorecard Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Monthly Slabs */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Monthly Slabs Output</span>
          <p className="text-2xl font-bold font-mono text-sky-400">
            {monthSummary.totalSlabs.toLocaleString()}
          </p>
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            Avg/Day: {monthSummary.daysLogged > 0 ? Math.round(monthSummary.totalSlabs / monthSummary.daysLogged).toLocaleString() : 0} pcs
          </div>
        </div>

        {/* Metric 2: Monthly Road Channels */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Road Channels Output</span>
          <p className="text-2xl font-bold font-mono text-teal-300">
            {monthSummary.totalChannels.toLocaleString()}
          </p>
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            Avg/Day: {monthSummary.daysLogged > 0 ? Math.round(monthSummary.totalChannels / monthSummary.daysLogged).toLocaleString() : 0} pcs
          </div>
        </div>

        {/* Metric 3: Mould Turnover */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Mould Cycles</span>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {monthSummary.totalMoulds.toLocaleString()}
          </p>
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            Avg/Day: {monthSummary.daysLogged > 0 ? Math.round(monthSummary.totalMoulds / monthSummary.daysLogged).toLocaleString() : 0} cyc
          </div>
        </div>

        {/* Metric 4: Monthly Defect Rate */}
        <div
          className={`p-4 bg-slate-900 border rounded-xl ${
            isMonthTargetOk ? 'border-slate-800' : 'border-rose-500/60'
          }`}
        >
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Average Defect Rate</span>
            <span
              className={`font-mono text-[11px] font-bold ${
                isMonthTargetOk ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isMonthTargetOk ? 'Target Met' : 'Above Target'}
            </span>
          </div>
          <p
            className={`text-2xl font-bold font-mono ${
              isMonthTargetOk ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {monthSummary.averageDefectRate}%
          </p>
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            Total Scrapped: {monthSummary.totalDefects.toLocaleString()} units
          </div>
        </div>

        {/* Metric 5: Estimated Monthly Scrap Cost */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Monthly Scrap Loss</span>
          <p className="text-2xl font-bold font-mono text-rose-300">
            ${monthSummary.estimatedScrapCost.toLocaleString()}
          </p>
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            Target Max Defect: &le; {settings.maxDefectRatePercent}%
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Daily Production Volume & Defect Rate Curve ({monthSummary.label})
            </h2>
            <p className="text-xs text-slate-400">
              Stacked bar output of Slabs & Channels against daily defect percentage trajectory
            </p>
          </div>
        </div>
        <MonthlyTrendChart yearMonth={selectedYearMonth} allLogs={allLogs} settings={settings} />
      </div>

      {/* Two Column Layout: Day-of-Week Efficiency & Monthly Quality Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Day-of-Week Efficiency Breakdown */}
        <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Day-of-Week Operational Efficiency</h3>
              <p className="text-xs text-slate-400">Identifies cyclical start-of-week or weekend variances</p>
            </div>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-3 pt-2">
            {weekdayStats.map(w => {
              const widthPct = maxWeekdayVolume > 0 ? (w.avgVolume / maxWeekdayVolume) * 100 : 0;
              const isLowDefect = w.avgDefectRate <= settings.maxDefectRatePercent;

              return (
                <div key={w.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold font-sans w-12">{w.name}</span>
                    <span className="text-slate-400">{w.avgVolume.toLocaleString()} units avg</span>
                    <span className={`font-bold ${isLowDefect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {w.avgDefectRate}% Defect
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLowDefect ? 'bg-sky-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quality Benchmarks & Best/Worst Days */}
        <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Monthly Operational Milestones</h3>

            <div className="space-y-3">
              {/* Best Day */}
              <div
                onClick={() => monthSummary.bestDay.date && onSelectDate(monthSummary.bestDay.date)}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <Award className="w-4 h-4" />
                  <span>Lowest Defect Run (Benchmark)</span>
                </div>
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-200">{monthSummary.bestDay.date}</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {monthSummary.bestDay.rate}% Defect Rate
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  Click to inspect operating parameters and vibrator frequencies for this shift.
                </p>
              </div>

              {/* Hardest Day */}
              <div
                onClick={() => monthSummary.worstDay.date && onSelectDate(monthSummary.worstDay.date)}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Highest Defect Spike</span>
                </div>
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-200">{monthSummary.worstDay.date}</span>
                  <span className="text-rose-400 font-bold text-sm">
                    {monthSummary.worstDay.rate}% Defect Rate
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  Click to view hourly breakdown, scrap root cause, and operator handover notes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Maintaining defect rate below {settings.maxDefectRatePercent}% recovered an estimated $
            {Math.round(monthSummary.totalProduced * 0.015 * 16)} in material value this month.
          </div>
        </div>
      </div>

      {/* Hourly Defect Heatmap Matrix */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <HourlyDefectHeatmap recentLogs={monthLogs} />
      </div>
    </div>
  );
};
