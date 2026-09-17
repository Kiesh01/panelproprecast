import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Calendar,
  Layers,
  Coins,
  TrendingUp,
  Users,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Filter,
  BarChart3,
  Globe,
} from 'lucide-react';

interface AdcashReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportRow {
  earnings: string | number;
  unique_users: number;
  clicks: number;
  unique_users_fallback?: number;
  unique_users_overcapped?: number;
  unique_users_rejected?: number;
  date?: string;
  zone?: string;
  unique_users_ecpm?: string | number;
  parent_zone?: string | null;
  [key: string]: any;
}

interface AdcashData {
  rows?: ReportRow[];
  total?: {
    earnings?: string | number;
    clicks?: number;
    unique_users?: number;
  };
}

export const AdcashReportingModal: React.FC<AdcashReportingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdcashData | null>(null);
  const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<'today' | '7days' | '14days' | '30days'>('7days');
  const [groupBy, setGroupBy] = useState<'date,zone' | 'date' | 'zone'>('date,zone');

  const calculateDates = (range: string) => {
    const end = new Date().toISOString().split('T')[0];
    let startDays = 7;
    if (range === 'today') startDays = 0;
    if (range === '7days') startDays = 7;
    if (range === '14days') startDays = 14;
    if (range === '30days') startDays = 30;

    const start = new Date(Date.now() - startDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return { start, end };
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = calculateDates(dateRange);
      const res = await fetch(
        `/api/adcash/reports?start_date=${start}&end_date=${end}&group_by=${groupBy}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not retrieve Adcash statistics.');
      }

      setData(json.data || { rows: [] });
      if (json.balance) {
        setBalance(json.balance);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen, dateRange, groupBy]);

  if (!isOpen) return null;

  // Aggregate metrics
  const rows = data?.rows || [];
  const totalEarnings = rows.reduce(
    (acc, r) => acc + (parseFloat(String(r.earnings || '0')) || 0),
    0
  );
  const totalVisitors = rows.reduce((acc, r) => acc + (Number(r.unique_users) || 0), 0);
  const totalClicks = rows.reduce((acc, r) => acc + (Number(r.clicks) || 0), 0);
  const avgEcpm =
    totalVisitors > 0 ? ((totalEarnings / totalVisitors) * 1000).toFixed(2) : '0.00';

  // Zone names helper for known zones
  const getZoneLabel = (zoneId?: string) => {
    if (!zoneId) return 'All Zones';
    if (zoneId === '12159754' || zoneId === 'qce6cxsl8n')
      return `Zone qce6cxsl8n (#${zoneId})`;
    if (zoneId === '12159756' || zoneId === 'snghyb82a' || zoneId === 'yfktraw69n')
      return `Zone snghyb82a (#${zoneId})`;
    return `Zone #${zoneId}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      id="adcash-reporting-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Adcash Publisher Reporting
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live API v.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Publisher Analytics &bull; Zone Performance &amp; Real-Time Earnings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Range Pills */}
            <div className="inline-flex bg-white rounded-lg border border-slate-200 p-0.5 text-xs font-medium text-slate-700 shadow-xs">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  dateRange === 'today'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'hover:text-blue-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('7days')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  dateRange === '7days'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'hover:text-blue-600'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange('14days')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  dateRange === '14days'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'hover:text-blue-600'
                }`}
              >
                Last 14 Days
              </button>
              <button
                onClick={() => setDateRange('30days')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  dateRange === '30days'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'hover:text-blue-600'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* Group By Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="date,zone">Date &amp; Zone</option>
                <option value="date">Date Only</option>
                <option value="zone">Zone Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <a
              href="https://adcash.myadcash.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              <span>Adcash Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Unable to fetch reporting data:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Metrics KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Balance */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Account Balance</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {balance
                  ? `${balance.currency} ${Number(balance.balance).toFixed(2)}`
                  : 'EUR 0.00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Available for payout</div>
            </div>

            {/* Total Period Earnings */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Period Earnings</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                EUR {totalEarnings.toFixed(4)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                From {rows.length} reporting row(s)
              </div>
            </div>

            {/* Unique Visitors / Impressions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Unique Visitors</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalVisitors.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Avg eCPM: <span className="font-semibold text-slate-700">EUR {avgEcpm}</span>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Total Clicks</span>
                <MousePointerClick className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalClicks.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                CTR:{' '}
                <span className="font-semibold text-slate-700">
                  {totalVisitors > 0
                    ? `${((totalClicks / totalVisitors) * 100).toFixed(2)}%`
                    : '0.00%'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Adcash Zones on PanelPro */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="font-bold text-blue-950">Active Connected Zones:</span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-mono font-semibold">
                    qce6cxsl8n
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-mono font-semibold">
                    snghyb82a
                  </span>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bearer token securely authenticated server-side</span>
            </div>
          </div>

          {/* Granular Statistics Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Breakdown Data ({rows.length} records)
              </h3>
              <span className="text-[11px] text-slate-500">
                Grouped by <strong className="text-slate-700">{groupBy}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    {groupBy.includes('date') && <th className="py-3 px-4">Date</th>}
                    {groupBy.includes('zone') && <th className="py-3 px-4">Zone ID</th>}
                    <th className="py-3 px-4 text-right">Unique Visitors</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">eCPM (EUR)</th>
                    <th className="py-3 px-4 text-right">Earnings (EUR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Fetching metrics from Adcash API...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No traffic or earnings records found for this period yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/40 transition-colors text-slate-800"
                      >
                        {groupBy.includes('date') && (
                          <td className="py-2.5 px-4 font-medium text-slate-700">
                            {row.date || '—'}
                          </td>
                        )}
                        {groupBy.includes('zone') && (
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                            {getZoneLabel(row.zone)}
                          </td>
                        )}
                        <td className="py-2.5 px-4 text-right font-medium">
                          {Number(row.unique_users || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium">
                          {Number(row.clicks || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-600">
                          {parseFloat(String(row.unique_users_ecpm || '0')).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                          EUR {parseFloat(String(row.earnings || '0')).toFixed(4)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {rows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200">
                      <td
                        colSpan={
                          groupBy === 'date,zone' ? 2 : 1
                        }
                        className="py-3 px-4 uppercase text-[11px] tracking-wider"
                      >
                        Total / Summary
                      </td>
                      <td className="py-3 px-4 text-right">
                        {totalVisitors.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {totalClicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        EUR {avgEcpm}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-extrabold text-sm">
                        EUR {totalEarnings.toFixed(4)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Footer info & Dismiss */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Adcash Publisher API v.2 &bull; 60 requests/min rate limit</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
