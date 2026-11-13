export type DefectReason =
  | 'Micro-cracking'
  | 'Edge Chipping'
  | 'Dimensional Drift'
  | 'Slump & Curing Void'
  | 'Mould Misalignment'
  | 'Surface Bleed'
  | 'Aggregate Segregation'
  | 'None';

export type ShiftName =
  | 'Morning Run (07:30-12:30)'
  | 'Midday Transition (12:30-13:30)'
  | 'Afternoon Run (13:30-17:00)'
  | 'Overtime / Special Run';

export interface HourlyRecord {
  id: string;
  hour: number; // 0 to 23 (7 to 16 standard Mon-Sat operating schedule)
  shift: ShiftName;
  timeSlotLabel?: string; // e.g. "07:30 - 08:30"
  
  // 9 Production Line Items:
  roadChannelsProduced: number;  // Channels (IN008)
  slabsProduced: number;         // Paving Slabs (IN003, Target: 120 pcs)
  cabrosProduced: number;        // Cabros (IN007, Target: 86 sqm)
  colouredCabrosProduced: number;// Coloured Cabros (IN011, sqm)
  wallCopingProduced: number;    // Wall Coping (IN010, Target: 120 pcs)
  shallowDrainsProduced: number; // Shallow Drains (IN002)
  roadKerbsProduced: number;     // Road Kerbs (IN001)
  culverts450Produced: number;   // 450mm culverts (IN004, Target: 2 pcs)
  culverts900Produced: number;   // 900mm culverts (IN006, Target: 3 pcs)
  mouldsProduced: number;        // Mould cycles

  // Defects per item:
  defectiveChannels: number;
  defectiveSlabs: number;
  defectiveCabros: number;
  defectiveColouredCabros: number;
  defectiveWallCoping: number;
  defectiveShallowDrains: number;
  defectiveRoadKerbs: number;
  defectiveCulverts450: number;
  defectiveCulverts900: number;
  defectiveMoulds: number;

  defectRate?: number;
  primaryDefectReason: DefectReason;
  notes?: string;
  curingTempC?: number;
  vibratorFreqHz?: number;
  machineDowntimeMinutes?: number;
}

export interface DailyLog {
  date: string; // ISO 'YYYY-MM-DD'
  supervisor: string;
  line: string;
  status: 'in-progress' | 'completed' | 'verified';
  isOperatingDay?: boolean; // false for Sundays

  // Targets
  targetSlabs: number;        // 120 pieces
  targetCabros: number;       // 86 sqm
  targetCulverts450: number;  // 2 pieces
  targetCulverts900: number;  // 3 pieces
  targetWallCopings: number;  // 120 pieces
  targetChannels: number;     // e.g. 60 pcs
  targetRoadKerbs: number;    // e.g. 50 pcs
  targetShallowDrains: number;// e.g. 40 pcs
  targetMoulds: number;
  targetMaxDefectRate: number;// default 2.5%

  ambientTempC: number;
  humidityPct: number;
  hourly: HourlyRecord[];
  shiftNotes?: string;

  // Precomputed totals (optional cache)
  totalSlabs?: number;
  totalChannels?: number;
  totalCabros?: number;
  totalColouredCabros?: number;
  totalWallCoping?: number;
  totalShallowDrains?: number;
  totalRoadKerbs?: number;
  totalCulverts450?: number;
  totalCulverts900?: number;
  totalMoulds?: number;
  totalProduced?: number;
  totalDefects?: number;
  defectRate?: number;
}

export interface PlantSettings {
  targetHourlySlabs: number; // 12 pcs / hour
  targetHourlyChannels: number;
  targetHourlyMoulds: number;
  targetDailySlabs: number;       // 120 pieces
  targetDailyCabros: number;      // 86 sqm
  targetDailyCulverts450: number; // 2 pieces
  targetDailyCulverts900: number; // 3 pieces
  targetDailyWallCopings: number; // 120 pieces
  targetDailyChannels: number;
  targetDailyMoulds: number;
  maxDefectRatePercent: number; // default 2.5%
  warningDefectRatePercent: number; // default 4.0%
  costPerDefectiveSlab: number; // e.g. $14.50
  costPerDefectiveChannel: number; // e.g. $18.00
  costPerDefectiveMould: number; // e.g. $22.50
  plantName: string;
  currencySymbol: string;
  operatingSchedule: string; // "Mon - Sat: 07:30 - 17:00"
}

export interface ShiftStats {
  shiftName: ShiftName;
  slabs: number;
  channels: number;
  cabros: number;
  colouredCabros: number;
  wallCoping: number;
  shallowDrains: number;
  roadKerbs: number;
  culverts450: number;
  culverts900: number;
  moulds: number;
  totalUnits: number;
  defects: number;
  defectRate: number;
  downtimeMin: number;
}

export interface DaySummary {
  date: string;
  totalSlabs: number;
  totalChannels: number;
  totalCabros: number;
  totalColouredCabros: number;
  totalWallCoping: number;
  totalShallowDrains: number;
  totalRoadKerbs: number;
  totalCulverts450: number;
  totalCulverts900: number;
  totalMoulds: number;
  totalProduced: number;
  totalDefects: number;
  defectRate: number;
  scrapCost: number;
  oeeAvailability: number;
  oeePerformance: number;
  oeeQuality: number;
  oeeOverall: number;
}

export interface MonthSummary {
  yearMonth: string; // YYYY-MM
  label: string;
  totalSlabs: number;
  totalChannels: number;
  totalCabros: number;
  totalColouredCabros: number;
  totalWallCoping: number;
  totalShallowDrains: number;
  totalRoadKerbs: number;
  totalCulverts450: number;
  totalCulverts900: number;
  totalMoulds: number;
  totalProduced: number;
  totalDefects: number;
  averageDefectRate: number;
  daysLogged: number;
  estimatedScrapCost: number;
  bestDay: { date: string; rate: number };
  worstDay: { date: string; rate: number };
}

export interface YearSummary {
  year: number;
  totalSlabs: number;
  totalChannels: number;
  totalCabros: number;
  totalColouredCabros: number;
  totalWallCoping: number;
  totalMoulds: number;
  totalProduced: number;
  totalDefects: number;
  averageDefectRate: number;
  estimatedScrapCost: number;
  monthlyBreakdown: {
    month: number;
    monthName: string;
    slabs: number;
    channels: number;
    moulds: number;
    defects: number;
    defectRate: number;
  }[];
}

export interface ActionableInsight {
  id: string;
  type: 'critical' | 'warning' | 'optimization' | 'positive';
  category: 'Quality' | 'Throughput' | 'Mould Maintenance' | 'Cost Savings';
  title: string;
  description: string;
  impactMetrics: string;
  recommendation: string;
  actionTaken?: boolean;
}
