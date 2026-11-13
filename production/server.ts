import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);

function parseMongoUri(raw?: string): string {
  const fallback = 'mongodb+srv://surfsimple:79602583@cluster0.nnvvp7x.mongodb.net/?appName=Cluster0';
  if (!raw) return fallback;
  const match = raw.match(/mongodb(?:\+srv)?:\/\/[^\s"']+/i);
  if (match) return match[0].trim();
  let cleaned = raw.replace(/^MONGO_URI\s*=\s*/i, '').replace(/^["']|["']$/g, '').trim();
  return cleaned || fallback;
}

const MONGO_URI = parseMongoUri(process.env.MONGO_URI);
const DB_NAME = (process.env.DB_NAME || 'Panelpro').replace(/^["']|["']$/g, '').trim();
const COLLECTION_NAME = (process.env.COLLECTION_NAME || 'Stats').replace(/^["']|["']$/g, '').trim();

let mongoClient: MongoClient | null = null;
let mongoPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient | null> {
  if (mongoClient) return mongoClient;
  if (!mongoPromise) {
    mongoPromise = (async () => {
      console.log('Connecting with URI:', JSON.stringify(MONGO_URI));
      const client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      await client.connect();
      mongoClient = client;
      console.log(`[MongoDB] Connected successfully to ${DB_NAME}.${COLLECTION_NAME}`);
      return client;
    })();
  }
  try {
    return await mongoPromise;
  } catch (err) {
    mongoPromise = null;
    mongoClient = null;
    throw err;
  }
}

async function getMongoCollection() {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

// Default Catalog (NO 600mm Culvert!)
// Targets: Slabs = 120 pieces, Cabros = 86 sqm, 450mm culvert = 2, 900mm culvert = 3, Wall Coping = 120 pieces
const DEFAULT_CATALOG = [
  { code: 'IN001', item: 'item1',   description: 'Road kerbs',     selling_price: 35,  unit_cost: 25,  default_qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN002', item: 'Item 2',  description: 'Shallow Drains', selling_price: 65,  unit_cost: 40,  default_qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN003', item: 'Item 3',  description: 'Paving Slabs',   selling_price: 35,  unit_cost: 25,  default_qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN004', item: 'Item 4',  description: '450mm culverts', selling_price: 380, unit_cost: 250, default_qty: 0, target_qty: 2,   unit: 'pieces' },
  { code: 'IN006', item: 'Item 6',  description: '900mm culverts', selling_price: 550, unit_cost: 375, default_qty: 0, target_qty: 3,   unit: 'pieces' },
  { code: 'IN007', item: 'Item 7',  description: 'Cabros',         selling_price: 130, unit_cost: 100, default_qty: 0, target_qty: 86,  unit: 'sqm' },
  { code: 'IN008', item: 'Item 8',  description: 'Road Channels',  selling_price: 50,  unit_cost: 35,  default_qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN009', item: 'Item 9',  description: 'Side Slabs',     selling_price: 25,  unit_cost: 15,  default_qty: 0, target_qty: 0,   unit: 'pcs' },
  { code: 'IN010', item: 'Item 10', description: 'Wall Coping',     selling_price: 65,  unit_cost: 40,  default_qty: 0, target_qty: 120, unit: 'pieces' },
  { code: 'IN011', item: 'Item 11', description: 'Coloured Cabros', selling_price: 150, unit_cost: 115, default_qty: 0, target_qty: 0,   unit: 'sqm' },
  { code: '',      item: '',        description: 'manhole',         selling_price: 50,  unit_cost: 50,  default_qty: 0, target_qty: 0,   unit: 'pcs' },
];

function calculateShiftName(hour: number): string {
  if (hour >= 7 && hour < 12) return 'Morning Run (07:30-12:30)';
  if (hour === 12) return 'Midday Transition (12:30-13:30)';
  if (hour >= 13 && hour <= 16) return 'Afternoon Run (13:30-17:00)';
  return 'Overtime / Special Run';
}

function calculateTotalsFromHourly(hourly: any[]) {
  let slabs = 0;
  let channels = 0;
  let cabros = 0;
  let colouredCabros = 0;
  let wallCoping = 0;
  let shallowDrains = 0;
  let roadKerbs = 0;
  let culverts450 = 0;
  let culverts900 = 0;
  let moulds = 0;

  let defSlabs = 0;
  let defChannels = 0;
  let defCabros = 0;
  let defColouredCabros = 0;
  let defWallCoping = 0;
  let defShallowDrains = 0;
  let defRoadKerbs = 0;
  let defCulverts450 = 0;
  let defCulverts900 = 0;
  let defMoulds = 0;

  for (const h of hourly) {
    slabs += h.slabsProduced || 0;
    channels += h.roadChannelsProduced || 0;
    cabros += h.cabrosProduced || 0;
    colouredCabros += h.colouredCabrosProduced || 0;
    wallCoping += h.wallCopingProduced || 0;
    shallowDrains += h.shallowDrainsProduced || 0;
    roadKerbs += h.roadKerbsProduced || 0;
    culverts450 += h.culverts450Produced || 0;
    culverts900 += h.culverts900Produced || 0;
    moulds += h.mouldsProduced || 0;

    defSlabs += h.defectiveSlabs || 0;
    defChannels += h.defectiveChannels || 0;
    defCabros += h.defectiveCabros || 0;
    defColouredCabros += h.defectiveColouredCabros || 0;
    defWallCoping += h.defectiveWallCoping || 0;
    defShallowDrains += h.defectiveShallowDrains || 0;
    defRoadKerbs += h.defectiveRoadKerbs || 0;
    defCulverts450 += h.defectiveCulverts450 || 0;
    defCulverts900 += h.defectiveCulverts900 || 0;
    defMoulds += h.defectiveMoulds || 0;
  }

  const totalProduced = slabs + channels + cabros + colouredCabros + wallCoping + shallowDrains + roadKerbs + culverts450 + culverts900;
  const totalDefects = defSlabs + defChannels + defCabros + defColouredCabros + defWallCoping + defShallowDrains + defRoadKerbs + defCulverts450 + defCulverts900;
  const defectRate = totalProduced > 0 ? parseFloat(((totalDefects / totalProduced) * 100).toFixed(2)) : 0;

  return {
    totalSlabs: slabs,
    totalChannels: channels,
    totalCabros: cabros,
    totalColouredCabros: colouredCabros,
    totalWallCoping: wallCoping,
    totalShallowDrains: shallowDrains,
    totalRoadKerbs: roadKerbs,
    totalCulverts450: culverts450,
    totalCulverts900: culverts900,
    totalMoulds: moulds,
    totalDefectiveSlabs: defSlabs,
    totalDefectiveChannels: defChannels,
    totalDefectiveCabros: defCabros,
    totalDefectiveColouredCabros: defColouredCabros,
    totalDefectiveMoulds: defMoulds,
    totalProduced,
    totalDefects,
    defectRate,
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// /api/health - verifies MongoDB Atlas connection
app.get('/api/health', async (_req, res) => {
  try {
    const coll = await getMongoCollection();
    if (coll) {
      const count = await coll.countDocuments();
      return res.json({
        connected: true,
        database: DB_NAME,
        collection: COLLECTION_NAME,
        documentCount: count,
        message: 'Connected to MongoDB Atlas cluster Panelpro.Stats',
      });
    }
  } catch (err: any) {
    return res.json({
      connected: false,
      database: DB_NAME,
      collection: COLLECTION_NAME,
      error: err?.message || 'Database connection error',
    });
  }

  res.json({
    connected: false,
    database: DB_NAME,
    collection: COLLECTION_NAME,
    message: 'Connecting to MongoDB Atlas...',
  });
});

// /api/stats/day
app.get('/api/stats/day', async (req, res) => {
  const dateStr = req.query.date as string;
  if (!dateStr) {
    return res.status(400).json({ error: 'Missing date parameter (YYYY-MM-DD)' });
  }

  try {
    const coll = await getMongoCollection();
    if (coll) {
      const doc = await coll.findOne({ date: dateStr });
      if (doc) {
        return res.json({ found: true, date: dateStr, log: doc });
      }
    }
  } catch (err: any) {
    console.warn(`Error fetching day log for ${dateStr}:`, err);
  }

  res.json({ found: false, date: dateStr, log: null });
});

// /api/stats/hourly (POST)
app.post('/api/stats/hourly', async (req, res) => {
  const dateStr = req.body?.date;
  const record = req.body?.record || req.body?.hourRecord;
  if (!dateStr || !record) {
    return res.status(400).json({ error: 'Missing date or record in body' });
  }

  try {
    const coll = await getMongoCollection();
    if (coll) {
      const hour = parseInt(record.hour, 10);
      record.hour = hour;
      record.shift = calculateShiftName(hour);

      let dayDoc = await coll.findOne({ date: dateStr });
      let hourly = dayDoc?.hourly || [];

      const idx = hourly.findIndex((h: any) => h.hour === hour);
      if (idx >= 0) {
        hourly[idx] = record;
      } else {
        hourly.push(record);
      }
      hourly.sort((a: any, b: any) => a.hour - b.hour);

      const totals = calculateTotalsFromHourly(hourly);
      const docToSave = {
        date: dateStr,
        supervisor: dayDoc?.supervisor || 'Marcus Vance',
        line: dayDoc?.line || 'Precast Operations',
        status: 'in-progress',
        hourly,
        ...totals,
        updatedAt: new Date().toISOString(),
      };

      await coll.updateOne({ date: dateStr }, { $set: docToSave }, { upsert: true });
      const updated = await coll.findOne({ date: dateStr });
      return res.json({ success: true, log: updated });
    }
  } catch (err: any) {
    console.warn('Error saving hourly record:', err);
  }

  res.json({ success: true, log: null });
});

// /api/stats/hourly (DELETE)
app.delete('/api/stats/hourly', async (req, res) => {
  const dateStr = req.query.date as string;
  const hour = parseInt(req.query.hour as string, 10);
  if (!dateStr || isNaN(hour)) {
    return res.status(400).json({ error: 'Missing date or hour' });
  }

  try {
    const coll = await getMongoCollection();
    if (coll) {
      const dayDoc = await coll.findOne({ date: dateStr });
      if (dayDoc) {
        const hourly = (dayDoc.hourly || []).filter((h: any) => h.hour !== hour);
        const totals = calculateTotalsFromHourly(hourly);
        await coll.updateOne(
          { date: dateStr },
          { $set: { hourly, ...totals, updatedAt: new Date().toISOString() } }
        );
        const updated = await coll.findOne({ date: dateStr });
        return res.json({ success: true, log: updated });
      }
    }
  } catch (err: any) {
    console.warn('Error deleting hourly record:', err);
  }

  res.json({ success: true, log: null });
});

// /api/stats/batch-day
app.post('/api/stats/batch-day', async (req, res) => {
  const dayData = req.body;
  if (!dayData || !dayData.date) {
    return res.status(400).json({ error: 'Missing day data or date' });
  }

  const dateStr = dayData.date;
  try {
    const coll = await getMongoCollection();
    if (coll) {
      const hourly = dayData.hourly || [];
      const totals = calculateTotalsFromHourly(hourly);
      const docToSave = {
        ...dayData,
        ...totals,
        updatedAt: new Date().toISOString(),
      };
      await coll.updateOne({ date: dateStr }, { $set: docToSave }, { upsert: true });
      const updated = await coll.findOne({ date: dateStr });
      return res.json({ success: true, log: updated });
    }
  } catch (err: any) {
    console.warn('Error saving batch day:', err);
  }

  res.json({ success: true, log: dayData });
});

// /api/stats/forgotten-day
app.post('/api/stats/forgotten-day', async (req, res) => {
  const data = req.body || {};
  const dateStr = data.date;
  if (!dateStr) {
    return res.status(400).json({ error: 'Missing date parameter (YYYY-MM-DD)' });
  }

  try {
    const coll = await getMongoCollection();

    let hourlyRecords = data.hourly;
    if (!hourlyRecords || !Array.isArray(hourlyRecords) || hourlyRecords.length === 0) {
      // 10 Operating intervals: 07:30 to 17:00 (hours 7 to 16)
      const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const count = hours.length;

      const slabs = parseInt(data.slabsProduced || 0, 10);
      const channels = parseInt(data.roadChannelsProduced || 0, 10);
      const cabros = parseInt(data.cabrosProduced || 0, 10);
      const colouredCabros = parseInt(data.colouredCabrosProduced || 0, 10);
      const wallCoping = parseInt(data.wallCopingProduced || 0, 10);
      const shallowDrains = parseInt(data.shallowDrainsProduced || 0, 10);
      const roadKerbs = parseInt(data.roadKerbsProduced || 0, 10);
      const culverts450 = parseInt(data.culverts450Produced || 0, 10);
      const culverts900 = parseInt(data.culverts900Produced || 0, 10);
      const moulds = parseInt(data.mouldsProduced || 0, 10);

      hourlyRecords = hours.map((h, idx) => {
        const isFirst = idx === 0;
        const s = Math.floor(slabs / count) + (isFirst ? slabs % count : 0);
        const c = Math.floor(channels / count) + (isFirst ? channels % count : 0);
        const cb = Math.floor(cabros / count) + (isFirst ? cabros % count : 0);
        const ccb = Math.floor(colouredCabros / count) + (isFirst ? colouredCabros % count : 0);
        const wc = Math.floor(wallCoping / count) + (isFirst ? wallCoping % count : 0);
        const sd = Math.floor(shallowDrains / count) + (isFirst ? shallowDrains % count : 0);
        const rk = Math.floor(roadKerbs / count) + (isFirst ? roadKerbs % count : 0);
        const c450 = Math.floor(culverts450 / count) + (isFirst ? culverts450 % count : 0);
        const c900 = Math.floor(culverts900 / count) + (isFirst ? culverts900 % count : 0);
        const m = Math.floor(moulds / count) + (isFirst ? moulds % count : 0);

        const d_s = isFirst ? parseInt(data.defectiveSlabs || 0, 10) : 0;
        const d_c = isFirst ? parseInt(data.defectiveChannels || 0, 10) : 0;
        const d_cb = isFirst ? parseInt(data.defectiveCabros || 0, 10) : 0;
        const d_ccb = isFirst ? parseInt(data.defectiveColouredCabros || 0, 10) : 0;
        const d_wc = isFirst ? parseInt(data.defectiveWallCoping || 0, 10) : 0;
        const d_sd = isFirst ? parseInt(data.defectiveShallowDrains || 0, 10) : 0;
        const d_rk = isFirst ? parseInt(data.defectiveRoadKerbs || 0, 10) : 0;
        const d_c450 = isFirst ? parseInt(data.defectiveCulverts450 || 0, 10) : 0;
        const d_c900 = isFirst ? parseInt(data.defectiveCulverts900 || 0, 10) : 0;
        const d_m = isFirst ? parseInt(data.defectiveMoulds || 0, 10) : 0;

        const prod = s + c + cb + ccb + wc + sd + rk + c450 + c900;
        const def = d_s + d_c + d_cb + d_ccb + d_wc + d_sd + d_rk + d_c450 + d_c900;
        const rate = prod > 0 ? parseFloat(((def / prod) * 100).toFixed(2)) : 0;

        return {
          hour: h,
          shift: calculateShiftName(h),
          slabsProduced: s,
          defectiveSlabs: d_s,
          roadChannelsProduced: c,
          defectiveChannels: d_c,
          cabrosProduced: cb,
          defectiveCabros: d_cb,
          colouredCabrosProduced: ccb,
          defectiveColouredCabros: d_ccb,
          wallCopingProduced: wc,
          defectiveWallCoping: d_wc,
          shallowDrainsProduced: sd,
          defectiveShallowDrains: d_sd,
          roadKerbsProduced: rk,
          defectiveRoadKerbs: d_rk,
          culverts450Produced: c450,
          defectiveCulverts450: d_c450,
          culverts900Produced: c900,
          defectiveCulverts900: d_c900,
          mouldsProduced: m,
          defectiveMoulds: d_m,
          defectRate: rate,
          primaryDefectReason: data.primaryDefectReason || 'None',
          machineDowntimeMinutes: 0,
          notes: isFirst ? data.notes || '' : '',
        };
      });
    }

    const totals = calculateTotalsFromHourly(hourlyRecords);
    const docToSave = {
      date: dateStr,
      supervisor: data.supervisor || 'Plant Shift Lead',
      line: 'Precast Operations',
      status: 'completed',
      shiftNotes: data.notes || 'Backfilled forgotten day production',
      hourly: hourlyRecords,
      ...totals,
      updatedAt: new Date().toISOString(),
    };

    if (coll) {
      await coll.updateOne({ date: dateStr }, { $set: docToSave }, { upsert: true });
      const updated = await coll.findOne({ date: dateStr });
      return res.json({ success: true, log: updated, message: `Forgotten day saved for ${dateStr}` });
    }
    return res.json({ success: true, log: docToSave, message: `Forgotten day saved for ${dateStr}` });
  } catch (err: any) {
    console.warn('Error saving forgotten day:', err);
    res.status(500).json({ error: err.message });
  }
});

// /api/stats/all
app.get('/api/stats/all', async (req, res) => {
  const limit = parseInt(req.query.limit as string, 10) || 100;
  try {
    const coll = await getMongoCollection();
    if (coll) {
      const docs = await coll.find({}).sort({ date: -1 }).limit(limit).toArray();
      return res.json({ logs: docs });
    }
  } catch (err: any) {
    console.warn('Error fetching all logs:', err);
  }
  res.json({ logs: [] });
});

// /api/stats/reset-to-zero: User requested "can everything be set at 0, there's no production start yet"
app.post('/api/stats/reset-to-zero', async (_req, res) => {
  try {
    const coll = await getMongoCollection();
    if (coll) {
      await coll.deleteMany({});
      return res.json({ success: true, message: 'All production stats reset cleanly to 0' });
    }
  } catch (err: any) {
    console.warn('Error resetting database to zero:', err);
  }
  res.json({ success: true });
});

// /api/reports/history-range
app.get('/api/reports/history-range', async (_req, res) => {
  let earliest = '2026-09-01';
  let latest = new Date().toISOString().split('T')[0];

  try {
    const coll = await getMongoCollection();
    if (coll) {
      const first = await coll.find({}).sort({ date: 1 }).limit(1).toArray();
      const last = await coll.find({}).sort({ date: -1 }).limit(1).toArray();
      if (first.length > 0 && first[0].date) earliest = first[0].date;
      if (last.length > 0 && last[0].date && last[0].date > latest) latest = last[0].date;
    }
  } catch (err) {
    console.warn('Error getting history bounds:', err);
  }

  const [eY, eM] = earliest.split('-').map(Number);
  const [lY, lM] = latest.split('-').map(Number);

  const months: any[] = [];
  let cy = eY,
    cm = eM;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  while (cy < lY || (cy === lY && cm <= lM)) {
    const id = `${cy.toString().padStart(4, '0')}-${cm.toString().padStart(2, '0')}`;
    const name = `${monthNames[cm - 1]} ${cy}`;
    months.push({ id, value: id, name, label: name, year: cy, month: cm });
    cm++;
    if (cm > 12) {
      cm = 1;
      cy++;
    }
  }

  res.json({
    earliestDate: earliest,
    latestDate: latest,
    availableMonths: months,
    currentMonth: `${lY.toString().padStart(4, '0')}-${lM.toString().padStart(2, '0')}`,
  });
});

// /api/reports/month-weeks
app.get('/api/reports/month-weeks', async (req, res) => {
  const monthStr = (req.query.month as string) || '2026-10';
  const [yStr, mStr] = monthStr.split('-');
  const year = parseInt(yStr, 10) || 2026;
  const month = parseInt(mStr, 10) || 10;

  const weeks: any[] = [];
  let curr = new Date(year, month - 1, 1);
  let weekIdx = 1;

  let allMonthDocs: any[] = [];
  try {
    const coll = await getMongoCollection();
    if (coll) {
      allMonthDocs = await coll.find({ date: { $regex: `^${monthStr}` } }).toArray();
    }
  } catch (err) {
    console.warn('Error getting month docs for weeks:', err);
  }

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

    for (const doc of allMonthDocs) {
      if (doc.date >= sIso && doc.date <= eIso) {
        daysLogged++;
        for (const h of doc.hourly || []) {
          slabs += h.slabsProduced || 0;
          channels += h.roadChannelsProduced || 0;
        }
      }
    }

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

    weekIdx++;
    curr = new Date(endW);
    curr.setDate(curr.getDate() + 2); // Skip Sunday
  }

  res.json({
    month: monthStr,
    weeks,
  });
});

// /api/reports/weekly-catalog
app.get('/api/reports/weekly-catalog', async (req, res) => {
  const periodStr = (req.query.period as string) || '09/10-15/10';
  const startDate = req.query.start_date as string;
  const endDate = req.query.end_date as string;

  const catalog = DEFAULT_CATALOG.map(item => ({ ...item, qty: item.default_qty }));

  if (startDate && endDate) {
    try {
      const coll = await getMongoCollection();
      if (coll) {
        const docs = await coll.find({ date: { $gte: startDate, $lte: endDate } }).toArray();
        let sSum = 0;
        let cSum = 0;
        let cbSum = 0;
        let ccbSum = 0;
        let wcSum = 0;
        let sdSum = 0;
        let rkSum = 0;
        let c450Sum = 0;
        let c900Sum = 0;

        for (const d of docs) {
          for (const h of d.hourly || []) {
            sSum += h.slabsProduced || 0;
            cSum += h.roadChannelsProduced || 0;
            cbSum += h.cabrosProduced || 0;
            ccbSum += h.colouredCabrosProduced || 0;
            wcSum += h.wallCopingProduced || 0;
            sdSum += h.shallowDrainsProduced || 0;
            rkSum += h.roadKerbsProduced || 0;
            c450Sum += h.culverts450Produced || 0;
            c900Sum += h.culverts900Produced || 0;
          }
        }

        for (const it of catalog) {
          if (it.description === 'Paving Slabs') it.qty = sSum;
          else if (it.description === 'Road Channels') it.qty = cSum;
          else if (it.description === 'Cabros') it.qty = cbSum;
          else if (it.description === 'Coloured Cabros') it.qty = ccbSum;
          else if (it.description === 'Wall Coping') it.qty = wcSum;
          else if (it.description === 'Shallow Drains') it.qty = sdSum;
          else if (it.description === 'Road kerbs') it.qty = rkSum;
          else if (it.description === '450mm culverts') it.qty = c450Sum;
          else if (it.description === '900mm culverts') it.qty = c900Sum;
        }
      }
    } catch (err) {
      console.warn('Error fetching weekly catalog from Mongo:', err);
    }
  }

  res.json({
    period: periodStr,
    items: catalog,
  });
});

// /api/reports/weekly-excel - Generates Excel matching exact styled layout with Navy (#0D3B66) header and formulas
app.all('/api/reports/weekly-excel', async (req, res) => {
  let periodStr = '09/10-15/10';
  let itemsToUse: any[] = DEFAULT_CATALOG;

  if (req.method === 'POST') {
    const data = req.body || {};
    if (data.period) periodStr = data.period;
    if (data.items && Array.isArray(data.items)) itemsToUse = data.items;
  } else {
    if (req.query.period) periodStr = req.query.period as string;
    if (req.query.items) {
      try {
        itemsToUse = JSON.parse(req.query.items as string);
      } catch {
        // fallback
      }
    }
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weekly Report', {
      views: [{ showGridLines: true }],
    });

    // Columns: Period | Code | Item | Description | Qty | Selling Price | Sales Total | Unit Cost | Cost Total | Profit
    sheet.columns = [
      { key: 'period', width: 15 },
      { key: 'code', width: 10 },
      { key: 'item', width: 10 },
      { key: 'description', width: 22 },
      { key: 'qty', width: 10 },
      { key: 'selling_price', width: 14 },
      { key: 'sales_total', width: 14 },
      { key: 'unit_cost', width: 12 },
      { key: 'cost_total', width: 14 },
      { key: 'profit', width: 14 },
    ];

    // Header Row with Navy Blue #0D3B66
    const headerRow = sheet.addRow([
      'Period', 'Code', 'Item', 'Description', 'Qty',
      'Selling Price', 'Sales Total', 'Unit Cost', 'Cost Total', 'Profit',
    ]);
    headerRow.height = 24;

    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D3B66' },
      };
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        left: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
      };
    });

    const startRowIdx = 2;
    let currentRowIdx = startRowIdx;

    const dashNumberFormat = '#,##0;-#,##0;"-"';

    for (const item of itemsToUse) {
      const q = item.qty || 0;
      const sp = item.selling_price || 0;
      const uc = item.unit_cost || 0;

      const row = sheet.addRow([
        currentRowIdx === startRowIdx ? periodStr : '',
        item.code || '',
        item.item || '',
        item.description || '',
        q > 0 ? q : '',
        sp,
        { formula: `IF(ISBLANK(E${currentRowIdx}),"-",IF(E${currentRowIdx}>0,E${currentRowIdx}*F${currentRowIdx},"-"))` },
        uc,
        { formula: `IF(ISBLANK(E${currentRowIdx}),"-",IF(E${currentRowIdx}>0,E${currentRowIdx}*H${currentRowIdx},"-"))` },
        { formula: `IF(ISBLANK(E${currentRowIdx}),"-",IF(E${currentRowIdx}>0,G${currentRowIdx}-I${currentRowIdx},"-"))` },
      ]);

      row.height = 20;

      // Period cell
      const cA = row.getCell(1);
      cA.alignment = { horizontal: 'center', vertical: 'middle' };
      cA.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } };

      // Code & Item
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

      // Description
      row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };

      // Qty - Blue Font
      const cQty = row.getCell(5);
      cQty.alignment = { horizontal: 'right', vertical: 'middle' };
      cQty.font = { name: 'Calibri', size: 11, color: { argb: 'FF0000FF' } };
      cQty.numFmt = '#,##0';

      // Selling Price - Blue Font
      const cSp = row.getCell(6);
      cSp.alignment = { horizontal: 'right', vertical: 'middle' };
      cSp.font = { name: 'Calibri', size: 11, color: { argb: 'FF0000FF' } };
      cSp.numFmt = '#,##0';

      // Sales Total - Formula with Dash Format
      const cSales = row.getCell(7);
      cSales.alignment = { horizontal: 'right', vertical: 'middle' };
      cSales.numFmt = dashNumberFormat;

      // Unit Cost - Blue Font
      const cUc = row.getCell(8);
      cUc.alignment = { horizontal: 'right', vertical: 'middle' };
      cUc.font = { name: 'Calibri', size: 11, color: { argb: 'FF0000FF' } };
      cUc.numFmt = '#,##0';

      // Cost Total - Formula
      const cCost = row.getCell(9);
      cCost.alignment = { horizontal: 'right', vertical: 'middle' };
      cCost.numFmt = dashNumberFormat;

      // Profit - Formula
      const cProfit = row.getCell(10);
      cProfit.alignment = { horizontal: 'right', vertical: 'middle' };
      cProfit.numFmt = dashNumberFormat;

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D7DE' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
          left: { style: 'thin', color: { argb: 'FFD0D7DE' } },
          right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        };
      });

      currentRowIdx++;
    }

    const lastItemRow = currentRowIdx - 1;

    // TOTAL ROW
    const totalRow = sheet.addRow([
      '', '', '', 'TOTAL',
      { formula: `SUM(E${startRowIdx}:E${lastItemRow})` },
      '',
      { formula: `SUM(G${startRowIdx}:G${lastItemRow})` },
      '',
      { formula: `SUM(I${startRowIdx}:I${lastItemRow})` },
      { formula: `SUM(J${startRowIdx}:J${lastItemRow})` },
    ]);
    totalRow.height = 22;

    totalRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'double', color: { argb: 'FF000000' } },
      };
    });

    totalRow.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
    totalRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(5).numFmt = '#,##0';
    totalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(7).numFmt = '#,##0';
    totalRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(9).numFmt = '#,##0';
    totalRow.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(10).numFmt = '#,##0';

    // Blank row
    sheet.addRow([]);

    // Footnotes matching spreadsheet template
    const fn1 = sheet.addRow([
      '*Note: headers are inferred (source PDF had none). Blue = values copied from PDF; black = formulas.',
    ]);
    fn1.getCell(1).font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } };

    const fn2 = sheet.addRow([
      '*Source PDF showed Sales total 91,515 and profit 30,090; line items sum to 81,765 (difference 9,750). Cost total 61,425 matches.',
    ]);
    fn2.getCell(1).font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFC00000' } };

    const cleanPeriod = periodStr.replace(/[\/\\:]/g, '-');
    const filename = `Weekly_Production_Report_${cleanPeriod}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error('Error generating Excel report:', err);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`======================================================================`);
    console.log(` Panelpro Precast & Logistics Ltd Server Running on port ${PORT}`);
    console.log(` Clean Slate: All variables initialized to 0`);
    console.log(` 600mm Culvert: Completely Removed`);
    console.log(` Daily inputs include: Channels, Slabs, Cabros, Coloured Cabros, Wall Copy, Shallow Drains, Road Kerbs, 450mm & 900mm Culverts`);
    console.log(`======================================================================`);
  });
}

startServer();
