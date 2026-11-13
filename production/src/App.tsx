/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Header } from './components/Header';
import { ShiftBanner } from './components/ShiftBanner';
import { RealTimeView } from './components/views/RealTimeView';
import { DailyLogView } from './components/views/DailyLogView';
import { MonthlyView } from './components/views/MonthlyView';
import { YearlyView } from './components/views/YearlyView';
import { InsightsSimulatorView } from './components/views/InsightsSimulatorView';
import { WeeklyReportView } from './components/views/WeeklyReportView';
import { LogHourModal } from './components/modals/LogHourModal';
import { BatchDayModal } from './components/modals/BatchDayModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ReportPrintModal } from './components/modals/ReportPrintModal';
import { ForgottenDayModal } from './components/modals/ForgottenDayModal';
import { DailyLog, HourlyRecord, PlantSettings } from './types/production';
import {
  deleteHourlyRecord,
  exportLogsToCSV,
  getDailyLog,
  loadDailyLogs,
  loadSettings,
  resetToSampleData,
  saveDailyLogs,
  saveSettings,
  upsertHourlyRecord,
} from './services/storage';
import {
  deleteHourlyFromDb,
  fetchAllLogsFromDb,
  fetchDayLogFromDb,
  fetchMongoHealth,
  MongoHealthStatus,
  reseedMongoDb,
  resetDbToZero,
  saveBatchDayToDb,
  saveHourlyToDb,
  saveForgottenDayToDb,
} from './services/api';
import { createBlankHour, createTypicalHour } from './utils/dataGenerator';


export default function App() {
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => loadDailyLogs());
  const [settings, setSettings] = useState<PlantSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('realtime');
  const [currentDate, setCurrentDate] = useState<string>('2026-10-26');
  const [mongoStatus, setMongoStatus] = useState<MongoHealthStatus | null>(null);

  // Modal visibility states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HourlyRecord | null>(null);
  const [targetHour, setTargetHour] = useState<number>(8);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isForgottenModalOpen, setIsForgottenModalOpen] = useState(false);

  // Live simulation state
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  // Load from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;

    async function initFromMongo() {
      const health = await fetchMongoHealth();
      if (isMounted) setMongoStatus(health);

      if (health.connected) {
        const dbLogs = await fetchAllLogsFromDb();
        if (isMounted && Object.keys(dbLogs).length > 0) {
          setLogs(prev => ({ ...prev, ...dbLogs }));
          saveDailyLogs(dbLogs);
        }
      }
    }

    initFromMongo();

    // Check status periodically
    const healthInterval = setInterval(async () => {
      const health = await fetchMongoHealth();
      if (isMounted) setMongoStatus(health);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(healthInterval);
    };
  }, []);

  // Fetch active day from MongoDB if not cached
  useEffect(() => {
    async function checkDay() {
      if (mongoStatus?.connected) {
        const dbDay = await fetchDayLogFromDb(currentDate);
        if (dbDay) {
          setLogs(prev => ({ ...prev, [currentDate]: dbDay }));
        }
      }
    }
    checkDay();
  }, [currentDate, mongoStatus?.connected]);

  // Active day log
  const currentDayLog = getDailyLog(currentDate, logs, settings);

  // Handlers
  const handleOpenLogModal = (record?: HourlyRecord | null, hour?: number) => {
    setEditingRecord(record || null);
    if (hour !== undefined) {
      setTargetHour(hour);
    } else if (currentDayLog.hourly.length > 0) {
      const last = currentDayLog.hourly[currentDayLog.hourly.length - 1].hour;
      setTargetHour(last >= 16 ? 7 : last + 1);
    } else {
      setTargetHour(7);
    }
    setIsLogModalOpen(true);
  };

  const handleSaveHourlyRecord = async (record: HourlyRecord) => {
    // 1. Optimistic local update
    const updated = upsertHourlyRecord(currentDate, record, logs, settings);
    setLogs(updated);

    // 2. Persist to MongoDB Atlas via Python API
    const remoteLog = await saveHourlyToDb(currentDate, record);
    if (remoteLog) {
      setLogs(prev => ({ ...prev, [currentDate]: remoteLog }));
      // Update doc count in status
      setMongoStatus(prev => (prev ? { ...prev, documentCount: Object.keys(updated).length } : prev));
    }
  };

  const handleDeleteHour = async (hour: number) => {
    const updated = deleteHourlyRecord(currentDate, hour, logs);
    setLogs(updated);

    // Persist delete to MongoDB
    await deleteHourlyFromDb(currentDate, hour);
  };

  const handleSaveDay = async (dayLog: DailyLog) => {
    const updated = {
      ...logs,
      [currentDate]: dayLog,
    };
    saveDailyLogs(updated);
    setLogs(updated);

    // Persist full day to MongoDB
    const remoteLog = await saveBatchDayToDb(dayLog);
    if (remoteLog) {
      setLogs(prev => ({ ...prev, [currentDate]: remoteLog }));
    }
  };

  const handleSaveForgottenDay = async (dayData: any) => {
    const targetD = dayData.date;
    const remoteLog = await saveForgottenDayToDb(dayData);
    if (remoteLog) {
      const updated = { ...logs, [targetD]: remoteLog };
      setLogs(updated);
      saveDailyLogs(updated);
      setCurrentDate(targetD);
    } else {
      const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const count = hours.length;
      const providedHourly = Array.isArray(dayData.hourly) && dayData.hourly.length > 0
        ? dayData.hourly
        : (Array.isArray(dayData.hourlyRecords) && dayData.hourlyRecords.length > 0 ? dayData.hourlyRecords : null);
      const hourly = providedHourly
        ? providedHourly.map((hr: any) => ({
            ...createBlankHour(hr.hour, targetD),
            ...hr,
          }))
        : hours.map((h, idx) => {
            const blank = createBlankHour(h, targetD);
            const isFirst = idx === 0;
            return {
              ...blank,
              slabsProduced: Math.floor((dayData.slabsProduced || 0) / count) + (isFirst ? (dayData.slabsProduced || 0) % count : 0),
              roadChannelsProduced: Math.floor((dayData.roadChannelsProduced || 0) / count) + (isFirst ? (dayData.roadChannelsProduced || 0) % count : 0),
              cabrosProduced: Math.floor((dayData.cabrosProduced || 0) / count) + (isFirst ? (dayData.cabrosProduced || 0) % count : 0),
              colouredCabrosProduced: Math.floor((dayData.colouredCabrosProduced || 0) / count) + (isFirst ? (dayData.colouredCabrosProduced || 0) % count : 0),
              wallCopingProduced: Math.floor((dayData.wallCopingProduced || 0) / count) + (isFirst ? (dayData.wallCopingProduced || 0) % count : 0),
              shallowDrainsProduced: Math.floor((dayData.shallowDrainsProduced || 0) / count) + (isFirst ? (dayData.shallowDrainsProduced || 0) % count : 0),
              roadKerbsProduced: Math.floor((dayData.roadKerbsProduced || 0) / count) + (isFirst ? (dayData.roadKerbsProduced || 0) % count : 0),
              culverts450Produced: Math.floor((dayData.culverts450Produced || 0) / count) + (isFirst ? (dayData.culverts450Produced || 0) % count : 0),
              culverts900Produced: Math.floor((dayData.culverts900Produced || 0) / count) + (isFirst ? (dayData.culverts900Produced || 0) % count : 0),
              mouldsProduced: Math.floor((dayData.mouldsProduced || 0) / count) + (isFirst ? (dayData.mouldsProduced || 0) % count : 0),
              defectiveSlabs: isFirst ? (dayData.defectiveSlabs || 0) : 0,
              defectiveChannels: isFirst ? (dayData.defectiveChannels || 0) : 0,
              defectiveCabros: isFirst ? (dayData.defectiveCabros || 0) : 0,
              defectiveColouredCabros: isFirst ? (dayData.defectiveColouredCabros || 0) : 0,
              defectiveWallCoping: isFirst ? (dayData.defectiveWallCoping || 0) : 0,
              defectiveShallowDrains: isFirst ? (dayData.defectiveShallowDrains || 0) : 0,
              defectiveRoadKerbs: isFirst ? (dayData.defectiveRoadKerbs || 0) : 0,
              defectiveCulverts450: isFirst ? (dayData.defectiveCulverts450 || 0) : 0,
              defectiveCulverts900: isFirst ? (dayData.defectiveCulverts900 || 0) : 0,
              primaryDefectReason: dayData.primaryDefectReason || 'None',
              notes: isFirst ? (dayData.notes || '') : '',
            };
          });
      const newDoc: DailyLog = {
        date: targetD,
        supervisor: dayData.supervisor || 'Plant Shift Lead',
        line: 'Precast Operations',
        status: 'completed',
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
        shiftNotes: dayData.notes || '',
      };
      const updated = { ...logs, [targetD]: newDoc };
      setLogs(updated);
      saveDailyLogs(updated);
      setCurrentDate(targetD);
    }
  };


  const handleSaveSettings = (newSettings: PlantSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetData = async () => {
    // Reset MongoDB Atlas to clean slate 0
    await resetDbToZero();
    const res = resetToSampleData();
    setLogs(res.logs);
    setSettings(res.settings);
    saveDailyLogs(res.logs);
    const health = await fetchMongoHealth();
    setMongoStatus(health);
  };

  const handleExportCSV = () => {
    const csvContent = exportLogsToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `panelpro_stats_export_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step next hour simulation tick
  const handleStepNextHour = useCallback(async () => {
    const existing = currentDayLog.hourly;
    let nextH = 7;
    if (existing.length > 0) {
      const lastHour = existing[existing.length - 1].hour;
      nextH = lastHour >= 16 ? 7 : lastHour + 1;
    }

    const newRecord = createTypicalHour(nextH, currentDate, Math.random() * 10);
    const updated = upsertHourlyRecord(currentDate, newRecord, logs, settings);
    setLogs(updated);

    // Sync to MongoDB
    await saveHourlyToDb(currentDate, newRecord);
  }, [currentDate, currentDayLog.hourly, logs, settings]);

  // Live simulation timer
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      handleStepNextHour();
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveSimulating, handleStepNextHour]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Navigation Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogModal={() => handleOpenLogModal(null)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenForgottenModal={() => setIsForgottenModalOpen(true)}
        mongoStatus={mongoStatus}
      />


      {/* Real-time Shift Telemetry Banner */}
      <ShiftBanner
        currentDayLog={currentDayLog}
        settings={settings}
        isLiveSimulating={isLiveSimulating}
        onToggleSim={() => setIsLiveSimulating(p => !p)}
        onStepNextHour={handleStepNextHour}
        mongoStatus={mongoStatus}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'realtime' && (
          <RealTimeView
            currentDayLog={currentDayLog}
            settings={settings}
            onOpenLogModal={handleOpenLogModal}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}

        {activeTab === 'daily' && (
          <DailyLogView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            dayLog={currentDayLog}
            settings={settings}
            onOpenLogModal={handleOpenLogModal}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onOpenForgottenModal={() => setIsForgottenModalOpen(true)}
            onDeleteHour={handleDeleteHour}
            allLogs={logs}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyView
            allLogs={logs}
            settings={settings}
            onSelectDate={date => {
              setCurrentDate(date);
              setActiveTab('daily');
            }}
          />
        )}

        {activeTab === 'yearly' && (
          <YearlyView allLogs={logs} settings={settings} />
        )}

        {activeTab === 'insights' && (
          <InsightsSimulatorView
            currentDayLog={currentDayLog}
            allLogs={logs}
            settings={settings}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReportView
            allLogs={logs}
            settings={settings}
          />
        )}
      </main>


      {/* Modals */}
      <ForgottenDayModal
        isOpen={isForgottenModalOpen}
        onClose={() => setIsForgottenModalOpen(false)}
        targetDate={currentDate}
        onDateChange={setCurrentDate}
        onSaveDay={handleSaveForgottenDay}
        existingDoc={logs[currentDate]}
        settings={settings}
        allLogs={logs}
      />

      <LogHourModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveHourlyRecord}
        initialRecord={editingRecord}
        targetHour={targetHour}
        dateStr={currentDate}
        settings={settings}
      />


      <BatchDayModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        dateStr={currentDate}
        settings={settings}
        onSaveDay={handleSaveDay}
        currentDayLog={currentDayLog}
        allLogs={logs}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
      />

      <ReportPrintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dayLog={currentDayLog}
        settings={settings}
      />
    </div>
  );
}
