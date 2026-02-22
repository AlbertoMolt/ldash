import time
import threading
import requests
import urllib3

from concurrent.futures import ThreadPoolExecutor
from src.logger import log, LogLevel
from src import network

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

_running = False
_thread = None

def ping(url):
    try:
        start = time.time()
        resp = requests.get(url, timeout=10, verify=False, allow_redirects=True)
        duration = int((time.time() - start) * 1000)
        return [resp.status_code, duration]
    except:
        return [0, 0]

def get_data():
    from src import database
    return [{"id": item["id"], "url": item["url"]} 
            for item in database.data if item.get("url")]

def update_status(items):
    network.update_status_cache(items)
    
def update_item_status(item_id, status, response_time):
    network.update_item_status(item_id, status, response_time)
    
def check_item(itemid):
    data = get_data()
    if not data:
        return
    
    log(LogLevel.INFO, f"Checking item {itemid} status")
    
    for item in data:
        if item['id'] == itemid:
            status_data = ping(item['url'])
            update_item_status(item['id'], status_data[0], status_data[1])
            break

def check_all_items():
    data = get_data()
    if not data:
        return
    
    results = []
    
    log(LogLevel.INFO, "Starting status checks")
    
    # Ping all URLs in parallel
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {executor.submit(ping, item['url']): item for item in data}
        
        for future in futures:
            item = futures[future]
            status_data = future.result()
            results.append({
                'id': item['id'],
                'status': status_data[0],
                'response_time': status_data[1]
            })
    
    # Update status directly in memory
    if results:
        update_status(results)
        log(LogLevel.INFO, "Status checks completed")

def _run():
    global _running
        
    # Wait a bit for app initialization
    time.sleep(5)
    
    while _running:
        try:
            check_all_items()
        except Exception as e:
            log(LogLevel.ERROR, f"Error in status checks: {e}")
        
        # Sleep for 5 minutes
        time.sleep(300)

def start():
    global _running, _thread
    
    if not _running:
        _running = True
        _thread = threading.Thread(target=_run, daemon=True)
        _thread.start()

def stop():
    global _running
    _running = False