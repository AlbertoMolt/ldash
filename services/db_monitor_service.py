from concurrent.futures import ThreadPoolExecutor
import os
import threading
import time

from src.config import DATABASE_FILE
from src.database import reload_database


_running = False
_thread = None

_last_modification_time = os.path.getmtime(DATABASE_FILE)

def _monitor_database_changes():
    global _last_modification_time
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        current_modification_time = os.path.getmtime(DATABASE_FILE)
        if _last_modification_time != current_modification_time:
            reload_database()
            print("Data changed! Reloading...")
            last_modification_time = current_modification_time
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