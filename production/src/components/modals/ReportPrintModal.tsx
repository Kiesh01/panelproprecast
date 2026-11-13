import React from 'react';
import { X, Printer } from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import { calculateDaySummary, calculateDefectPareto, calculateShiftStats } from '../../utils/analytics';
import { formatHour } from '../../utils/dataGenerator';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayLog: DailyLog;
  settings: PlantSettings;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({ isOpen, onClose, dayLog, settings }) => {
  if (!isOpen) return null;

  const summary = calculateDaySummary(dayLog, settings);
  const pareto = calculateDefectPareto(dayLog.hourly);
  const shifts = calculateShiftStats(dayLog.hourly);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Controls Header (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">Daily Production & Quality Handover Report</h2>
            <span className="text-xs text-slate-400 font-mono">({dayLog.date})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-0">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
                  {settings.plantName}
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Automated Precast Casting & Paving Operational Audit · Schedule: Mon–Sat 07:30–17:00
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400 print:text-gray-700">
                <p>Date: <strong className="text-slate-200 print:text-black">{dayLog.date}</strong></p>
                <p>Supervisor: {dayLog.supervisor}</p>
                <p>Status: {dayLog.status.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Key Executive KPIs */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg print:border print:border-gray-300 print:bg-gray-50">
            <div>
              <span className="text-[10px] uppercase font-sans text-slate-400 print:text-gray-600">Total Slabs</span>
              <p className="text-lg font-bold font-mono text-sky-400 print:text-black">
                {summary.totalSlabs.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans text-slate-400 print:text-gray-600">Road Channels</span>
              <p className="text-lg font-bold font-mono text-teal-300 print:text-black">
                {summary.totalChannels.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans text-slate-400 print:text-gray-600">Mould Cycles</span>
              <p className="text-lg font-bold font-mono text-amber-400 print:text-black">
                {summary.totalMoulds.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans text-slate-400 print:text-gray-600">Defect Rate</span>
              <p
                className={`text-lg font-bold font-mono ${
                  summary.defectRate <= settings.maxDefectRatePercent ? 'text-emerald-400' : 'text-rose-400'
                } print:text-black`}
              >
                {summary.defectRate}%
              </p>
            </div>
          </div>

          {/* Shift Summaries */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700 mb-2">
              Shift Performance Summary
            </h3>
            <table className="w-full text-xs font-mono border-collapse border border-slate-800 print:border-gray-400">
              <thead>
                <tr className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-black border-b border-slate-800 print:border-gray-400">
                  <th className="p-2 text-left font-sans">Shift Name</th>
                  <th className="p-2 text-right">Slabs</th>
                  <th className="p-2 text-right">Channels</th>
                  <th className="p-2 text-right">Moulds</th>
                  <th className="p-2 text-right">Defects</th>
                  <th className="p-2 text-right">Defect %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                {Object.values(shifts).map(s => (
                  <tr key={s.shiftName}>
                    <td className="p-2 font-sans font-medium">{s.shiftName}</td>
                    <td className="p-2 text-right">{s.slabs}</td>
                    <td className="p-2 text-right">{s.channels}</td>
                    <td className="p-2 text-right">{s.moulds}</td>
                    <td className="p-2 text-right text-rose-400 print:text-black">{s.defects}</td>
                    <td className="p-2 text-right font-bold">{s.defectRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Defect Root Causes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700 mb-2">
              Defect Root Cause Breakdown (Pareto Analysis)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {pareto.slice(0, 6).map(p => (
                <div
                  key={p.reason}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded print:border-gray-300 print:bg-white"
                >
                  <span className="text-xs font-semibold text-slate-200 print:text-black block truncate">
                    {p.reason}
                  </span>
                  <div className="flex justify-between items-center text-xs text-slate-400 print:text-gray-700 mt-1 font-mono">
                    <span>{p.count} scrap units</span>
                    <span className="font-bold text-rose-400 print:text-black">{p.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700 mb-2">
              Hourly Telemetry Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono border-collapse border border-slate-800 print:border-gray-400">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-black border-b border-slate-800 print:border-gray-400">
                    <th className="p-1.5 text-left font-sans">Hour</th>
                    <th className="p-1.5 text-right">Slabs</th>
                    <th className="p-1.5 text-right">Channels</th>
                    <th className="p-1.5 text-right">Moulds</th>
                    <th className="p-1.5 text-right">Defects</th>
                    <th className="p-1.5 text-right">Defect %</th>
                    <th className="p-1.5 text-left font-sans">Primary Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {dayLog.hourly.map(h => {
                    const total =
                      (h.slabsProduced || 0) +
                      (h.roadChannelsProduced || 0) +
                      (h.cabrosProduced || 0) +
                      (h.colouredCabrosProduced || 0) +
                      (h.wallCopingProduced || 0) +
                      (h.shallowDrainsProduced || 0) +
                      (h.roadKerbsProduced || 0) +
                      (h.culverts450Produced || 0) +
                      (h.culverts900Produced || 0);
                    const def =
                      (h.defectiveSlabs || 0) +
                      (h.defectiveChannels || 0) +
                      (h.defectiveCabros || 0) +
                      (h.defectiveColouredCabros || 0) +
                      (h.defectiveWallCoping || 0) +
                      (h.defectiveShallowDrains || 0) +
                      (h.defectiveRoadKerbs || 0) +
                      (h.defectiveCulverts450 || 0) +
                      (h.defectiveCulverts900 || 0);
                    const rate = total > 0 ? ((def / total) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={h.id}>
                        <td className="p-1.5">{formatHour(h.hour)}</td>
                        <td className="p-1.5 text-right">{h.slabsProduced}</td>
                        <td className="p-1.5 text-right">{h.roadChannelsProduced}</td>
                        <td className="p-1.5 text-right">{h.mouldsProduced}</td>
                        <td className="p-1.5 text-right text-rose-400 print:text-black">{def}</td>
                        <td className="p-1.5 text-right font-bold">{rate}%</td>
                        <td className="p-1.5 font-sans truncate max-w-[120px] text-slate-400 print:text-gray-700">
                          {h.primaryDefectReason || 'None'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff block */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-400 flex justify-between text-xs text-slate-400 print:text-gray-700">
            <div>
              <p className="font-sans font-medium text-slate-300 print:text-black">Shift Supervisor Sign-off:</p>
              <div className="w-48 h-8 border-b border-dashed border-slate-600 print:border-gray-500 mt-2" />
            </div>
            <div>
              <p className="font-sans font-medium text-slate-300 print:text-black">Quality Assurance Engineer:</p>
              <div className="w-48 h-8 border-b border-dashed border-slate-600 print:border-gray-500 mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
