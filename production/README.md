# CastOps - Production & Defect Monitoring System
### Zero-Node Edition: Pure HTML, CSS, JavaScript & Python (MongoDB Atlas)

Industrial production monitoring dashboard for **precast slabs, road channels, and moulds** with hourly defect rate telemetry, shift tracking, daily logging, monthly & yearly analytics, Pareto root-cause analysis, and What-If ROI modeling.

Directly connected to **MongoDB Atlas**:
- **Cluster**: `cluster0.nnvvp7x.mongodb.net`
- **Database**: `Panelpro`
- **Collection**: `Stats`

---

## Operating Schedule
- **Production Days**: Monday through Saturday
- **Shift Hours**: **07:30 AM – 5:00 PM (17:00)** across 10 discrete hourly intervals
  - `07:30 - 08:30` (Morning Run)
  - `08:30 - 09:30` (Morning Run)
  - `09:30 - 10:30` (Morning Run)
  - `10:30 - 11:30` (Morning Run)
  - `11:30 - 12:30` (Morning Run)
  - `12:30 - 13:30` (Midday Break & Line Inspection)
  - `13:30 - 14:30` (Afternoon Run)
  - `14:30 - 15:30` (Afternoon Run)
  - `15:30 - 16:30` (Afternoon Run)
  - `16:30 - 17:00` (Afternoon Run & Washdown)
- **Sunday**: Non-production / Scheduled Maintenance

---

## How to Run (100% Zero-Node — Pure Python + HTML/CSS/JS)

You do **NOT** need Node.js, `npm`, or `vite` installed at all! Everything is served by Python, and the UI runs directly in your browser.

### Step 1: Open Terminal in the Unzipped Project Folder
In VS Code, press `` Ctrl+` `` (Windows) or `` Cmd+` `` (Mac) to open the terminal, or open your standard Terminal / Command Prompt and navigate to this folder.

### Step 2: Install Python Libraries
Run this single command:
```bash
pip3 install -r requirements.txt
```
*(Or manually: `pip3 install pymongo dnspython flask flask-cors python-dotenv openpyxl`)*
*(On Windows: `pip install -r requirements.txt`)*


### Step 3: Start the Application
Run:
```bash
python3 server.py
```
*(On Windows: `python server.py`)*

You will see:
```text
======================================================================
 CastOps - Production & Defect Monitoring System
 Standalone Zero-Node Edition: Pure HTML/CSS/JS + Python Flask
======================================================================
 * Connected to MongoDB: cluster0.nnvvp7x.mongodb.net (Panelpro.Stats)
 * Dashboard URL:        http://127.0.0.1:5050
 * Shift Schedule:      Mon - Sat: 07:30 to 17:00 (Sunday Maintenance)
 * Zero Node / Zero Vite required! Press Ctrl+C to quit.
======================================================================
```

### Step 4: Open in Your Browser
Click or navigate to:
👉 **[http://localhost:5050](http://localhost:5050)** (or the URL printed in your terminal)

---

## Why this eliminates the Mac errors you encountered:
1. **No `vite: command not found`**: Node.js and Vite are completely bypassed. Python serves the HTML, CSS, JavaScript, and MongoDB APIs together in one process.
2. **No `Port 5000 is in use` / AirPlay error**: macOS Monterey/Ventura/Sonoma uses port 5000 for Apple AirPlay Receiver. Our server automatically starts on **port 5050** (and automatically detects if a port is busy to try the next open port like 5051 or 8081). You will never get an "Address already in use" crash.

---

## Features Included in the Dashboard
- **Real-Time Monitor**: Hourly production gauges, defect percentage, live line telemetry.
- **Hourly Shift Logger**: Modal to log slabs, channels, moulds, defect counts, primary causes, and notes for the 07:30–17:00 shift slots.
- **Pareto Defect Breakdown**: Visualizes top defect causes (Cracked corners, Honeycombing, Dimensional out-of-tolerance, Surface voids, Mould warping, Curing discolouration).
- **Daily Operations Ledger**: Complete tabular shift records with edit and delete capabilities.
- **Monthly Analytics**: 30-day production trends, daily scrap rates, weekday defect heatmaps.
- **Yearly Analytics**: 12-month aggregated volumes, seasonal defect patterns, annual yield rate.
- **Actionable Insights & ROI Simulator**: What-If financial simulator calculating annual dollar savings per 0.5% defect reduction.
- **Weekly Financial & Production Report (Excel .xlsx)**: Dedicated section matching your production sheet with navy blue headers, item codes (IN001–IN010), catalog descriptions, selling prices, unit costs, dynamic quantity inputs, calculated Sales Total, Cost Total, and Profit formulas, with 1-click formatted `.xlsx` download.
- **Export & Sync**: Export shift data to CSV (`panelpro_stats_export.csv`), Weekly Excel `.xlsx` reports, and direct live sync to MongoDB Atlas.

