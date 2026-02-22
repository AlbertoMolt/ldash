import threading
import time

from services import pinger_service
from src.logger import log, LogLevel

items_status_cache = {}
_socketio = None  # ← Guardar referencia

def init_socketio(socketio):
    global _socketio
    _socketio = socketio

def update_status_cache(new_statuses):
    for item in new_statuses:
        items_status_cache[item["id"]] = item
        
    _emit_status_update()
        
def update_item_status(item_id, status, response_time):
    items_status_cache[item_id] = {
        "id": item_id,
        "status": status,
        "response_time": response_time
    }
    _emit_status_update()

def get_items_status():
    return list(items_status_cache.values())

def force_status_check():
    log(LogLevel.INFO, "Forcing status check")
    
    def _run_check():
        pinger_service.check_all_items()
    
    threading.Thread(target=_run_check, daemon=True).start()
    
def force_item_status_check(itemid):
    def _run_check():
        time.sleep(0.1)
        pinger_service.check_item(itemid)
    
    threading.Thread(target=_run_check, daemon=True).start()
    
def _emit_status_update():
    global _socketio
    
    if _socketio is None:
        return
    
    try:
        _socketio.emit('status_update', {
            'statuses': list(items_status_cache.values())
        })
    except Exception as e:
        log(LogLevel.ERROR, f"Error emitting status update: {e}")