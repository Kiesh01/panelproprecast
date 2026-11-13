import os
import math
import random
from datetime import datetime, timedelta, timezone
from db import get_collection, get_shift_name, calculate_totals_from_hourly

DEFECT_REASONS = [
    'Edge Chipping',
    'Micro-cracking',
    'Dimensional Drift',
    'Slump & Curing Void',
    'Mould Misalignment',
    'Surface Bleed',
    'Aggregate Segregation'
]

SUPERVISORS = ['Marcus Vance', 'Elena Rostova', 'David Chen', 'Sarah Jenkins']

def generate_hourly_records(date_str: str, day_seed: int):
    hourly = []
    # 7:30 AM to 5:00 PM operating schedule (10 intervals: hours 7 to 16)
    # 7 = 07:30-08:30, ..., 16 = 16:30-17:00
    for hour in [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:
        shift = get_shift_name(hour)
        is_final_half_hour = (hour == 16)
        scale = 0.55 if is_final_half_hour else 1.0

        is_peak = (8 <= hour <= 11) or (13 <= hour <= 15)
        hour_factor = (1.05 if is_peak else 0.94) * scale

        r1 = math.sin(hour * 1.7 + day_seed) * 0.12
        r2 = math.cos(hour * 2.3 + day_seed * 1.2) * 0.10

        slabs = round(90 * hour_factor * (1 + r1))
        channels = round(65 * hour_factor * (1 + r2))
        moulds = round(150 * hour_factor * (1 + (r1 + r2) / 2))

        defect_pct = (2.0 + (math.sin(hour * 3.1 + day_seed) + 1) * 1.0) * (1.3 if hour == 12 else 1.0)
        if hour == 13:
            defect_pct += 0.7  # post-lunch restart variance

        total_prod = slabs + channels
        total_def = max(1, round(total_prod * (defect_pct / 100)))

        def_slabs = round(total_def * 0.55)
        def_channels = max(0, total_def - def_slabs)
        def_moulds = max(0, round(random.uniform(0, 2) + (2 if defect_pct > 3.5 else 0)))

        reason = DEFECT_REASONS[(hour + day_seed) % len(DEFECT_REASONS)]

        hourly.append({
            "id": f"{date_str}_h{hour}",
            "hour": hour,
            "shift": shift,
            "slabsProduced": max(0, slabs),
            "roadChannelsProduced": max(0, channels),
            "mouldsProduced": max(0, moulds),
            "defectiveSlabs": def_slabs,
            "defectiveChannels": def_channels,
            "defectiveMoulds": def_moulds,
            "defectRate": round((total_def / total_prod * 100), 2) if total_prod > 0 else 0.0,
            "primaryDefectReason": reason if total_def > 0 else "None",
            "notes": "End of shift washdown and line staging" if is_final_half_hour else (f"Defect rate alert ({defect_pct:.1f}%)." if defect_pct > 4.2 else ""),
            "curingTempC": round(21 + math.sin(hour / 3) * 6),
            "vibratorFreqHz": round(49.5 + random.random() * 1.2, 1),
            "machineDowntimeMinutes": 15 if hour == 12 else (random.randint(1, 6) if random.random() < 0.15 else 0)
        })

    return hourly

def seed_database(days_back: int = 45):
    coll = get_collection()
    anchor = datetime(2026, 10, 26, 12, 0, 0, tzinfo=timezone.utc)
    print(f"Seeding Panelpro.Stats with 7:30 AM - 5:00 PM Mon-Sat schedule from {anchor.strftime('%Y-%m-%d')} backwards {days_back} days...")

    docs_to_insert = []
    for i in range(days_back, -1, -1):
        day_date = anchor - timedelta(days=i)
        date_str = day_date.strftime("%Y-%m-%d")
        year = day_date.year
        month = day_date.month
        is_sunday = (day_date.weekday() == 6)

        if is_sunday:
            hourly = []
            totals = calculate_totals_from_hourly(hourly)
            shift_notes = "Sunday Scheduled Plant Shutdown & Maintenance (Operating Schedule: Mon - Sat 07:30 - 17:00)."
            status = "completed"
        else:
            hourly = generate_hourly_records(date_str, i * 3)
            totals = calculate_totals_from_hourly(hourly)
            shift_notes = "Operating Schedule: 07:30 AM - 5:00 PM. Production run completed nominally."
            status = "verified"

        sup = SUPERVISORS[i % len(SUPERVISORS)]

        doc = {
            "date": date_str,
            "year": year,
            "month": month,
            "supervisor": sup,
            "line": "Precast Operations",
            "status": status,
            "targetSlabs": 0 if is_sunday else 120,
            "targetCabros": 0 if is_sunday else 86,
            "targetCulverts": 0 if is_sunday else 5,
            "targetWallCopings": 0 if is_sunday else 120,
            "targetChannels": 0 if is_sunday else 60,
            "targetMoulds": 0 if is_sunday else 140,
            "targetMaxDefectRate": 2.5,
            "ambientTempC": 22 + round(math.sin(i) * 5),
            "humidityPct": 55 + round(math.cos(i) * 15),
            "shiftNotes": shift_notes,
            "hourly": hourly,
            **totals,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }

        coll.update_one({"date": date_str}, {"$set": doc}, upsert=True)
        docs_to_insert.append(date_str)

    print(f"Successfully updated {len(docs_to_insert)} daily logs in MongoDB collection Panelpro.Stats with 7:30-17:00 Mon-Sat schedule!")
    print(f"Total documents now in Stats: {coll.count_documents({})}")

if __name__ == "__main__":
    seed_database()
