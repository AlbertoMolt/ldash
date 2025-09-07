from flask import Flask, abort, render_template, request, jsonify
import csv
from collections import defaultdict
import os
import time
import threading


DATABASE_FILE = "data/database.csv"

database_header = "ID,Name,Icon,Url,Category,New tab? true/false,(THIS ROW IS BEING IGNORED)"

database_header_list = ["id", "name", "icon", "url", "category", "tab_type"]


if not os.path.exists(DATABASE_FILE):
    print("Error: " + "Database file not found!")
    
last_modification_time = os.path.getmtime(DATABASE_FILE)

app = Flask(__name__)

# Variables globales para los datos
data = []
grouped_data = {}

def monitor_database_changes():
    global last_modification_time
    while True:
        current_modification_time = os.path.getmtime(DATABASE_FILE)
        
        if last_modification_time != current_modification_time:
            reload_database()
            print("Data changed! Reloading...")
            last_modification_time = current_modification_time
        time.sleep(5)

def reload_database():
    global data, grouped_data
    data = []
    try:
        with open(DATABASE_FILE, "r", encoding="utf-8") as file:
            reader = csv.reader(file)
            for line in reader:
                if any(item.strip() != "" for item in line):
                    data.append(line)
            try:
                del data[0] # Eliminar primera linea
            except:
                print("Database header not found, writing it...")
                with open(DATABASE_FILE, "w", newline="", encoding="utf-8") as file:
                    file.write(database_header)
                    
                reload_database()
    except:
        print("Error: " + "Database file not found!")

    # Actualizar datos agrupados también
    try:
        grouped_data = grouped_category(data)
        data = set_dictionary(data)
    except:
        # TODO: añadir una excepción para manejar si el archivo está vacío
        ...
    return data

def update_database():
    with open(DATABASE_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=database_header_list)
        writer.writeheader()
        writer.writerows(data)
    
    reload_database() # Forzar recargar base de datos
    print("Database updated!")

def grouped_category(data):
    grouped = defaultdict(list)

    for item in data:
        category = item[4]
        grouped[category].append(item)
    return grouped

def set_dictionary(data):
    items = []
    for item in data:
        data_dict = {
            "id": item[0],
            "name": item[1],
            "icon": item[2],
            "url": item[3],
            "category": item[4],
            "tab_type": item[5]
        }
        items.append(data_dict)
    return items

def get_items_ids():
    item_ids = []
    for item in data:
        item_ids.append(int(item["id"]))
    return item_ids

def get_usable_id():
    return max(get_items_ids()) + 1


# Create item
@app.route('/item/', methods=['POST'])
def create_item():
    new_item_data = request.get_json()
    new_item_data['id'] = get_usable_id() # Populating with an id
    
    data.append(new_item_data)
    update_database()
    
    return jsonify({"success": True})
    
# Delete item
@app.route('/item/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    
    for i, item in enumerate(data):
        if item["id"] == str(item_id):
            data.pop(i)
            update_database()
            
            return jsonify({"success": True})
    
    return jsonify({"success": False, "error": "Item not found"}), 404

# Get item
@app.route('/item/<int:item_id>', methods=['GET'])
def get_item(item_id):
    for item in data:
        if item["id"] == str(item_id):
            return jsonify({
                'success': True,
                'name': item["name"],
                'icon': item["icon"],
                'url': item["url"],
                'category': item["category"],
                'tab_type': item["tab_type"]
            })
    return jsonify({
        'success': False,
        'error': 'Item not found'
    }), 404

# Edit item
@app.route('/item/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data_received = request.get_json()
    
    for i, item in enumerate(data):
        if item["id"] == str(item_id):
            data[i] = {
                "id": item_id,
                "name": data_received["name"],
                "icon": data_received["icon"],
                "url": data_received["url"],
                "category": data_received["category"],
                "tab_type": data_received["tab_type"]
            }
            update_database()
            return jsonify({"success": True})
    
    return jsonify({"success": False, "error": "Item not found"}), 404

@app.route('/')
def home():
    return render_template('index.html', grouped_category=grouped_data)

if __name__ == "__main__":
    data = reload_database()
    categories_grouped = grouped_data
    
    monitor_changes = threading.Thread(target=monitor_database_changes, daemon=True)
    monitor_changes.start()

    print("✅ Started")
    app.run(debug=True)
