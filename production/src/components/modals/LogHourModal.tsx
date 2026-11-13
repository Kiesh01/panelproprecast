import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { DefectReason, HourlyRecord, PlantSettings } from '../../types/production';
import { createBlankHour, formatHour, getShiftForHour } from '../../utils/dataGenerator';

interface LogHourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: HourlyRecord) => void;
  initialRecord?: HourlyRecord | null;
  targetHour?: number;
  dateStr: string;
  settings: PlantSettings;
}

const DEFECT_REASONS: DefectReason[] = [
  'None',
  'Edge Chipping',
  'Micro-cracking',
  'Dimensional Drift',
  'Slump & Curing Void',
  'Mould Misalignment',
  'Surface Bleed',
  'Aggregate Segregation',
];

export const LogHourModal: React.FC<LogHourModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  targetHour = 8,
  dateStr,
  settings,
}) => {
  const [record, setRecord] = useState<HourlyRecord>(() => {
    return initialRecord || createBlankHour(targetHour, dateStr);
  });

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    } else {
      setRecord(createBlankHour(targetHour, dateStr));
    }
  }, [initialRecord, targetHour, dateStr]);

  if (!isOpen) return null;

  const totalProduced =
    (record.slabsProduced || 0) +
    (record.roadChannelsProduced || 0) +
    (record.cabrosProduced || 0) +
    (record.colouredCabrosProduced || 0) +
    (record.wallCopingProduced || 0) +
    (record.shallowDrainsProduced || 0) +
    (record.roadKerbsProduced || 0) +
    (record.culverts450Produced || 0) +
    (record.culverts900Produced || 0);

  const totalDefects =
    (record.defectiveSlabs || 0) +
    (record.defectiveChannels || 0) +
    (record.defectiveCabros || 0) +
    (record.defectiveColouredCabros || 0) +
    (record.defectiveWallCoping || 0) +
    (record.defectiveShallowDrains || 0) +
    (record.defectiveRoadKerbs || 0) +
    (record.defectiveCulverts450 || 0) +
    (record.defectiveCulverts900 || 0);

  const defectRate = totalProduced > 0 ? ((totalDefects / totalProduced) * 100).toFixed(2) : '0.00';

  const handleHourChange = (newHour: number) => {
    setRecord(prev => ({
      ...prev,
      hour: newHour,
      shift: getShiftForHour(newHour),
      timeSlotLabel: formatHour(newHour),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...record,
      defectRate: parseFloat(defectRate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              {initialRecord ? 'Edit Hourly Production Record' : 'Log Hourly Production'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                All 9 Precast Items Included
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Production Date: {dateStr} · {getShiftForHour(record.hour)} · (No 600mm Culvert)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Hour Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Production Interval (Mon - Sat: 07:30 AM – 5:00 PM)
              </label>
              <span className="text-[11px] text-sky-400 font-mono">
                {formatHour(record.hour)}
              </span>
            </div>
            <select
              value={record.hour}
              onChange={e => handleHourChange(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-hidden focus:border-sky-500"
            >
              <optgroup label="Standard Operating Hours (Mon - Sat: 07:30 AM - 5:00 PM)">
                <option value={7}>07:30 - 08:30 (Morning Startup & Pacing)</option>
                <option value={8}>08:30 - 09:30 (Morning Run)</option>
                <option value={9}>09:30 - 10:30 (Morning Run)</option>
                <option value={10}>10:30 - 11:30 (Morning Run)</option>
                <option value={11}>11:30 - 12:30 (Midday Pre-Break)</option>
                <option value={12}>12:30 - 13:30 (Midday Maintenance & Lunch)</option>
                <option value={13}>13:30 - 14:30 (Afternoon Run)</option>
                <option value={14}>14:30 - 15:30 (Afternoon Run)</option>
                <option value={15}>15:30 - 16:30 (Afternoon Run)</option>
                <option value={16}>16:30 - 17:00 (Final Half-Hour Run & Washdown)</option>
              </optgroup>
              <optgroup label="Early Pre-Cast / Overtime Slots">
                <option value={6}>06:00 - 07:30 (Early Pre-Cast Batching)</option>
                <option value={17}>17:00 - 18:00 (Evening Extended Run)</option>
                <option value={18}>18:00 - 19:00 (Evening Extended Run)</option>
              </optgroup>
            </select>
          </div>

          {/* Daily Products Production Inputs - 4 Column Responsive Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Manufactured Concrete Products (Produced & Defective)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Everything defaults cleanly to 0</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. Paving Slabs */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400">Paving Slabs</span>
                  <span className="text-[10px] font-mono text-slate-400">Target 120 pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.slabsProduced}
                      onChange={e => setRecord({ ...record, slabsProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveSlabs}
                      onChange={e => setRecord({ ...record, defectiveSlabs: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Road Channels */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-teal-300">Channels</span>
                  <span className="text-[10px] font-mono text-slate-400">Road Channels</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.roadChannelsProduced}
                      onChange={e => setRecord({ ...record, roadChannelsProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveChannels}
                      onChange={e => setRecord({ ...record, defectiveChannels: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Cabros */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400">Cabros</span>
                  <span className="text-[10px] font-mono text-slate-400">Target 86 sqm</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (sqm)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.cabrosProduced || 0}
                      onChange={e => setRecord({ ...record, cabrosProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective (sqm)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveCabros || 0}
                      onChange={e => setRecord({ ...record, defectiveCabros: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Coloured Cabros */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-lime-400">Coloured Cabro</span>
                  <span className="text-[10px] font-mono text-slate-400">sqm</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (sqm)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.colouredCabrosProduced || 0}
                      onChange={e => setRecord({ ...record, colouredCabrosProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective (sqm)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveColouredCabros || 0}
                      onChange={e => setRecord({ ...record, defectiveColouredCabros: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Wall Coping */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-400">Wall Copy</span>
                  <span className="text-[10px] font-mono text-slate-400">Target 120 pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.wallCopingProduced || 0}
                      onChange={e => setRecord({ ...record, wallCopingProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveWallCoping || 0}
                      onChange={e => setRecord({ ...record, defectiveWallCoping: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Shallow Drains */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-violet-400">Shallow Drains</span>
                  <span className="text-[10px] font-mono text-slate-400">pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.shallowDrainsProduced || 0}
                      onChange={e => setRecord({ ...record, shallowDrainsProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveShallowDrains || 0}
                      onChange={e => setRecord({ ...record, defectiveShallowDrains: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Road Kerbs */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-400">Road Kerbs</span>
                  <span className="text-[10px] font-mono text-slate-400">pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.roadKerbsProduced || 0}
                      onChange={e => setRecord({ ...record, roadKerbsProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveRoadKerbs || 0}
                      onChange={e => setRecord({ ...record, defectiveRoadKerbs: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 7. 450mm Culverts */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-400">450mm Culvert</span>
                  <span className="text-[10px] font-mono text-slate-400">Target 2 pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.culverts450Produced || 0}
                      onChange={e => setRecord({ ...record, culverts450Produced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveCulverts450 || 0}
                      onChange={e => setRecord({ ...record, defectiveCulverts450: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* 8. 900mm Culverts */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-orange-400">900mm Culvert</span>
                  <span className="text-[10px] font-mono text-slate-400">Target 3 pcs</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Produced (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={record.culverts900Produced || 0}
                      onChange={e => setRecord({ ...record, culverts900Produced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block">Defective</label>
                    <input
                      type="number"
                      min="0"
                      value={record.defectiveCulverts900 || 0}
                      onChange={e => setRecord({ ...record, defectiveCulverts900: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mould Cycles & Defect Root Cause Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">Moulds & Cycles</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Cycles Run</label>
                  <input
                    type="number"
                    min="0"
                    value={record.mouldsProduced}
                    onChange={e => setRecord({ ...record, mouldsProduced: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-400 block">Damaged</label>
                  <input
                    type="number"
                    min="0"
                    value={record.defectiveMoulds}
                    onChange={e => setRecord({ ...record, defectiveMoulds: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Defect Root Cause
              </label>
              <select
                value={record.primaryDefectReason}
                onChange={e => setRecord({ ...record, primaryDefectReason: e.target.value as DefectReason })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
              >
                {DEFECT_REASONS.map(reason => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Line Downtime (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={record.machineDowntimeMinutes || 0}
                onChange={e => setRecord({ ...record, machineDowntimeMinutes: Math.min(60, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Operator Observations / Shift Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Vibrator frequency set to 50Hz, curing moisture verified"
              value={record.notes || ''}
              onChange={e => setRecord({ ...record, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Real-time Calculated KPI Strip */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">Total Output</span>
              <span className="font-bold text-slate-100">{totalProduced} units</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">Defects</span>
              <span className="font-bold text-rose-400">{totalDefects} units</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">Defect Rate</span>
              <span
                className={`font-bold ${
                  parseFloat(defectRate) <= settings.maxDefectRatePercent ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {defectRate}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
