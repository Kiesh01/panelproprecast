import os
import math
from datetime import datetime, timezone
import pymongo
from dotenv import load_dotenv

import re

load_dotenv()

raw_uri = os.getenv(
    "MONGO_URI",
    "mongodb+srv://surfsimple:79602583@cluster0.nnvvp7x.mongodb.net/?appName=Cluster0"
)
uri_match = re.search(r'mongodb(?:\+srv)?://[^\s"\']+', raw_uri)
if uri_match:
    MONGO_URI = uri_match.group(0).strip()
else:
    MONGO_URI = raw_uri.strip().strip('"').strip("'")

DB_NAME = (os.getenv("DB_NAME") or "Panelpro").strip().strip('"').strip("'")
COLLECTION_NAME = (os.getenv("COLLECTION_NAME") or "Stats").strip().strip('"').strip("'")

_client = None

def get_client():
    global _client
    if _client is None:
        _client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client

def get_db():
    return get_client()[DB_NAME]

def get_collection():
    coll = get_db()[COLLECTION_NAME]
    # Ensure indexes exist
    try:
        coll.create_index([("date", pymongo.ASCENDING)], unique=True)
        coll.create_index([("year", pymongo.ASCENDING), ("month", pymongo.ASCENDING)])
    except Exception as e:
        print(f"Index creation warning: {e}")
    return coll

def check_connection():
    try:
        client = get_client()
        client.admin.command('ping')
        coll = get_collection()
        count = coll.count_documents({})
        return {
            "connected": True,
            "database": DB_NAME,
            "collection": COLLECTION_NAME,
            "documentCount": count,
            "message": "Connected to MongoDB Atlas cluster Panelpro.Stats"
        }
    except Exception as e:
        return {
            "connected": False,
            "database": DB_NAME,
            "collection": COLLECTION_NAME,
            "error": str(e)
        }

def get_shift_name(hour: int) -> str:
    if 7 <= hour < 12:
        return "Morning Run (07:30-12:30)"
    elif hour == 12:
        return "Midday Transition (12:30-13:30)"
    elif 13 <= hour <= 16:
        return "Afternoon Run (13:30-17:00)"
    return "Overtime / Special Run"

def calculate_totals_from_hourly(hourly_list):
    total_slabs = sum(h.get("slabsProduced", 0) for h in hourly_list)
    total_channels = sum(h.get("roadChannelsProduced", 0) for h in hourly_list)
    total_cabros = sum(h.get("cabrosProduced", 0) for h in hourly_list)
    total_coloured_cabros = sum(h.get("colouredCabrosProduced", 0) for h in hourly_list)
    total_wall_coping = sum(h.get("wallCopingProduced", 0) for h in hourly_list)
    total_shallow_drains = sum(h.get("shallowDrainsProduced", 0) for h in hourly_list)
    total_road_kerbs = sum(h.get("roadKerbsProduced", 0) for h in hourly_list)
    total_culverts450 = sum(h.get("culverts450Produced", 0) for h in hourly_list)
    total_culverts900 = sum(h.get("culverts900Produced", 0) for h in hourly_list)
    total_side_slabs = sum(h.get("sideSlabsProduced", 0) for h in hourly_list)
    total_moulds = sum(h.get("mouldsProduced", 0) for h in hourly_list)

    def_slabs = sum(h.get("defectiveSlabs", 0) for h in hourly_list)
    def_channels = sum(h.get("defectiveChannels", 0) for h in hourly_list)
    def_cabros = sum(h.get("defectiveCabros", 0) for h in hourly_list)
    def_coloured_cabros = sum(h.get("defectiveColouredCabros", 0) for h in hourly_list)
    def_wall_coping = sum(h.get("defectiveWallCoping", 0) for h in hourly_list)
    def_shallow_drains = sum(h.get("defectiveShallowDrains", 0) for h in hourly_list)
    def_road_kerbs = sum(h.get("defectiveRoadKerbs", 0) for h in hourly_list)
    def_culverts450 = sum(h.get("defectiveCulverts450", 0) for h in hourly_list)
    def_culverts900 = sum(h.get("defectiveCulverts900", 0) for h in hourly_list)
    def_side_slabs = sum(h.get("defectiveSideSlabs", 0) for h in hourly_list)
    def_moulds = sum(h.get("defectiveMoulds", 0) for h in hourly_list)

    total_produced = (
        total_slabs + total_channels + total_cabros + total_coloured_cabros + total_wall_coping +
        total_shallow_drains + total_road_kerbs + total_culverts450 + total_culverts900 + total_side_slabs
    )
    total_defects = (
        def_slabs + def_channels + def_cabros + def_coloured_cabros + def_wall_coping +
        def_shallow_drains + def_road_kerbs + def_culverts450 + def_culverts900 + def_side_slabs
    )
    defect_rate = round((total_defects / total_produced * 100), 2) if total_produced > 0 else 0.0

    return {
        "totalSlabs": total_slabs,
        "totalChannels": total_channels,
        "totalCabros": total_cabros,
        "totalColouredCabros": total_coloured_cabros,
        "totalWallCoping": total_wall_coping,
        "totalShallowDrains": total_shallow_drains,
        "totalRoadKerbs": total_road_kerbs,
        "totalCulverts450": total_culverts450,
        "totalCulverts900": total_culverts900,
        "totalSideSlabs": total_side_slabs,
        "totalMoulds": total_moulds,
        "totalDefectiveSlabs": def_slabs,
        "totalDefectiveChannels": def_channels,
        "totalDefectiveCabros": def_cabros,
        "totalDefectiveColouredCabros": def_coloured_cabros,
        "totalDefectiveWallCoping": def_wall_coping,
        "totalDefectiveShallowDrains": def_shallow_drains,
        "totalDefectiveRoadKerbs": def_road_kerbs,
        "totalDefectiveCulverts450": def_culverts450,
        "totalDefectiveCulverts900": def_culverts900,
        "totalDefectiveSideSlabs": def_side_slabs,
        "totalDefectiveMoulds": def_moulds,
        "totalProduced": total_produced,
        "totalDefects": total_defects,
        "defectRate": defect_rate
    }

def get_day_log(date_str: str):
    coll = get_collection()
    doc = coll.find_one({"date": date_str})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def upsert_day_log(day_data: dict):
    coll = get_collection()
    date_str = day_data["date"]
    
    # Extract year, month
    parts = date_str.split("-")
    year = int(parts[0])
    month = int(parts[1])

    hourly = day_data.get("hourly", [])
    totals = calculate_totals_from_hourly(hourly)

    doc_to_save = {
        "date": date_str,
        "year": year,
        "month": month,
        "supervisor": day_data.get("supervisor", "Marcus Vance"),
        "line": day_data.get("line", "Precast Operations"),
        "targetSlabs": day_data.get("targetSlabs", 120),
        "targetCabros": day_data.get("targetCabros", 86),
        "targetCulverts": day_data.get("targetCulverts", 5),
        "targetWallCopings": day_data.get("targetWallCopings", 120),
        "targetChannels": day_data.get("targetChannels", 60),
        "targetMoulds": day_data.get("targetMoulds", 140),
        "targetMaxDefectRate": day_data.get("targetMaxDefectRate", 2.5),
        "ambientTempC": day_data.get("ambientTempC", 22),
        "humidityPct": day_data.get("humidityPct", 58),
        "shiftNotes": day_data.get("shiftNotes", ""),
        "hourly": hourly,
        **totals,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }

    coll.update_one({"date": date_str}, {"$set": doc_to_save}, upsert=True)
    return get_day_log(date_str)

def upsert_hourly_record(date_str: str, record_data: dict):
    coll = get_collection()
    day_doc = coll.find_one({"date": date_str})

    if not day_doc:
        hourly = []
        base_doc = {
            "date": date_str,
            "supervisor": "Marcus Vance",
            "line": "Precast Operations",
            "status": "in-progress",
            "hourly": []
        }
    else:
        hourly = day_doc.get("hourly", [])
        base_doc = day_doc

    # Check if record for this hour exists
    hour = int(record_data["hour"])
    record_data["hour"] = hour
    record_data["shift"] = get_shift_name(hour)
    
    # Calculate record defect rate
    prod = (
        record_data.get("slabsProduced", 0) +
        record_data.get("roadChannelsProduced", 0) +
        record_data.get("cabrosProduced", 0) +
        record_data.get("colouredCabrosProduced", 0) +
        record_data.get("wallCopingProduced", 0) +
        record_data.get("shallowDrainsProduced", 0) +
        record_data.get("roadKerbsProduced", 0) +
        record_data.get("culverts450Produced", 0) +
        record_data.get("culverts900Produced", 0) +
        record_data.get("sideSlabsProduced", 0)
    )
    defs = (
        record_data.get("defectiveSlabs", 0) +
        record_data.get("defectiveChannels", 0) +
        record_data.get("defectiveCabros", 0) +
        record_data.get("defectiveColouredCabros", 0) +
        record_data.get("defectiveWallCoping", 0) +
        record_data.get("defectiveShallowDrains", 0) +
        record_data.get("defectiveRoadKerbs", 0) +
        record_data.get("defectiveCulverts450", 0) +
        record_data.get("defectiveCulverts900", 0) +
        record_data.get("defectiveSideSlabs", 0)
    )
    record_data["defectRate"] = round((defs / prod * 100), 2) if prod > 0 else 0.0

    existing_idx = next((i for i, h in enumerate(hourly) if h.get("hour") == hour), -1)
    if existing_idx >= 0:
        hourly[existing_idx] = record_data
    else:
        hourly.append(record_data)

    hourly.sort(key=lambda x: x["hour"])
    base_doc["hourly"] = hourly

    return upsert_day_log(base_doc)

def delete_hourly_record(date_str: str, hour: int):
    coll = get_collection()
    day_doc = coll.find_one({"date": date_str})
    if not day_doc:
        return None

    hourly = [h for h in day_doc.get("hourly", []) if h.get("hour") != hour]
    day_doc["hourly"] = hourly
    return upsert_day_log(day_doc)

def get_month_logs(year_month_str: str):
    coll = get_collection()
    regex = f"^{year_month_str}"
    cursor = coll.find({"date": {"$regex": regex}}).sort("date", pymongo.ASCENDING)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_year_logs(year: int):
    coll = get_collection()
    cursor = coll.find({"year": year}).sort("date", pymongo.ASCENDING)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_all_logs(limit: int = 100):
    coll = get_collection()
    cursor = coll.find().sort("date", pymongo.DESCENDING).limit(limit)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_date_range_logs(start_date: str, end_date: str):
    coll = get_collection()
    cursor = coll.find({"date": {"$gte": start_date, "$lte": end_date}}).sort("date", pymongo.ASCENDING)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_db_date_bounds():
    coll = get_collection()
    earliest = coll.find_one(sort=[("date", 1)])
    latest = coll.find_one(sort=[("date", -1)])
    return {
        "earliest": earliest.get("date") if earliest else "2026-09-01",
        "latest": latest.get("date") if latest else "2026-11-08"
    }


