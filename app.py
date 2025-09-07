from flask import Flask, abort, render_template, request, jsonify
import csv
from collections import defaultdict
import os
import time
import threading


DATABASE_FILE = "data/database.csv"

if not os.path.exists(DATABASE_FILE):
    print("Database file not found!")
    
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
    with open(DATABASE_FILE, "r", encoding="utf-8") as archivo:
        reader = csv.reader(archivo)
        for line in reader:
            if any(item.strip() != "" for item in line):
                data.append(line)
                
        del data[0] # Eliminar primera linea
    
    # Actualizar datos agrupados también
    grouped_data = grouped_category(data)
    data = set_dictionary(data)
    return data

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

@app.route('/delete_item', methods=['POST'])
def delete_item():
    data = request.json
    print(data)
    return jsonify({
        'success': True, 
        'message': 'Item añadido correctamente',
        'id': 123  # ID del nuevo item creado
    })
    
@app.route('/edit_item', methods=['POST'])
def edit_item():
    data = request.json
    print(data)
    return jsonify({
        'success': True, 
        'message': 'Item añadido correctamente',
        'id': 123  # ID del nuevo item creado
    })
    
@app.route('/item/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = data[item_id]

    for item in data:
        if item["id"] == item_id:
            return jsonify({
                'name': item["name"],
                'icon': item["icon"],
                'url': item["url"],
                'url': item["url"],
                'tab_type' : item["tab_type"]
            })
        else:
            abort(404, description="Item not found")
    

@app.route('/')
def home():
    return render_template('index.html', grouped_category=grouped_data)

if __name__ == "__main__":
    
    # Cargar datos iniciales
    data = reload_database()
    categories_grouped = grouped_data
    
    # Iniciar hilo monitor como daemon
    monitor_changes = threading.Thread(target=monitor_database_changes, daemon=True)
    monitor_changes.start()
    
    print("Started")
    print(data)
    app.run(debug=True)
