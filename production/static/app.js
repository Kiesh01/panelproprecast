// Panelpro Precast & Logistics Ltd - Standalone Pure JavaScript Client (Zero Node.js / Zero npm)
// Fully synchronized with React UI and Cloud Backend (Panelpro.Stats)

let currentDate = '2026-10-26';
let currentDayLog = null;
let allLogsCache = {};
let calendarViewYear = 2026;
let calendarViewMonth = 10; // 1-12
let isVisualCalendarOpen = false;
let isBatchCalendarOpen = false;
let isForgotCalendarOpen = true;

const OPERATING_SLOTS = [
  { hour: 7, label: '07:30 - 08:30', shift: 'Morning Run' },
  { hour: 8, label: '08:30 - 09:30', shift: 'Morning Run' },
  { hour: 9, label: '09:30 - 10:30', shift: 'Morning Run' },
  { hour: 10, label: '10:30 - 11:30', shift: 'Morning Run' },
  { hour: 11, label: '11:30 - 12:30', shift: 'Morning Run' },
  { hour: 12, label: '12:30 - 13:30', shift: 'Midday Transition' },
  { hour: 13, label: '13:30 - 14:30', shift: 'Afternoon Run' },
  { hour: 14, label: '14:30 - 15:30', shift: 'Afternoon Run' },
  { hour: 15, label: '15:30 - 16:30', shift: 'Afternoon Run' },
  { hour: 16, label: '16:30 - 17:00', shift: 'Afternoon Run' },
];

function formatSlot(hour) {
  const found = OPERATING_SLOTS.find(s => s.hour === hour);
  return found ? found.label : `${hour}:00 - ${hour + 1}:00`;
}

// -------------------------------------------------------------
// 1. Initial Load & Mongo Status Check
// -------------------------------------------------------------
async function init() {
  const dateInput = document.getElementById('daily-date-picker');
  if (dateInput) dateInput.value = currentDate;
  const chartDate = document.getElementById('rt-chart-date');
  if (chartDate) chartDate.textContent = currentDate;

  await checkMongoHealth();
  await loadMonthLogsForCache('2026-10');
  await loadDayData(currentDate);
  loadMonthlyAnalytics('2026-10');
  loadYearlyAnalytics(2026);
  updateSimulator();
  initWeeklyReport();

  renderAllCalendars();
}

async function checkMongoHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.connected) {
      const bannerStatus = document.getElementById('banner-mongo-status');
      if (bannerStatus) bannerStatus.textContent = 'Live';
      const bannerCount = document.getElementById('banner-doc-count');
      if (bannerCount) bannerCount.textContent = `(${data.documentCount} days stored)`;
    } else {
      const bannerStatus = document.getElementById('banner-mongo-status');
      if (bannerStatus) bannerStatus.textContent = 'Connecting...';
    }
  } catch (err) {
    console.warn('Backend not responding yet:', err);
  }
}

async function loadMonthLogsForCache(monthStr) {
  try {
    const res = await fetch(`/api/stats/month?month=${monthStr}`);
    const data = await res.json();
    if (data && data.logs) {
      data.logs.forEach(l => {
        allLogsCache[l.date] = l;
      });
    }
  } catch (err) {
    console.warn('Could not cache month logs:', err);
  }
}

// -------------------------------------------------------------
// 2. Fetch Day Data from Python API
// -------------------------------------------------------------
async function loadDayData(dateStr) {
  currentDate = dateStr;
  const datePicker = document.getElementById('daily-date-picker');
  if (datePicker) datePicker.value = dateStr;
  const chartDate = document.getElementById('rt-chart-date');
  if (chartDate) chartDate.textContent = dateStr;

  // Sync calendar month view with selected date
  const parts = dateStr.split('-');
  calendarViewYear = parseInt(parts[0], 10);
  calendarViewMonth = parseInt(parts[1], 10);

  // Check Sunday
  const d = new Date(dateStr + 'T12:00:00Z');
  const isSunday = (d.getDay() === 0);
  const sundayAlert = document.getElementById('sunday-maintenance-alert');
  if (sundayAlert) {
    sundayAlert.classList.toggle('hidden', !isSunday);
  }

  try {
    const res = await fetch(`/api/stats/day?date=${dateStr}`);
    const data = await res.json();
    if (data.found && data.log) {
      currentDayLog = data.log;
      allLogsCache[dateStr] = data.log;
    } else {
      currentDayLog = {
        date: dateStr,
        hourly: [],
        totalSlabs: 0,
        totalChannels: 0,
        totalCabros: 0,
        totalColouredCabros: 0,
        totalWallCoping: 0,
        totalShallowDrains: 0,
        totalRoadKerbs: 0,
        totalCulverts450: 0,
        totalCulverts900: 0,
        totalSideSlabs: 0,
        totalMoulds: 0,
        totalDefects: 0,
        totalProduced: 0,
        defectRate: 0.0,
        supervisor: 'Marcus Vance',
      };
    }
    renderAllDayViews();
    renderAllCalendars();
  } catch (err) {
    console.error('Failed to load day data:', err);
  }
}

// -------------------------------------------------------------
// 3. Render All Day Views & Scorecards
// -------------------------------------------------------------
function renderAllDayViews() {
  if (!currentDayLog) return;

  const hourly = currentDayLog.hourly || [];
  
  // Calculate or retrieve totals
  const totalSlabs = currentDayLog.totalSlabs ?? hourly.reduce((sum, h) => sum + (h.slabsProduced || 0), 0);
  const totalChannels = currentDayLog.totalChannels ?? hourly.reduce((sum, h) => sum + (h.roadChannelsProduced || 0), 0);
  const totalCabros = currentDayLog.totalCabros ?? hourly.reduce((sum, h) => sum + (h.cabrosProduced || 0), 0);
  const totalColouredCabros = currentDayLog.totalColouredCabros ?? hourly.reduce((sum, h) => sum + (h.colouredCabrosProduced || 0), 0);
  const totalWallCoping = currentDayLog.totalWallCoping ?? hourly.reduce((sum, h) => sum + (h.wallCopingProduced || 0), 0);
  const totalShallowDrains = currentDayLog.totalShallowDrains ?? hourly.reduce((sum, h) => sum + (h.shallowDrainsProduced || 0), 0);
  const totalRoadKerbs = currentDayLog.totalRoadKerbs ?? hourly.reduce((sum, h) => sum + (h.roadKerbsProduced || 0), 0);
  const totalCulverts450 = currentDayLog.totalCulverts450 ?? hourly.reduce((sum, h) => sum + (h.culverts450Produced || 0), 0);
  const totalCulverts900 = currentDayLog.totalCulverts900 ?? hourly.reduce((sum, h) => sum + (h.culverts900Produced || 0), 0);
  const totalSideSlabs = currentDayLog.totalSideSlabs ?? hourly.reduce((sum, h) => sum + (h.sideSlabsProduced || 0), 0);
  const totalMoulds = currentDayLog.totalMoulds ?? hourly.reduce((sum, h) => sum + (h.mouldsProduced || 0), 0);

  const totalCulverts = totalCulverts450 + totalCulverts900;
  const totalProduced = currentDayLog.totalProduced ?? (
    totalSlabs + totalChannels + totalCabros + totalColouredCabros + totalWallCoping +
    totalShallowDrains + totalRoadKerbs + totalCulverts450 + totalCulverts900 + totalSideSlabs
  );

  const totalDefects = currentDayLog.totalDefects ?? hourly.reduce((sum, h) => {
    return sum + (h.defectiveSlabs || 0) + (h.defectiveChannels || 0) + (h.defectiveCabros || 0) +
      (h.defectiveColouredCabros || 0) + (h.defectiveWallCoping || 0) + (h.defectiveShallowDrains || 0) +
      (h.defectiveRoadKerbs || 0) + (h.defectiveCulverts450 || 0) + (h.defectiveCulverts900 || 0) +
      (h.defectiveSideSlabs || 0);
  }, 0);

  const defectRate = totalProduced > 0 ? ((totalDefects / totalProduced) * 100) : 0.0;

  // Banner
  const bannerDefect = document.getElementById('banner-defect-rate');
  if (bannerDefect) bannerDefect.textContent = `${defectRate.toFixed(2)}%`;
  const bannerSup = document.getElementById('banner-supervisor');
  if (bannerSup) bannerSup.textContent = `Sup: ${currentDayLog.supervisor || 'Marcus Vance'}`;

  // Empty state alert if no hourly records logged for this workday
  const emptyAlert = document.getElementById('daily-empty-alert');
  if (emptyAlert) {
    const d = new Date(currentDate + 'T12:00:00Z');
    const isSunday = (d.getDay() === 0);
    emptyAlert.classList.toggle('hidden', isSunday || hourly.length > 0);
  }

  // Real-Time Header Metric Cards
  const latestHour = hourly.length > 0 ? hourly[hourly.length - 1] : null;
  const currentSlabs = latestHour ? (latestHour.slabsProduced || 0) : 0;
  const currentChannels = latestHour ? (latestHour.roadChannelsProduced || 0) : 0;
  const currentMoulds = latestHour ? (latestHour.mouldsProduced || 0) : 0;
  const currentDefRate = latestHour ? (latestHour.defectRate || 0.0) : 0.0;

  const rtSlabRate = document.getElementById('rt-slab-rate');
  if (rtSlabRate) rtSlabRate.textContent = currentSlabs;
  const rtSlabTotal = document.getElementById('rt-slab-total');
  if (rtSlabTotal) rtSlabTotal.textContent = totalSlabs.toLocaleString();
  const rtSlabPct = document.getElementById('rt-slab-pct');
  if (rtSlabPct) rtSlabPct.textContent = `${Math.round((currentSlabs / 12) * 100)}% Target`;
  const rtSlabBar = document.getElementById('rt-slab-bar');
  if (rtSlabBar) rtSlabBar.style.width = `${Math.min(100, (currentSlabs / 12) * 100)}%`;

  const rtChanRate = document.getElementById('rt-channel-rate');
  if (rtChanRate) rtChanRate.textContent = currentChannels;
  const rtChanTotal = document.getElementById('rt-channel-total');
  if (rtChanTotal) rtChanTotal.textContent = totalChannels.toLocaleString();
  const rtChanPct = document.getElementById('rt-channel-pct');
  if (rtChanPct) rtChanPct.textContent = `${Math.round((currentChannels / 6) * 100)}% Target`;
  const rtChanBar = document.getElementById('rt-channel-bar');
  if (rtChanBar) rtChanBar.style.width = `${Math.min(100, (currentChannels / 6) * 100)}%`;

  const rtMouldRate = document.getElementById('rt-mould-rate');
  if (rtMouldRate) rtMouldRate.textContent = currentMoulds;
  const rtMouldTotal = document.getElementById('rt-mould-total');
  if (rtMouldTotal) rtMouldTotal.textContent = totalMoulds.toLocaleString();
  const rtMouldPct = document.getElementById('rt-mould-pct');
  if (rtMouldPct) rtMouldPct.textContent = `${Math.round((currentMoulds / 14) * 100)}% Target`;
  const rtMouldBar = document.getElementById('rt-mould-bar');
  if (rtMouldBar) rtMouldBar.style.width = `${Math.min(100, (currentMoulds / 14) * 100)}%`;

  const rtDefRate = document.getElementById('rt-defect-rate');
  if (rtDefRate) rtDefRate.textContent = `${currentDefRate.toFixed(1)}%`;
  const rtDefBar = document.getElementById('rt-defect-bar');
  if (rtDefBar) rtDefBar.style.width = `${Math.min(100, (currentDefRate / 4) * 100)}%`;
  const rtDefReason = document.getElementById('rt-defect-reason');
  if (rtDefReason) rtDefReason.textContent = latestHour ? (latestHour.primaryDefectReason || 'None') : 'None';
  const rtDefAvg = document.getElementById('rt-defect-day-avg');
  if (rtDefAvg) rtDefAvg.textContent = `${defectRate.toFixed(1)}%`;

  // Daily Scorecard Cards (All 9 Items)
  const dSlabs = document.getElementById('daily-total-slabs');
  if (dSlabs) dSlabs.textContent = totalSlabs.toLocaleString();

  const dCabros = document.getElementById('daily-total-cabros');
  if (dCabros) dCabros.innerHTML = `${totalCabros.toLocaleString()} <span class="text-xs font-normal text-slate-400">sqm</span>`;

  const dColCabros = document.getElementById('daily-total-coloured-cabros');
  if (dColCabros) dColCabros.innerHTML = `${totalColouredCabros.toLocaleString()} <span class="text-xs font-normal text-slate-400">sqm</span>`;

  const dWall = document.getElementById('daily-total-wallcoping');
  if (dWall) dWall.textContent = totalWallCoping.toLocaleString();

  const dCulverts = document.getElementById('daily-total-culverts');
  if (dCulverts) {
    dCulverts.innerHTML = `${totalCulverts.toLocaleString()} <span id="daily-culverts-sub" class="text-[10px] text-slate-400 font-mono ml-1">(${totalCulverts450} for 450mm / ${totalCulverts900} for 900mm)</span>`;
  }

  const dChannels = document.getElementById('daily-total-channels');
  if (dChannels) dChannels.textContent = totalChannels.toLocaleString();

  const dProduced = document.getElementById('daily-total-produced');
  if (dProduced) dProduced.textContent = totalProduced.toLocaleString();

  const dDefRate = document.getElementById('daily-defect-rate');
  if (dDefRate) {
    dDefRate.textContent = `${defectRate.toFixed(2)}% Def`;
    dDefRate.className = `font-mono text-[10px] font-bold ${defectRate > 2.5 ? 'text-rose-400' : 'text-emerald-400'}`;
  }

  // Render Charts & Tables
  renderHourlySvgChart('rt-hourly-chart-container', hourly);
  renderHourlySvgChart('daily-hourly-chart-container', hourly);
  renderParetoChart('rt-pareto-chart-container', hourly);
  renderRecentHoursList(hourly);
  renderDailyLedgerTable(hourly);

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 4. SVG Hourly Chart Renderer
// -------------------------------------------------------------
function renderHourlySvgChart(containerId, hourly) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!hourly || hourly.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg text-xs">
        No production logged for this date. Click "+ Log Production Hour" or "Batch Day Fill" to add shift records.
      </div>`;
    return;
  }

  const width = 850;
  const height = 240;
  const padL = 45;
  const padR = 45;
  const padT = 20;
  const padB = 35;
  const pW = width - padL - padR;
  const pH = height - padT - padB;

  const maxUnits = Math.max(...hourly.map(h => {
    return (h.slabsProduced || 0) + (h.roadChannelsProduced || 0) + (h.cabrosProduced || 0) + (h.colouredCabrosProduced || 0) + (h.wallCopingProduced || 0);
  }), 150);
  const yMax = Math.ceil(maxUnits / 50) * 50;
  const rightYMax = 8; // 8% defect rate axis

  const slotW = pW / hourly.length;
  const barW = Math.max(12, Math.min(28, slotW * 0.55));

  let barsHtml = '';
  let defectPoints = [];

  hourly.forEach((h, i) => {
    const xCenter = padL + i * slotW + slotW / 2;
    const xBar = xCenter - barW / 2;

    const sH = ((h.slabsProduced || 0) / yMax) * pH;
    const cH = ((h.roadChannelsProduced || 0) / yMax) * pH;

    const sY = padT + pH - sH;
    const cY = sY - cH;

    const dRate = h.defectRate || 0;
    const dY = padT + pH - (dRate / rightYMax) * pH;
    defectPoints.push({ x: xCenter, y: dY, rate: dRate });

    const tickLabel = formatSlot(h.hour).split(' - ')[0];

    barsHtml += `
      <g>
        <rect x="${xBar}" y="${sY}" width="${barW}" height="${sH}" fill="#0284c7" rx="1"></rect>
        <rect x="${xBar}" y="${cY}" width="${barW}" height="${cH}" fill="#14b8a6" rx="1"></rect>
        <text x="${xCenter}" y="${height - padB + 14}" text-anchor="middle" class="text-[9.5px] font-mono fill-slate-400">${tickLabel}</text>
      </g>`;
  });

  // Polyline for defect
  const polyPoints = defectPoints.map(p => `${p.x},${p.y}`).join(' ');
  const lineHtml = `<polyline fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" points="${polyPoints}"/>`;
  const dotsHtml = defectPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#f43f5e" stroke="#0f172a" stroke-width="1.5"/>`).join('');

  // Target 2.5% line
  const targetY = padT + pH - (2.5 / rightYMax) * pH;
  const targetLineHtml = `<line x1="${padL}" y1="${targetY}" x2="${width - padR}" y2="${targetY}" stroke="#10b981" stroke-dasharray="3 3" opacity="0.6"/>`;

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto min-w-[620px] select-none">
      ${targetLineHtml}
      ${barsHtml}
      ${lineHtml}
      ${dotsHtml}
      <text x="${padL - 6}" y="${padT + 8}" text-anchor="end" class="text-[9px] font-mono fill-slate-500">${yMax}</text>
      <text x="${width - padR + 6}" y="${padT + 8}" text-anchor="start" class="text-[9px] font-mono fill-rose-400">8%</text>
    </svg>`;
}

// -------------------------------------------------------------
// 5. Pareto Chart
// -------------------------------------------------------------
function renderParetoChart(containerId, hourly) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const counts = {};
  let totalDef = 0;
  hourly.forEach(h => {
    const d = (h.defectiveSlabs || 0) + (h.defectiveChannels || 0) + (h.defectiveCabros || 0) +
      (h.defectiveColouredCabros || 0) + (h.defectiveWallCoping || 0) + (h.defectiveShallowDrains || 0) +
      (h.defectiveRoadKerbs || 0) + (h.defectiveCulverts450 || 0) + (h.defectiveCulverts900 || 0);
    if (d > 0 && h.primaryDefectReason && h.primaryDefectReason !== 'None') {
      counts[h.primaryDefectReason] = (counts[h.primaryDefectReason] || 0) + d;
      totalDef += d;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    container.innerHTML = `<p class="text-xs text-emerald-400 py-6 text-center">Zero defects recorded today! 100% Quality pass rate.</p>`;
    return;
  }

  let html = '<div class="space-y-2 pt-1 font-mono text-xs">';
  sorted.forEach(([reason, count]) => {
    const pct = ((count / totalDef) * 100).toFixed(1);
    html += `
      <div class="space-y-0.5">
        <div class="flex justify-between text-slate-300">
          <span class="font-sans font-medium">${reason}</span>
          <span><strong>${count}</strong> units (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div class="bg-rose-500 h-full rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// -------------------------------------------------------------
// 6. Recent Hours List & 13-Column Ledger Table
// -------------------------------------------------------------
function renderRecentHoursList(hourly) {
  const container = document.getElementById('rt-hourly-list');
  const countEl = document.getElementById('rt-hour-count');
  if (countEl) countEl.textContent = `${hourly.length} intervals`;

  if (!container) return;

  if (hourly.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">No production intervals logged today.</p>';
    return;
  }

  container.innerHTML = hourly.slice().reverse().map(h => `
    <div class="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs font-mono">
      <div>
        <span class="font-bold text-slate-200">${formatSlot(h.hour)}</span>
        <span class="text-slate-500 font-sans ml-2">${h.shift || 'Shift Run'}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sky-400">${h.slabsProduced || 0} Slabs</span>
        <span class="text-teal-300">${h.roadChannelsProduced || 0} Chan</span>
        <span class="text-emerald-400">${h.cabrosProduced || 0} Cabros</span>
        <span class="text-lime-400">${h.colouredCabrosProduced || 0} Col.Cab</span>
        <span class="text-cyan-400">${h.wallCopingProduced || 0} Copy</span>
        <span class="font-bold ${(h.defectRate || 0) >= 2.5 ? 'text-rose-400' : 'text-emerald-400'}">${h.defectRate || 0}% Def</span>
      </div>
    </div>
  `).join('');
}

function renderDailyLedgerTable(hourly) {
  const body = document.getElementById('daily-table-body');
  const countEl = document.getElementById('daily-ledger-count');
  if (countEl) countEl.textContent = `${hourly.length} entries`;

  if (!body) return;

  if (hourly.length === 0) {
    body.innerHTML = '<tr><td colspan="14" class="p-8 text-center text-slate-500 font-sans">No data recorded for this day. Click "Add Forgotten Day" or "Batch Day Fill" to input records.</td></tr>';
    return;
  }

  body.innerHTML = hourly.map(h => {
    const def = (h.defectiveSlabs || 0) + (h.defectiveChannels || 0) + (h.defectiveCabros || 0) +
      (h.defectiveColouredCabros || 0) + (h.defectiveWallCoping || 0) + (h.defectiveShallowDrains || 0) +
      (h.defectiveRoadKerbs || 0) + (h.defectiveCulverts450 || 0) + (h.defectiveCulverts900 || 0);

    return `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="py-2.5 px-3 font-semibold text-slate-200">${formatSlot(h.hour)}</td>
        <td class="py-2.5 px-2 text-right text-teal-300 font-bold">${h.roadChannelsProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-sky-400 font-bold">${h.slabsProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-emerald-400 font-bold">${h.cabrosProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-lime-400 font-bold">${h.colouredCabrosProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-cyan-400 font-bold">${h.wallCopingProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-violet-400 font-bold">${h.shallowDrainsProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-indigo-400 font-bold">${h.roadKerbsProduced || 0}</td>
        <td class="py-2.5 px-2 text-right text-amber-400 font-bold">${h.culverts450Produced || 0}</td>
        <td class="py-2.5 px-2 text-right text-orange-400 font-bold">${h.culverts900Produced || 0}</td>
        <td class="py-2.5 px-2 text-right text-rose-400 font-semibold">${def}</td>
        <td class="py-2.5 px-2 text-right font-bold ${(h.defectRate || 0) >= 2.5 ? 'text-rose-400' : 'text-emerald-400'}">${h.defectRate || 0}%</td>
        <td class="py-2.5 px-3 font-sans text-slate-300">${h.primaryDefectReason || 'None'}</td>
        <td class="py-2.5 px-3 text-center">
          <button onclick="deleteHour(${h.hour})" title="Delete Interval" class="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 7. Interactive Visual Calendar Implementation
// -------------------------------------------------------------
function renderAllCalendars() {
  if (isVisualCalendarOpen) {
    renderVisualCalendar('visual-calendar-container', onCalendarDateSelect, currentDate);
  }
  if (isBatchCalendarOpen) {
    const bDate = document.getElementById('batch-date')?.value || currentDate;
    renderVisualCalendar('batch-calendar-container', onBatchCalendarDateSelect, bDate);
  }
  if (isForgotCalendarOpen) {
    const fDate = document.getElementById('forgot-date')?.value || currentDate;
    renderVisualCalendar('forgot-calendar-container', onForgotCalendarDateSelect, fDate);
  }
}

function toggleVisualCalendar() {
  const container = document.getElementById('visual-calendar-container');
  const btnText = document.getElementById('btn-cal-text') || document.getElementById('btn-calendar-view-text');
  if (!container) return;

  isVisualCalendarOpen = !isVisualCalendarOpen;
  container.classList.toggle('hidden', !isVisualCalendarOpen);
  if (btnText) btnText.textContent = isVisualCalendarOpen ? 'Hide Calendar' : 'Calendar View';

  if (isVisualCalendarOpen) {
    renderVisualCalendar('visual-calendar-container', onCalendarDateSelect, currentDate);
  }
  if (window.lucide) lucide.createIcons();
}

function toggleBatchCalendar() {
  const container = document.getElementById('batch-calendar-container');
  const btnText = document.getElementById('btn-batch-cal-text');
  if (!container) return;

  isBatchCalendarOpen = !isBatchCalendarOpen;
  container.classList.toggle('hidden', !isBatchCalendarOpen);
  if (btnText) btnText.textContent = isBatchCalendarOpen ? 'Hide Calendar' : 'Open Calendar';

  if (isBatchCalendarOpen) {
    const bDate = document.getElementById('batch-date')?.value || currentDate;
    renderVisualCalendar('batch-calendar-container', onBatchCalendarDateSelect, bDate);
  }
  if (window.lucide) lucide.createIcons();
}

function toggleForgotCalendar() {
  const container = document.getElementById('forgot-calendar-container');
  const btnText = document.getElementById('btn-forgot-cal-text');
  if (!container) return;

  isForgotCalendarOpen = !isForgotCalendarOpen;
  container.classList.toggle('hidden', !isForgotCalendarOpen);
  if (btnText) btnText.textContent = isForgotCalendarOpen ? 'Hide Calendar' : 'Open Calendar';

  if (isForgotCalendarOpen) {
    const fDate = document.getElementById('forgot-date')?.value || currentDate;
    renderVisualCalendar('forgot-calendar-container', onForgotCalendarDateSelect, fDate);
  }
  if (window.lucide) lucide.createIcons();
}

function onCalendarDateSelect(dateStr) {
  loadDayData(dateStr);
}

function onBatchCalendarDateSelect(dateStr) {
  const bDate = document.getElementById('batch-date');
  if (bDate) bDate.value = dateStr;
  renderVisualCalendar('batch-calendar-container', onBatchCalendarDateSelect, dateStr);
}

function onForgotCalendarDateSelect(dateStr) {
  const fDate = document.getElementById('forgot-date');
  if (fDate) {
    fDate.value = dateStr;
    onForgotDateChange(dateStr);
  }
  renderVisualCalendar('forgot-calendar-container', onForgotCalendarDateSelect, dateStr);
}

function stepCalendarMonth(delta) {
  calendarViewMonth += delta;
  if (calendarViewMonth > 12) {
    calendarViewMonth = 1;
    calendarViewYear += 1;
  } else if (calendarViewMonth < 1) {
    calendarViewMonth = 12;
    calendarViewYear -= 1;
  }
  const mStr = `${calendarViewYear}-${String(calendarViewMonth).padStart(2, '0')}`;
  loadMonthLogsForCache(mStr).then(() => {
    renderAllCalendars();
  });
}

function jumpCalendarTo(target) {
  if (target === 'today') {
    onCalendarDateSelect('2026-10-26');
  } else if (target === 'yesterday') {
    onCalendarDateSelect('2026-10-25');
  } else if (target === 'missing') {
    // Find first unlogged workday in current month
    const daysInM = new Date(calendarViewYear, calendarViewMonth, 0).getDate();
    for (let d = 1; d <= daysInM; d++) {
      const dStr = `${calendarViewYear}-${String(calendarViewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dt = new Date(dStr + 'T12:00:00Z');
      const isSun = dt.getDay() === 0;
      const isPast = dStr <= '2026-10-26';
      const log = allLogsCache[dStr];
      if (!isSun && isPast && (!log || !log.hourly || log.hourly.length === 0)) {
        onCalendarDateSelect(dStr);
        return;
      }
    }
  }
}

function renderVisualCalendar(containerId, onSelectDate, selectedDate) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[calendarViewMonth - 1];

  const firstDayOfWeek = new Date(calendarViewYear, calendarViewMonth - 1, 1).getDay();
  // Adjust Monday-first: Mon=0, Sun=6
  const startOffset = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(calendarViewYear, calendarViewMonth, 0).getDate();

  let daysHtml = '';
  // Empty leading cells
  for (let i = 0; i < startOffset; i++) {
    daysHtml += `<div class="min-h-[58px] p-1 rounded-lg bg-slate-950/20 border border-slate-900/40 opacity-30"></div>`;
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calendarViewYear}-${String(calendarViewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dt = new Date(dateStr + 'T12:00:00Z');
    const isSunday = (dt.getDay() === 0);
    const isSelected = (dateStr === selectedDate);
    const isToday = (dateStr === '2026-10-26');
    const isFuture = (dateStr > '2026-10-26');

    const log = allLogsCache[dateStr] || (currentDayLog && currentDayLog.date === dateStr ? currentDayLog : null);
    const hasLog = log && log.hourly && log.hourly.length > 0;
    const pieces = log ? (log.totalProduced || 0) : 0;
    const defRate = log ? (log.defectRate || 0) : 0;

    let badgeHtml = '';
    let cellBg = 'bg-slate-950/70 border-slate-800/80 hover:border-slate-600';

    if (isSunday) {
      badgeHtml = `<span class="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 rounded block mt-1 truncate">Sunday Off</span>`;
      cellBg = 'bg-slate-950/40 border-slate-900 text-slate-500';
    } else if (isFuture) {
      badgeHtml = `<span class="text-[9px] font-mono text-slate-600 px-1 rounded block mt-1 truncate">Scheduled</span>`;
      cellBg = 'bg-slate-950/40 border-slate-900 text-slate-600';
    } else if (hasLog) {
      badgeHtml = `
        <div class="mt-1 flex items-center justify-between text-[9px] font-mono">
          <span class="text-emerald-400 font-bold truncate">✓ ${pieces > 0 ? pieces.toLocaleString() : 'Logged'}</span>
          <span class="${defRate > 2.5 ? 'text-rose-400' : 'text-emerald-400'}">${defRate}%</span>
        </div>`;
      cellBg = 'bg-slate-900/90 border-emerald-900/60 hover:border-emerald-500';
    } else {
      // Workday in past with missing data
      badgeHtml = `<span class="text-[9px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/60 px-1 py-0.5 rounded block mt-1 truncate font-semibold">⚠ Unlogged</span>`;
      cellBg = 'bg-amber-950/20 border-amber-900/50 hover:border-amber-500';
    }

    if (isSelected) {
      cellBg += ' ring-2 ring-sky-500 bg-sky-950/40 border-sky-400';
    }

    daysHtml += `
      <button 
        type="button" 
        onclick="(${onSelectDate.name})('${dateStr}')" 
        class="min-h-[58px] p-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${cellBg}"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold ${isSelected ? 'text-sky-300' : (isSunday ? 'text-slate-500' : 'text-slate-200')}">
            ${day}
          </span>
          ${isToday ? '<span class="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-sky-500 text-slate-950 font-bold">Today</span>' : ''}
        </div>
        ${badgeHtml}
      </button>
    `;
  }

  container.innerHTML = `
    <div class="p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl space-y-3 shadow-lg">
      <!-- Calendar Header & Navigation Controls -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <button type="button" onclick="stepCalendarMonth(-1)" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <span class="font-bold text-sm text-slate-100 font-sans tracking-wide">
            ${monthName} ${calendarViewYear}
          </span>
          <button type="button" onclick="stepCalendarMonth(1)" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Jump Presets -->
        <div class="flex items-center gap-1.5 text-[11px] font-mono">
          <button type="button" onclick="jumpCalendarTo('today')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer">Today (26th)</button>
          <button type="button" onclick="jumpCalendarTo('yesterday')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer">Yesterday</button>
          <button type="button" onclick="jumpCalendarTo('missing')" class="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800 cursor-pointer">Jump to Missing</button>
        </div>
      </div>

      <!-- Weekday Column Headers (Mon to Sun) -->
      <div class="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span class="text-rose-400/80">Sun</span>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1">
        ${daysHtml}
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Logged Workday</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Missing / Unlogged</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-600"></span> Sunday Off</span>
        </div>
        <span class="text-slate-500">Click any day to inspect & edit</span>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 8. Modals & Data Entry Actions (Saves directly to MongoDB)
// -------------------------------------------------------------
function openLogHourModal() {
  const modal = document.getElementById('modal-log-hour');
  if (modal) modal.classList.remove('hidden');
}
function closeLogHourModal() {
  const modal = document.getElementById('modal-log-hour');
  if (modal) modal.classList.add('hidden');
}

function openBatchDayModal() {
  const modal = document.getElementById('modal-batch-day');
  if (!modal) return;
  const bDate = document.getElementById('batch-date');
  if (bDate) bDate.value = currentDate;
  modal.classList.remove('hidden');
  renderAllCalendars();
}
function closeBatchDayModal() {
  const modal = document.getElementById('modal-batch-day');
  if (modal) modal.classList.add('hidden');
}

function zeroBatchInputs() {
  [
    'batch-channels', 'batch-slabs', 'batch-cabros', 'batch-coloured-cabros', 'batch-wallcoping',
    'batch-shallowdrains', 'batch-roadkerbs', 'batch-culverts450', 'batch-culverts900',
    'batch-sideslabs', 'batch-moulds'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });
}

function prefillBatchTargets() {
  const targets = {
    'batch-channels': '60',
    'batch-slabs': '120',
    'batch-cabros': '86',
    'batch-coloured-cabros': '0',
    'batch-wallcoping': '120',
    'batch-shallowdrains': '40',
    'batch-roadkerbs': '50',
    'batch-culverts450': '2',
    'batch-culverts900': '3',
    'batch-sideslabs': '30',
    'batch-moulds': '140'
  };
  Object.entries(targets).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

async function submitHourlyRecord(e) {
  e.preventDefault();
  const hour = parseInt(document.getElementById('input-hour').value, 10);
  const slabs = parseInt(document.getElementById('input-slabs')?.value, 10) || 0;
  const defSlabs = parseInt(document.getElementById('input-def-slabs')?.value, 10) || 0;
  const channels = parseInt(document.getElementById('input-channels')?.value, 10) || 0;
  const defChannels = parseInt(document.getElementById('input-def-channels')?.value, 10) || 0;
  const cabros = parseInt(document.getElementById('input-cabros')?.value, 10) || 0;
  const defCabros = parseInt(document.getElementById('input-def-cabros')?.value, 10) || 0;
  const colouredCabros = parseInt(document.getElementById('input-coloured-cabros')?.value, 10) || 0;
  const defColouredCabros = parseInt(document.getElementById('input-def-coloured-cabros')?.value, 10) || 0;
  const wallcoping = parseInt(document.getElementById('input-wallcoping')?.value, 10) || 0;
  const defWallcoping = parseInt(document.getElementById('input-def-wallcoping')?.value, 10) || 0;
  const shallowdrains = parseInt(document.getElementById('input-shallowdrains')?.value, 10) || 0;
  const defShallowdrains = parseInt(document.getElementById('input-def-shallowdrains')?.value, 10) || 0;
  const roadkerbs = parseInt(document.getElementById('input-roadkerbs')?.value, 10) || 0;
  const defRoadkerbs = parseInt(document.getElementById('input-def-roadkerbs')?.value, 10) || 0;
  const culverts450 = parseInt(document.getElementById('input-culverts450')?.value, 10) || 0;
  const defCulverts450 = parseInt(document.getElementById('input-def-culverts450')?.value, 10) || 0;
  const culverts900 = parseInt(document.getElementById('input-culverts900')?.value, 10) || 0;
  const defCulverts900 = parseInt(document.getElementById('input-def-culverts900')?.value, 10) || 0;
  const moulds = parseInt(document.getElementById('input-moulds')?.value, 10) || 0;
  const defMoulds = parseInt(document.getElementById('input-def-moulds')?.value, 10) || 0;

  const reason = document.getElementById('input-reason')?.value || 'None';
  const downtime = parseInt(document.getElementById('input-downtime')?.value, 10) || 0;
  const notes = document.getElementById('input-notes')?.value || '';

  const totalProd = slabs + channels + cabros + colouredCabros + wallcoping + shallowdrains + roadkerbs + culverts450 + culverts900;
  const totalDef = defSlabs + defChannels + defCabros + defColouredCabros + defWallcoping + defShallowdrains + defRoadkerbs + defCulverts450 + defCulverts900;
  const rate = totalProd > 0 ? parseFloat(((totalDef / totalProd) * 100).toFixed(2)) : 0.0;

  const record = {
    hour,
    shift: (hour < 12) ? 'Morning Run' : (hour === 12 ? 'Midday Transition' : 'Afternoon Run'),
    slabsProduced: slabs,
    defectiveSlabs: defSlabs,
    roadChannelsProduced: channels,
    defectiveChannels: defChannels,
    cabrosProduced: cabros,
    defectiveCabros: defCabros,
    colouredCabrosProduced: colouredCabros,
    defectiveColouredCabros: defColouredCabros,
    wallCopingProduced: wallcoping,
    defectiveWallCoping: defWallcoping,
    shallowDrainsProduced: shallowdrains,
    defectiveShallowDrains: defShallowdrains,
    roadKerbsProduced: roadkerbs,
    defectiveRoadKerbs: defRoadkerbs,
    culverts450Produced: culverts450,
    defectiveCulverts450: defCulverts450,
    culverts900Produced: culverts900,
    defectiveCulverts900: defCulverts900,
    mouldsProduced: moulds,
    defectiveMoulds: defMoulds,
    defectRate: rate,
    primaryDefectReason: reason,
    machineDowntimeMinutes: downtime,
    notes,
  };

  try {
    const res = await fetch('/api/stats/hourly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: currentDate, record }),
    });
    const data = await res.json();
    if (data.success && data.log) {
      currentDayLog = data.log;
      allLogsCache[currentDate] = data.log;
      renderAllDayViews();
      renderAllCalendars();
    }
  } catch (err) {
    console.error('Save to MongoDB error:', err);
  }

  closeLogHourModal();
}

async function submitBatchDay(e) {
  e.preventDefault();
  const targetDate = document.getElementById('batch-date')?.value || currentDate;
  const slabsTotal = parseInt(document.getElementById('batch-slabs')?.value, 10) || 0;
  const channelsTotal = parseInt(document.getElementById('batch-channels')?.value, 10) || 0;
  const cabrosTotal = parseInt(document.getElementById('batch-cabros')?.value, 10) || 0;
  const colouredCabrosTotal = parseInt(document.getElementById('batch-coloured-cabros')?.value, 10) || 0;
  const wallcopingTotal = parseInt(document.getElementById('batch-wallcoping')?.value, 10) || 0;
  const shallowdrainsTotal = parseInt(document.getElementById('batch-shallowdrains')?.value, 10) || 0;
  const roadkerbsTotal = parseInt(document.getElementById('batch-roadkerbs')?.value, 10) || 0;
  const culverts450Total = parseInt(document.getElementById('batch-culverts450')?.value, 10) || 0;
  const culverts900Total = parseInt(document.getElementById('batch-culverts900')?.value, 10) || 0;
  const sideslabsTotal = parseInt(document.getElementById('batch-sideslabs')?.value, 10) || 0;
  const mouldsTotal = parseInt(document.getElementById('batch-moulds')?.value, 10) || 0;

  const rate = parseFloat(document.getElementById('batch-rate')?.value) || 1.5;
  const supervisor = document.getElementById('batch-supervisor')?.value || 'Marcus Vance';
  const notes = document.getElementById('batch-notes')?.value || 'Batch operational shift log generated';

  // 10 operating slots: 7 to 16
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const count = hours.length;

  function dist(total) {
    const base = Math.floor(total / count);
    const rem = total % count;
    return hours.map((_, i) => base + (i === 0 ? rem : 0));
  }

  const sDist = dist(slabsTotal);
  const cDist = dist(channelsTotal);
  const cabDist = dist(cabrosTotal);
  const colCabDist = dist(colouredCabrosTotal);
  const wcDist = dist(wallcopingTotal);
  const sdDist = dist(shallowdrainsTotal);
  const rkDist = dist(roadkerbsTotal);
  const c450Dist = dist(culverts450Total);
  const c900Dist = dist(culverts900Total);
  const ssDist = dist(sideslabsTotal);
  const mDist = dist(mouldsTotal);

  const hourly = hours.map((hour, idx) => {
    const s = sDist[idx];
    const c = cDist[idx];
    const cab = cabDist[idx];
    const colCab = colCabDist[idx];
    const wc = wcDist[idx];
    const sd = sdDist[idx];
    const rk = rkDist[idx];
    const c450 = c450Dist[idx];
    const c900 = c900Dist[idx];
    const ss = ssDist[idx];
    const m = mDist[idx];

    const prod = s + c + cab + colCab + wc + sd + rk + c450 + c900 + ss;
    const def = Math.round(prod * (rate / 100));
    const defS = Math.round(def * 0.5);
    const defC = def - defS;

    return {
      hour,
      shift: (hour < 12) ? 'Morning Run' : (hour === 12 ? 'Midday Transition' : 'Afternoon Run'),
      slabsProduced: s,
      defectiveSlabs: defS,
      roadChannelsProduced: c,
      defectiveChannels: defC,
      cabrosProduced: cab,
      defectiveCabros: 0,
      colouredCabrosProduced: colCab,
      defectiveColouredCabros: 0,
      wallCopingProduced: wc,
      defectiveWallCoping: 0,
      shallowDrainsProduced: sd,
      defectiveShallowDrains: 0,
      roadKerbsProduced: rk,
      defectiveRoadKerbs: 0,
      culverts450Produced: c450,
      defectiveCulverts450: 0,
      culverts900Produced: c900,
      defectiveCulverts900: 0,
      sideSlabsProduced: ss,
      defectiveSideSlabs: 0,
      mouldsProduced: m,
      defectiveMoulds: 0,
      defectRate: prod > 0 ? parseFloat(((def / prod) * 100).toFixed(2)) : 0.0,
      primaryDefectReason: def > 0 ? 'Edge Chipping' : 'None',
      machineDowntimeMinutes: hour === 12 ? 15 : 0,
      notes: idx === 9 ? 'Daily washdown completed' : '',
    };
  });

  const dayDoc = {
    date: targetDate,
    supervisor,
    line: 'Precast Operations',
    status: 'completed',
    hourly,
    shiftNotes: notes,
  };

  try {
    const res = await fetch('/api/stats/batch-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dayDoc),
    });
    const data = await res.json();
    if (data.success && data.log) {
      allLogsCache[targetDate] = data.log;
      if (currentDate === targetDate) {
        currentDayLog = data.log;
      } else {
        await loadDayData(targetDate);
      }
      renderAllDayViews();
      renderAllCalendars();
    }
  } catch (err) {
    console.error('Batch save error:', err);
  }

  closeBatchDayModal();
}

async function deleteHour(hour) {
  try {
    const res = await fetch(`/api/stats/hourly?date=${currentDate}&hour=${hour}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success && data.log) {
      currentDayLog = data.log;
      allLogsCache[currentDate] = data.log;
      renderAllDayViews();
      renderAllCalendars();
    }
  } catch (err) {
    console.error('Delete hour error:', err);
  }
}

async function stepNextHourSim() {
  const existing = currentDayLog ? currentDayLog.hourly : [];
  let nextH = 7;
  if (existing.length > 0) {
    const lastH = existing[existing.length - 1].hour;
    nextH = lastH >= 16 ? 7 : lastH + 1;
  }

  const rec = {
    hour: nextH,
    shift: (nextH < 12) ? 'Morning Run' : (nextH === 12 ? 'Midday Transition' : 'Afternoon Run'),
    slabsProduced: 12,
    defectiveSlabs: 0,
    roadChannelsProduced: 6,
    defectiveChannels: 0,
    cabrosProduced: 9,
    defectiveCabros: 0,
    colouredCabrosProduced: 0,
    defectiveColouredCabros: 0,
    wallCopingProduced: 12,
    defectiveWallCoping: 0,
    shallowDrainsProduced: 4,
    defectiveShallowDrains: 0,
    roadKerbsProduced: 5,
    defectiveRoadKerbs: 0,
    culverts450Produced: 0,
    defectiveCulverts450: 0,
    culverts900Produced: 1,
    defectiveCulverts900: 0,
    mouldsProduced: 14,
    defectiveMoulds: 0,
    defectRate: 0.0,
    primaryDefectReason: 'None',
    machineDowntimeMinutes: 0,
    notes: 'Real-time production hour tick logged',
  };

  const res = await fetch('/api/stats/hourly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: currentDate, record: rec }),
  });
  const data = await res.json();
  if (data.success && data.log) {
    currentDayLog = data.log;
    allLogsCache[currentDate] = data.log;
    renderAllDayViews();
    renderAllCalendars();
  }
}

// -------------------------------------------------------------
// 9. Monthly & Yearly Analytics
// -------------------------------------------------------------
async function loadMonthlyAnalytics(monthStr) {
  try {
    const res = await fetch(`/api/stats/month?month=${monthStr}`);
    const data = await res.json();

    const loggedEl = document.getElementById('monthly-logged-days');
    if (loggedEl) loggedEl.textContent = `Logged Days: ${data.daysLogged}`;
    const slabsEl = document.getElementById('monthly-total-slabs');
    if (slabsEl) slabsEl.textContent = data.totalSlabs.toLocaleString();
    const chanEl = document.getElementById('monthly-total-channels');
    if (chanEl) chanEl.textContent = data.totalChannels.toLocaleString();
    const defEl = document.getElementById('monthly-defect-rate');
    if (defEl) defEl.textContent = `${data.averageDefectRate}%`;
    const mouldsEl = document.getElementById('monthly-total-moulds');
    if (mouldsEl) mouldsEl.textContent = data.totalMoulds.toLocaleString();

    renderMonthlyTrendChart(data.logs || []);
    renderMonthlyHeatmap(data.logs || []);
  } catch (err) {
    console.error('Failed to load monthly analytics:', err);
  }
}

function renderMonthlyTrendChart(logs) {
  const container = document.getElementById('monthly-trend-chart-container');
  if (!container || logs.length === 0) return;

  const width = 850;
  const height = 220;
  const padL = 40;
  const padR = 40;
  const pW = width - padL - padR;
  const pH = height - 50;

  const maxV = Math.max(...logs.map(l => l.totalProduced || 0), 1800);
  const slotW = pW / logs.length;

  let bars = '';
  logs.forEach((l, idx) => {
    const x = padL + idx * slotW + slotW / 4;
    const h = ((l.totalProduced || 0) / maxV) * pH;
    const y = height - 25 - h;
    const dayNum = l.date.split('-')[2];
    bars += `
      <rect x="${x}" y="${y}" width="${slotW * 0.5}" height="${h}" fill="#0284c7" rx="1"></rect>
      <text x="${x + slotW / 4}" y="${height - 10}" text-anchor="middle" class="text-[8.5px] font-mono fill-slate-500">${dayNum}</text>`;
  });

  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" class="w-full h-auto min-w-[600px] select-none">${bars}</svg>`;
}

function renderMonthlyHeatmap(logs) {
  const container = document.getElementById('monthly-heatmap-container');
  if (!container) return;

  const recent = logs.slice(0, 7).reverse();
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  let rows = '';
  recent.forEach(log => {
    let cells = '';
    hours.forEach(h => {
      const rec = (log.hourly || []).find(r => r.hour === h);
      const rate = rec ? (rec.defectRate || 0) : 0;
      let bg = '#1e293b';
      if (rate > 0 && rate < 2.5) bg = '#047857';
      else if (rate >= 2.5 && rate < 4.0) bg = '#d97706';
      else if (rate >= 4.0) bg = '#dc2626';

      cells += `<div style="background-color: ${bg}" class="h-6 rounded-xs flex items-center justify-center text-[9px] font-mono text-white/90">${rate > 0 ? rate.toFixed(0) + '%' : ''}</div>`;
    });

    rows += `
      <div class="grid grid-cols-[80px_repeat(10,1fr)] gap-1 items-center">
        <span class="text-[11px] font-mono text-slate-400">${log.date.substring(5)}</span>
        ${cells}
      </div>`;
  });

  container.innerHTML = `
    <div class="border border-slate-800 rounded-lg p-2.5 bg-slate-950/60 overflow-x-auto min-w-[550px] space-y-1">
      <div class="grid grid-cols-[80px_repeat(10,1fr)] gap-1 text-[10px] text-slate-500 font-mono text-center mb-1">
        <span class="text-left font-sans">Date</span>
        <span>07:30</span><span>08:30</span><span>09:30</span><span>10:30</span><span>11:30</span>
        <span>12:30</span><span>13:30</span><span>14:30</span><span>15:30</span><span>16:30</span>
      </div>
      ${rows}
    </div>`;
}

async function loadYearlyAnalytics(year) {
  try {
    const btn26 = document.getElementById('yr-btn-2026');
    if (btn26) btn26.className = year === 2026 ? 'px-3 py-1 text-xs font-semibold rounded bg-sky-600 text-white' : 'px-3 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white';
    const btn25 = document.getElementById('yr-btn-2025');
    if (btn25) btn25.className = year === 2025 ? 'px-3 py-1 text-xs font-semibold rounded bg-sky-600 text-white' : 'px-3 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white';

    const res = await fetch(`/api/stats/year?year=${year}`);
    const data = await res.json();

    const ySlabs = document.getElementById('yearly-slabs');
    if (ySlabs) ySlabs.textContent = data.totalSlabs.toLocaleString();
    const yChan = document.getElementById('yearly-channels');
    if (yChan) yChan.textContent = data.totalChannels.toLocaleString();
    const yDef = document.getElementById('yearly-defect');
    if (yDef) yDef.textContent = `${data.averageDefectRate}%`;
    const yMoulds = document.getElementById('yearly-moulds');
    if (yMoulds) yMoulds.textContent = data.totalMoulds.toLocaleString();

    renderYearlyBarChart(data.monthlyBreakdown || []);
  } catch (err) {
    console.error('Failed to load yearly analytics:', err);
  }
}

function renderYearlyBarChart(months) {
  const container = document.getElementById('yearly-chart-container');
  if (!container) return;

  const width = 850;
  const height = 220;
  const padL = 40;
  const padR = 40;
  const pW = width - padL - padR;
  const pH = height - 50;

  const maxVal = Math.max(...months.map(m => Math.max(m.slabs, m.channels)), 25000);
  const slotW = pW / 12;
  const subBarW = slotW * 0.35;

  let bars = '';
  months.forEach((m, idx) => {
    const x = padL + idx * slotW;
    const sH = (m.slabs / maxVal) * pH;
    const cH = (m.channels / maxVal) * pH;
    bars += `
      <rect x="${x + 2}" y="${height - 25 - sH}" width="${subBarW}" height="${sH}" fill="#0284c7" rx="1"></rect>
      <rect x="${x + subBarW + 4}" y="${height - 25 - cH}" width="${subBarW}" height="${cH}" fill="#14b8a6" rx="1"></rect>
      <text x="${x + slotW / 2}" y="${height - 8}" text-anchor="middle" class="text-[9.5px] font-mono fill-slate-400">${m.monthName}</text>`;
  });

  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" class="w-full h-auto min-w-[600px] select-none">${bars}</svg>`;
}

// -------------------------------------------------------------
// 10. Defect Cost Simulator
// -------------------------------------------------------------
function updateSimulator() {
  const currEl = document.getElementById('sim-curr');
  if (!currEl) return;

  const curr = parseFloat(currEl.value);
  const target = parseFloat(document.getElementById('sim-target').value);
  const vol = parseInt(document.getElementById('sim-vol').value, 10);
  const cost = parseFloat(document.getElementById('sim-cost').value);

  document.getElementById('sim-curr-val').textContent = `${curr.toFixed(1)}%`;
  document.getElementById('sim-target-val').textContent = `${target.toFixed(1)}%`;
  document.getElementById('sim-vol-val').textContent = vol.toLocaleString();
  document.getElementById('sim-cost-val').textContent = `$${cost.toFixed(2)}`;

  const delta = Math.max(0, curr - target);
  const pieces = Math.round(vol * (delta / 100));
  const monthSaved = Math.round(pieces * cost);
  const yearSaved = monthSaved * 12;

  document.getElementById('sim-res-pieces').textContent = `+${pieces.toLocaleString()} pcs`;
  document.getElementById('sim-res-month').textContent = `$${monthSaved.toLocaleString()}`;
  document.getElementById('sim-res-year').textContent = `$${yearSaved.toLocaleString()}`;
}

// -------------------------------------------------------------
// 11. Navigation & Date Controls
// -------------------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.className = 'nav-btn py-1 text-slate-400 hover:text-slate-200 border-b-2 border-transparent cursor-pointer';
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');

  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.className = 'nav-btn py-1 text-sky-400 border-b-2 border-sky-400 font-semibold cursor-pointer';
  }

  if (window.lucide) lucide.createIcons();
}

function onDateSelect(newDate) {
  loadDayData(newDate);
}

function stepDay(offset) {
  const d = new Date(currentDate + 'T12:00:00Z');
  d.setDate(d.getDate() + offset);
  loadDayData(d.toISOString().split('T')[0]);
}

function goToToday() {
  loadDayData('2026-10-26');
}

function openPrintReport() {
  window.print();
}

function openSettingsModal() {
  alert("Panelpro Precast & Logistics Ltd:\n- Slabs Target: 120 pieces/day (12 pcs/hr)\n- Cabros Target: 86 sqm/day\n- Culverts Target: 5 total (2 for 450mm, 3 for 900mm - NO 600mm)\n- Wall Copings Target: 120 pieces/day\n- Schedule: Mon - Sat 07:30 - 17:00\n- Cloud Sync: Active");
}

// -------------------------------------------------------------
// 12. Weekly Excel Report & Dynamic Week Selector (All 0 by Default)
// -------------------------------------------------------------
let weeklyCatalog = [
  { code: 'IN001', item: 'item1',   description: 'Road kerbs',     selling_price: 35,  unit_cost: 25,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN002', item: 'Item 2',  description: 'Shallow Drains', selling_price: 65,  unit_cost: 40,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN003', item: 'Item 3',  description: 'Paving Slabs',   selling_price: 35,  unit_cost: 25,  qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN004', item: 'Item 4',  description: '450mm culverts', selling_price: 380, unit_cost: 250, qty: 0, target_qty: 2,   unit: 'pieces' },
  { code: 'IN006', item: 'Item 6',  description: '900mm culverts', selling_price: 550, unit_cost: 375, qty: 0, target_qty: 3,   unit: 'pieces' },
  { code: 'IN007', item: 'Item 7',  description: 'Cabros',          selling_price: 130, unit_cost: 100, qty: 0, target_qty: 86,  unit: 'sqm' },
  { code: 'IN008', item: 'Item 8',  description: 'Road Channels',   selling_price: 50,  unit_cost: 35,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN009', item: 'Item 9',  description: 'Side Slabs',      selling_price: 25,  unit_cost: 15,  qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN010', item: 'Item 10', description: 'Wall Coping',     selling_price: 65,  unit_cost: 40,  qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN011', item: 'Item 11', description: 'Coloured Cabros', selling_price: 150, unit_cost: 115, qty: 0, target_qty: 0,   unit: 'sqm' },
  { code: '',      item: '',        description: 'manhole',         selling_price: 50,  unit_cost: 50,  qty: 0, target_qty: 0,   unit: 'pcs' },
];
let weeklyPeriod = '09/10-15/10';
let availableHistoryMonths = [];
let currentMonthWeeks = [];
let activeWeekIndex = 0;

function applyWeeklyTargets() {
  weeklyCatalog.forEach(item => {
    if (item.description === 'Paving Slabs') item.qty = 120;
    else if (item.description === 'Cabros') item.qty = 86;
    else if (item.description === '450mm culverts') item.qty = 2;
    else if (item.description === '900mm culverts') item.qty = 3;
    else if (item.description === 'Wall Coping') item.qty = 120;
  });
  renderWeeklyTable();
}

async function initWeeklyReport() {
  const periodInput = document.getElementById('weekly-period-input');
  if (periodInput) periodInput.value = weeklyPeriod;

  await loadHistoryMonths();
  renderWeeklyTable();
}

async function loadHistoryMonths() {
  const select = document.getElementById('weekly-month-select');
  if (!select) return;

  try {
    const res = await fetch('/api/reports/history-range');
    const data = await res.json();
    if (data && data.months && data.months.length > 0) {
      availableHistoryMonths = data.months;
      select.innerHTML = data.months.map(m => 
        `<option value="${m.value}">${m.label}</option>`
      ).join('');

      const defaultMonth = data.months.find(m => m.value === '2026-10') ? '2026-10' : data.months[0].value;
      select.value = defaultMonth;
      await onWeeklyMonthChange(defaultMonth);
      return;
    }
  } catch (err) {
    console.warn('Failed to load history range from backend:', err);
  }

  await onWeeklyMonthChange('2026-10');
}

async function onWeeklyMonthChange(monthStr) {
  try {
    const res = await fetch(`/api/reports/month-weeks?month=${monthStr}`);
    const data = await res.json();
    if (data && data.weeks) {
      currentMonthWeeks = data.weeks;
      renderWeeklyPills(data.weeks);

      const targetIndex = data.weeks.findIndex(w => w.period === '19/10-24/10');
      const idxToSelect = targetIndex >= 0 ? targetIndex : 0;
      if (data.weeks.length > 0) {
        selectWeek(data.weeks[idxToSelect], idxToSelect, false);
      }
    }
  } catch (err) {
    console.warn('Failed to load month weeks:', err);
  }
}

function renderWeeklyPills(weeks) {
  const container = document.getElementById('weekly-pills-container');
  if (!container) return;

  if (!weeks || weeks.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-500 font-mono col-span-full">No operating weeks found for this month</span>';
    return;
  }

  container.innerHTML = weeks.map((w, idx) => {
    const isActive = idx === activeWeekIndex;
    const borderStyle = isActive 
      ? 'border-sky-500 bg-sky-950/40 text-sky-200 ring-1 ring-sky-500' 
      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300';
    return `
      <button 
        type="button" 
        onclick="onWeekPillClick(${idx})"
        class="p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${borderStyle}"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs ${isActive ? 'text-sky-300' : 'text-slate-100'}">${w.label}</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${w.days_logged > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
            ${w.days_logged}d
          </span>
        </div>
        <p class="font-mono text-xs font-semibold mt-1 text-slate-200">${w.period}</p>
        <span class="text-[10px] font-mono text-slate-400 block mt-0.5">${w.dates}</span>
      </button>
    `;
  }).join('');
}

function onWeekPillClick(idx) {
  if (currentMonthWeeks[idx]) {
    selectWeek(currentMonthWeeks[idx], idx, true);
  }
}

async function selectWeek(weekObj, index = 0, fetchFromMongo = true) {
  activeWeekIndex = index;
  weeklyPeriod = weekObj.period;

  const periodInput = document.getElementById('weekly-period-input');
  if (periodInput) periodInput.value = weeklyPeriod;

  const startInput = document.getElementById('weekly-custom-start');
  const endInput = document.getElementById('weekly-custom-end');
  if (startInput) startInput.value = weekObj.start_date;
  if (endInput) endInput.value = weekObj.end_date;

  renderWeeklyPills(currentMonthWeeks);

  if (fetchFromMongo) {
    try {
      const res = await fetch(`/api/reports/weekly-catalog?start_date=${weekObj.start_date}&end_date=${weekObj.end_date}&period=${encodeURIComponent(weekObj.period)}`);
      const data = await res.json();
      if (data && data.items) {
        weeklyCatalog = data.items.map(it => ({
          code: it.code,
          item: it.item,
          description: it.description,
          selling_price: it.selling_price,
          unit_cost: it.unit_cost,
          qty: it.qty || 0,
        }));
      }
    } catch (err) {
      console.warn('Could not query weekly catalog from backend:', err);
    }
  }

  renderWeeklyTable();
}

async function applyCustomDateRange() {
  const startInput = document.getElementById('weekly-custom-start');
  const endInput = document.getElementById('weekly-custom-end');
  if (!startInput || !endInput) return;

  const start = startInput.value;
  const end = endInput.value;
  if (!start || !end) {
    alert('Please choose both start and end dates.');
    return;
  }

  const sParts = start.split('-');
  const eParts = end.split('-');
  weeklyPeriod = `${sParts[2]}/${sParts[1]}-${eParts[2]}/${eParts[1]}`;

  const periodInput = document.getElementById('weekly-period-input');
  if (periodInput) periodInput.value = weeklyPeriod;

  try {
    const res = await fetch(`/api/reports/weekly-catalog?start_date=${start}&end_date=${end}&period=${encodeURIComponent(weeklyPeriod)}`);
    const data = await res.json();
    if (data && data.items) {
      weeklyCatalog = data.items.map(it => ({
        code: it.code,
        item: it.item,
        description: it.description,
        selling_price: it.selling_price,
        unit_cost: it.unit_cost,
        qty: it.qty || 0,
      }));
    }
  } catch (err) {
    console.warn('Failed to load custom date range from MongoDB:', err);
  }

  renderWeeklyTable();
}

function zeroWeeklyCatalog() {
  weeklyCatalog.forEach(item => {
    item.qty = 0;
  });
  renderWeeklyTable();
}

function onWeeklyPeriodChange(newVal) {
  weeklyPeriod = newVal || '09/10-15/10';
  renderWeeklyTable();
}

function onWeeklyQtyChange(index, newVal) {
  const cleanVal = Math.max(0, parseInt(newVal) || 0);
  if (weeklyCatalog[index]) {
    weeklyCatalog[index].qty = cleanVal;
    renderWeeklyTable();
  }
}

function loadSampleWeekTemplate() {
  weeklyPeriod = '09/10-15/10';
  const periodInput = document.getElementById('weekly-period-input');
  if (periodInput) periodInput.value = weeklyPeriod;

  const sampleQtys = {
    'IN001': 0, 'IN002': 0, 'IN003': 417, 'IN004': 15,
    'IN006': 0, 'IN007': 469, 'IN008': 10,
    'IN009': 0, 'IN010': 0, 'IN011': 0, 'manhole': 0
  };

  weeklyCatalog.forEach(item => {
    const key = item.code || item.description;
    item.qty = sampleQtys[key] !== undefined ? sampleQtys[key] : 0;
  });

  renderWeeklyTable();
}

function renderWeeklyTable() {
  const tbody = document.getElementById('weekly-table-body');
  if (!tbody) return;

  let totalQty = 0;
  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;

  let rowsHtml = '';
  weeklyCatalog.forEach((row, idx) => {
    const qty = row.qty || 0;
    const sellPrice = row.selling_price || 0;
    const unitCost = row.unit_cost || 0;

    const salesTotal = (qty > 0) ? (qty * sellPrice) : 0;
    const costTotal = (qty > 0) ? (qty * unitCost) : 0;
    const profit = (qty > 0) ? (salesTotal - costTotal) : 0;

    totalQty += qty;
    totalSales += salesTotal;
    totalCost += costTotal;
    totalProfit += profit;

    const salesDisplay = (qty > 0) ? salesTotal.toLocaleString() : '-';
    const costDisplay = (qty > 0) ? costTotal.toLocaleString() : '-';
    const profitDisplay = (qty > 0) ? profit.toLocaleString() : '-';

    const periodCell = (idx === 0) 
      ? `<td rowspan="${weeklyCatalog.length}" class="py-2.5 px-3 border border-slate-700/60 text-center font-bold text-white bg-slate-900/90 align-middle">${weeklyPeriod}</td>`
      : '';

    rowsHtml += `
      <tr class="hover:bg-slate-800/40 transition-colors">
        ${periodCell}
        <td class="py-2 px-3 border border-slate-700/60 text-center text-slate-300">${row.code || ''}</td>
        <td class="py-2 px-3 border border-slate-700/60 text-center text-slate-300">${row.item || ''}</td>
        <td class="py-2 px-4 border border-slate-700/60 text-left text-slate-200 font-sans">
          <div class="flex items-center justify-between gap-2">
            <span>${row.description}</span>
            ${row.target_qty ? `
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${qty >= row.target_qty ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'}">
                Target: ${row.target_qty} ${row.unit || 'pcs'}
              </span>
            ` : ''}
          </div>
        </td>
        <td class="py-1 px-2 border border-slate-700/60 text-right">
          <input 
            type="number" 
            min="0" 
            value="${qty > 0 ? qty : ''}" 
            placeholder="-"
            onchange="onWeeklyQtyChange(${idx}, this.value)"
            class="w-full text-right bg-transparent text-sky-400 font-bold focus:bg-slate-800 rounded px-1.5 py-0.5 border border-transparent focus:border-sky-500 focus:outline-hidden"
          />
        </td>
        <td class="py-2 px-3 border border-slate-700/60 text-right text-sky-400 font-bold">${sellPrice.toLocaleString()}</td>
        <td class="py-2 px-3 border border-slate-700/60 text-right text-white">${salesDisplay}</td>
        <td class="py-2 px-3 border border-slate-700/60 text-right text-sky-400 font-bold">${unitCost.toLocaleString()}</td>
        <td class="py-2 px-3 border border-slate-700/60 text-right text-white">${costDisplay}</td>
        <td class="py-2 px-3 border border-slate-700/60 text-right text-white">${profitDisplay}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  // Footer totals
  const fQty = document.getElementById('weekly-foot-qty');
  if (fQty) fQty.textContent = totalQty.toLocaleString();
  const fSales = document.getElementById('weekly-foot-sales');
  if (fSales) fSales.textContent = totalSales.toLocaleString();
  const fCost = document.getElementById('weekly-foot-cost');
  if (fCost) fCost.textContent = totalCost.toLocaleString();
  const fProfit = document.getElementById('weekly-foot-profit');
  if (fProfit) fProfit.textContent = totalProfit.toLocaleString();

  // Metric cards
  const cQty = document.getElementById('weekly-card-qty');
  if (cQty) cQty.textContent = totalQty.toLocaleString();
  const cSales = document.getElementById('weekly-card-sales');
  if (cSales) cSales.textContent = `$${totalSales.toLocaleString()}`;
  const cCost = document.getElementById('weekly-card-cost');
  if (cCost) cCost.textContent = `$${totalCost.toLocaleString()}`;
  const cProfit = document.getElementById('weekly-card-profit');
  if (cProfit) cProfit.textContent = `$${totalProfit.toLocaleString()}`;

  const margin = (totalSales > 0) ? ((totalProfit / totalSales) * 100).toFixed(2) : '0.00';
  const cMargin = document.getElementById('weekly-card-margin');
  if (cMargin) cMargin.textContent = `${margin}% Gross Margin`;
}

function downloadWeeklyExcelQuick() {
  switchTab('weekly');
  downloadWeeklyExcel();
}

async function downloadWeeklyExcel() {
  const cleanPeriod = weeklyPeriod.replace(/[\/\\:]/g, '-');
  const filename = `Weekly_Production_Report_${cleanPeriod}.xlsx`;

  try {
    const res = await fetch('/api/reports/weekly-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: weeklyPeriod,
        items: weeklyCatalog,
        include_footnotes: true
      })
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    console.warn('Backend excel endpoint unavailable, triggering client spreadsheet fallback:', err);
  }

  generateClientExcelFallback(filename);
}

function generateClientExcelFallback(filename) {
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

  weeklyCatalog.forEach((row, i) => {
    const periodVal = (i === 0) ? weeklyPeriod : '';
    const qtyVal = row.qty || 0;
    const qtyCell = (qtyVal > 0) ? `<Data ss:Type="Number">${qtyVal}</Data>` : '';

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
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${weeklyCatalog.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${weeklyCatalog.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${weeklyCatalog.length}]C:R[-1]C)"></Cell>
    <Cell ss:StyleID="TotalCell" ss:Formula="=SUM(R[-${weeklyCatalog.length}]C:R[-1]C)"></Cell>
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
}

// -------------------------------------------------------------
// 13. Forgotten Day Backfill Workflow (All 9 Items & Calendar)
// -------------------------------------------------------------
let forgotMode = 'summary';

function openForgottenDayModal() {
  const modal = document.getElementById('modal-forgotten-day');
  if (!modal) return;

  const targetDate = (currentDayLog && currentDayLog.hourly && currentDayLog.hourly.length === 0) 
    ? currentDate 
    : getDaysAgoDate(1);

  const dateInput = document.getElementById('forgot-date');
  if (dateInput) {
    dateInput.value = targetDate;
    onForgotDateChange(targetDate);
  }

  zeroForgotInputs();
  populateForgotHourlyTable();
  switchForgotMode('summary');

  modal.classList.remove('hidden');
  renderAllCalendars();
  if (window.lucide) lucide.createIcons();
}

function closeForgottenDayModal() {
  const modal = document.getElementById('modal-forgotten-day');
  if (modal) modal.classList.add('hidden');
}

function getDaysAgoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function setForgotDatePreset(daysAgo) {
  const dStr = getDaysAgoDate(daysAgo);
  const dateInput = document.getElementById('forgot-date');
  if (dateInput) {
    dateInput.value = dStr;
    onForgotDateChange(dStr);
  }
}

async function onForgotDateChange(dateStr) {
  const statusEl = document.getElementById('forgot-date-status');
  if (!statusEl) return;

  const d = new Date(dateStr + 'T12:00:00Z');
  const isSunday = (d.getDay() === 0);
  if (isSunday) {
    statusEl.innerHTML = '<span class="text-amber-400">Notice: This is a Sunday (Scheduled Plant Maintenance)</span>';
    return;
  }

  statusEl.innerHTML = '<span class="text-slate-400">Checking cloud records...</span>';
  try {
    const res = await fetch(`/api/stats/day?date=${dateStr}`);
    const data = await res.json();
    if (data.found && data.log && data.log.hourly && data.log.hourly.length > 0) {
      statusEl.innerHTML = `<span class="text-amber-400">Warning: Date already has ${data.log.hourly.length} intervals logged. Saving will overwrite.</span>`;
    } else {
      statusEl.innerHTML = '<span class="text-emerald-400">Ready to backfill (No prior records recorded)</span>';
    }
  } catch (err) {
    statusEl.innerHTML = '<span class="text-emerald-400">Ready to backfill</span>';
  }
  renderAllCalendars();
}

function switchForgotMode(mode) {
  forgotMode = mode;
  const tabSummary = document.getElementById('forgot-tab-summary');
  const tabHourly = document.getElementById('forgot-tab-hourly');
  const viewSummary = document.getElementById('forgot-view-summary');
  const viewHourly = document.getElementById('forgot-view-hourly');

  if (mode === 'summary') {
    if (tabSummary) tabSummary.className = 'px-4 py-2 font-semibold border-b-2 border-sky-500 text-sky-400 cursor-pointer';
    if (tabHourly) tabHourly.className = 'px-4 py-2 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent cursor-pointer';
    if (viewSummary) viewSummary.classList.remove('hidden');
    if (viewHourly) viewHourly.classList.add('hidden');
  } else {
    if (tabSummary) tabSummary.className = 'px-4 py-2 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent cursor-pointer';
    if (tabHourly) tabHourly.className = 'px-4 py-2 font-semibold border-b-2 border-sky-500 text-sky-400 cursor-pointer';
    if (viewSummary) viewSummary.classList.add('hidden');
    if (viewHourly) viewHourly.classList.remove('hidden');
  }
}

function zeroForgotInputs() {
  const fields = [
    'forgot-channels', 'forgot-def-channels',
    'forgot-slabs', 'forgot-def-slabs',
    'forgot-cabros', 'forgot-def-cabros',
    'forgot-coloured-cabros', 'forgot-def-coloured-cabros',
    'forgot-wallcoping', 'forgot-def-wallcoping',
    'forgot-shallowdrains', 'forgot-def-shallowdrains',
    'forgot-roadkerbs', 'forgot-def-roadkerbs',
    'forgot-culverts450', 'forgot-def-culverts450',
    'forgot-culverts900', 'forgot-def-culverts900',
    'forgot-moulds', 'forgot-def-moulds'
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  const reasonEl = document.getElementById('forgot-reason');
  if (reasonEl) reasonEl.value = 'None';

  // Zero hourly table rows if present
  OPERATING_SLOTS.forEach(slot => {
    ['channels', 'slabs', 'cabros', 'colouredcabros', 'wallcoping', 'shallowdrains', 'roadkerbs', 'culverts450', 'culverts900', 'def'].forEach(type => {
      const el = document.getElementById(`f-h-${slot.hour}-${type}`);
      if (el) el.value = '0';
    });
  });
}

function populateForgotHourlyTable() {
  const tbody = document.getElementById('forgot-hourly-tbody');
  if (!tbody) return;

  tbody.innerHTML = OPERATING_SLOTS.map(slot => `
    <tr class="hover:bg-slate-800/40">
      <td class="p-2 text-slate-300 font-semibold">${slot.label}</td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-channels" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-teal-300 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-slabs" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-sky-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-cabros" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-emerald-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-colouredcabros" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-lime-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-wallcoping" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-cyan-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-shallowdrains" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-violet-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-roadkerbs" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-indigo-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-culverts450" class="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-amber-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-culverts900" class="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-orange-400 text-xs"></td>
      <td class="p-1"><input type="number" min="0" value="0" id="f-h-${slot.hour}-def" class="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-rose-300 text-xs"></td>
    </tr>
  `).join('');
}

async function submitForgottenDay(event) {
  event.preventDefault();

  const dateInput = document.getElementById('forgot-date');
  const dateStr = dateInput ? dateInput.value : currentDate;
  if (!dateStr) {
    alert('Please pick a valid date.');
    return;
  }

  let payload = {
    date: dateStr,
    supervisor: document.getElementById('forgot-supervisor')?.value || 'Marcus Vance',
    notes: document.getElementById('forgot-notes')?.value || 'Backfilled production log'
  };

  if (forgotMode === 'summary') {
    payload.mode = 'summary';
    payload.totalChannels = parseInt(document.getElementById('forgot-channels')?.value) || 0;
    payload.defectiveChannels = parseInt(document.getElementById('forgot-def-channels')?.value) || 0;
    payload.totalSlabs = parseInt(document.getElementById('forgot-slabs')?.value) || 0;
    payload.defectiveSlabs = parseInt(document.getElementById('forgot-def-slabs')?.value) || 0;
    payload.totalCabros = parseInt(document.getElementById('forgot-cabros')?.value) || 0;
    payload.defectiveCabros = parseInt(document.getElementById('forgot-def-cabros')?.value) || 0;
    payload.totalColouredCabros = parseInt(document.getElementById('forgot-coloured-cabros')?.value) || 0;
    payload.defectiveColouredCabros = parseInt(document.getElementById('forgot-def-coloured-cabros')?.value) || 0;
    payload.totalWallCoping = parseInt(document.getElementById('forgot-wallcoping')?.value) || 0;
    payload.defectiveWallCoping = parseInt(document.getElementById('forgot-def-wallcoping')?.value) || 0;
    payload.totalShallowDrains = parseInt(document.getElementById('forgot-shallowdrains')?.value) || 0;
    payload.defectiveShallowDrains = parseInt(document.getElementById('forgot-def-shallowdrains')?.value) || 0;
    payload.totalRoadKerbs = parseInt(document.getElementById('forgot-roadkerbs')?.value) || 0;
    payload.defectiveRoadKerbs = parseInt(document.getElementById('forgot-def-roadkerbs')?.value) || 0;
    payload.totalCulverts450 = parseInt(document.getElementById('forgot-culverts450')?.value) || 0;
    payload.defectiveCulverts450 = parseInt(document.getElementById('forgot-def-culverts450')?.value) || 0;
    payload.totalCulverts900 = parseInt(document.getElementById('forgot-culverts900')?.value) || 0;
    payload.defectiveCulverts900 = parseInt(document.getElementById('forgot-def-culverts900')?.value) || 0;
    payload.totalMoulds = parseInt(document.getElementById('forgot-moulds')?.value) || 0;
    payload.defectiveMoulds = parseInt(document.getElementById('forgot-def-moulds')?.value) || 0;
    payload.primaryReason = document.getElementById('forgot-reason')?.value || 'None';
  } else {
    payload.mode = 'hourly';
    let hourlyRecords = [];

    OPERATING_SLOTS.forEach(slot => {
      const c = parseInt(document.getElementById(`f-h-${slot.hour}-channels`)?.value) || 0;
      const s = parseInt(document.getElementById(`f-h-${slot.hour}-slabs`)?.value) || 0;
      const cab = parseInt(document.getElementById(`f-h-${slot.hour}-cabros`)?.value) || 0;
      const colCab = parseInt(document.getElementById(`f-h-${slot.hour}-colouredcabros`)?.value) || 0;
      const wc = parseInt(document.getElementById(`f-h-${slot.hour}-wallcoping`)?.value) || 0;
      const sd = parseInt(document.getElementById(`f-h-${slot.hour}-shallowdrains`)?.value) || 0;
      const rk = parseInt(document.getElementById(`f-h-${slot.hour}-roadkerbs`)?.value) || 0;
      const c450 = parseInt(document.getElementById(`f-h-${slot.hour}-culverts450`)?.value) || 0;
      const c900 = parseInt(document.getElementById(`f-h-${slot.hour}-culverts900`)?.value) || 0;
      const def = parseInt(document.getElementById(`f-h-${slot.hour}-def`)?.value) || 0;

      const prod = c + s + cab + colCab + wc + sd + rk + c450 + c900;
      const rate = prod > 0 ? (def / prod) * 100 : 0.0;

      hourlyRecords.push({
        hour: slot.hour,
        shift: slot.shift,
        roadChannelsProduced: c,
        defectiveChannels: 0,
        slabsProduced: s,
        defectiveSlabs: def,
        cabrosProduced: cab,
        defectiveCabros: 0,
        colouredCabrosProduced: colCab,
        defectiveColouredCabros: 0,
        wallCopingProduced: wc,
        defectiveWallCoping: 0,
        shallowDrainsProduced: sd,
        defectiveShallowDrains: 0,
        roadKerbsProduced: rk,
        defectiveRoadKerbs: 0,
        culverts450Produced: c450,
        defectiveCulverts450: 0,
        culverts900Produced: c900,
        defectiveCulverts900: 0,
        mouldsProduced: 0,
        defectRate: parseFloat(rate.toFixed(2)),
        primaryDefectReason: def > 0 ? 'Surface Bleed' : 'None',
        notes: `Shift slot ${slot.label}`
      });
    });

    payload.hourly = hourlyRecords;
  }

  try {
    const res = await fetch('/api/stats/forgotten-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      closeForgottenDayModal();
      allLogsCache[dateStr] = data.log;
      await loadDayData(dateStr);
    } else {
      alert(`Error saving production day: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Failed to save forgotten day:', err);
    alert('Network error connecting to cloud server.');
  }
}

window.addEventListener('DOMContentLoaded', init);
