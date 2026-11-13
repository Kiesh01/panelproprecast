import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingUp,
  Wrench,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import { generateActionableInsights } from '../../utils/analytics';

interface InsightsSimulatorViewProps {
  currentDayLog: DailyLog;
  allLogs: Record<string, DailyLog>;
  settings: PlantSettings;
}

export const InsightsSimulatorView: React.FC<InsightsSimulatorViewProps> = ({
  currentDayLog,
  allLogs,
  settings,
}) => {
  // Actionable Insights list
  const recentDays = Object.values(allLogs).slice(0, 14);
  const initialInsights = generateActionableInsights(currentDayLog, recentDays, settings);
  const [insights, setInsights] = useState(initialInsights);

  // What-If Simulator state
  const [currentDefectRate, setCurrentDefectRate] = useState(3.4);
  const [targetDefectRate, setTargetDefectRate] = useState(1.8);
  const [monthlyVolume, setMonthlyVolume] = useState(55000);
  const [avgPieceCost, setAvgPieceCost] = useState(16.5);

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: true,
    c4: false,
    c5: true,
  });

  const toggleInsightAction = (id: string) => {
    setInsights(prev =>
      prev.map(item => (item.id === id ? { ...item, actionTaken: !item.actionTaken } : item))
    );
  };

  // Calculations for What-If
  const rateReduction = Math.max(0, currentDefectRate - targetDefectRate);
  const monthlyUnitsSaved = Math.round(monthlyVolume * (rateReduction / 100));
  const monthlySavingsDollars = Math.round(monthlyUnitsSaved * avgPieceCost);
  const annualSavingsDollars = monthlySavingsDollars * 12;
  const mouldsSavedAnnual = Math.round(monthlyUnitsSaved * 1.5 * 12);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Actionable Plant Insights & Operational Efficiency Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated deterministic root-cause analysis based on hourly defect rates, mould wear cycles, and shift variances.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {insights.filter(i => i.actionTaken).length} of {insights.length} recommendations addressed
          </span>
        </div>
      </div>

      {/* Actionable Insights Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Prioritized Plant Engineering Directives
        </h3>

        {insights.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No active anomalies detected. Plant operating strictly within target tolerances.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(item => {
              const isCrit = item.type === 'critical';
              const isWarn = item.type === 'warning';
              const isPos = item.type === 'positive';

              const borderClass = isCrit
                ? 'border-rose-500/50 bg-rose-950/10'
                : isWarn
                ? 'border-amber-500/40 bg-amber-950/10'
                : isPos
                ? 'border-emerald-500/40 bg-emerald-950/10'
                : 'border-sky-500/30 bg-slate-900/60';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${borderClass} ${
                    item.actionTaken ? 'opacity-60' : 'opacity-100'
                  }`}
                >
                  <div>
                    {/* Header: Category & Type */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-300'
                            : isPos
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-sm font-bold text-slate-100 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">{item.description}</p>

                    {/* Impact metrics pill */}
                    <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono mb-3">
                      <span className="text-slate-400 block text-[10px] font-sans">Observed Impact:</span>
                      <span className="text-slate-200 font-semibold">{item.impactMetrics}</span>
                    </div>

                    {/* Action Recommendation */}
                    <div className="text-xs text-slate-300 mb-4 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                      <strong className="text-sky-300 block mb-0.5">Recommended Action:</strong>
                      {item.recommendation}
                    </div>
                  </div>

                  {/* Footer button */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {item.actionTaken ? 'Completed / Verified' : 'Pending line review'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleInsightAction(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        item.actionTaken
                          ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.actionTaken ? 'Completed' : 'Mark Action Done'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive What-If ROI & Scrap Reduction Simulator */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Interactive Defect Reduction & Financial ROI Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Model the financial impact and unit volume recovered by reducing hourly scrap rate across Slabs and Road Channels.
        </p>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Slider 1: Current Baseline */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Current Defect Rate:</span>
              <span className="font-mono font-bold text-rose-400">{currentDefectRate}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.1"
              value={currentDefectRate}
              onChange={e => setCurrentDefectRate(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0%</span>
              <span>4.0%</span>
              <span>8.0%</span>
            </div>
          </div>

          {/* Slider 2: Target Defect Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Optimized Target:</span>
              <span className="font-mono font-bold text-emerald-400">{targetDefectRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max={currentDefectRate}
              step="0.1"
              value={Math.min(targetDefectRate, currentDefectRate)}
              onChange={e => setTargetDefectRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5% (Elite)</span>
              <span>2.0% (Standard)</span>
              <span>{currentDefectRate}%</span>
            </div>
          </div>

          {/* Slider 3: Monthly Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Monthly Output:</span>
              <span className="font-mono font-bold text-sky-400">
                {monthlyVolume.toLocaleString()} pcs
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="100000"
              step="2500"
              value={monthlyVolume}
              onChange={e => setMonthlyVolume(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20k</span>
              <span>60k</span>
              <span>100k</span>
            </div>
          </div>

          {/* Slider 4: Unit Scrap Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Avg Piece Scrap Cost:</span>
              <span className="font-mono font-bold text-amber-400">${avgPieceCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="8.0"
              max="35.0"
              step="0.5"
              value={avgPieceCost}
              onChange={e => setAvgPieceCost(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$8</span>
              <span>$20</span>
              <span>$35</span>
            </div>
          </div>
        </div>

        {/* Projected Returns Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-950 border border-slate-800 rounded-xl">
          <div>
            <span className="text-[11px] font-sans text-slate-400 block mb-1">Defect Reduction Gain</span>
            <p className="text-2xl font-bold font-mono text-emerald-400">
              -{rateReduction.toFixed(1)}%
            </p>
            <span className="text-[11px] font-mono text-slate-500 mt-1 block">
              Shift improvement
            </span>
          </div>

          <div>
            <span className="text-[11px] font-sans text-slate-400 block mb-1">Monthly Pieces Recovered</span>
            <p className="text-2xl font-bold font-mono text-sky-400">
              +{monthlyUnitsSaved.toLocaleString()}
            </p>
            <span className="text-[11px] font-mono text-slate-500 mt-1 block">
              Saleable slabs & channels
            </span>
          </div>

          <div>
            <span className="text-[11px] font-sans text-slate-400 block mb-1">Monthly Cost Savings</span>
            <p className="text-2xl font-bold font-mono text-amber-400">
              ${monthlySavingsDollars.toLocaleString()}
            </p>
            <span className="text-[11px] font-mono text-slate-500 mt-1 block">
              Direct scrap elimination
            </span>
          </div>

          <div>
            <span className="text-[11px] font-sans text-slate-400 block mb-1">Annual Projected ROI</span>
            <p className="text-2xl font-bold font-mono text-emerald-400">
              ${annualSavingsDollars.toLocaleString()}
            </p>
            <span className="text-[11px] font-mono text-slate-500 mt-1 block">
              ~{mouldsSavedAnnual.toLocaleString()} mould cycles conserved
            </span>
          </div>
        </div>
      </div>

      {/* Daily Shift Quality Checklist */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Standard Operating Quality Verification Checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { id: 'c1', title: 'Table Vibrator Frequency Calibration (50Hz ± 1.5Hz)', desc: 'Prevents honeycomb voids in road channel drainage profiles.' },
            { id: 'c2', title: 'Hydraulic Demoulding Clamp Pressure (165 Bar)', desc: 'Prevents micro-fractures and perimeter edge chipping during stripping.' },
            { id: 'c3', title: 'Aggregate Moisture Sensor Probe Check', desc: 'Ensures water-cement ratio consistency across hourly concrete batches.' },
            { id: 'c4', title: 'Mould Release Oil Nozzle Uniformity Audit', desc: 'Eliminates surface bleed and adhesion tears on slab face.' },
            { id: 'c5', title: 'End-of-Shift Mould Ultrasonic Washdown', desc: 'Prevents grout accumulation on mould corners and dimension drift.' },
          ].map(item => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={checklist[item.id] || false}
                onChange={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="mt-0.5 rounded text-sky-500 focus:ring-0 accent-sky-500"
              />
              <div>
                <span className={`font-semibold block ${checklist[item.id] ? 'text-slate-200 line-through' : 'text-slate-100'}`}>
                  {item.title}
                </span>
                <span className="text-slate-400 text-[11px]">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
