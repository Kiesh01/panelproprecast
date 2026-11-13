import os
import sys
import socket
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure python directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Locate static folder
if os.path.exists(os.path.join(BASE_DIR, "static")):
    STATIC_DIR = os.path.join(BASE_DIR, "static")
else:
    STATIC_DIR = os.path.join(os.path.dirname(BASE_DIR), "static")

from db import (
    check_connection,
    get_day_log,
    upsert_day_log,
    upsert_hourly_record,
    delete_hourly_record,
    get_month_logs,
    get_year_logs,
    get_all_logs,
    get_date_range_logs,
    get_db_date_bounds,
    calculate_totals_from_hourly,
)
from seed_data import seed_database
from excel_report import generate_weekly_excel_report, DEFAULT_CATALOG
import json
import calendar
from datetime import date, datetime, timedelta



load_dotenv()

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="/static")
CORS(app)

# -------------------------------------------------------------
# Frontend Routes (Zero Node.js Required)
# -------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/<path:filename>")
def serve_static_root(filename):
    file_path = os.path.join(STATIC_DIR, filename)
    if os.path.isfile(file_path):
        return send_from_directory(STATIC_DIR, filename)
    return send_from_directory(STATIC_DIR, "index.html")

# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    status = check_connection()
    return jsonify(status)

@app.route("/api/stats/day", methods=["GET"])
def get_day():
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Missing date parameter (YYYY-MM-DD)"}), 400
    
    log = get_day_log(date_str)
    if not log:
        return jsonify({"found": False, "date": date_str, "log": None})
    return jsonify({"found": True, "date": date_str, "log": log})

@app.route("/api/stats/hourly", methods=["POST"])
def post_hourly():
    data = request.json or {}
    date_str = data.get("date")
    record = data.get("record")
    if not date_str or not record:
        return jsonify({"error": "Missing date or record"}), 400

    updated_day = upsert_hourly_record(date_str, record)
    return jsonify({"success": True, "log": updated_day})

@app.route("/api/stats/hourly", methods=["DELETE"])
def delete_hourly():
    date_str = request.args.get("date")
    hour = request.args.get("hour")
    if not date_str or hour is None:
        return jsonify({"error": "Missing date or hour"}), 400

    updated_day = delete_hourly_record(date_str, int(hour))
    return jsonify({"success": True, "log": updated_day})

@app.route("/api/stats/batch-day", methods=["POST"])
def post_batch_day():
    day_data = request.json
    if not day_data or not day_data.get("date"):
        return jsonify({"error": "Missing day data or date"}), 400

    saved_day = upsert_day_log(day_data)
    return jsonify({"success": True, "log": saved_day})

@app.route("/api/stats/month", methods=["GET"])
def get_month():
    month_str = request.args.get("month", "2026-10")
    logs = get_month_logs(month_str)

    total_slabs = sum(l.get("totalSlabs", 0) for l in logs)
    total_channels = sum(l.get("totalChannels", 0) for l in logs)
    total_moulds = sum(l.get("totalMoulds", 0) for l in logs)
    total_defects = sum(l.get("totalDefects", 0) for l in logs)
    total_produced = total_slabs + total_channels
    avg_rate = round((total_defects / total_produced * 100), 2) if total_produced > 0 else 0.0

    return jsonify({
        "month": month_str,
        "daysLogged": len(logs),
        "totalSlabs": total_slabs,
        "totalChannels": total_channels,
        "totalMoulds": total_moulds,
        "totalProduced": total_produced,
        "totalDefects": total_defects,
        "averageDefectRate": avg_rate,
        "logs": logs
    })

@app.route("/api/stats/year", methods=["GET"])
def get_year():
    try:
        year_int = int(request.args.get("year", "2026"))
    except ValueError:
        year_int = 2026

    logs = get_year_logs(year_int)
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    breakdown = [{"month": i, "monthName": name, "slabs": 0, "channels": 0, "moulds": 0, "defects": 0, "defectRate": 0.0} for i, name in enumerate(month_names)]

    total_slabs = 0
    total_channels = 0
    total_moulds = 0
    total_defects = 0

    for l in logs:
        m_idx = l.get("month", 1) - 1
        if 0 <= m_idx < 12:
            breakdown[m_idx]["slabs"] += l.get("totalSlabs", 0)
            breakdown[m_idx]["channels"] += l.get("totalChannels", 0)
            breakdown[m_idx]["moulds"] += l.get("totalMoulds", 0)
            breakdown[m_idx]["defects"] += l.get("totalDefects", 0)

            total_slabs += l.get("totalSlabs", 0)
            total_channels += l.get("totalChannels", 0)
            total_moulds += l.get("totalMoulds", 0)
            total_defects += l.get("totalDefects", 0)

    for b in breakdown:
        prod = b["slabs"] + b["channels"]
        b["defectRate"] = round((b["defects"] / prod * 100), 2) if prod > 0 else 0.0

    tot_prod = total_slabs + total_channels
    avg_rate = round((total_defects / tot_prod * 100), 2) if tot_prod > 0 else 0.0

    return jsonify({
        "year": year_int,
        "totalSlabs": total_slabs,
        "totalChannels": total_channels,
        "totalMoulds": total_moulds,
        "totalProduced": tot_prod,
        "totalDefects": total_defects,
        "averageDefectRate": avg_rate,
        "monthlyBreakdown": breakdown,
        "logCount": len(logs)
    })

@app.route("/api/stats/all", methods=["GET"])
def get_all():
    limit = int(request.args.get("limit", 60))
    logs = get_all_logs(limit)
    return jsonify({"logs": logs})

@app.route("/api/stats/seed", methods=["POST"])
def reseed():
    seed_database(45)
    return jsonify({"success": True, "message": "Panelpro.Stats re-seeded successfully from MongoDB"})

@app.route("/api/stats/export", methods=["GET"])
def export_csv():
    logs = get_all_logs(200)
    lines = [
        "Date,Hour,Shift,Channels Produced,Slabs Produced,Cabros Produced,Coloured Cabros Produced,Wall Coping Produced,Shallow Drains Produced,Road Kerbs Produced,450mm Culverts Produced,900mm Culverts Produced,Moulds Produced,Defective Slabs,Defective Channels,Defective Coloured Cabros,Defective Moulds,Defect Rate %,Primary Defect Reason,Notes"
    ]
    for day in logs:
        d = day.get("date", "")
        for h in day.get("hourly", []):
            hour_str = f"{h.get('hour', 0):02d}:00"
            shift_str = f'"{h.get("shift", "")}"'
            rate_str = f"{h.get('defectRate', 0):.2f}"
            reason_str = f'"{h.get("primaryDefectReason", "None")}"'
            notes_str = f'"{h.get("notes", "").replace(chr(34), chr(34)+chr(34))}"'
            line = (
                f"{d},{hour_str},{shift_str},"
                f"{h.get('roadChannelsProduced',0)},{h.get('slabsProduced',0)},{h.get('cabrosProduced',0)},{h.get('colouredCabrosProduced',0)},"
                f"{h.get('wallCopingProduced',0)},{h.get('shallowDrainsProduced',0)},{h.get('roadKerbsProduced',0)},"
                f"{h.get('culverts450Produced',0)},{h.get('culverts900Produced',0)},{h.get('mouldsProduced',0)},"
                f"{h.get('defectiveSlabs',0)},{h.get('defectiveChannels',0)},{h.get('defectiveColouredCabros',0)},{h.get('defectiveMoulds',0)},"
                f"{rate_str},{reason_str},{notes_str}"
            )
            lines.append(line)

    csv_data = "\n".join(lines)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=panelpro_stats_export.csv"}
    )

@app.route("/api/reports/weekly-catalog", methods=["GET"])
def get_weekly_catalog():
    period_str = request.args.get("period", "09/10-15/10")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    agg = None
    log_count = 0

    if start_date and end_date:
        logs = get_date_range_logs(start_date, end_date)
        log_count = len(logs)
        if logs:
            agg = {
                "Paving Slabs": sum(l.get("totalSlabs", 0) for l in logs),
                "Road Channels": sum(l.get("totalChannels", 0) for l in logs),
                "Cabros": sum(l.get("totalCabros", 0) for l in logs),
                "Coloured Cabros": sum(l.get("totalColouredCabros", 0) for l in logs),
                "Wall Coping": sum(l.get("totalWallCoping", 0) for l in logs),
                "Shallow Drains": sum(l.get("totalShallowDrains", 0) for l in logs),
                "Road kerbs": sum(l.get("totalRoadKerbs", 0) for l in logs),
                "450mm culverts": sum(l.get("totalCulverts450", 0) for l in logs),
                "900mm culverts": sum(l.get("totalCulverts900", 0) for l in logs),
                "Side Slabs": sum(l.get("totalSideSlabs", 0) for l in logs),
            }

    # Clone default catalog
    catalog = [dict(item) for item in DEFAULT_CATALOG]

    for item in catalog:
        desc = item["description"]
        if agg is not None and desc in agg:
            item["qty"] = agg[desc]
        else:
            item["qty"] = item.get("default_qty", 0)

        # Calculate line item financials
        qty = item["qty"]
        sp = item["selling_price"]
        uc = item["unit_cost"]
        item["sales_total"] = (qty * sp) if qty > 0 else 0
        item["cost_total"] = (qty * uc) if qty > 0 else 0
        item["profit"] = (item["sales_total"] - item["cost_total"]) if qty > 0 else 0

    total_qty = sum(i["qty"] for i in catalog)
    total_sales = sum(i["sales_total"] for i in catalog)
    total_cost = sum(i["cost_total"] for i in catalog)
    total_profit = sum(i["profit"] for i in catalog)

    return jsonify({
        "period": period_str,
        "start_date": start_date,
        "end_date": end_date,
        "daysLogged": log_count,
        "items": catalog,
        "totals": {
            "qty": total_qty,
            "salesTotal": total_sales,
            "costTotal": total_cost,
            "profit": total_profit
        }
    })

@app.route("/api/reports/weekly-excel", methods=["GET", "POST"])
def export_weekly_excel():
    period_str = "09/10-15/10"
    items_to_use = None
    include_footnotes = True

    if request.method == "POST":
        data = request.json or {}
        period_str = data.get("period", period_str)
        items_to_use = data.get("items")
        include_footnotes = data.get("include_footnotes", True)
    else:
        period_str = request.args.get("period", period_str)
        items_json = request.args.get("items")
        if items_json:
            try:
                items_to_use = json.loads(items_json)
            except Exception:
                items_to_use = None

        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        if not items_to_use and start_date and end_date:
            logs = get_date_range_logs(start_date, end_date)
            if logs:
                agg = {
                    "Paving Slabs": sum(l.get("totalSlabs", 0) for l in logs),
                    "Road Channels": sum(l.get("totalChannels", 0) for l in logs),
                    "Cabros": sum(l.get("totalCabros", 0) for l in logs),
                    "Coloured Cabros": sum(l.get("totalColouredCabros", 0) for l in logs),
                    "Wall Coping": sum(l.get("totalWallCoping", 0) for l in logs),
                    "Shallow Drains": sum(l.get("totalShallowDrains", 0) for l in logs),
                    "Road kerbs": sum(l.get("totalRoadKerbs", 0) for l in logs),
                    "450mm culverts": sum(l.get("totalCulverts450", 0) for l in logs),
                    "900mm culverts": sum(l.get("totalCulverts900", 0) for l in logs),
                    "Side Slabs": sum(l.get("totalSideSlabs", 0) for l in logs),
                }
                items_to_use = [dict(it) for it in DEFAULT_CATALOG]
                for it in items_to_use:
                    desc = it["description"]
                    it["qty"] = agg.get(desc, it.get("default_qty", 0))

    excel_buffer = generate_weekly_excel_report(
        period_label=period_str,
        catalog_items=items_to_use,
        include_footnotes=include_footnotes
    )

    clean_period = "".join(c for c in period_str if c.isalnum() or c in "-_")
    filename = f"Weekly_Production_Report_{clean_period}.xlsx"

    return Response(
        excel_buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


def calculate_weeks_in_month(year: int, month: int):
    """
    Computes Monday through Saturday production shift weeks for the specified month.
    """
    weeks = []
    curr = date(year, month, 1)
    week_idx = 1

    while curr.month == month:
        if curr.weekday() == 6:  # Skip Sunday maintenance
            curr += timedelta(days=1)
            if curr.month != month:
                break

        start_w = curr
        days_to_sat = 5 - curr.weekday()
        end_w = curr + timedelta(days=days_to_sat)

        period_str = f"{start_w.strftime('%d/%m')}-{end_w.strftime('%d/%m')}"
        start_str = start_w.strftime('%Y-%m-%d')
        end_str = end_w.strftime('%Y-%m-%d')

        logs = get_date_range_logs(start_str, end_str)
        slabs = sum(l.get("totalSlabs", 0) for l in logs) if logs else 0
        channels = sum(l.get("totalChannels", 0) for l in logs) if logs else 0
        moulds = sum(l.get("totalMoulds", 0) for l in logs) if logs else 0
        defects = sum(l.get("totalDefects", 0) for l in logs) if logs else 0

        weeks.append({
            "weekNumber": week_idx,
            "label": f"Week {week_idx} ({period_str})",
            "period": period_str,
            "startDate": start_str,
            "start_date": start_str,
            "endDate": end_str,
            "end_date": end_str,
            "dates": f"{start_w.strftime('%d/%m')} - {end_w.strftime('%d/%m')}",
            "daysLogged": len(logs),
            "days_logged": len(logs),
            "totalSlabs": slabs,
            "total_slabs": slabs,
            "totalChannels": channels,
            "total_channels": channels,
            "totalMoulds": moulds,
            "total_moulds": moulds,
            "totalDefects": defects,
            "total_defects": defects
        })

        week_idx += 1
        curr = end_w + timedelta(days=2)  # Skip Sunday to next Monday

    return weeks


@app.route("/api/reports/history-range", methods=["GET"])
def get_history_range():
    bounds = get_db_date_bounds()
    earliest_str = bounds.get("earliest", "2026-09-01")
    latest_str = bounds.get("latest", "2026-11-08")

    try:
        e_y, e_m, _ = map(int, earliest_str.split("-"))
    except Exception:
        e_y, e_m = 2026, 9

    try:
        l_y, l_m, _ = map(int, latest_str.split("-"))
    except Exception:
        l_y, l_m = 2026, 11

    months = []
    cy, cm = e_y, e_m
    while (cy < l_y) or (cy == l_y and cm <= l_m):
        m_id = f"{cy:04d}-{cm:02d}"
        m_name = f"{calendar.month_name[cm]} {cy}"
        months.append({
            "id": m_id,
            "value": m_id,
            "name": m_name,
            "label": m_name,
            "year": cy,
            "month": cm
        })
        cm += 1
        if cm > 12:
            cm = 1
            cy += 1

    return jsonify({
        "earliestDate": earliest_str,
        "earliest_date": earliest_str,
        "latestDate": latest_str,
        "latest_date": latest_str,
        "availableMonths": months,
        "months": months,
        "currentMonth": f"{l_y:04d}-{l_m:02d}"
    })


@app.route("/api/reports/month-weeks", methods=["GET"])
def get_month_weeks_route():
    month_str = request.args.get("month", "2026-10")
    try:
        parts = month_str.split("-")
        y = int(parts[0])
        m = int(parts[1])
    except Exception:
        y, m = 2026, 10

    weeks = calculate_weeks_in_month(y, m)
    return jsonify({
        "month": month_str,
        "monthName": f"{calendar.month_name[m]} {y}",
        "weeks": weeks
    })


@app.route("/api/stats/forgotten-day", methods=["POST"])
def post_forgotten_day():
    data = request.json or {}
    date_str = data.get("date")
    if not date_str:
        return jsonify({"error": "Missing date parameter (YYYY-MM-DD)"}), 400

    slabs = int(data.get("slabsProduced") or data.get("totalSlabs") or 0)
    channels = int(data.get("roadChannelsProduced") or data.get("totalChannels") or 0)
    cabros = int(data.get("cabrosProduced") or data.get("totalCabros") or 0)
    coloured_cabros = int(data.get("colouredCabrosProduced") or data.get("totalColouredCabros") or 0)
    wall_coping = int(data.get("wallCopingProduced") or data.get("totalWallCoping") or 0)
    shallow_drains = int(data.get("shallowDrainsProduced") or data.get("totalShallowDrains") or 0)
    road_kerbs = int(data.get("roadKerbsProduced") or data.get("totalRoadKerbs") or 0)
    culverts_450 = int(data.get("culverts450Produced") or data.get("totalCulverts450") or 0)
    culverts_900 = int(data.get("culverts900Produced") or data.get("totalCulverts900") or 0)
    side_slabs = int(data.get("sideSlabsProduced") or data.get("totalSideSlabs") or 0)
    moulds = int(data.get("mouldsProduced") or data.get("totalMoulds") or 0)

    def_slabs = int(data.get("defectiveSlabs") or 0)
    def_channels = int(data.get("defectiveChannels") or 0)
    def_cabros = int(data.get("defectiveCabros") or 0)
    def_coloured_cabros = int(data.get("defectiveColouredCabros") or 0)
    def_wall_coping = int(data.get("defectiveWallCoping") or 0)
    def_shallow_drains = int(data.get("defectiveShallowDrains") or 0)
    def_road_kerbs = int(data.get("defectiveRoadKerbs") or 0)
    def_culverts_450 = int(data.get("defectiveCulverts450") or 0)
    def_culverts_900 = int(data.get("defectiveCulverts900") or 0)
    def_side_slabs = int(data.get("defectiveSideSlabs") or 0)
    def_moulds = int(data.get("defectiveMoulds") or data.get("damagedMoulds") or 0)

    reason = data.get("primaryDefectReason") or data.get("primaryReason") or "None"
    supervisor = data.get("supervisor", "Marcus Vance")
    notes = data.get("notes", "Backfilled forgotten day production record")
    hourly_input = data.get("hourly")

    if hourly_input and isinstance(hourly_input, list) and len(hourly_input) > 0:
        hourly_records = hourly_input
    else:
        # Standard Mon-Sat shift intervals: 07:30 to 17:00 (10 intervals, hours 7 to 16)
        hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        count = len(hours)

        def distribute(val):
            per_h = val // count
            rem = val % count
            return [per_h + (rem if i == 0 else 0) for i in range(count)]

        s_dist = distribute(slabs)
        c_dist = distribute(channels)
        cab_dist = distribute(cabros)
        col_cab_dist = distribute(coloured_cabros)
        wc_dist = distribute(wall_coping)
        sd_dist = distribute(shallow_drains)
        rk_dist = distribute(road_kerbs)
        c450_dist = distribute(culverts_450)
        c900_dist = distribute(culverts_900)
        ss_dist = distribute(side_slabs)
        m_dist = distribute(moulds)

        hourly_records = []
        for idx, h in enumerate(hours):
            s_val = s_dist[idx]
            c_val = c_dist[idx]
            cab_val = cab_dist[idx]
            col_cab_val = col_cab_dist[idx]
            wc_val = wc_dist[idx]
            sd_val = sd_dist[idx]
            rk_val = rk_dist[idx]
            c450_val = c450_dist[idx]
            c900_val = c900_dist[idx]
            ss_val = ss_dist[idx]
            m_val = m_dist[idx]

            d_s = def_slabs if idx == 0 else 0
            d_c = def_channels if idx == 0 else 0
            d_cab = def_cabros if idx == 0 else 0
            d_col_cab = def_coloured_cabros if idx == 0 else 0
            d_wc = def_wall_coping if idx == 0 else 0
            d_sd = def_shallow_drains if idx == 0 else 0
            d_rk = def_road_kerbs if idx == 0 else 0
            d_c450 = def_culverts_450 if idx == 0 else 0
            d_c900 = def_culverts_900 if idx == 0 else 0
            d_ss = def_side_slabs if idx == 0 else 0
            d_m = def_moulds if idx == 0 else 0

            prod = s_val + c_val + cab_val + col_cab_val + wc_val + sd_val + rk_val + c450_val + c900_val + ss_val
            tot_def = d_s + d_c + d_cab + d_col_cab + d_wc + d_sd + d_rk + d_c450 + d_c900 + d_ss
            rate = round((tot_def / prod * 100), 2) if prod > 0 else 0.0

            shift_title = "Morning Run" if h < 12 else ("Midday Transition" if h == 12 else "Afternoon Run")
            hourly_records.append({
                "hour": h,
                "shift": shift_title,
                "slabsProduced": s_val,
                "defectiveSlabs": d_s,
                "roadChannelsProduced": c_val,
                "defectiveChannels": d_c,
                "cabrosProduced": cab_val,
                "defectiveCabros": d_cab,
                "colouredCabrosProduced": col_cab_val,
                "defectiveColouredCabros": d_col_cab,
                "wallCopingProduced": wc_val,
                "defectiveWallCoping": d_wc,
                "shallowDrainsProduced": sd_val,
                "defectiveShallowDrains": d_sd,
                "roadKerbsProduced": rk_val,
                "defectiveRoadKerbs": d_rk,
                "culverts450Produced": c450_val,
                "defectiveCulverts450": d_c450,
                "culverts900Produced": c900_val,
                "defectiveCulverts900": d_c900,
                "sideSlabsProduced": ss_val,
                "defectiveSideSlabs": d_ss,
                "mouldsProduced": m_val,
                "defectiveMoulds": d_m,
                "defectRate": rate,
                "primaryDefectReason": reason if tot_def > 0 else "None",
                "machineDowntimeMinutes": 0,
                "notes": notes if idx == 0 else ""
            })

    doc = {
        "date": date_str,
        "supervisor": supervisor,
        "line": "Precast Operations",
        "status": "completed",
        "shiftNotes": notes,
        "hourly": hourly_records
    }

    saved = upsert_day_log(doc)
    return jsonify({"success": True, "log": saved, "message": f"Forgotten day production saved for {date_str}"})



def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_open_port(preferred_port: int, max_tries: int = 10) -> int:
    for port in range(preferred_port, preferred_port + max_tries):
        if not is_port_in_use(port):
            return port
    return preferred_port

if __name__ == "__main__":
    # Prefer port from environment, or default to 5050 (avoids macOS AirPlay Receiver port 5000)
    env_port = os.getenv("PORT") or os.getenv("PYTHON_PORT")
    preferred = int(env_port) if env_port else 5050
    port = find_open_port(preferred)

    print("=" * 70)
    print(" Panelpro Precast & Logistics Ltd - Production & Defect Monitoring System")
    print(" Standalone Zero-Node Edition: Pure HTML/CSS/JS + Python Flask")
    print("=" * 70)
    print(f" * Connected to MongoDB: cluster0.nnvvp7x.mongodb.net (Panelpro.Stats)")
    print(f" * Dashboard URL:        http://127.0.0.1:{port}  or  http://localhost:{port}")
    print(f" * Shift Schedule:      Mon - Sat: 07:30 to 17:00 (Sunday Maintenance)")
    print(" * Zero Node / Zero Vite required! Press Ctrl+C to quit.")
    print("=" * 70)
    app.run(host="0.0.0.0", port=port, debug=False)
