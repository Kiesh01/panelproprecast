import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  FileSpreadsheet,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { DailyLog, PlantSettings } from '../../types/production';
import {
  AvailableMonth,
  fetchHistoryRange,
  fetchMonthWeeks,
  ProductionWeek,
} from '../../services/api';

export interface CatalogItem {
  code: string;
  item: string;
  description: string;
  selling_price: number;
  unit_cost: number;
  qty: number;
  target_qty?: number;
  unit?: string;
}

// Clean Slate: All variables initialized to ZERO
// Targets: Slabs = 120 pieces, Cabros = 86 sqm, 450mm Culverts = 2, 900mm Culverts = 3 (NO 600mm culverts!), Wall Coping = 120 pieces
const ZERO_CATALOG: CatalogItem[] = [
  { code: 'IN001', item: 'item1',   description: 'Road kerbs',     selling_price: 35,  unit_cost: 25,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN002', item: 'Item 2',  description: 'Shallow Drains', selling_price: 65,  unit_cost: 40,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN003', item: 'Item 3',  description: 'Paving Slabs',   selling_price: 35,  unit_cost: 25,  qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN004', item: 'Item 4',  description: '450mm culverts', selling_price: 380, unit_cost: 250, qty: 0, target_qty: 2,   unit: 'pieces' },
  { code: 'IN006', item: 'Item 6',  description: '900mm culverts', selling_price: 550, unit_cost: 375, qty: 0, target_qty: 3,   unit: 'pieces' },
  { code: 'IN007', item: 'Item 7',  description: 'Cabros',         selling_price: 130, unit_cost: 100, qty: 0, target_qty: 86,  unit: 'sqm' },
  { code: 'IN008', item: 'Item 8',  description: 'Road Channels',  selling_price: 50,  unit_cost: 35,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN009', item: 'Item 9',  description: 'Side Slabs',     selling_price: 25,  unit_cost: 15,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN010', item: 'Item 10', description: 'Wall Coping',    selling_price: 65,  unit_cost: 40,  qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN011', item: 'Item 11', description: 'Coloured Cabros', selling_price: 150, unit_cost: 115, qty: 0, target_qty: 0,   unit: 'sqm' },
  { code: '',      item: '',        description: 'manhole',        selling_price: 50,  unit_cost: 50,  qty: 0, target_qty: 0,   unit: 'pcs' },
];

interface WeeklyReportViewProps {
  allLogs: Record<string, DailyLog>;
  settings: PlantSettings;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ allLogs }) => {
  // Available months desde software inception
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([
    { id: '2026-09', name: 'September 2026', year: 2026, month: 9 },
    { id: '2026-10', name: 'October 2026', year: 2026, month: 10 },
    { id: '2026-11', name: 'November 2026', year: 2026, month: 11 },
  ]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [weeksInMonth, setWeeksInMonth] = useState<ProductionWeek[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | 'custom'>(1);

  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-05');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-10');

  // Report table state
  const [period, setPeriod] = useState<string>('09/10-15/10');
  const [items, setItems] = useState<CatalogItem[]>(ZERO_CATALOG);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedWeekDaysCount, setSelectedWeekDaysCount] = useState<number>(0);

  // 1. Load history months on mount
  useEffect(() => {
    async function loadRange() {
      const range = await fetchHistoryRange();
      if (range && range.availableMonths && range.availableMonths.length > 0) {
        setAvailableMonths(range.availableMonths);
        if (range.currentMonth) {
          setSelectedMonth(range.currentMonth);
        }
      }
    }
    loadRange();
  }, []);

  // 2. Load weeks whenever selectedMonth changes
  useEffect(() => {
    async function loadWeeks() {
      const weeks = await fetchMonthWeeks(selectedMonth);
      if (weeks && weeks.length > 0) {
        setWeeksInMonth(weeks);
        const target = weeks[0];
        setSelectedWeekNumber(target.weekNumber);
        applyWeekData(target.startDate, target.endDate, target.period, target.daysLogged);
      } else {
        generateClientWeeks(selectedMonth);
      }
    }
    loadWeeks();
  }, [selectedMonth]);

  const generateClientWeeks = (monthStr: string) => {
    const [yStr, mStr] = monthStr.split('-');
    const year = parseInt(yStr) || 2026;
    const month = parseInt(mStr) || 10;
    const weeks: ProductionWeek[] = [];

    let curr = new Date(year, month - 1, 1);
    let weekIdx = 1;

    while (curr.getMonth() === month - 1) {
      if (curr.getDay() === 0) {
        curr.setDate(curr.getDate() + 1);
        if (curr.getMonth() !== month - 1) break;
      }

      const startW = new Date(curr);
      const daysToSat = (6 - curr.getDay()) % 7;
      const endW = new Date(curr);
      endW.setDate(endW.getDate() + daysToSat);

      const sIso = startW.toISOString().split('T')[0];
      const eIso = endW.toISOString().split('T')[0];
      const pStr = `${startW.getDate().toString().padStart(2, '0')}/${(startW.getMonth() + 1).toString().padStart(2, '0')}-${endW.getDate().toString().padStart(2, '0')}/${(endW.getMonth() + 1).toString().padStart(2, '0')}`;

      let daysLogged = 0;
      let slabs = 0;
      let channels = 0;

      Object.values(allLogs).forEach(log => {
        if (log.date >= sIso && log.date <= eIso) {
          daysLogged += 1;
          (log.hourly || []).forEach(h => {
            slabs += h.slabsProduced || 0;
            channels += h.roadChannelsProduced || 0;
          });
        }
      });

      weeks.push({
        weekNumber: weekIdx,
        label: `Week ${weekIdx} (${pStr})`,
        period: pStr,
        startDate: sIso,
        endDate: eIso,
        daysLogged,
        totalSlabs: slabs,
        totalChannels: channels,
      });

      weekIdx += 1;
      curr = new Date(endW);
      curr.setDate(curr.getDate() + 2);
    }

    setWeeksInMonth(weeks);
    if (weeks.length > 0) {
      setSelectedWeekNumber(weeks[0].weekNumber);
      applyWeekData(weeks[0].startDate, weeks[0].endDate, weeks[0].period, weeks[0].daysLogged);
    }
  };

  const applyWeekData = useCallback((startDate: string, endDate: string, periodLabel: string, daysCount: number) => {
    setPeriod(periodLabel);
    setSelectedWeekDaysCount(daysCount);

    // Sum actual production from allLogs for all 9 items
    let slabsCount = 0;
    let channelsCount = 0;
    let cabrosCount = 0;
    let colouredCabrosCount = 0;
    let wallCopingCount = 0;
    let shallowDrainsCount = 0;
    let roadKerbsCount = 0;
    let culverts450Count = 0;
    let culverts900Count = 0;

    Object.values(allLogs).forEach(log => {
      if (log.date >= startDate && log.date <= endDate) {
        (log.hourly || []).forEach(h => {
          slabsCount += h.slabsProduced || 0;
          channelsCount += h.roadChannelsProduced || 0;
          cabrosCount += h.cabrosProduced || 0;
          colouredCabrosCount += h.colouredCabrosProduced || 0;
          wallCopingCount += h.wallCopingProduced || 0;
          shallowDrainsCount += h.shallowDrainsProduced || 0;
          roadKerbsCount += h.roadKerbsProduced || 0;
          culverts450Count += h.culverts450Produced || 0;
          culverts900Count += h.culverts900Produced || 0;
        });
      }
    });

    setItems(prev =>
      prev.map(item => {
        if (item.description === 'Paving Slabs') return { ...item, qty: slabsCount };
        if (item.description === 'Road Channels') return { ...item, qty: channelsCount };
        if (item.description === 'Cabros') return { ...item, qty: cabrosCount };
        if (item.description === 'Coloured Cabros') return { ...item, qty: colouredCabrosCount };
        if (item.description === 'Wall Coping') return { ...item, qty: wallCopingCount };
        if (item.description === 'Shallow Drains') return { ...item, qty: shallowDrainsCount };
        if (item.description === 'Road kerbs') return { ...item, qty: roadKerbsCount };
        if (item.description === '450mm culverts') return { ...item, qty: culverts450Count };
        if (item.description === '900mm culverts') return { ...item, qty: culverts900Count };
        return { ...item, qty: 0 };
      })
    );
  }, [allLogs]);

  const handleSelectWeek = (week: ProductionWeek) => {
    setSelectedWeekNumber(week.weekNumber);
    setCustomStartDate(week.startDate);
    setCustomEndDate(week.endDate);
    applyWeekData(week.startDate, week.endDate, week.period, week.daysLogged);
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) return;
    setSelectedWeekNumber('custom');
    const sDate = new Date(customStartDate + 'T12:00:00Z');
    const eDate = new Date(customEndDate + 'T12:00:00Z');
    const pStr = `${sDate.getDate().toString().padStart(2, '0')}/${(sDate.getMonth() + 1).toString().padStart(2, '0')}-${eDate.getDate().toString().padStart(2, '0')}/${(eDate.getMonth() + 1).toString().padStart(2, '0')}`;

    let daysCount = 0;
    Object.values(allLogs).forEach(l => {
      if (l.date >= customStartDate && l.date <= customEndDate) daysCount++;
    });

    applyWeekData(customStartDate, customEndDate, pStr, daysCount);
  };

  const handleZeroAllVariables = () => {
    setItems(ZERO_CATALOG.map(it => ({ ...it, qty: 0 })));
  };

  const handleQtyChange = (idx: number, valStr: string) => {
    const val = Math.max(0, parseInt(valStr) || 0);
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], qty: val };
      return next;
    });
  };

  const totals = useMemo(() => {
    let qtySum = 0;
    let salesSum = 0;
    let costSum = 0;

    items.forEach(it => {
      const q = it.qty || 0;
      qtySum += q;
      if (q > 0) {
        salesSum += q * it.selling_price;
        costSum += q * it.unit_cost;
      }
    });

    const profitSum = salesSum - costSum;
    const margin = salesSum > 0 ? ((profitSum / salesSum) * 100).toFixed(2) : '0.00';

    return {
      qty: qtySum,
      salesTotal: salesSum,
      costTotal: costSum,
      profit: profitSum,
      margin,
    };
  }, [items]);

  const handleDownloadExcel = async () => {
    setIsExporting(true);
    const cleanPeriod = period.replace(/[\/\\:]/g, '-');
    const filename = `Weekly_Production_Report_${cleanPeriod}.xlsx`;

    try {
      const response = await fetch('/api/reports/weekly-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          items,
          include_footnotes: true,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
        return;
      }
    } catch {
      // Fallback to client excel generator
    }

    try {
      generateClientExcel(filename);
    } finally {
      setIsExporting(false);
    }
  };

  const generateClientExcel = (filename: string) => {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0D3B66" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
   </Borders>
  </Style>
  <Style ss:ID="BlueVal">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0000FF"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
   </Borders>
  </Style>
  <Style ss:ID="FormulaVal">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0;-#,##0;&quot;-&quot;"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
   </Borders>
  </Style>
  <Style ss:ID="TextCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D7DE"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#000000"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
  </Style>
  <Style ss:ID="NoteItalic">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#444444"/>
  </Style>
  <Style ss:ID="NoteRed">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#C00000"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Weekly Report">
  <Table>
   <Column ss:Width="90"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="130"/>
   <Column ss:Width="60"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Row ss:Height="22">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Period</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Code</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Qty</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Selling Price</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sales Total</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Unit Cost</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Cost Total</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Profit</Data></Cell>
   </Row>`;

    items.forEach((row, i) => {
      const periodVal = i === 0 ? period : '';
      const qtyVal = row.qty || 0;
      const qtyCell = qtyVal > 0 ? `<Data ss:Type="Number">${qtyVal}</Data>` : '';

      xml += `
   <Row>
    <Cell ss:StyleID="TextCell"><Data ss:Type="String">${periodVal}</Data></Cell>
    <Cell ss:StyleID="TextCell"><Data ss:Type="String">${row.code || ''}</Data></Cell>
    <Cell ss:StyleID="TextCell"><Data ss:Type="String">${row.item || ''}</Data></Cell>
    <Cell ss:StyleID="TextCell"><Data ss:Type="String">${row.description}</Data></Cell>
    <Cell ss:StyleID="BlueVal">${qtyCell}</Cell>
    <Cell ss:StyleID="BlueVal"><Data ss:Type="Number">${row.selling_price}</Data></Cell>
    <Cell ss:StyleID="FormulaVal" ss:Formula="=IF(ISBLANK(R[0]C[-2]),&quot;-&quot;,IF(R[0]C[-2]&gt;0,R[0]C[-2]*R[0]C[-1],&quot;-&quot;))"></Cell>
    <Cell ss:StyleID="BlueVal"><Data ss:Type="Number">${row.unit_cost}</Data></Cell>
    <Cell ss:StyleID="FormulaVal" ss:Formula="=IF(ISBLANK(R[0]C[-4]),&quot;-&quot;,IF(R[0]C[-4]&gt;0,R[0]C[-4]*R[0]C[-1],&quot;-&quot;))"></Cell>
    <Cell ss:StyleID="FormulaVal" ss:Formula="=IF(ISBLANK(R[0]C[-5]),&quot;-&quot;,IF(R[0]C[-5]&gt;0,R[0]C[-3]-R[0]C[-1],&quot;-&quot;))"></Cell>
   </Row>`;
    });

    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${items.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${items.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${items.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${items.length}]C:R[-1]C)"></Cell>
   </Row>
   <Row></Row>
   <Row>
    <Cell ss:StyleID="NoteItalic"><Data ss:Type="String">*Note: headers are inferred (source PDF had none). Blue = values copied from PDF; black = formulas.</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="NoteRed"><Data ss:Type="String">*Source PDF showed Sales total 91,515 and profit 30,090; line items sum to 81,765 (difference 9,750). Cost total 61,425 matches.</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.xlsx', '.xls');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleApplyTargets = () => {
    setItems(prev =>
      prev.map(it => {
        let t = it.qty;
        if (it.description === 'Paving Slabs') t = 120;
        else if (it.description === 'Cabros') t = 86;
        else if (it.description === '450mm culverts') t = 2;
        else if (it.description === '900mm culverts') t = 3;
        else if (it.description === 'Wall Coping') t = 120;
        return { ...it, qty: t };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Week Selector Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Weekly Production & Financial Report
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Custom Week Picker
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Select any week from when software started ({availableMonths[0]?.name || 'Sep 2026'}) to present. Clean slate: all variables start at 0.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyTargets}
              title="Apply Operator Production Targets"
              className="px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Targets (120 Slabs, 86 Cabros, 120 WallCopy, 5 Culverts)</span>
            </button>

            <button
              type="button"
              onClick={handleZeroAllVariables}
              title="Set all variables to zero"
              className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zero All</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Excel...' : 'Download Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Month & Week Picker Grid */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Month Selector Column */}
          <div className="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>1. Select Month (From Inception):</span>
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-medium text-white focus:outline-hidden focus:border-sky-500"
            >
              {availableMonths.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Selected Period:</span>
              <span className="text-emerald-400 font-bold">{period}</span>
            </div>
          </div>

          {/* Weeks within Selected Month */}
          <div className="md:col-span-8 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Choose Production Week within {availableMonths.find(m => m.id === selectedMonth)?.name || selectedMonth}:</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">Mon–Sat Shift Schedule</span>
            </div>

            {/* Week Pills / Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {weeksInMonth.map(w => {
                const isSelected = selectedWeekNumber === w.weekNumber;
                return (
                  <button
                    key={w.weekNumber}
                    type="button"
                    onClick={() => handleSelectWeek(w)}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono">Week {w.weekNumber}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                      {w.period}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {w.daysLogged > 0 ? `${w.daysLogged} days logged` : '0 days logged'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Range Option */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Or custom date range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-mono text-xs px-2 py-1 rounded"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-mono text-xs px-2 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomRange}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-xs transition cursor-pointer"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmarks Strip */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Plant Production Benchmarks & Targets (Zero 600mm Culvert)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleApplyTargets}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            Fill Spreadsheet with Defined Targets
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg">
            <span className="text-[11px] text-slate-400 block">Paving Slabs Target</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-sky-400">120</span>
              <span className="text-[11px] text-slate-400 font-mono">pieces</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">12 pcs / hour continuous run</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg">
            <span className="text-[11px] text-slate-400 block">Cabros Target</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-teal-300">86</span>
              <span className="text-[11px] text-slate-400 font-mono">sqm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Square meters output benchmark</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg">
            <span className="text-[11px] text-slate-400 block">Culverts Target</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-amber-400">5 total</span>
              <span className="text-[11px] text-slate-400 font-mono">pcs</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">2 (450mm) + 3 (900mm) · NO 600mm</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg">
            <span className="text-[11px] text-slate-400 block">Wall Copings Target</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-cyan-400">120</span>
              <span className="text-[11px] text-slate-400 font-mono">pieces</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">12 pcs / hour continuous run</span>
          </div>
        </div>
      </div>

      {/* Summary Financial Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Total Units Produced</span>
          <p className="text-2xl font-bold font-mono text-sky-400">{totals.qty.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">
            {selectedWeekDaysCount > 0 ? `${selectedWeekDaysCount} operating days aggregated` : 'Variables at 0 (or custom)'}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Gross Sales Revenue</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">${totals.salesTotal.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Selling Price &times; Qty</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Total Production Cost</span>
          <p className="text-2xl font-bold font-mono text-amber-400">${totals.costTotal.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Unit Cost &times; Qty</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Weekly Operating Profit</span>
          <p className="text-2xl font-bold font-mono text-cyan-400">${totals.profit.toLocaleString()}</p>
          <span className="text-[10px] text-cyan-300 font-mono">{totals.margin}% Gross Margin</span>
        </div>
      </div>

      {/* Live Spreadsheet Editor Table matching Reference Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-300 font-medium">Spreadsheet Live Preview & Editor</span>
            <span className="text-[11px] text-slate-500">(Period: <strong className="text-white">{period}</strong>)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Blue = Input
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> White = Formula
            </span>
            <button
              type="button"
              onClick={handleZeroAllVariables}
              className="text-rose-400 hover:text-rose-300 underline font-sans ml-2 cursor-pointer"
            >
              Clear to Zero
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse min-w-[760px]">
            {/* Header: Dark Navy Blue (#0D3B66) matching uploaded screenshot */}
            <thead>
              <tr className="bg-[#0D3B66] text-white font-bold text-center border-b border-[#0D3B66]">
                <th className="py-2.5 px-3 border border-slate-700/60 w-24">Period</th>
                <th className="py-2.5 px-3 border border-slate-700/60 w-16">Code</th>
                <th className="py-2.5 px-3 border border-slate-700/60 w-16">Item</th>
                <th className="py-2.5 px-4 border border-slate-700/60 text-left w-40">Description</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-20">Qty</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-24">Selling Price</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-28">Sales Total</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-24">Unit Cost</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-28">Cost Total</th>
                <th className="py-2.5 px-3 border border-slate-700/60 text-right w-28">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {items.map((row, idx) => {
                const q = row.qty || 0;
                const sp = row.selling_price || 0;
                const uc = row.unit_cost || 0;

                const salesTotal = q > 0 ? q * sp : 0;
                const costTotal = q > 0 ? q * uc : 0;
                const profit = q > 0 ? salesTotal - costTotal : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {idx === 0 && (
                      <td
                        rowSpan={items.length}
                        className="py-2.5 px-3 border border-slate-700/60 text-center font-bold text-white bg-slate-900/90 align-middle"
                      >
                        {period}
                      </td>
                    )}
                    <td className="py-2 px-3 border border-slate-700/60 text-center text-slate-300">
                      {row.code}
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-center text-slate-300">
                      {row.item}
                    </td>
                    <td className="py-2 px-4 border border-slate-700/60 text-left text-slate-200 font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{row.description}</span>
                        {row.target_qty ? (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                              q >= row.target_qty
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            Target: {row.target_qty} {row.unit || 'pcs'}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-1 px-2 border border-slate-700/60 text-right">
                      <input
                        type="number"
                        min="0"
                        value={q > 0 ? q : ''}
                        placeholder="0"
                        onChange={e => handleQtyChange(idx, e.target.value)}
                        className="w-full text-right bg-transparent text-sky-400 font-bold focus:bg-slate-800 rounded px-1.5 py-0.5 border border-transparent focus:border-sky-500 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-right text-sky-400 font-bold">
                      {sp.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-right text-white">
                      {q > 0 ? salesTotal.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-right text-sky-400 font-bold">
                      {uc.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-right text-white">
                      {q > 0 ? costTotal.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-3 border border-slate-700/60 text-right text-white">
                      {q > 0 ? profit.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-600 border-b-4 border-double border-slate-600">
              <tr>
                <td className="py-2 px-3 border border-slate-800" />
                <td className="py-2 px-3 border border-slate-800" />
                <td className="py-2 px-3 border border-slate-800" />
                <td className="py-2 px-4 border border-slate-800 text-left font-bold text-white">
                  TOTAL
                </td>
                <td className="py-2 px-3 border border-slate-800 text-right text-white">
                  {totals.qty.toLocaleString()}
                </td>
                <td className="py-2 px-3 border border-slate-800" />
                <td className="py-2 px-3 border border-slate-800 text-right text-white">
                  {totals.salesTotal.toLocaleString()}
                </td>
                <td className="py-2 px-3 border border-slate-800" />
                <td className="py-2 px-3 border border-slate-800 text-right text-white">
                  {totals.costTotal.toLocaleString()}
                </td>
                <td className="py-2 px-3 border border-slate-800 text-right text-white">
                  {totals.profit.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footnotes from template */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-1 font-sans">
          <p className="text-slate-400 italic">
            *Note: headers are inferred (source PDF had none). Blue = values copied from PDF; black = formulas.*
          </p>
          <p className="text-rose-400/90 italic">
            *Source PDF showed Sales total 91,515 and profit 30,090; line items sum to 81,765 (difference 9,750). Cost total 61,425 matches.*
          </p>
        </div>
      </div>

      {/* Formula & Export Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">Native Excel Calculations Enabled</p>
            <p className="text-slate-400">
              When opened in Microsoft Excel or Google Sheets, Sales Total (<code className="text-emerald-300">=E4*F4</code>), Cost Total (<code className="text-emerald-300">=E4*H4</code>), Profit (<code className="text-emerald-300">=G4-I4</code>), and column sums are genuine live formulas.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={isExporting}
          className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download {period}.xlsx</span>
        </button>
      </div>
    </div>
  );
};
