import { DailyLog, DefectReason, HourlyRecord, PlantSettings, ShiftName } from '../types/production';
export { calculateHourlyDefectRate } from './analytics';

export const OPERATING_HOURS_MON_SAT = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export const DEFAULT_SETTINGS: PlantSettings = {
  targetHourlySlabs: 12, // 12 pcs/hour over 10 schedule hours = 120 pieces
  targetHourlyChannels: 6,
  targetHourlyMoulds: 14,
  targetDailySlabs: 120,       // Slabs target: 120 pieces
  targetDailyCabros: 86,       // Cabros target: 86 sqm
  targetDailyCulverts450: 2,   // 450mm culvert target: 2 pieces
  targetDailyCulverts900: 3,   // 900mm culvert target: 3 pieces
  targetDailyWallCopings: 120, // Wall Copings target: 120 pieces
  targetDailyChannels: 60,
  targetDailyMoulds: 140,
  maxDefectRatePercent: 2.5,
  warningDefectRatePercent: 4.0,
  costPerDefectiveSlab: 14.50,
  costPerDefectiveChannel: 18.00,
  costPerDefectiveMould: 22.50,
  plantName: 'Panelpro Precast & Logistics Ltd',
  currencySymbol: '$',
  operatingSchedule: 'Mon - Sat: 07:30 AM - 5:00 PM (Sun Off)',
};

export function getShiftForHour(hour: number): ShiftName {
  if (hour >= 7 && hour < 12) return 'Morning Run (07:30-12:30)';
  if (hour === 12) return 'Midday Transition (12:30-13:30)';
  if (hour >= 13 && hour <= 16) return 'Afternoon Run (13:30-17:00)';
  return 'Overtime / Special Run';
}

export function formatHour(hour: number): string {
  const scheduleSlots: Record<number, string> = {
    7: '07:30 - 08:30',
    8: '08:30 - 09:30',
    9: '09:30 - 10:30',
    10: '10:30 - 11:30',
    11: '11:30 - 12:30',
    12: '12:30 - 13:30',
    13: '13:30 - 14:30',
    14: '14:30 - 15:30',
    15: '15:30 - 16:30',
    16: '16:30 - 17:00',
  };
  if (scheduleSlots[hour]) {
    return scheduleSlots[hour];
  }
  const h1 = hour.toString().padStart(2, '0');
  const h2 = ((hour + 1) % 24).toString().padStart(2, '0');
  return `${h1}:00 - ${h2}:00`;
}

export function createBlankHour(hour: number, dateStr?: string): HourlyRecord {
  const shift = getShiftForHour(hour);
  return {
    id: `${dateStr || 'new'}_h${hour}_${Math.random().toString(36).substring(2, 7)}`,
    hour,
    shift,
    timeSlotLabel: formatHour(hour),
    // All 9 production items start strictly at 0
    roadChannelsProduced: 0,
    slabsProduced: 0,
    cabrosProduced: 0,
    colouredCabrosProduced: 0,
    wallCopingProduced: 0,
    shallowDrainsProduced: 0,
    roadKerbsProduced: 0,
    culverts450Produced: 0,
    culverts900Produced: 0,
    mouldsProduced: 0,

    defectiveChannels: 0,
    defectiveSlabs: 0,
    defectiveCabros: 0,
    defectiveColouredCabros: 0,
    defectiveWallCoping: 0,
    defectiveShallowDrains: 0,
    defectiveRoadKerbs: 0,
    defectiveCulverts450: 0,
    defectiveCulverts900: 0,
    defectiveMoulds: 0,

    defectRate: 0,
    primaryDefectReason: 'None',
    notes: '',
    curingTempC: 22,
    vibratorFreqHz: 50,
    machineDowntimeMinutes: 0,
  };
}

export function createTypicalHour(hour: number, dateStr?: string, _seedVariance = 0): HourlyRecord {
  const blank = createBlankHour(hour, dateStr);
  return {
    ...blank,
    slabsProduced: 12,
    roadChannelsProduced: 6,
    cabrosProduced: 8,
    wallCopingProduced: 12,
    mouldsProduced: 14,
  };
}

export function createBlankDayLog(dateStr: string): DailyLog {
  const d = new Date(dateStr + 'T12:00:00Z');
  const isSunday = d.getDay() === 0;

  return {
    date: dateStr,
    supervisor: 'Plant Shift Lead',
    line: 'Precast Operations',
    status: 'in-progress',
    isOperatingDay: !isSunday,
    targetSlabs: DEFAULT_SETTINGS.targetDailySlabs,
    targetCabros: DEFAULT_SETTINGS.targetDailyCabros,
    targetCulverts450: DEFAULT_SETTINGS.targetDailyCulverts450,
    targetCulverts900: DEFAULT_SETTINGS.targetDailyCulverts900,
    targetWallCopings: DEFAULT_SETTINGS.targetDailyWallCopings,
    targetChannels: DEFAULT_SETTINGS.targetDailyChannels,
    targetRoadKerbs: 50,
    targetShallowDrains: 40,
    targetMoulds: DEFAULT_SETTINGS.targetDailyMoulds,
    targetMaxDefectRate: DEFAULT_SETTINGS.maxDefectRatePercent,
    ambientTempC: 22,
    humidityPct: 55,
    hourly: [],
    shiftNotes: isSunday
      ? 'Sunday Plant Shutdown: Scheduled mechanical maintenance.'
      : 'Operating Schedule: Mon - Sat (07:30 - 17:00). Ready for daily production entries.',
  };
}

/**
 * Returns a clean slate with zero production data (as requested: "there's no production start yet")
 */
export function generateInitialSeedData(): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date().toISOString().split('T')[0];
  logs[today] = createBlankDayLog(today);
  return logs;
}
