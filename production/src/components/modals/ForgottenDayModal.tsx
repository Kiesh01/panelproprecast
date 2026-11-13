import React, { useState, useEffect } from 'react';
import { X, Calendar, Save, Clock, CheckCircle2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { DefectReason, PlantSettings, DailyLog } from '../../types/production';
import { formatHour, getShiftForHour } from '../../utils/dataGenerator';
import { InteractiveCalendar } from '../common/InteractiveCalendar';

interface ForgottenDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  onDateChange: (newDate: string) => void;
  onSaveDay: (dayData: {
    date: string;
    slabsProduced: number;
    defectiveSlabs: number;
    roadChannelsProduced: number;
    defectiveChannels: number;
    cabrosProduced: number;
    defectiveCabros: number;
    colouredCabrosProduced: number;
    defectiveColouredCabros: number;
    wallCopingProduced: number;
    defectiveWallCoping: number;
    shallowDrainsProduced: number;
    defectiveShallowDrains: number;
    roadKerbsProduced: number;
    defectiveRoadKerbs: number;
    culverts450Produced: number;
    defectiveCulverts450: number;
    culverts900Produced: number;
    defectiveCulverts900: number;
    sideSlabsProduced?: number;
    defectiveSideSlabs?: number;
    mouldsProduced: number;
    defectiveMoulds: number;
    primaryDefectReason: DefectReason;
    supervisor: string;
    notes: string;
    hourly?: any[];
  }) => Promise<void>;
  existingDoc?: any;
  settings: PlantSettings;
  allLogs?: Record<string, DailyLog>;
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

export const ForgottenDayModal: React.FC<ForgottenDayModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  onDateChange,
  onSaveDay,
  existingDoc,
  allLogs = {},
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(targetDate || new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState<boolean>(true);
  const [entryMode, setEntryMode] = useState<'quick' | 'hourly'>('quick');

  // All variables strictly initialized to zero
  const [slabsProduced, setSlabsProduced] = useState<number>(0);
  const [defectiveSlabs, setDefectiveSlabs] = useState<number>(0);

  const [roadChannelsProduced, setRoadChannelsProduced] = useState<number>(0);
  const [defectiveChannels, setDefectiveChannels] = useState<number>(0);

  const [cabrosProduced, setCabrosProduced] = useState<number>(0);
  const [defectiveCabros, setDefectiveCabros] = useState<number>(0);

  const [colouredCabrosProduced, setColouredCabrosProduced] = useState<number>(0);
  const [defectiveColouredCabros, setDefectiveColouredCabros] = useState<number>(0);

  const [wallCopingProduced, setWallCopingProduced] = useState<number>(0);
  const [defectiveWallCoping, setDefectiveWallCoping] = useState<number>(0);

  const [shallowDrainsProduced, setShallowDrainsProduced] = useState<number>(0);
  const [defectiveShallowDrains, setDefectiveShallowDrains] = useState<number>(0);

  const [roadKerbsProduced, setRoadKerbsProduced] = useState<number>(0);
  const [defectiveRoadKerbs, setDefectiveRoadKerbs] = useState<number>(0);

  const [culverts450Produced, setCulverts450Produced] = useState<number>(0);
  const [defectiveCulverts450, setDefectiveCulverts450] = useState<number>(0);

  const [culverts900Produced, setCulverts900Produced] = useState<number>(0);
  const [defectiveCulverts900, setDefectiveCulverts900] = useState<number>(0);

  const [mouldsProduced, setMouldsProduced] = useState<number>(0);
  const [defectiveMoulds, setDefectiveMoulds] = useState<number>(0);

  const [primaryDefectReason, setPrimaryDefectReason] = useState<DefectReason>('None');
  const [supervisor, setSupervisor] = useState<string>('Plant Shift Lead');
  const [notes, setNotes] = useState<string>('Backfilled forgotten day production');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const shiftHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const [hourlyRows, setHourlyRows] = useState<Record<number, any>>(() => {
    const map: any = {};
    shiftHours.forEach(h => {
      map[h] = {
        slabs: 0, defSlabs: 0,
        channels: 0, defChannels: 0,
        cabros: 0, defCabros: 0,
        colouredCabros: 0, defColouredCabros: 0,
        wallCoping: 0, defWallCoping: 0,
        shallowDrains: 0, defShallowDrains: 0,
        roadKerbs: 0, defRoadKerbs: 0,
        culverts450: 0, defCulverts450: 0,
        culverts900: 0, defCulverts900: 0,
        moulds: 0, defMoulds: 0,
        reason: 'None',
      };
    });
    return map;
  });

  useEffect(() => {
    setSelectedDate(targetDate);
  }, [targetDate]);

  useEffect(() => {
    if (existingDoc && existingDoc.hourly && existingDoc.hourly.length > 0) {
      let s = 0, ds = 0;
      let c = 0, dc = 0;
      let cb = 0, dcb = 0;
      let ccb = 0, dccb = 0;
      let wc = 0, dwc = 0;
      let sd = 0, dsd = 0;
      let rk = 0, drk = 0;
      let c450 = 0, dc450 = 0;
      let c900 = 0, dc900 = 0;
      let m = 0, dm = 0;

      const newHourly: any = {};
      shiftHours.forEach(h => {
        newHourly[h] = {
          slabs: 0, defSlabs: 0,
          channels: 0, defChannels: 0,
          cabros: 0, defCabros: 0,
          colouredCabros: 0, defColouredCabros: 0,
          wallCoping: 0, defWallCoping: 0,
          shallowDrains: 0, defShallowDrains: 0,
          roadKerbs: 0, defRoadKerbs: 0,
          culverts450: 0, defCulverts450: 0,
          culverts900: 0, defCulverts900: 0,
          moulds: 0, defMoulds: 0,
          reason: 'None',
        };
      });

      existingDoc.hourly.forEach((h: any) => {
        s += h.slabsProduced || 0;
        ds += h.defectiveSlabs || 0;
        c += h.roadChannelsProduced || 0;
        dc += h.defectiveChannels || 0;
        cb += h.cabrosProduced || 0;
        dcb += h.defectiveCabros || 0;
        ccb += h.colouredCabrosProduced || 0;
        dccb += h.defectiveColouredCabros || 0;
        wc += h.wallCopingProduced || 0;
        dwc += h.defectiveWallCoping || 0;
        sd += h.shallowDrainsProduced || 0;
        dsd += h.defectiveShallowDrains || 0;
        rk += h.roadKerbsProduced || 0;
        drk += h.defectiveRoadKerbs || 0;
        c450 += h.culverts450Produced || 0;
        dc450 += h.defectiveCulverts450 || 0;
        c900 += h.culverts900Produced || 0;
        dc900 += h.defectiveCulverts900 || 0;
        m += h.mouldsProduced || 0;
        dm += h.defectiveMoulds || 0;

        if (newHourly[h.hour]) {
          newHourly[h.hour] = {
            slabs: h.slabsProduced || 0,
            defSlabs: h.defectiveSlabs || 0,
            channels: h.roadChannelsProduced || 0,
            defChannels: h.defectiveChannels || 0,
            cabros: h.cabrosProduced || 0,
            defCabros: h.defectiveCabros || 0,
            colouredCabros: h.colouredCabrosProduced || 0,
            defColouredCabros: h.defectiveColouredCabros || 0,
            wallCoping: h.wallCopingProduced || 0,
            defWallCoping: h.defectiveWallCoping || 0,
            shallowDrains: h.shallowDrainsProduced || 0,
            defShallowDrains: h.defectiveShallowDrains || 0,
            roadKerbs: h.roadKerbsProduced || 0,
            defRoadKerbs: h.defectiveRoadKerbs || 0,
            culverts450: h.culverts450Produced || 0,
            defCulverts450: h.defectiveCulverts450 || 0,
            culverts900: h.culverts900Produced || 0,
            defCulverts900: h.defectiveCulverts900 || 0,
            moulds: h.mouldsProduced || 0,
            defMoulds: h.defectiveMoulds || 0,
            reason: h.primaryDefectReason || 'None',
          };
        }
      });

      setSlabsProduced(s);
      setDefectiveSlabs(ds);
      setRoadChannelsProduced(c);
      setDefectiveChannels(dc);
      setCabrosProduced(cb);
      setDefectiveCabros(dcb);
      setColouredCabrosProduced(ccb);
      setDefectiveColouredCabros(dccb);
      setWallCopingProduced(wc);
      setDefectiveWallCoping(dwc);
      setShallowDrainsProduced(sd);
      setDefectiveShallowDrains(dsd);
      setRoadKerbsProduced(rk);
      setDefectiveRoadKerbs(drk);
      setCulverts450Produced(c450);
      setDefectiveCulverts450(dc450);
      setCulverts900Produced(c900);
      setDefectiveCulverts900(dc900);
      setMouldsProduced(m);
      setDefectiveMoulds(dm);

      setHourlyRows(newHourly);
      if (existingDoc.shiftNotes) setNotes(existingDoc.shiftNotes);
      if (existingDoc.supervisor) setSupervisor(existingDoc.supervisor);
    } else {
      handleZeroAll();
    }
  }, [selectedDate, existingDoc]);

  const handleZeroAll = () => {
    setSlabsProduced(0);
    setDefectiveSlabs(0);
    setRoadChannelsProduced(0);
    setDefectiveChannels(0);
    setCabrosProduced(0);
    setDefectiveCabros(0);
    setColouredCabrosProduced(0);
    setDefectiveColouredCabros(0);
    setWallCopingProduced(0);
    setDefectiveWallCoping(0);
    setShallowDrainsProduced(0);
    setDefectiveShallowDrains(0);
    setRoadKerbsProduced(0);
    setDefectiveRoadKerbs(0);
    setCulverts450Produced(0);
    setDefectiveCulverts450(0);
    setCulverts900Produced(0);
    setDefectiveCulverts900(0);
    setMouldsProduced(0);
    setDefectiveMoulds(0);
    setPrimaryDefectReason('None');
    setNotes('Backfilled forgotten day production');

    const resetMap: any = {};
    shiftHours.forEach(h => {
      resetMap[h] = {
        slabs: 0, defSlabs: 0,
        channels: 0, defChannels: 0,
        cabros: 0, defCabros: 0,
        colouredCabros: 0, defColouredCabros: 0,
        wallCoping: 0, defWallCoping: 0,
        shallowDrains: 0, defShallowDrains: 0,
        roadKerbs: 0, defRoadKerbs: 0,
        culverts450: 0, defCulverts450: 0,
        culverts900: 0, defCulverts900: 0,
        moulds: 0, defMoulds: 0,
        reason: 'None',
      };
    });
    setHourlyRows(resetMap);
  };

  if (!isOpen) return null;

  const totalProduced =
    slabsProduced +
    roadChannelsProduced +
    cabrosProduced +
    colouredCabrosProduced +
    wallCopingProduced +
    shallowDrainsProduced +
    roadKerbsProduced +
    culverts450Produced +
    culverts900Produced;

  const totalDefects =
    defectiveSlabs +
    defectiveChannels +
    defectiveCabros +
    defectiveColouredCabros +
    defectiveWallCoping +
    defectiveShallowDrains +
    defectiveRoadKerbs +
    defectiveCulverts450 +
    defectiveCulverts900;

  const defectRate = totalProduced > 0 ? ((totalDefects / totalProduced) * 100).toFixed(2) : '0.00';

  const handleDatePicked = (d: string) => {
    setSelectedDate(d);
    onDateChange(d);
  };

  const handleHourlyChange = (h: number, field: string, val: any) => {
    setHourlyRows(prev => {
      const next = { ...prev };
      next[h] = { ...next[h], [field]: val };

      // Recompute totals across rows
      let s = 0, ds = 0;
      let c = 0, dc = 0;
      let cb = 0, dcb = 0;
      let ccb = 0, dccb = 0;
      let wc = 0, dwc = 0;
      let sd = 0, dsd = 0;
      let rk = 0, drk = 0;
      let c450 = 0, dc450 = 0;
      let c900 = 0, dc900 = 0;
      let m = 0, dm = 0;

      Object.values(next).forEach((row: any) => {
        s += row.slabs || 0;
        ds += row.defSlabs || 0;
        c += row.channels || 0;
        dc += row.defChannels || 0;
        cb += row.cabros || 0;
        dcb += row.defCabros || 0;
        ccb += row.colouredCabros || 0;
        dccb += row.defColouredCabros || 0;
        wc += row.wallCoping || 0;
        dwc += row.defWallCoping || 0;
        sd += row.shallowDrains || 0;
        dsd += row.defShallowDrains || 0;
        rk += row.roadKerbs || 0;
        drk += row.defRoadKerbs || 0;
        c450 += row.culverts450 || 0;
        dc450 += row.defCulverts450 || 0;
        c900 += row.culverts900 || 0;
        dc900 += row.defCulverts900 || 0;
        m += row.moulds || 0;
        dm += row.defMoulds || 0;
      });

      setSlabsProduced(s);
      setDefectiveSlabs(ds);
      setRoadChannelsProduced(c);
      setDefectiveChannels(dc);
      setCabrosProduced(cb);
      setDefectiveCabros(dcb);
      setColouredCabrosProduced(ccb);
      setDefectiveColouredCabros(dccb);
      setWallCopingProduced(wc);
      setDefectiveWallCoping(dwc);
      setShallowDrainsProduced(sd);
      setDefectiveShallowDrains(dsd);
      setRoadKerbsProduced(rk);
      setDefectiveRoadKerbs(drk);
      setCulverts450Produced(c450);
      setDefectiveCulverts450(dc450);
      setCulverts900Produced(c900);
      setDefectiveCulverts900(dc900);
      setMouldsProduced(m);
      setDefectiveMoulds(dm);

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      let hourlyPayload: any[] | undefined = undefined;

      if (entryMode === 'hourly') {
        hourlyPayload = shiftHours.map(h => {
          const r = hourlyRows[h];
          const prod =
            (r.slabs || 0) +
            (r.channels || 0) +
            (r.cabros || 0) +
            (r.colouredCabros || 0) +
            (r.wallCoping || 0) +
            (r.shallowDrains || 0) +
            (r.roadKerbs || 0) +
            (r.culverts450 || 0) +
            (r.culverts900 || 0);

          const def =
            (r.defSlabs || 0) +
            (r.defChannels || 0) +
            (r.defCabros || 0) +
            (r.defColouredCabros || 0) +
            (r.defWallCoping || 0) +
            (r.defShallowDrains || 0) +
            (r.defRoadKerbs || 0) +
            (r.defCulverts450 || 0) +
            (r.defCulverts900 || 0);

          const rate = prod > 0 ? parseFloat(((def / prod) * 100).toFixed(2)) : 0;
          return {
            hour: h,
            shift: getShiftForHour(h),
            timeSlotLabel: formatHour(h),
            slabsProduced: r.slabs || 0,
            defectiveSlabs: r.defSlabs || 0,
            roadChannelsProduced: r.channels || 0,
            defectiveChannels: r.defChannels || 0,
            cabrosProduced: r.cabros || 0,
            defectiveCabros: r.defCabros || 0,
            colouredCabrosProduced: r.colouredCabros || 0,
            defectiveColouredCabros: r.defColouredCabros || 0,
            wallCopingProduced: r.wallCoping || 0,
            defectiveWallCoping: r.defWallCoping || 0,
            shallowDrainsProduced: r.shallowDrains || 0,
            defectiveShallowDrains: r.defShallowDrains || 0,
            roadKerbsProduced: r.roadKerbs || 0,
            defectiveRoadKerbs: r.defRoadKerbs || 0,
            culverts450Produced: r.culverts450 || 0,
            defectiveCulverts450: r.defCulverts450 || 0,
            culverts900Produced: r.culverts900 || 0,
            defectiveCulverts900: r.defCulverts900 || 0,
            mouldsProduced: r.moulds || 0,
            defectiveMoulds: r.defMoulds || 0,
            defectRate: rate,
            primaryDefectReason: r.reason || 'None',
            machineDowntimeMinutes: 0,
            notes: '',
          };
        });
      }

      await onSaveDay({
        date: selectedDate,
        slabsProduced,
        defectiveSlabs,
        roadChannelsProduced,
        defectiveChannels,
        cabrosProduced,
        defectiveCabros,
        colouredCabrosProduced,
        defectiveColouredCabros,
        wallCopingProduced,
        defectiveWallCoping,
        shallowDrainsProduced,
        defectiveShallowDrains,
        roadKerbsProduced,
        defectiveRoadKerbs,
        culverts450Produced,
        defectiveCulverts450,
        culverts900Produced,
        defectiveCulverts900,
        mouldsProduced,
        defectiveMoulds,
        primaryDefectReason,
        supervisor,
        notes,
        hourly: hourlyPayload,
      });

      setSuccessMsg(`Production for ${selectedDate} saved successfully!`);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch {
      setIsSaving(false);
    }
  };

  const setRelativeDay = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const iso = d.toISOString().split('T')[0];
    handleDatePicked(iso);
  };

  // Calendar metadata from allLogs
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Log Forgotten Day Production
                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                  All Precast Items
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive month calendar picker: green indicates logged days, amber indicates missing workdays.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Strip & Calendar */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Selected Forgotten Production Date:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => handleDatePicked(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white font-mono text-sm px-3 py-1.5 rounded-lg focus:outline-hidden focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Quick Date Presets & Calendar Toggle */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-300 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-md transition cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
                  {showCalendar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDay(0)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDay(-1)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium cursor-pointer"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDay(-2)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition font-medium cursor-pointer"
                >
                  2 Days Ago
                </button>
                <button
                  type="button"
                  onClick={handleZeroAll}
                  title="Zero all variables"
                  className="px-2.5 py-1 text-xs bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-md transition font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zero All</span>
                </button>
              </div>
            </div>

            {/* Visual Calendar View */}
            {showCalendar && (
              <div className="pt-2 animate-in fade-in duration-200">
                <InteractiveCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleDatePicked}
                  loggedDates={loggedMetadata}
                />
              </div>
            )}
          </div>

          {/* Mode Switch: Quick Day Totals vs Hour-by-Hour */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setEntryMode('quick')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                entryMode === 'quick'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Day Totals (Summary Entry)
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('hourly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                entryMode === 'hourly'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hour-by-Hour Ledger (07:30 to 17:00)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {entryMode === 'quick' ? (
              <div className="space-y-4">
                {/* 9 Product Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Channels */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-teal-300 block">Road Channels</span>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={roadChannelsProduced}
                        onChange={e => setRoadChannelsProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveChannels}
                        onChange={e => setDefectiveChannels(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Slabs */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Paving Slabs</span>
                      <span className="text-[10px] text-slate-400 font-mono">120 pcs</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={slabsProduced}
                        onChange={e => setSlabsProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveSlabs}
                        onChange={e => setDefectiveSlabs(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Cabros */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">Cabros</span>
                      <span className="text-[10px] text-slate-400 font-mono">86 sqm</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced (sqm)</label>
                      <input
                        type="number"
                        min="0"
                        value={cabrosProduced}
                        onChange={e => setCabrosProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective (sqm)</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveCabros}
                        onChange={e => setDefectiveCabros(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Coloured Cabros */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-lime-400">Coloured Cabros</span>
                      <span className="text-[10px] text-slate-400 font-mono">sqm</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced (sqm)</label>
                      <input
                        type="number"
                        min="0"
                        value={colouredCabrosProduced}
                        onChange={e => setColouredCabrosProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective (sqm)</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveColouredCabros}
                        onChange={e => setDefectiveColouredCabros(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Wall Coping */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">Wall Copy</span>
                      <span className="text-[10px] text-slate-400 font-mono">120 pcs</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={wallCopingProduced}
                        onChange={e => setWallCopingProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveWallCoping}
                        onChange={e => setDefectiveWallCoping(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Shallow Drains */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-violet-400 block">Shallow Drains</span>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={shallowDrainsProduced}
                        onChange={e => setShallowDrainsProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveShallowDrains}
                        onChange={e => setDefectiveShallowDrains(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Road Kerbs */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-indigo-400 block">Road Kerbs</span>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={roadKerbsProduced}
                        onChange={e => setRoadKerbsProduced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveRoadKerbs}
                        onChange={e => setDefectiveRoadKerbs(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* 450mm Culverts */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">450mm Culvert</span>
                      <span className="text-[10px] font-mono text-slate-400">2 pcs</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={culverts450Produced}
                        onChange={e => setCulverts450Produced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveCulverts450}
                        onChange={e => setDefectiveCulverts450(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* 900mm Culverts */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">900mm Culvert</span>
                      <span className="text-[10px] font-mono text-slate-400">3 pcs</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Total Produced</label>
                      <input
                        type="number"
                        min="0"
                        value={culverts900Produced}
                        onChange={e => setCulverts900Produced(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-400 block">Defective</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveCulverts900}
                        onChange={e => setDefectiveCulverts900(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Moulds */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 block">Moulds Run</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Cycles</label>
                        <input
                          type="number"
                          min="0"
                          value={mouldsProduced}
                          onChange={e => setMouldsProduced(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-rose-400 block">Damaged</label>
                        <input
                          type="number"
                          min="0"
                          value={defectiveMoulds}
                          onChange={e => setDefectiveMoulds(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-rose-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      Primary Defect Root Cause
                    </label>
                    <select
                      value={primaryDefectReason}
                      onChange={e => setPrimaryDefectReason(e.target.value as DefectReason)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      {DEFECT_REASONS.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      Supervisor / Shift Lead
                    </label>
                    <input
                      type="text"
                      value={supervisor}
                      onChange={e => setSupervisor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Forgotten Day Shift Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Backfilled from clipboard shift logs"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto overflow-x-auto pr-1">
                <div className="min-w-[760px] space-y-2">
                <div className="grid grid-cols-11 gap-1.5 text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-950 rounded border border-slate-800">
                  <span>Slot</span>
                  <span className="text-right text-teal-300">Channels</span>
                  <span className="text-right text-sky-400">Slabs</span>
                  <span className="text-right text-emerald-400">Cabros</span>
                  <span className="text-right text-lime-400">Col.Cabro</span>
                  <span className="text-right text-cyan-400">WallCopy</span>
                  <span className="text-right text-violet-400">Shallow</span>
                  <span className="text-right text-indigo-400">Kerbs</span>
                  <span className="text-right text-amber-400">450mm</span>
                  <span className="text-right text-orange-400">900mm</span>
                  <span className="text-right text-rose-400">Defects</span>
                </div>

                {shiftHours.map(h => (
                  <div key={h} className="grid grid-cols-11 gap-1.5 items-center text-xs p-1 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                    <span className="font-mono text-[10px] text-slate-300 truncate">
                      {formatHour(h).split(' - ')[0]}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.channels || 0}
                      onChange={e => handleHourlyChange(h, 'channels', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.slabs || 0}
                      onChange={e => handleHourlyChange(h, 'slabs', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.cabros || 0}
                      onChange={e => handleHourlyChange(h, 'cabros', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.colouredCabros || 0}
                      onChange={e => handleHourlyChange(h, 'colouredCabros', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-lime-200 text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.wallCoping || 0}
                      onChange={e => handleHourlyChange(h, 'wallCoping', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.shallowDrains || 0}
                      onChange={e => handleHourlyChange(h, 'shallowDrains', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.roadKerbs || 0}
                      onChange={e => handleHourlyChange(h, 'roadKerbs', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.culverts450 || 0}
                      onChange={e => handleHourlyChange(h, 'culverts450', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.culverts900 || 0}
                      onChange={e => handleHourlyChange(h, 'culverts900', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-white text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={hourlyRows[h]?.defSlabs || 0}
                      onChange={e => handleHourlyChange(h, 'defSlabs', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 text-right p-1 rounded font-mono text-rose-300 text-xs"
                    />
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Calculated summary ribbon */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="text-slate-400">Total Output:</span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sky-400 font-bold">{slabsProduced} Slabs</span>
                <span className="text-teal-300 font-bold">{roadChannelsProduced} Channels</span>
                <span className="text-emerald-400 font-bold">{cabrosProduced} Cabros</span>
                <span className="text-lime-400 font-bold">{colouredCabrosProduced} Col.Cabros</span>
                <span className="text-cyan-400 font-bold">{wallCopingProduced} WallCopy</span>
                <span className="text-amber-400 font-bold">{culverts450Produced} (450mm) / {culverts900Produced} (900mm)</span>
                <span className="text-rose-400 font-bold">{totalDefects} Defects ({defectRate}%)</span>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium text-center">
                {successMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleZeroAll}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
              >
                Reset to Zero
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Forgotten Day'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
