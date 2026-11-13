import React from 'react';
import { AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import { DailyLog, HourlyRecord, PlantSettings } from '../../types/production';
import { calculateDaySummary, calculateHourlyDefectRate } from '../../utils/analytics';
import { formatHour, getShiftForHour } from '../../utils/dataGenerator';
import { HourlyProductionChart } from '../charts/HourlyProductionChart';
import { DefectParetoChart } from '../charts/DefectParetoChart';
import { OeeGauge } from '../charts/OeeGauge';

interface RealTimeViewProps {
  currentDayLog: DailyLog;
  settings: PlantSettings;
  onOpenLogModal: (hourRecord?: HourlyRecord | null, targetHour?: number) => void;
  onOpenBatchModal: () => void;
}

export const RealTimeView: React.FC<RealTimeViewProps> = ({
  currentDayLog,
  settings,
  onOpenLogModal,
  onOpenBatchModal,
}) => {
  const summary = calculateDaySummary(currentDayLog, settings);
  const hourly = currentDayLog.hourly;
  const latestRecord = hourly.length > 0 ? hourly[hourly.length - 1] : null;

  const currentDefectRate = latestRecord ? calculateHourlyDefectRate(latestRecord) : 0;
  const currentSlabs = latestRecord ? latestRecord.slabsProduced : 0;
  const currentChannels = latestRecord ? latestRecord.roadChannelsProduced : 0;
  const currentMoulds = latestRecord ? latestRecord.mouldsProduced : 0;

  const slabTargetPct = Math.round((currentSlabs / (settings.targetHourlySlabs || 1)) * 100);
  const channelTargetPct = Math.round((currentChannels / (settings.targetHourlyChannels || 1)) * 100);
  const mouldTargetPct = Math.round((currentMoulds / (settings.targetHourlyMoulds || 1)) * 100);

  const isCurrentWarning = currentDefectRate >= settings.warningDefectRatePercent;

  return (
    <div className="space-y-6">
      {/* Operator Target Benchmarks Banner */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-semibold text-slate-200">Daily Production Targets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            Slabs: <strong className="text-sky-400">120 pcs</strong> <span className="text-slate-500">(12/hr)</span>
          </span>
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            Cabros: <strong className="text-teal-300">86 sqm</strong>
          </span>
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            Culverts: <strong className="text-amber-400">5 total</strong> <span className="text-slate-500">(2x 450mm, 3x 900mm)</span>
          </span>
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            Wall Copings: <strong className="text-cyan-400">120 pcs</strong> <span className="text-slate-500">(12/hr)</span>
          </span>
        </div>
      </div>

      {/* Real-time KPI Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Slabs Throughput */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Slabs / Hour</span>
            <span className="text-[11px] font-mono text-sky-400 font-semibold">{slabTargetPct}% of Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{currentSlabs}</span>
            <span className="text-xs text-slate-500 font-mono">/ {settings.targetHourlySlabs} target</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, slabTargetPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Shift Total: {summary.totalSlabs.toLocaleString()}</span>
            <span>Target: {settings.targetDailySlabs.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2: Road Channels */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Road Channels / Hour</span>
            <span className="text-[11px] font-mono text-teal-300 font-semibold">{channelTargetPct}% of Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{currentChannels}</span>
            <span className="text-xs text-slate-500 font-mono">/ {settings.targetHourlyChannels} target</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, channelTargetPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Shift Total: {summary.totalChannels.toLocaleString()}</span>
            <span>Target: {settings.targetDailyChannels.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 3: Mould Cycles */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Mould Cycles / Hour</span>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">{mouldTargetPct}% of Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{currentMoulds}</span>
            <span className="text-xs text-slate-500 font-mono">/ {settings.targetHourlyMoulds} target</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, mouldTargetPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Shift Total: {summary.totalMoulds.toLocaleString()}</span>
            <span>Cycle Speed: 26s</span>
          </div>
        </div>

        {/* Metric 4: Live Defect Rate */}
        <div
          className={`p-4 bg-slate-900 border rounded-xl relative overflow-hidden ${
            isCurrentWarning ? 'border-rose-500/60 shadow-lg shadow-rose-950/20' : 'border-slate-800'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Hourly Defect Rate</span>
            {isCurrentWarning ? (
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Spike Alert
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-mono">Within Bounds</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                isCurrentWarning ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {currentDefectRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">Max &le; {settings.maxDefectRatePercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCurrentWarning ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (currentDefectRate / settings.warningDefectRatePercent) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Primary: {latestRecord?.primaryDefectReason || 'None'}</span>
            <span>Daily Avg: {summary.defectRate}%</span>
          </div>
        </div>

        {/* Metric 5: OEE Overall */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <OeeGauge
            overall={summary.oeeOverall}
            availability={summary.oeeAvailability}
            performance={summary.oeePerformance}
            quality={summary.oeeQuality}
          />
        </div>
      </div>

      {/* Main Real-Time Chart: Today's Hourly Production Breakdown */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Live Hourly Output & Defect Telemetry ({currentDayLog.date})
            </h2>
            <p className="text-xs text-slate-400">
              Real-time synchronization for Slabs, Road Channels, Mould cycles, and quality variance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenBatchModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batch Day Fill
            </button>
            <button
              type="button"
              onClick={() => onOpenLogModal(null, latestRecord ? Math.min(16, latestRecord.hour + 1) : 7)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Production Hour
            </button>
          </div>
        </div>

        <HourlyProductionChart hourly={hourly} settings={settings} />
      </div>

      {/* Two Column Layout: Root Cause Pareto & Shift Timeline Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pareto Root Cause Analysis */}
        <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Today's Defect Root Cause (Pareto)</h3>
          <p className="text-xs text-slate-400 mb-3">80% of scrap is caused by the top 2 defect reasons</p>
          <DefectParetoChart hourly={hourly} />
        </div>

        {/* Right Column: Recent Hour Telemetry & Audit Feed */}
        <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Recent Hourly Production Records</h3>
              <p className="text-xs text-slate-400">Click any hour to review line notes or edit figures</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{hourly.length} hours logged</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {hourly.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hours logged yet today.</p>
            ) : (
              hourly
                .slice()
                .reverse()
                .map(h => {
                  const rate = calculateHourlyDefectRate(h);
                  const isWarn = rate >= settings.warningDefectRatePercent;
                  const isOk = rate <= settings.maxDefectRatePercent;

                  return (
                    <div
                      key={h.id}
                      onClick={() => onOpenLogModal(h, h.hour)}
                      className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-slate-200">{formatHour(h.hour)}</span>
                        <span className="text-slate-500 text-[11px]">{getShiftForHour(h.hour).split(' ')[0]}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-mono">
                        <span className="text-sky-400">{h.slabsProduced || 0} Slabs</span>
                        <span className="text-teal-300">{h.roadChannelsProduced || 0} Channels</span>
                        <span className="text-emerald-400">{h.cabrosProduced || 0} Cabros</span>
                        <span className="text-lime-400">{h.colouredCabrosProduced || 0} Col.Cabro</span>
                        <span className="text-amber-300">{h.mouldsProduced || 0} Moulds</span>
                        <span
                          className={`font-bold ${
                            isWarn ? 'text-rose-400' : isOk ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {rate}% Defect
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
