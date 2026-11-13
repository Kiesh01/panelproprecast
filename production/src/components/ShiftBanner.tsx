import React from 'react';
import { Play, Pause, FastForward, Activity, Database } from 'lucide-react';
import { DailyLog, PlantSettings } from '../types/production';
import { calculateDaySummary } from '../utils/analytics';
import { getShiftForHour } from '../utils/dataGenerator';
import { MongoHealthStatus } from '../services/api';

interface ShiftBannerProps {
  currentDayLog: DailyLog;
  settings: PlantSettings;
  isLiveSimulating: boolean;
  onToggleSim: () => void;
  onStepNextHour: () => void;
  mongoStatus?: MongoHealthStatus | null;
}

export const ShiftBanner: React.FC<ShiftBannerProps> = ({
  currentDayLog,
  settings,
  isLiveSimulating,
  onToggleSim,
  onStepNextHour,
  mongoStatus,
}) => {
  const summary = calculateDaySummary(currentDayLog, settings);
  const latestHour = currentDayLog.hourly.length > 0
    ? currentDayLog.hourly[currentDayLog.hourly.length - 1].hour
    : 8;
  const currentShift = getShiftForHour(latestHour);

  const isWarning = summary.defectRate >= settings.warningDefectRatePercent;
  const isTargetOk = summary.defectRate <= settings.maxDefectRatePercent;

  const dayOfWeek = new Date(currentDayLog.date + 'T12:00:00Z').getDay();
  const isSunday = dayOfWeek === 0;

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Plant & Shift Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-200">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Plant Operations</span>
          </div>
          <span className="text-slate-600">/</span>
          <span className={isSunday ? 'text-amber-400 font-semibold' : 'text-sky-300 font-medium'}>
            {isSunday ? 'Sunday Maintenance (Plant Closed)' : currentShift}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 font-sans">
            Schedule: <strong className="text-slate-200 font-mono">Mon–Sat 07:30–17:00</strong>
          </span>
          <span className="text-slate-600">/</span>
          <span>Sup: {currentDayLog.supervisor}</span>
          <span className="text-slate-600">/</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${mongoStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-400 font-sans">Cloud Sync:</span>
            <span className="text-emerald-400 font-semibold">
              {mongoStatus?.connected ? 'Live' : 'Connecting...'}
            </span>
            {mongoStatus?.documentCount !== undefined && (
              <span className="text-slate-500">({mongoStatus.documentCount} days stored)</span>
            )}
          </span>
        </div>

        {/* Status Indicator & Live Simulation Controls */}
        <div className="flex items-center gap-4">
          {/* Quality State */}
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 font-sans text-[11px]">Today's Defect Rate:</span>
            <span
              className={`font-bold ${
                isWarning ? 'text-rose-400' : isTargetOk ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {summary.defectRate}%
            </span>
            <span className="text-slate-500 text-[10px]">
              ({isTargetOk ? 'Target Met' : isWarning ? 'Warning Triggered' : 'Elevated'})
            </span>
          </div>

          {/* Simulation Toggle Controls */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
            <button
              type="button"
              onClick={onToggleSim}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                isLiveSimulating
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isLiveSimulating ? 'Pause live production feed simulation' : 'Start live production feed simulation'}
            >
              {isLiveSimulating ? (
                <>
                  <Pause className="w-3 h-3 text-rose-400" />
                  <span>Streaming</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-sky-400" />
                  <span>Simulate Feed</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onStepNextHour}
              disabled={isLiveSimulating}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Add Next Hour Output Tick"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>+1 Hour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
