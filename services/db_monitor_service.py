from concurrent.futures import ThreadPoolExecutor
import os
import threading
import time

from src.config import DATABASE_FILE
from src.database import reload_database
from src.logger import log, LogLevel


_running = False
_thread = None

_last_modification_time = os.path.getmtime(DATABASE_FILE)

def _monitor_database_changes():
    global _last_modification_time, _running
    
    while _running:
        try:
            current_modification_time = os.path.getmtime(DATABASE_FILE)
            if _last_modification_time != current_modification_time:
                log(LogLevel.INFO, "Database file changed - reloading data")
                reload_database()
                
                _last_modification_time = current_modification_time
        except Exception as e:
            log(LogLevel.ERROR, f"Error monitoring database: {e}")
        
        time.sleep(5)
        
        
def start():
    global _running, _thread
    
    if not _running:
        _running = True
        _thread = threading.Thread(target=_monitor_database_changes, daemon=True)
        _thread.start()

def stop():
    global _running
    _running = False