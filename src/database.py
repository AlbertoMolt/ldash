import csv
import os
import time
from collections import defaultdict

from src.config import DATABASE_FILE, DATABASE_HEADER_LIST

os.makedirs("data", exist_ok=True)

data = []
grouped_data = {}

if not os.path.exists(DATABASE_FILE):
    print("Database file not found!")
    print("Creating empty database file...")
    with open(DATABASE_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=DATABASE_HEADER_LIST)
        writer.writeheader()

last_modification_time = os.path.getmtime(DATABASE_FILE)


def reload_database():
    global data, grouped_data
    data = []
    try:
        with open(DATABASE_FILE, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if any(value.strip() != "" for value in row.values()):
                    row["id"] = int(row["id"])
                    data.append(row)
    except FileNotFoundError:
        print("Error: Database file not found!")
        return []
    except Exception as e:
        print(f"Error loading database: {e}")
        return []

    try:
        grouped_data = _group_by_category(data)
    except Exception as e:
        print(f"Error grouping data: {e}")

    return data


def update_database():
    with open(DATABASE_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=DATABASE_HEADER_LIST)
        writer.writeheader()
        writer.writerows(data)

    reload_database()
    print("Database updated!")


def monitor_database_changes():
    global last_modification_time
    while True:
        current_modification_time = os.path.getmtime(DATABASE_FILE)
        if last_modification_time != current_modification_time:
            reload_database()
            print("Data changed! Reloading...")
            last_modification_time = current_modification_time
        time.sleep(5)


def _group_by_category(items):
    grouped = defaultdict(list)
    for item in items:
        grouped[item["category"]].append(item)
    return grouped