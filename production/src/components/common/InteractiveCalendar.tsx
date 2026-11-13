import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface DayLogMeta {
  totalProduced?: number;
  defectRate?: number;
  isLogged?: boolean;
}

interface InteractiveCalendarProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  loggedDates?: Record<string, DayLogMeta>;
  className?: string;
  showPresets?: boolean;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  selectedDate,
  onSelectDate,
  loggedDates = {},
  className = '',
  showPresets = true,
  minDate = '2026-01-01',
  maxDate = '2027-12-31',
}) => {
  // Parse currently selected date
  const selectedObj = useMemo(() => {
    if (!selectedDate) return new Date();
    const parts = selectedDate.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2] || 1);
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState<number>(selectedObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(selectedObj.getMonth()); // 0-indexed

  // Today ISO string
  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleYearChange = (newYear: number) => {
    setCurrentYear(newYear);
  };

  const handleMonthChange = (newMonth: number) => {
    setCurrentMonth(newMonth);
  };

  // Calendar matrix computation (Mon-Sun)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday-based day of week (0=Mon, 6=Sun)
    let firstDayIndex = firstDayOfMonth.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6;

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isSunday: boolean;
      isToday: boolean;
      isSelected: boolean;
      isFuture: boolean;
      meta?: DayLogMeta;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const dayDate = new Date(prevYear, prevMonth, dNum);
      const isSun = dayDate.getDay() === 0;

      cells.push({
        dateStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isSunday: isSun,
        isToday: dateStr === todayIso,
        isSelected: dateStr === selectedDate,
        isFuture: dateStr > todayIso,
        meta: loggedDates[dateStr],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(currentYear, currentMonth, d);
      const isSun = dayDate.getDay() === 0;

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isSunday: isSun,
        isToday: dateStr === todayIso,
        isSelected: dateStr === selectedDate,
        isFuture: dateStr > todayIso,
        meta: loggedDates[dateStr],
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayDate = new Date(nextYear, nextMonth, i);
      const isSun = dayDate.getDay() === 0;

      cells.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isSunday: isSun,
        isToday: dateStr === todayIso,
        isSelected: dateStr === selectedDate,
        isFuture: dateStr > todayIso,
        meta: loggedDates[dateStr],
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayIso, selectedDate, loggedDates]);

  // Find most recent unlogged past weekday (for quick jump)
  const lastMissingDate = useMemo(() => {
    const cur = new Date();
    // Check past 30 days
    for (let i = 1; i <= 30; i++) {
      const check = new Date(cur);
      check.setDate(cur.getDate() - i);
      if (check.getDay() === 0) continue; // Skip Sunday
      const iso = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`;
      const meta = loggedDates[iso];
      if (!meta || !meta.isLogged || (meta.totalProduced || 0) === 0) {
        return iso;
      }
    }
    return null;
  }, [loggedDates]);

  const selectPreset = (isoStr: string) => {
    onSelectDate(isoStr);
    const [y, m] = isoStr.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
  };

  return (
    <div className={`bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl ${className}`}>
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            {/* Month select */}
            <select
              value={currentMonth}
              onChange={e => handleMonthChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-100 cursor-pointer focus:outline-hidden focus:border-sky-500"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            {/* Year select */}
            <select
              value={currentYear}
              onChange={e => handleYearChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-100 cursor-pointer focus:outline-hidden focus:border-sky-500"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCurrentYear(now.getFullYear());
              setCurrentMonth(now.getMonth());
            }}
            className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
          >
            This Month
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {DAYS_OF_WEEK.map((d, idx) => (
          <div
            key={d}
            className={`text-[10px] font-semibold uppercase tracking-wider py-1 ${
              idx === 6 ? 'text-rose-400/80' : 'text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map(cell => {
          const hasProduction = cell.meta && cell.meta.isLogged && (cell.meta.totalProduced || 0) > 0;
          const isMissingWorkday = !cell.isSunday && !cell.isFuture && !hasProduction;

          // Background & Border styling
          let cellStyle = 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border-transparent';
          if (!cell.isCurrentMonth) {
            cellStyle = 'bg-slate-950/40 text-slate-600 hover:bg-slate-900/40 border-transparent';
          }
          if (cell.isSunday) {
            cellStyle = 'bg-slate-950/80 text-slate-500 border-dashed border-slate-800 hover:bg-slate-900';
          }
          if (cell.isSelected) {
            cellStyle = 'bg-sky-600/30 text-sky-200 border-2 border-sky-400 shadow-md shadow-sky-950';
          } else if (cell.isToday) {
            cellStyle = 'bg-slate-900 text-slate-100 border-2 border-sky-500/60';
          }

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => {
                onSelectDate(cell.dateStr);
                const [y, m] = cell.dateStr.split('-').map(Number);
                if (m - 1 !== currentMonth || y !== currentYear) {
                  setCurrentYear(y);
                  setCurrentMonth(m - 1);
                }
              }}
              className={`relative min-h-[52px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer group ${cellStyle}`}
            >
              {/* Day number & Today/Sun tag */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${
                  cell.isSelected ? 'text-sky-300' : cell.isToday ? 'text-sky-400' : cell.isSunday ? 'text-slate-500' : 'text-slate-200'
                }`}>
                  {cell.dayNum}
                </span>

                {cell.isToday && (
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 bg-sky-500/20 text-sky-300 rounded">
                    Today
                  </span>
                )}
                {cell.isSunday && (
                  <span className="text-[8px] uppercase tracking-wider text-slate-600 font-mono">
                    Off
                  </span>
                )}
              </div>

              {/* Status Indicator Badges */}
              <div className="mt-1">
                {hasProduction ? (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 rounded px-1 py-0.5 truncate">
                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{cell.meta?.totalProduced} pcs</span>
                  </div>
                ) : isMissingWorkday && cell.isCurrentMonth ? (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-800/40 rounded px-1 py-0.5 truncate">
                    <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">Unlogged</span>
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Quick Presets */}
      {showPresets && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Quick Jump:</span>
            <button
              type="button"
              onClick={() => selectPreset(todayIso)}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const yest = new Date();
                yest.setDate(yest.getDate() - 1);
                const iso = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
                selectPreset(iso);
              }}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md transition cursor-pointer"
            >
              Yesterday
            </button>
            {lastMissingDate && (
              <button
                type="button"
                onClick={() => selectPreset(lastMissingDate)}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 rounded-md transition cursor-pointer"
                title="Jump to the most recent unlogged past workday"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>Jump to Missing Day ({lastMissingDate.slice(5)})</span>
              </button>
            )}
          </div>

          {/* Color Key */}
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Logged</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Unlogged</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>Sun Off</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
