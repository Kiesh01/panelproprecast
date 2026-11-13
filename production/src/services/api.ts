import { DailyLog, HourlyRecord } from '../types/production';

export interface MongoHealthStatus {
  connected: boolean;
  database: string;
  collection: string;
  documentCount?: number;
  message?: string;
  error?: string;
}

export async function fetchMongoHealth(): Promise<MongoHealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn('API /api/health unavailable, using fallback', err);
    return {
      connected: false,
      database: 'Panelpro',
      collection: 'Stats',
      error: err.message || 'Service unavailable',
    };
  }
}

export async function fetchDayLogFromDb(dateStr: string): Promise<DailyLog | null> {
  try {
    const res = await fetch(`/api/stats/day?date=${encodeURIComponent(dateStr)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.found && data.log) {
      return data.log as DailyLog;
    }
  } catch (err) {
    console.warn(`Failed to fetch day log for ${dateStr} from MongoDB:`, err);
  }
  return null;
}

export async function saveHourlyToDb(dateStr: string, record: HourlyRecord): Promise<DailyLog | null> {
  try {
    const res = await fetch('/api/stats/hourly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, record }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.log as DailyLog;
  } catch (err) {
    console.warn('Failed to save hourly record to MongoDB:', err);
    return null;
  }
}

export async function deleteHourlyFromDb(dateStr: string, hour: number): Promise<DailyLog | null> {
  try {
    const res = await fetch(`/api/stats/hourly?date=${encodeURIComponent(dateStr)}&hour=${hour}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.log as DailyLog;
  } catch (err) {
    console.warn('Failed to delete hourly record from MongoDB:', err);
    return null;
  }
}

export async function saveBatchDayToDb(dayData: DailyLog): Promise<DailyLog | null> {
  try {
    const res = await fetch('/api/stats/batch-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dayData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.log as DailyLog;
  } catch (err) {
    console.warn('Failed to save batch day to MongoDB:', err);
    return null;
  }
}

export async function fetchAllLogsFromDb(): Promise<Record<string, DailyLog>> {
  try {
    const res = await fetch('/api/stats/all?limit=100');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.logs && Array.isArray(data.logs)) {
      const map: Record<string, DailyLog> = {};
      for (const log of data.logs) {
        if (log.date) {
          map[log.date] = log;
        }
      }
      return map;
    }
  } catch (err) {
    console.warn('Failed to fetch all logs from MongoDB:', err);
  }
  return {};
}

export async function reseedMongoDb(): Promise<boolean> {
  try {
    const res = await fetch('/api/stats/seed', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error('Failed to reseed MongoDB:', err);
    return false;
  }
}

export async function resetDbToZero(): Promise<boolean> {
  try {
    const res = await fetch('/api/stats/reset-to-zero', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error('Failed to reset MongoDB to zero:', err);
    return false;
  }
}

export async function saveForgottenDayToDb(payload: any): Promise<DailyLog | null> {
  try {
    const res = await fetch('/api/stats/forgotten-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.log as DailyLog;
  } catch (err) {
    console.warn('Failed to save forgotten day to MongoDB:', err);
    return null;
  }
}

export interface AvailableMonth {
  id: string;
  name: string;
  year: number;
  month: number;
}

export interface HistoryRangeResponse {
  earliestDate: string;
  latestDate: string;
  availableMonths: AvailableMonth[];
  currentMonth: string;
}

export async function fetchHistoryRange(): Promise<HistoryRangeResponse | null> {
  try {
    const res = await fetch('/api/reports/history-range');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch history range:', err);
    return null;
  }
}

export interface ProductionWeek {
  weekNumber: number;
  label: string;
  period: string;
  startDate: string;
  endDate: string;
  daysLogged: number;
  totalSlabs: number;
  totalChannels: number;
  totalMoulds?: number;
  totalDefects?: number;
}

export async function fetchMonthWeeks(monthStr: string): Promise<ProductionWeek[]> {
  try {
    const res = await fetch(`/api/reports/month-weeks?month=${encodeURIComponent(monthStr)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.weeks || [];
  } catch (err) {
    console.warn('Failed to fetch month weeks:', err);
    return [];
  }
}

