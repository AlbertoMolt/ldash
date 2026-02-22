import setproctitle

from flask import Flask
from waitress import serve

from services import pinger_service, db_monitor_service
from src import database, models
from src.config import HOST, get_port
from src.routes import api_bp, crud_bp

setproctitle.setproctitle('ldash')

app = Flask(__name__)
app.register_blueprint(crud_bp)
app.register_blueprint(api_bp)

if __name__ == "__main__":
    database.reload_database()
    
    # Services initialization
    pinger_service.start()    
    db_monitor_service.start()
    
    print(r"""
    __    ____  ___   _____ __  __
   / /   / __ \/   | / ___// / / /
  / /   / / / / /| | \__ \/ /_/ / 
 / /___/ /_/ / ___ |___/ / __  /  
/_____/_____/_/  |_/____/_/ /_/   
    """)
    print("=" * 60)
    print(f"  ✅ LDASH Started Successfully")
    print(f"  🌐 Running on: http://{HOST}:{get_port()}")
    print(f"  💾 Loaded {len(database.data)} items • {len(models.get_item_profiles())} profiles")
    
    if (db_monitor_service._running):
        print(f"  🔄 Database monitor running")
    
    if (pinger_service._running):
        print(f"  📍 Pinger service started - checking every 5 minutes")
        
    print("=" * 60)
    print("  Press Ctrl+C to stop\n")
    
    serve(app, host=HOST, port=get_port(), threads=8)