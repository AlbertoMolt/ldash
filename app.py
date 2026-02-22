import sys
import logging

from flask import Flask
from flask_socketio import SocketIO
import setproctitle

from services import pinger_service
from services import db_monitor_service
from src import database, models, network
from src.config import HOST, get_port
from src.routes import api_bp, crud_bp
from src.logger import log, LogLevel

logging.getLogger('werkzeug').setLevel(logging.ERROR)

import flask.cli
flask.cli.show_server_banner = lambda *args, **kwargs: None

setproctitle.setproctitle('ldash')

app = Flask(__name__)

socketio = SocketIO(app, 
    cors_allowed_origins="*", 
    async_mode='threading',
    logger=False,
    engineio_logger=False)

network.init_socketio(socketio)

app.register_blueprint(crud_bp)
app.register_blueprint(api_bp)


if __name__ == "__main__":
    log(LogLevel.INFO, "LDASH Starting...")
    
    database.reload_database()
    
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
    
    socketio.run(app, 
        host=HOST, 
        port=get_port(), 
        debug=False,
        use_reloader=False,
        allow_unsafe_werkzeug=True)
