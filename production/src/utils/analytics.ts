import {
  ActionableInsight,
  DailyLog,
  DaySummary,
  DefectReason,
  HourlyRecord,
  MonthSummary,
  PlantSettings,
  ShiftName,
  ShiftStats,
  YearSummary,
} from '../types/production';

export function calculateHourlyDefectRate(record: HourlyRecord): number {
  const total =
    (record.slabsProduced || 0) +
    (record.roadChannelsProduced || 0) +
    (record.cabrosProduced || 0) +
    (record.colouredCabrosProduced || 0) +
    (record.wallCopingProduced || 0) +
    (record.shallowDrainsProduced || 0) +
    (record.roadKerbsProduced || 0) +
    (record.culverts450Produced || 0) +
    (record.culverts900Produced || 0);

  if (total <= 0) return 0;

  const defects =
    (record.defectiveSlabs || 0) +
    (record.defectiveChannels || 0) +
    (record.defectiveCabros || 0) +
    (record.defectiveColouredCabros || 0) +
    (record.defectiveWallCoping || 0) +
    (record.defectiveShallowDrains || 0) +
    (record.defectiveRoadKerbs || 0) +
    (record.defectiveCulverts450 || 0) +
    (record.defectiveCulverts900 || 0);

  return Number(((defects / total) * 100).toFixed(2));
}

export function calculateDaySummary(log: DailyLog, settings: PlantSettings): DaySummary {
  let totalSlabs = 0;
  let totalChannels = 0;
  let totalCabros = 0;
  let totalColouredCabros = 0;
  let totalWallCoping = 0;
  let totalShallowDrains = 0;
  let totalRoadKerbs = 0;
  let totalCulverts450 = 0;
  let totalCulverts900 = 0;
  let totalMoulds = 0;

  let totalDefectiveSlabs = 0;
  let totalDefectiveChannels = 0;
  let totalDefectiveCabros = 0;
  let totalDefectiveColouredCabros = 0;
  let totalDefectiveWallCoping = 0;
  let totalDefectiveShallowDrains = 0;
  let totalDefectiveRoadKerbs = 0;
  let totalDefectiveCulverts450 = 0;
  let totalDefectiveCulverts900 = 0;
  let totalDefectiveMoulds = 0;
  let totalDowntimeMinutes = 0;

  for (const h of log.hourly) {
    totalSlabs += h.slabsProduced || 0;
    totalChannels += h.roadChannelsProduced || 0;
    totalCabros += h.cabrosProduced || 0;
    totalColouredCabros += h.colouredCabrosProduced || 0;
    totalWallCoping += h.wallCopingProduced || 0;
    totalShallowDrains += h.shallowDrainsProduced || 0;
    totalRoadKerbs += h.roadKerbsProduced || 0;
    totalCulverts450 += h.culverts450Produced || 0;
    totalCulverts900 += h.culverts900Produced || 0;
    totalMoulds += h.mouldsProduced || 0;

    totalDefectiveSlabs += h.defectiveSlabs || 0;
    totalDefectiveChannels += h.defectiveChannels || 0;
    totalDefectiveCabros += h.defectiveCabros || 0;
    totalDefectiveColouredCabros += h.defectiveColouredCabros || 0;
    totalDefectiveWallCoping += h.defectiveWallCoping || 0;
    totalDefectiveShallowDrains += h.defectiveShallowDrains || 0;
    totalDefectiveRoadKerbs += h.defectiveRoadKerbs || 0;
    totalDefectiveCulverts450 += h.defectiveCulverts450 || 0;
    totalDefectiveCulverts900 += h.defectiveCulverts900 || 0;
    totalDefectiveMoulds += h.defectiveMoulds || 0;
    totalDowntimeMinutes += h.machineDowntimeMinutes || 0;
  }

  const totalProduced =
    totalSlabs +
    totalChannels +
    totalCabros +
    totalColouredCabros +
    totalWallCoping +
    totalShallowDrains +
    totalRoadKerbs +
    totalCulverts450 +
    totalCulverts900;

  const totalDefects =
    totalDefectiveSlabs +
    totalDefectiveChannels +
    totalDefectiveCabros +
    totalDefectiveColouredCabros +
    totalDefectiveWallCoping +
    totalDefectiveShallowDrains +
    totalDefectiveRoadKerbs +
    totalDefectiveCulverts450 +
    totalDefectiveCulverts900;

  const defectRate = totalProduced > 0 ? Number(((totalDefects / totalProduced) * 100).toFixed(2)) : 0;

  const scrapCost =
    totalDefectiveSlabs * settings.costPerDefectiveSlab +
    totalDefectiveChannels * settings.costPerDefectiveChannel +
    totalDefectiveMoulds * settings.costPerDefectiveMould;

  const plannedOperatingTime = log.hourly.length * 60;
  const operatingTime = Math.max(0, plannedOperatingTime - totalDowntimeMinutes);
  const oeeAvailability =
    plannedOperatingTime > 0 ? Math.min(100, Number(((operatingTime / plannedOperatingTime) * 100).toFixed(1))) : 100;

  const targetVolume = (settings.targetHourlySlabs + settings.targetHourlyChannels) * log.hourly.length;
  const oeePerformance = targetVolume > 0 ? Math.min(100, Number(((totalProduced / targetVolume) * 100).toFixed(1))) : (totalProduced > 0 ? 100 : 0);

  const goodPieces = Math.max(0, totalProduced - totalDefects);
  const oeeQuality = totalProduced > 0 ? Number(((goodPieces / totalProduced) * 100).toFixed(1)) : 100;

  const oeeOverall = Number(((oeeAvailability * oeePerformance * oeeQuality) / 10000).toFixed(1));

  return {
    date: log.date,
    totalSlabs,
    totalChannels,
    totalCabros,
    totalColouredCabros,
    totalWallCoping,
    totalShallowDrains,
    totalRoadKerbs,
    totalCulverts450,
    totalCulverts900,
    totalMoulds,
    totalProduced,
    totalDefects,
    defectRate,
    scrapCost: Number(scrapCost.toFixed(2)),
    oeeAvailability,
    oeePerformance,
    oeeQuality,
    oeeOverall,
  };
}

export function calculateShiftStats(hourly: HourlyRecord[]): Record<ShiftName, ShiftStats> {
  const shifts: Record<ShiftName, ShiftStats> = {
    'Morning Run (07:30-12:30)': {
      shiftName: 'Morning Run (07:30-12:30)',
      slabs: 0,
      channels: 0,
      cabros: 0,
      colouredCabros: 0,
      wallCoping: 0,
      shallowDrains: 0,
      roadKerbs: 0,
      culverts450: 0,
      culverts900: 0,
      moulds: 0,
      totalUnits: 0,
      defects: 0,
      defectRate: 0,
      downtimeMin: 0,
    },
    'Midday Transition (12:30-13:30)': {
      shiftName: 'Midday Transition (12:30-13:30)',
      slabs: 0,
      channels: 0,
      cabros: 0,
      colouredCabros: 0,
      wallCoping: 0,
      shallowDrains: 0,
      roadKerbs: 0,
      culverts450: 0,
      culverts900: 0,
      moulds: 0,
      totalUnits: 0,
      defects: 0,
      defectRate: 0,
      downtimeMin: 0,
    },
    'Afternoon Run (13:30-17:00)': {
      shiftName: 'Afternoon Run (13:30-17:00)',
      slabs: 0,
      channels: 0,
      cabros: 0,
      colouredCabros: 0,
      wallCoping: 0,
      shallowDrains: 0,
      roadKerbs: 0,
      culverts450: 0,
      culverts900: 0,
      moulds: 0,
      totalUnits: 0,
      defects: 0,
      defectRate: 0,
      downtimeMin: 0,
    },
    'Overtime / Special Run': {
      shiftName: 'Overtime / Special Run',
      slabs: 0,
      channels: 0,
      cabros: 0,
      colouredCabros: 0,
      wallCoping: 0,
      shallowDrains: 0,
      roadKerbs: 0,
      culverts450: 0,
      culverts900: 0,
      moulds: 0,
      totalUnits: 0,
      defects: 0,
      defectRate: 0,
      downtimeMin: 0,
    },
  };

  for (const h of hourly) {
    const shift = shifts[h.shift] || shifts['Morning Run (07:30-12:30)'];
    shift.slabs += h.slabsProduced || 0;
    shift.channels += h.roadChannelsProduced || 0;
    shift.cabros += h.cabrosProduced || 0;
    shift.colouredCabros += h.colouredCabrosProduced || 0;
    shift.wallCoping += h.wallCopingProduced || 0;
    shift.shallowDrains += h.shallowDrainsProduced || 0;
    shift.roadKerbs += h.roadKerbsProduced || 0;
    shift.culverts450 += h.culverts450Produced || 0;
    shift.culverts900 += h.culverts900Produced || 0;
    shift.moulds += h.mouldsProduced || 0;

    const units =
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

    shift.totalUnits += units;
    shift.defects += def;
    shift.downtimeMin += h.machineDowntimeMinutes || 0;
  }

  for (const key of Object.keys(shifts) as ShiftName[]) {
    const s = shifts[key];
    s.defectRate = s.totalUnits > 0 ? Number(((s.defects / s.totalUnits) * 100).toFixed(2)) : 0;
  }

  return shifts;
}

export function calculateDefectPareto(hourly: HourlyRecord[]): { reason: DefectReason; count: number; percentage: number; cumulativePercentage: number }[] {
  const counts: Record<string, number> = {};
  let totalDefects = 0;

  for (const h of hourly) {
    const defCount =
      (h.defectiveSlabs || 0) +
      (h.defectiveChannels || 0) +
      (h.defectiveCabros || 0) +
      (h.defectiveColouredCabros || 0) +
      (h.defectiveWallCoping || 0) +
      (h.defectiveShallowDrains || 0) +
      (h.defectiveRoadKerbs || 0) +
      (h.defectiveCulverts450 || 0) +
      (h.defectiveCulverts900 || 0);

    if (defCount > 0 && h.primaryDefectReason && h.primaryDefectReason !== 'None') {
      counts[h.primaryDefectReason] = (counts[h.primaryDefectReason] || 0) + defCount;
      totalDefects += defCount;
    }
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({
      reason: reason as DefectReason,
      count,
      percentage: totalDefects > 0 ? Number(((count / totalDefects) * 100).toFixed(1)) : 0,
      cumulativePercentage: 0,
    }));

  let cum = 0;
  for (const item of sorted) {
    cum += item.percentage;
    item.cumulativePercentage = Math.min(100, Number(cum.toFixed(1)));
  }

  return sorted;
}

export function calculateMonthSummary(
  yearMonth: string,
  allLogs: Record<string, DailyLog>,
  settings: PlantSettings
): MonthSummary {
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthNum = parseInt(monthStr, 10);
  const yearNum = parseInt(yearStr, 10);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const label = `${monthNames[monthNum - 1]} ${yearNum}`;

  let totalSlabs = 0;
  let totalChannels = 0;
  let totalCabros = 0;
  let totalColouredCabros = 0;
  let totalWallCoping = 0;
  let totalShallowDrains = 0;
  let totalRoadKerbs = 0;
  let totalCulverts450 = 0;
  let totalCulverts900 = 0;
  let totalMoulds = 0;
  let totalDefects = 0;
  let daysLogged = 0;
  let totalScrapCost = 0;

  let bestDay = { date: '', rate: 999 };
  let worstDay = { date: '', rate: -1 };

  for (const [date, log] of Object.entries(allLogs)) {
    if (date.startsWith(yearMonth)) {
      daysLogged++;
      const summary = calculateDaySummary(log, settings);
      totalSlabs += summary.totalSlabs;
      totalChannels += summary.totalChannels;
      totalCabros += summary.totalCabros;
      totalColouredCabros += summary.totalColouredCabros;
      totalWallCoping += summary.totalWallCoping;
      totalShallowDrains += summary.totalShallowDrains;
      totalRoadKerbs += summary.totalRoadKerbs;
      totalCulverts450 += summary.totalCulverts450;
      totalCulverts900 += summary.totalCulverts900;
      totalMoulds += summary.totalMoulds;
      totalDefects += summary.totalDefects;
      totalScrapCost += summary.scrapCost;

      if (summary.totalProduced > 0) {
        if (summary.defectRate < bestDay.rate) {
          bestDay = { date, rate: summary.defectRate };
        }
        if (summary.defectRate > worstDay.rate) {
          worstDay = { date, rate: summary.defectRate };
        }
      }
    }
  }

  const totalProduced =
    totalSlabs +
    totalChannels +
    totalCabros +
    totalColouredCabros +
    totalWallCoping +
    totalShallowDrains +
    totalRoadKerbs +
    totalCulverts450 +
    totalCulverts900;

  const averageDefectRate = totalProduced > 0 ? Number(((totalDefects / totalProduced) * 100).toFixed(2)) : 0;

  return {
    yearMonth,
    label,
    totalSlabs,
    totalChannels,
    totalCabros,
    totalColouredCabros,
    totalWallCoping,
    totalShallowDrains,
    totalRoadKerbs,
    totalCulverts450,
    totalCulverts900,
    totalMoulds,
    totalProduced,
    totalDefects,
    averageDefectRate,
    daysLogged,
    estimatedScrapCost: Number(totalScrapCost.toFixed(2)),
    bestDay: bestDay.date ? bestDay : { date: `${yearMonth}-01`, rate: averageDefectRate },
    worstDay: worstDay.date ? worstDay : { date: `${yearMonth}-01`, rate: averageDefectRate },
  };
}

export function calculateYearSummary(
  year: number,
  allLogs: Record<string, DailyLog>,
  settings: PlantSettings
): YearSummary {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBreakdown = monthNames.map((monthName, idx) => ({
    month: idx,
    monthName,
    slabs: 0,
    channels: 0,
    moulds: 0,
    defects: 0,
    defectRate: 0,
  }));

  let totalSlabs = 0;
  let totalChannels = 0;
  let totalCabros = 0;
  let totalColouredCabros = 0;
  let totalWallCoping = 0;
  let totalProduced = 0;
  let totalMoulds = 0;
  let totalDefects = 0;
  let totalScrapCost = 0;

  for (const [date, log] of Object.entries(allLogs)) {
    if (date.startsWith(`${year}-`)) {
      const monthIdx = parseInt(date.substring(5, 7), 10) - 1;
      const daySum = calculateDaySummary(log, settings);

      monthlyBreakdown[monthIdx].slabs += daySum.totalSlabs;
      monthlyBreakdown[monthIdx].channels += daySum.totalChannels;
      monthlyBreakdown[monthIdx].moulds += daySum.totalMoulds;
      monthlyBreakdown[monthIdx].defects += daySum.totalDefects;

      totalSlabs += daySum.totalSlabs;
      totalChannels += daySum.totalChannels;
      totalCabros += daySum.totalCabros;
      totalColouredCabros += daySum.totalColouredCabros;
      totalWallCoping += daySum.totalWallCoping;
      totalProduced += daySum.totalProduced;
      totalMoulds += daySum.totalMoulds;
      totalDefects += daySum.totalDefects;
      totalScrapCost += daySum.scrapCost;
    }
  }

  for (const m of monthlyBreakdown) {
    const prod = m.slabs + m.channels;
    m.defectRate = prod > 0 ? Number(((m.defects / prod) * 100).toFixed(2)) : 0;
  }

  const averageDefectRate = totalProduced > 0 ? Number(((totalDefects / totalProduced) * 100).toFixed(2)) : 0;

  return {
    year,
    totalSlabs,
    totalChannels,
    totalCabros,
    totalColouredCabros,
    totalWallCoping,
    totalMoulds,
    totalProduced,
    totalDefects,
    averageDefectRate,
    estimatedScrapCost: Number(totalScrapCost.toFixed(2)),
    monthlyBreakdown,
  };
}

export function generateActionableInsights(
  todayLog: DailyLog,
  recentLogs: DailyLog[],
  settings: PlantSettings
): ActionableInsight[] {
  const insights: ActionableInsight[] = [];
  const todaySummary = calculateDaySummary(todayLog, settings);
  const pareto = calculateDefectPareto(todayLog.hourly);
  const shiftStats = calculateShiftStats(todayLog.hourly);

  const spikingHours = todayLog.hourly.filter(h => calculateHourlyDefectRate(h) >= settings.warningDefectRatePercent);
  if (spikingHours.length > 0) {
    const hoursList = spikingHours.map(h => `${h.hour}:00`).join(', ');
    insights.push({
      id: 'insight-spike-hour',
      type: 'critical',
      category: 'Quality',
      title: `Hourly Defect Rate Exceeded Warning Threshold (${settings.warningDefectRatePercent}%)`,
      description: `Spikes detected during hour(s) ${hoursList}. Max hourly defect recorded was ${Math.max(...spikingHours.map(h => calculateHourlyDefectRate(h)))}%.`,
      impactMetrics: `${spikingHours.reduce((acc, h) => acc + (h.defectiveSlabs || 0) + (h.defectiveChannels || 0), 0)} scrap units during spike intervals`,
      recommendation: `Inspect demoulding hydraulic pressure and hydraulic dampener calibrations between shift transitions. Check concrete slump consistency at batching plant.`,
    });
  }

  if (pareto.length > 0 && pareto[0].percentage >= 35) {
    const topReason = pareto[0];
    let recommendation = 'Conduct immediate quality gate audit on demoulding and curing steps.';
    if (topReason.reason === 'Edge Chipping') {
      recommendation = 'Edge chipping is leading cause (demoulding gripper vibration is stripping fresh edges). Increase pre-cure resting time by 12 minutes before stripping.';
    } else if (topReason.reason === 'Micro-cracking') {
      recommendation = 'Micro-cracking accounts for the majority of scrap. Verify aggregate moisture probe calibration and check curing room humidity.';
    } else if (topReason.reason === 'Slump & Curing Void') {
      recommendation = 'Slump & curing voids indicate inadequate secondary vibration. Increase table vibrator frequency from 48Hz to 52Hz for road channels.';
    } else if (topReason.reason === 'Dimensional Drift') {
      recommendation = 'Dimensional drift detected on slab line. Tighten mould clamp bolts and check side-rail wear shims.';
    }

    insights.push({
      id: 'insight-pareto-dominant',
      type: 'warning',
      category: 'Quality',
      title: `Dominant Root Cause: ${topReason.reason} (${topReason.percentage}% of all defects)`,
      description: `${topReason.reason} accounts for ${topReason.count} rejected units today, representing the largest fraction of scrap.`,
      impactMetrics: `$${(topReason.count * ((settings.costPerDefectiveSlab + settings.costPerDefectiveChannel) / 2)).toFixed(0)} scrap loss today`,
      recommendation,
    });
  }

  return insights;
}
