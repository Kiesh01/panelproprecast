import { DailyLog, HourlyRecord, PlantSettings } from '../types/production';
import { DEFAULT_SETTINGS, generateInitialSeedData } from '../utils/dataGenerator';

const LOGS_STORAGE_KEY = 'castops_daily_logs_v2';
const SETTINGS_STORAGE_KEY = 'castops_settings_v2';

export function loadSettings(): PlantSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: PlantSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
  }
}

export function loadDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load logs from storage, seeding defaults', e);
  }

  // Clean slate: all variables start at zero
  const seed = generateInitialSeedData();
  saveDailyLogs(seed);
  return seed;
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to storage', e);
  }
}

export function getDailyLog(dateStr: string, logs: Record<string, DailyLog>, settings: PlantSettings): DailyLog {
  if (logs[dateStr]) {
    return logs[dateStr];
  }

  // Create new blank day log if not present
  return {
    date: dateStr,
    supervisor: 'Plant Shift Lead',
    line: 'Precast Operations',
    status: 'in-progress',
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
    humidityPct: 60,
    hourly: [],
    shiftNotes: '',
  };
}

export function upsertHourlyRecord(
  dateStr: string,
  record: HourlyRecord,
  logs: Record<string, DailyLog>,
  settings: PlantSettings
): Record<string, DailyLog> {
  const currentDay = getDailyLog(dateStr, logs, settings);
  const existingIndex = currentDay.hourly.findIndex(h => h.hour === record.hour);

  let newHourly: HourlyRecord[];
  if (existingIndex >= 0) {
    newHourly = [...currentDay.hourly];
    newHourly[existingIndex] = record;
  } else {
    newHourly = [...currentDay.hourly, record];
  }

  newHourly.sort((a, b) => a.hour - b.hour);

  const updatedDay: DailyLog = {
    ...currentDay,
    hourly: newHourly,
  };

  const updatedLogs = {
    ...logs,
    [dateStr]: updatedDay,
  };

  saveDailyLogs(updatedLogs);
  return updatedLogs;
}

export function deleteHourlyRecord(
  dateStr: string,
  hour: number,
  logs: Record<string, DailyLog>
): Record<string, DailyLog> {
  if (!logs[dateStr]) return logs;

  const currentDay = logs[dateStr];
  const updatedDay: DailyLog = {
    ...currentDay,
    hourly: currentDay.hourly.filter(h => h.hour !== hour),
  };

  const updatedLogs = {
    ...logs,
    [dateStr]: updatedDay,
  };

  saveDailyLogs(updatedLogs);
  return updatedLogs;
}

export function exportLogsToCSV(logs: Record<string, DailyLog>): string {
  const headers = [
    'Date',
    'Hour',
    'Shift',
    'Channels Produced',
    'Slabs Produced',
    'Cabros Produced',
    'Coloured Cabros Produced',
    'Wall Coping Produced',
    'Shallow Drains Produced',
    'Road Kerbs Produced',
    '450mm Culvert Produced',
    '900mm Culvert Produced',
    'Moulds Produced',
    'Defective Slabs',
    'Defective Channels',
    'Defective Coloured Cabros',
    'Defect Rate %',
    'Primary Defect Reason',
    'Notes',
  ];

  const rows: string[] = [headers.join(',')];

  const sortedDates = Object.keys(logs).sort();
  for (const date of sortedDates) {
    const day = logs[date];
    for (const h of day.hourly) {
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

      const rate = total > 0 ? ((def / total) * 100).toFixed(2) : '0.00';

      const row = [
        date,
        `${h.hour}:00`,
        `"${h.shift}"`,
        h.roadChannelsProduced || 0,
        h.slabsProduced || 0,
        h.cabrosProduced || 0,
        h.colouredCabrosProduced || 0,
        h.wallCopingProduced || 0,
        h.shallowDrainsProduced || 0,
        h.roadKerbsProduced || 0,
        h.culverts450Produced || 0,
        h.culverts900Produced || 0,
        h.mouldsProduced || 0,
        h.defectiveSlabs || 0,
        h.defectiveChannels || 0,
        h.defectiveColouredCabros || 0,
        rate,
        `"${h.primaryDefectReason || 'None'}"`,
        `"${(h.notes || '').replace(/"/g, '""')}"`,
      ];
      rows.push(row.join(','));
    }
  }

  return rows.join('\n');
}

export function resetToSampleData(): { logs: Record<string, DailyLog>; settings: PlantSettings } {
  const seed = generateInitialSeedData();
  saveDailyLogs(seed);
  saveSettings(DEFAULT_SETTINGS);
  return { logs: seed, settings: DEFAULT_SETTINGS };
}
