<<<<<<< HEAD
from flask import Flask, abort, render_template, request, jsonify
=======
from flask import Flask, render_template, request, jsonify
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
import csv
from collections import defaultdict
import os
import time
import threading

<<<<<<< HEAD

DATABASE_FILE = "/data/database.csv"

if not os.path.exists(DATABASE_FILE):
    print("Database file not found!")
    
=======
DATABASE_FILE = "database.csv"
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
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
<<<<<<< HEAD
            print("Data changed! Reloading...")
=======
            print("Data changed! Reloading data...")
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
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
<<<<<<< HEAD
    grouped_data = grouped_category(data)
    data = set_dictionary(data)
    return data

def grouped_category(data):
    grouped = defaultdict(list)
    try:
        for item in data:
            category = item[4]
            print(category)
            grouped[category].append(item)
        return grouped
    except:
        print("Ni puta idea")
    
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
=======
    grouped_data = group_by_category(data)
    return data

def group_by_category(data):
    grouped = defaultdict(list)
    for item in data:
        category = item[4]
        grouped[category].append(item)
    return grouped
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)

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
<<<<<<< HEAD
def edit_item():
=======
def delete_item():
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
    data = request.json
    print(data)
    return jsonify({
        'success': True, 
        'message': 'Item añadido correctamente',
        'id': 123  # ID del nuevo item creado
    })
<<<<<<< HEAD
    
@app.route('/item/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = data[item_id]

    for item in data:
        if item[id] == item_id:
            return jsonify({
                'name': data[name]                
            
            })
        else:
            abort(404, description="Item not found")
    

@app.route('/')
def home():
    return render_template('index.html', grouped_category=grouped_category)

if __name__ == "__main__":
    
    # Cargar datos iniciales
    data = reload_database()
    grouped_category = grouped_category(data)
=======

@app.route('/')
def home():
    return render_template('index.html', grouped_data=grouped_data)

if __name__ == "__main__":
    # Cargar datos iniciales
    data = reload_database()
    grouped_data = group_by_category(data)
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
    
    # Iniciar hilo monitor como daemon
    monitor_changes = threading.Thread(target=monitor_database_changes, daemon=True)
    monitor_changes.start()
    
    print("Started")
<<<<<<< HEAD
    print(data)
    # app.run(debug=True)
=======
    app.run(debug=True)
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
