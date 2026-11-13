import React, { useState, useEffect } from 'react';
import { X, Wand2, Calendar, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import { createBlankHour } from '../../utils/dataGenerator';
import { InteractiveCalendar } from '../common/InteractiveCalendar';

interface BatchDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  settings: PlantSettings;
  onSaveDay: (log: DailyLog) => void;
  currentDayLog?: DailyLog;
  allLogs?: Record<string, DailyLog>;
}

export const BatchDayModal: React.FC<BatchDayModalProps> = ({
  isOpen,
  onClose,
  dateStr: initialDateStr,
  settings,
  onSaveDay,
  currentDayLog,
  allLogs = {},
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // All 10 precast items & moulds
  const [slabs, setSlabs] = useState<number>(0);
  const [channels, setChannels] = useState<number>(0);
  const [cabros, setCabros] = useState<number>(0);
  const [colouredCabros, setColouredCabros] = useState<number>(0);
  const [wallCoping, setWallCoping] = useState<number>(0);
  const [shallowDrains, setShallowDrains] = useState<number>(0);
  const [roadKerbs, setRoadKerbs] = useState<number>(0);
  const [culverts450, setCulverts450] = useState<number>(0);
  const [culverts900, setCulverts900] = useState<number>(0);
  const [sideSlabs, setSideSlabs] = useState<number>(0);
  const [manholes, setManholes] = useState<number>(0);
  const [moulds, setMoulds] = useState<number>(0);

  const [targetDefectRate, setTargetDefectRate] = useState<number>(1.5);
  const [supervisor, setSupervisor] = useState<string>(currentDayLog?.supervisor || 'Marcus Vance');
  const [notes, setNotes] = useState<string>(currentDayLog?.shiftNotes || 'Daily batch production record created.');

  // Sync date when initialDateStr changes
  useEffect(() => {
    if (initialDateStr) {
      setSelectedDate(initialDateStr);
    }
  }, [initialDateStr]);

  // When date changes, check if existing log exists in allLogs
  useEffect(() => {
    const existing = allLogs[selectedDate] || (selectedDate === initialDateStr ? currentDayLog : null);
    if (existing && existing.hourly && existing.hourly.length > 0) {
      let s = 0, c = 0, cb = 0, ccb = 0, wc = 0, sd = 0, rk = 0, c450 = 0, c900 = 0, ss = 0, mh = 0, m = 0;
      existing.hourly.forEach(h => {
        s += h.slabsProduced || 0;
        c += h.roadChannelsProduced || 0;
        cb += h.cabrosProduced || 0;
        ccb += h.colouredCabrosProduced || 0;
        wc += h.wallCopingProduced || 0;
        sd += h.shallowDrainsProduced || 0;
        rk += h.roadKerbsProduced || 0;
        c450 += h.culverts450Produced || 0;
        c900 += h.culverts900Produced || 0;
        ss += (h as any).sideSlabsProduced || 0;
        mh += (h as any).manholesProduced || 0;
        m += h.mouldsProduced || 0;
      });
      setSlabs(s);
      setChannels(c);
      setCabros(cb);
      setColouredCabros(ccb);
      setWallCoping(wc);
      setShallowDrains(sd);
      setRoadKerbs(rk);
      setCulverts450(c450);
      setCulverts900(c900);
      setSideSlabs(ss);
      setManholes(mh);
      setMoulds(m);
      if (existing.supervisor) setSupervisor(existing.supervisor);
      if (existing.shiftNotes) setNotes(existing.shiftNotes);
    } else {
      // Default to zero clean slate
      handleZeroAll();
    }
  }, [selectedDate, allLogs, initialDateStr, currentDayLog]);

  const handleZeroAll = () => {
    setSlabs(0);
    setChannels(0);
    setCabros(0);
    setColouredCabros(0);
    setWallCoping(0);
    setShallowDrains(0);
    setRoadKerbs(0);
    setCulverts450(0);
    setCulverts900(0);
    setSideSlabs(0);
    setManholes(0);
    setMoulds(0);
  };

  const handleFillTargets = () => {
    setSlabs(settings.targetDailySlabs || 120);
    setChannels(settings.targetDailyChannels || 60);
    setCabros(settings.targetDailyCabros || 86);
    setColouredCabros(0);
    setWallCoping(settings.targetDailyWallCopings || 120);
    setShallowDrains(40);
    setRoadKerbs(50);
    setCulverts450(settings.targetDailyCulverts450 ?? 2);
    setCulverts900(settings.targetDailyCulverts900 ?? 3);
    setSideSlabs(0);
    setManholes(0);
    setMoulds(settings.targetDailyMoulds || 180);
  };

  if (!isOpen) return null;

  // Calendar metadata from allLogs
  const loggedMetadata: Record<string, { totalProduced: number; defectRate?: number; isLogged: boolean }> = {};
  Object.keys(allLogs).forEach(d => {
    const l = allLogs[d];
    loggedMetadata[d] = {
      totalProduced: l.totalProduced || l.hourly?.reduce((a, b) => a + (b.slabsProduced || 0) + (b.roadChannelsProduced || 0) + (b.cabrosProduced || 0) + (b.colouredCabrosProduced || 0) + (b.wallCopingProduced || 0) + (b.shallowDrainsProduced || 0) + (b.roadKerbsProduced || 0) + (b.culverts450Produced || 0) + (b.culverts900Produced || 0), 0) || 0,
      defectRate: l.defectRate,
      isLogged: (l.hourly && l.hourly.length > 0) || false,
    };
  });

  const totalBatchProduced =
    slabs + channels + cabros + colouredCabros + wallCoping + shallowDrains + roadKerbs + culverts450 + culverts900 + sideSlabs + manholes;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    // Standard Mon - Sat operating schedule: 07:30 to 17:00 (10 intervals: hours 7 through 16)
    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const count = hours.length;

    const hourly = hours.map((hour, idx) => {
      const isFirst = idx === 0;
      const s = Math.floor(slabs / count) + (isFirst ? slabs % count : 0);
      const c = Math.floor(channels / count) + (isFirst ? channels % count : 0);
      const cb = Math.floor(cabros / count) + (isFirst ? cabros % count : 0);
      const ccb = Math.floor(colouredCabros / count) + (isFirst ? colouredCabros % count : 0);
      const wc = Math.floor(wallCoping / count) + (isFirst ? wallCoping % count : 0);
      const sd = Math.floor(shallowDrains / count) + (isFirst ? shallowDrains % count : 0);
      const rk = Math.floor(roadKerbs / count) + (isFirst ? roadKerbs % count : 0);
      const c450 = Math.floor(culverts450 / count) + (isFirst ? culverts450 % count : 0);
      const c900 = Math.floor(culverts900 / count) + (isFirst ? culverts900 % count : 0);
      const ss = Math.floor(sideSlabs / count) + (isFirst ? sideSlabs % count : 0);
      const mh = Math.floor(manholes / count) + (isFirst ? manholes % count : 0);
      const m = Math.floor(moulds / count) + (isFirst ? moulds % count : 0);

      const totProd = s + c + cb + ccb + wc + sd + rk + c450 + c900 + ss + mh;
      const totDef = Math.round(totProd * (targetDefectRate / 100));

      // Distribute defects across items proportionately
      const defSlabs = s > 0 ? Math.min(s, Math.round(totDef * (s / (totProd || 1)))) : 0;
      const defChan = c > 0 ? Math.min(c, Math.round(totDef * (c / (totProd || 1)))) : 0;
      const defCabros = cb > 0 ? Math.min(cb, Math.round(totDef * (cb / (totProd || 1)))) : 0;
      const defColouredCabros = ccb > 0 ? Math.min(ccb, Math.round(totDef * (ccb / (totProd || 1)))) : 0;
      const defWall = wc > 0 ? Math.min(wc, Math.round(totDef * (wc / (totProd || 1)))) : 0;
      const defShallow = sd > 0 ? Math.min(sd, Math.round(totDef * (sd / (totProd || 1)))) : 0;
      const defKerbs = rk > 0 ? Math.min(rk, Math.round(totDef * (rk / (totProd || 1)))) : 0;
      const defC450 = c450 > 0 && Math.random() < 0.1 ? 1 : 0;
      const defC900 = c900 > 0 && Math.random() < 0.1 ? 1 : 0;
      const defMoulds = m > 0 ? Math.round(m * 0.01) : 0;

      const blank = createBlankHour(hour, selectedDate);
      return {
        ...blank,
        slabsProduced: s,
        roadChannelsProduced: c,
        cabrosProduced: cb,
        colouredCabrosProduced: ccb,
        wallCopingProduced: wc,
        shallowDrainsProduced: sd,
        roadKerbsProduced: rk,
        culverts450Produced: c450,
        culverts900Produced: c900,
        sideSlabsProduced: ss,
        manholesProduced: mh,
        mouldsProduced: m,
        defectiveSlabs: defSlabs,
        defectiveChannels: defChan,
        defectiveCabros: defCabros,
        defectiveColouredCabros: defColouredCabros,
        defectiveWallCoping: defWall,
        defectiveShallowDrains: defShallow,
        defectiveRoadKerbs: defKerbs,
        defectiveCulverts450: defC450,
        defectiveCulverts900: defC900,
        defectiveMoulds: defMoulds,
        defectRate: totProd > 0 ? parseFloat(((totDef / totProd) * 100).toFixed(2)) : 0,
      };
    });

    const newLog: DailyLog = {
      date: selectedDate,
      supervisor,
      line: 'Precast Operations',
      status: 'verified',
      targetSlabs: settings.targetDailySlabs,
      targetCabros: settings.targetDailyCabros,
      targetCulverts450: settings.targetDailyCulverts450,
      targetCulverts900: settings.targetDailyCulverts900,
      targetWallCopings: settings.targetDailyWallCopings,
      targetChannels: settings.targetDailyChannels,
      targetRoadKerbs: 50,
      targetShallowDrains: 40,
      targetMoulds: settings.targetDailyMoulds,
      targetMaxDefectRate: settings.maxDefectRatePercent,
      ambientTempC: 22,
      humidityPct: 58,
      hourly,
      shiftNotes: notes,
    };

    onSaveDay(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <Wand2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Batch Log Day Production
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  All Items Included
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Date: <strong className="text-sky-300">{selectedDate}</strong> · 07:30 to 17:00 Schedule (No 600mm Culvert)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {/* Date Selector & Interactive Calendar Toggle */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-200">Production Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-mono text-xs px-2.5 py-1 rounded-lg focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-300 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-lg transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{showCalendar ? 'Hide Calendar' : 'Open Visual Calendar'}</span>
                  {showCalendar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleZeroAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition cursor-pointer"
                  title="Zero all items"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zero All</span>
                </button>

                <button
                  type="button"
                  onClick={handleFillTargets}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition cursor-pointer"
                  title="Prefill default target quantities"
                >
                  Prefill Targets
                </button>
              </div>
            </div>

            {/* Embedded Calendar View */}
            {showCalendar && (
              <div className="pt-2 animate-in fade-in duration-200">
                <InteractiveCalendar
                  selectedDate={selectedDate}
                  onSelectDate={d => {
                    setSelectedDate(d);
                    setShowCalendar(false);
                  }}
                  loggedDates={loggedMetadata}
                />
              </div>
            )}
          </div>

          {/* Supervisor & Target Defect Rate Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Supervisor on Duty</label>
              <input
                type="text"
                value={supervisor}
                onChange={e => setSupervisor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Defect Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={targetDefectRate}
                onChange={e => setTargetDefectRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Total Day Output</label>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-sky-400">
                {totalBatchProduced.toLocaleString()} units
              </div>
            </div>
          </div>

          {/* ALL Precast Line Items Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Enter Total Quantities to Distribute Across 10 Operating Hours (07:30 - 17:00):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {/* 1. Road Channels */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[11px] font-bold text-teal-300 block mb-1">Road Channels</label>
                <input
                  type="number"
                  min="0"
                  value={channels}
                  onChange={e => setChannels(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 2. Paving Slabs */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-sky-400">Paving Slabs</label>
                  <span className="text-[9px] text-slate-400 font-mono">120 target</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={slabs}
                  onChange={e => setSlabs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 3. Cabros */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-emerald-400">Cabros</label>
                  <span className="text-[9px] text-slate-400 font-mono">86 sqm</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={cabros}
                  onChange={e => setCabros(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 4. Coloured Cabros */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-lime-400">Coloured Cabro</label>
                  <span className="text-[9px] text-slate-400 font-mono">sqm</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={colouredCabros}
                  onChange={e => setColouredCabros(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 4. Wall Coping */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-cyan-400">Wall Copy</label>
                  <span className="text-[9px] text-slate-400 font-mono">120 target</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={wallCoping}
                  onChange={e => setWallCoping(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 5. Shallow Drains */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[11px] font-bold text-violet-400 block mb-1">Shallow Drains</label>
                <input
                  type="number"
                  min="0"
                  value={shallowDrains}
                  onChange={e => setShallowDrains(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 6. Road Kerbs */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[11px] font-bold text-indigo-400 block mb-1">Road Kerbs</label>
                <input
                  type="number"
                  min="0"
                  value={roadKerbs}
                  onChange={e => setRoadKerbs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 7. 450mm Culvert */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-amber-400">450mm Culvert</label>
                  <span className="text-[9px] text-slate-400 font-mono">2 target</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={culverts450}
                  onChange={e => setCulverts450(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 8. 900mm Culvert */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-orange-400">900mm Culvert</label>
                  <span className="text-[9px] text-slate-400 font-mono">3 target</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={culverts900}
                  onChange={e => setCulverts900(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 9. Side Slabs */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[11px] font-bold text-rose-300 block mb-1">Side Slabs</label>
                <input
                  type="number"
                  min="0"
                  value={sideSlabs}
                  onChange={e => setSideSlabs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>

              {/* 10. Mould Cycles */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[11px] font-bold text-yellow-400 block mb-1">Mould Cycles</label>
                <input
                  type="number"
                  min="0"
                  value={moulds}
                  onChange={e => setMoulds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Daily Log Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Generate & Save Batch Day ({selectedDate})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
