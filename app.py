import threading

from flask import Flask
from waitress import serve

from services.ping import pinger_service
from src import database, models, network
from src.config import HOST, get_port
from src.routes import api_bp, crud_bp, internal_bp

app = Flask(__name__)
app.register_blueprint(crud_bp)
app.register_blueprint(api_bp)
app.register_blueprint(internal_bp)

if __name__ == "__main__":
    database.reload_database()
    
    pinger_service.start_service()
    
    monitor_thread = threading.Thread(target=database.monitor_database_changes, daemon=True)
    monitor_thread.start()

    print(r"""
    __    ____  ___   _____ __  __
   / /   / __ \/   | / ___// / / /
  / /   / / / / /| | \__ \/ /_/ / 
 / /___/ /_/ / ___ |___/ / __  /  
/_____/_____/_/  |_/____/_/ /_/   
    """)
    print("=" * 45)
    print(f"  ✅ LDASH Started Successfully")
    print(f"  🌐 Running on: http://{HOST}:{get_port()}")
    print(f"  💾 Loaded {len(database.data)} items • {len(models.get_item_profiles())} profiles")
    print(f"  🔄 Monitoring: {'✓' if monitor_thread.is_alive() else '✗'}")
    print("=" * 45)
    print("  Press Ctrl+C to stop\n")
    
    serve(app, host=HOST, port=get_port(), threads=8)