import React from 'react';
import { Settings, Plus, Printer, Database, FileSpreadsheet, Download } from 'lucide-react';
import { MongoHealthStatus } from '../services/api';

export type ActiveTab = 'realtime' | 'daily' | 'monthly' | 'yearly' | 'insights' | 'weekly';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenForgottenModal?: () => void;
  mongoStatus?: MongoHealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenLogModal,
  onOpenSettings,
  onOpenReport,
  onOpenForgottenModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Company Logo & Brand Name */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Panelpro Precast and Logistics Ltd"
              className="h-10 w-auto max-w-[170px] object-contain rounded bg-white/95 px-1.5 py-0.5 shadow-xs"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-white uppercase whitespace-nowrap leading-tight">
                Panelpro
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap leading-tight">
                Precast &amp; Logistics Ltd
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => onTabChange('realtime')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'realtime'
                  ? 'text-sky-400 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Real-Time Monitor
            </button>

            <button
              type="button"
              onClick={() => onTabChange('daily')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'daily'
                  ? 'text-sky-400 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Daily Operations
            </button>

            <button
              type="button"
              onClick={() => onTabChange('monthly')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'monthly'
                  ? 'text-sky-400 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Monthly Analytics
            </button>

            <button
              type="button"
              onClick={() => onTabChange('yearly')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'yearly'
                  ? 'text-sky-400 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Yearly Insights
            </button>

            <button
              type="button"
              onClick={() => onTabChange('insights')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'insights'
                  ? 'text-sky-400 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Actionable Insights & ROI
            </button>

            <button
              type="button"
              onClick={() => onTabChange('weekly')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'weekly'
                  ? 'text-emerald-400 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Weekly Excel Report</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('weekly')}
              title="Download Weekly Production & Financial Report (.xlsx)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel Report</span>
            </button>

            {onOpenForgottenModal && (
              <button
                type="button"
                onClick={onOpenForgottenModal}
                title="Log Forgotten Day Production"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Forgotten Day</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenReport}
              title="Print Shift Handover Report"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>


            <button
              type="button"
              onClick={onOpenSettings}
              title="Plant Configuration & Targets"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Hour Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto gap-4 py-2 border-t border-slate-900 text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('realtime')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'realtime' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Real-Time
          </button>
          <button
            type="button"
            onClick={() => onTabChange('daily')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'daily' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onTabChange('monthly')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'monthly' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onTabChange('yearly')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'yearly' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Yearly
          </button>
          <button
            type="button"
            onClick={() => onTabChange('insights')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'insights' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Insights & ROI
          </button>
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`whitespace-nowrap px-2 py-1 flex items-center gap-1 ${activeTab === 'weekly' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span>Weekly Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
