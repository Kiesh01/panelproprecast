import React, { useState } from 'react';
import { X, Check, RotateCcw, Download } from 'lucide-react';
import { PlantSettings } from '../../types/production';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlantSettings;
  onSaveSettings: (settings: PlantSettings) => void;
  onResetData: () => void;
  onExportCSV: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  onExportCSV,
}) => {
  const [form, setForm] = useState<PlantSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Production Benchmarks & Configuration</h2>
            <p className="text-xs text-slate-400">Configure plant throughput targets and defect thresholds</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Plant Name & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Plant / Production Facility</label>
              <input
                type="text"
                value={form.plantName}
                onChange={e => setForm({ ...form, plantName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Operating Schedule</label>
              <input
                type="text"
                value={form.operatingSchedule || 'Mon - Sat: 07:30 AM - 5:00 PM'}
                onChange={e => setForm({ ...form, operatingSchedule: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Hourly Targets */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-200 block mb-2">Plant Daily Benchmark Targets</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-sky-400 block mb-1">Slabs (Pieces)</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetDailySlabs || 120}
                  onChange={e => {
                    const d = parseInt(e.target.value, 10) || 0;
                    setForm({ ...form, targetDailySlabs: d, targetHourlySlabs: Math.round(d / 10) });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-teal-300 block mb-1">Cabros (sqm)</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetDailyCabros || 86}
                  onChange={e => setForm({ ...form, targetDailyCabros: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-400 block mb-1">450mm Culvert</label>
                <input
                  type="number"
                  min="0"
                  value={form.targetDailyCulverts450 ?? 2}
                  onChange={e => setForm({ ...form, targetDailyCulverts450: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-orange-400 block mb-1">900mm Culvert</label>
                <input
                  type="number"
                  min="0"
                  value={form.targetDailyCulverts900 ?? 3}
                  onChange={e => setForm({ ...form, targetDailyCulverts900: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-cyan-400 block mb-1">Wall Coping (Pcs)</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetDailyWallCopings || 120}
                  onChange={e => setForm({ ...form, targetDailyWallCopings: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-200 block mb-2">Hourly Shift Pacing Targets (Units / Hour)</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-sky-400 block mb-1">Slabs / Hour</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetHourlySlabs || 12}
                  onChange={e => setForm({ ...form, targetHourlySlabs: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-teal-400 block mb-1">Channels / Hour</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetHourlyChannels || 6}
                  onChange={e => setForm({ ...form, targetHourlyChannels: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-400 block mb-1">Moulds / Hour</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetHourlyMoulds || 14}
                  onChange={e => setForm({ ...form, targetHourlyMoulds: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Defect Thresholds */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-200 block mb-2">Quality Compliance Thresholds</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-emerald-400 block mb-1">Target Max Defect %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={form.maxDefectRatePercent}
                  onChange={e => setForm({ ...form, maxDefectRatePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-rose-400 block mb-1">Warning Trigger Defect %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="20"
                  value={form.warningDefectRatePercent}
                  onChange={e => setForm({ ...form, warningDefectRatePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Scrap Valuation */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-200 block mb-2">Scrap Cost Basis ($ per rejected piece)</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Slab Scrap Cost</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.costPerDefectiveSlab}
                  onChange={e => setForm({ ...form, costPerDefectiveSlab: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Channel Scrap Cost</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.costPerDefectiveChannel}
                  onChange={e => setForm({ ...form, costPerDefectiveChannel: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mould Refurb Cost</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.costPerDefectiveMould}
                  onChange={e => setForm({ ...form, costPerDefectiveMould: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Data Actions (CSV Export, Sample Data Reset) */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export All Historical CSV
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Sample Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-400">Confirm wipe?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2 py-1 text-xs bg-rose-600 text-white rounded font-medium"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
