import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Wand2,
  Edit2,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { DailyLog, HourlyRecord, PlantSettings } from '../../types/production';
import { calculateDaySummary, calculateHourlyDefectRate } from '../../utils/analytics';
import { formatHour, getShiftForHour } from '../../utils/dataGenerator';
import { HourlyProductionChart } from '../charts/HourlyProductionChart';
import { DefectParetoChart } from '../charts/DefectParetoChart';
import { InteractiveCalendar } from '../common/InteractiveCalendar';

interface DailyLogViewProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  dayLog: DailyLog;
  settings: PlantSettings;
  onOpenLogModal: (initial?: HourlyRecord | null, targetHour?: number) => void;
  onOpenBatchModal: () => void;
  onOpenForgottenModal: () => void;
  onDeleteHour: (hour: number) => void;
  allLogs?: Record<string, DailyLog>;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  currentDate,
  onDateChange,
  dayLog,
  settings,
  onOpenLogModal,
  onOpenBatchModal,
  onOpenForgottenModal,
  onDeleteHour,
  allLogs = {},
}) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const summary = calculateDaySummary(dayLog, settings);

  const loggedMetadata: Record<string, { totalProduced: number; defectRate?: number; isLogged: boolean }> = {};
  Object.keys(allLogs).forEach(d => {
    const l = allLogs[d];
    if (l) {
      loggedMetadata[d] = {
        totalProduced: l.totalProduced || l.hourly?.reduce((a, b) => a + (b.slabsProduced || 0) + (b.roadChannelsProduced || 0) + (b.cabrosProduced || 0) + (b.colouredCabrosProduced || 0) + (b.wallCopingProduced || 0) + (b.shallowDrainsProduced || 0) + (b.roadKerbsProduced || 0) + (b.culverts450Produced || 0) + (b.culverts900Produced || 0), 0) || 0,
        defectRate: l.defectRate,
        isLogged: (l.hourly && l.hourly.length > 0) || false,
      };
    }
  });

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T12:00:00Z');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T12:00:00Z');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isDefectWarning = summary.defectRate >= settings.warningDefectRatePercent;
  const isDefectTargetOk = summary.defectRate <= settings.maxDefectRatePercent;

  const dayOfWeek = new Date(currentDate + 'T12:00:00Z').getDay();
  const isSunday = dayOfWeek === 0;

  return (
    <div className="space-y-6">
      {/* Sunday Non-Production Banner */}
      {isSunday && (
        <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">Sunday Scheduled Maintenance (Plant Closed)</p>
              <p className="text-slate-400 mt-0.5">
                Standard operating schedule is <strong>Monday – Saturday (07:30 AM – 5:00 PM)</strong>. Sunday is dedicated to ultrasonic mould washdown and hydraulic servicing.
              </p>
            </div>
          </div>
          <span className="font-mono text-slate-400 shrink-0 text-[11px]">Mon–Sat Run</span>
        </div>
      )}

      {/* Forgotten Day Prompt if no data recorded for this day */}
      {!isSunday && dayLog.hourly.length === 0 && (
        <div className="p-4 bg-slate-900/95 border border-sky-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Plus className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">No Production Records for {currentDate}</p>
              <p className="text-slate-400 mt-0.5">
                If you forgot to enter production for this date, click <strong>Log Forgotten Day</strong> to input the figures. All variables initialize at zero.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenForgottenModal}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Forgotten Day Data</span>
          </button>
        </div>
      )}

      {/* Top Date Toolbar & Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={currentDate}
              onChange={e => onDateChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-hidden focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-md transition-colors font-medium cursor-pointer"
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Toggle Visual Production Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>{showCalendar ? 'Close Calendar' : 'Calendar View'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenForgottenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Forgotten Day</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Batch Fill Day</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLogModal(null, 8)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Hour</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Calendar (when toggled) */}
      {showCalendar && (
        <div className="animate-in fade-in duration-200">
          <InteractiveCalendar
            selectedDate={currentDate}
            onSelectDate={d => {
              onDateChange(d);
              setShowCalendar(false);
            }}
            loggedDates={loggedMetadata}
          />
        </div>
      )}

      {/* Daily Performance Scorecard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Slabs */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Slabs</span>
            <span className="font-mono text-sky-400">Target 120</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalSlabs}</p>
        </div>

        {/* Cabros */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Cabros</span>
            <span className="font-mono text-teal-300">Target 86 sqm</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalCabros} <span className="text-xs font-normal text-slate-400">sqm</span></p>
        </div>

        {/* Coloured Cabros */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Col. Cabro</span>
            <span className="font-mono text-lime-400">sqm</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalColouredCabros} <span className="text-xs font-normal text-slate-400">sqm</span></p>
        </div>

        {/* Wall Coping */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Wall Copy</span>
            <span className="font-mono text-cyan-400">Target 120</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalWallCoping}</p>
        </div>

        {/* Culverts (450mm & 900mm) */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Culverts</span>
            <span className="font-mono text-amber-400">5 pcs total</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">
            {summary.totalCulverts450 + summary.totalCulverts900}
            <span className="text-[10px] text-slate-400 font-mono ml-1">({summary.totalCulverts450} / {summary.totalCulverts900})</span>
          </p>
        </div>

        {/* Channels */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Road Channels</span>
            <span className="font-mono text-emerald-400">pcs</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalChannels}</p>
        </div>

        {/* Total Produced & Defect Rate */}
        <div className={`p-3 bg-slate-900 border rounded-xl ${isDefectWarning ? 'border-rose-500/60' : 'border-slate-800'}`}>
          <div className="flex justify-between items-start mb-1 text-xs text-slate-400">
            <span>Total Output</span>
            <span className={`font-mono text-[10px] font-bold ${isDefectTargetOk ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.defectRate}% Def
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">{summary.totalProduced}</p>
        </div>
      </div>

      {/* Hourly Output & Defect Telemetry Chart */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Hourly Output & Defect Telemetry for {currentDate}
            </h2>
            <p className="text-xs text-slate-400">
              Production volume of precast lines vs hourly defect rate %
            </p>
          </div>
        </div>
        <HourlyProductionChart hourly={dayLog.hourly} settings={settings} />
      </div>

      {/* Root Cause & Notes Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">
            Defect Root Cause Pareto Analysis
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Focus maintenance and operator training on vital causes
          </p>
          <DefectParetoChart hourly={dayLog.hourly} />
        </div>

        <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Shift Handover & Operational Notes</h3>
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans min-h-[90px]">
              {dayLog.shiftNotes || 'No special operational notices entered for this production shift.'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[11px] font-sans text-slate-400 block">Supervisor</span>
              <span className="text-slate-200 font-semibold">{dayLog.supervisor}</span>
            </div>
            <div>
              <span className="text-[11px] font-sans text-slate-400 block">Atmospheric Curing</span>
              <span className="text-slate-200">{dayLog.ambientTempC}°C · {dayLog.humidityPct}% RH</span>
            </div>
            <div>
              <span className="text-[11px] font-sans text-slate-400 block">Quality Status</span>
              <span className="text-emerald-400 font-semibold">{dayLog.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Hourly Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">Hourly Production Ledger (All Precast Items)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {dayLog.hourly.length} intervals recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 text-left font-sans">Interval</th>
                <th className="py-2.5 px-2 text-right text-teal-300">Channels</th>
                <th className="py-2.5 px-2 text-right text-sky-400">Slabs</th>
                <th className="py-2.5 px-2 text-right text-emerald-400">Cabros</th>
                <th className="py-2.5 px-2 text-right text-lime-400">Col.Cabro</th>
                <th className="py-2.5 px-2 text-right text-cyan-400">WallCopy</th>
                <th className="py-2.5 px-2 text-right text-violet-400">Shallow</th>
                <th className="py-2.5 px-2 text-right text-indigo-400">Kerbs</th>
                <th className="py-2.5 px-2 text-right text-amber-400">450mm</th>
                <th className="py-2.5 px-2 text-right text-orange-400">900mm</th>
                <th className="py-2.5 px-2 text-right text-rose-400">Defects</th>
                <th className="py-2.5 px-2 text-right">Defect %</th>
                <th className="py-2.5 px-3 text-left font-sans">Root Cause</th>
                <th className="py-2.5 px-3 text-center font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dayLog.hourly.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-500 font-sans">
                    No production data entered for this day. Click "Log Hour" or "Add Forgotten Day" above.
                  </td>
                </tr>
              ) : (
                dayLog.hourly.map(h => {
                  const rate = calculateHourlyDefectRate(h);
                  const isWarn = rate >= settings.warningDefectRatePercent;
                  const isOk = rate <= settings.maxDefectRatePercent;

                  const totDefs =
                    (h.defectiveSlabs || 0) +
                    (h.defectiveChannels || 0) +
                    (h.defectiveCabros || 0) +
                    (h.defectiveColouredCabros || 0) +
                    (h.defectiveWallCoping || 0) +
                    (h.defectiveShallowDrains || 0) +
                    (h.defectiveRoadKerbs || 0) +
                    (h.defectiveCulverts450 || 0) +
                    (h.defectiveCulverts900 || 0);

                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-200 font-semibold">{formatHour(h.hour).split(' - ')[0]}</td>
                      <td className="py-2.5 px-2 text-right text-teal-300">{h.roadChannelsProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-sky-400">{h.slabsProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-emerald-400">{h.cabrosProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-lime-400">{h.colouredCabrosProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-cyan-400">{h.wallCopingProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-violet-400">{h.shallowDrainsProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-indigo-400">{h.roadKerbsProduced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-amber-400">{h.culverts450Produced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-orange-400">{h.culverts900Produced || 0}</td>
                      <td className="py-2.5 px-2 text-right text-rose-400">{totDefs}</td>
                      <td
                        className={`py-2.5 px-2 text-right font-bold ${
                          isWarn ? 'text-rose-400' : isOk ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {rate}%
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[120px]">
                        {h.primaryDefectReason || 'None'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenLogModal(h, h.hour)}
                            className="p-1 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Hour"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHour(h.hour)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Hour"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
