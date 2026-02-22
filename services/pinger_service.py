import time
import threading
import requests
import urllib3

from concurrent.futures import ThreadPoolExecutor

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

_running = False
_thread = None

def ping(url):
    """Ping a single URL and return [status, response_time_ms]"""
    try:
        start = time.time()
        resp = requests.get(url, timeout=10, verify=False, allow_redirects=True)
        duration = int((time.time() - start) * 1000)
        return [resp.status_code, duration]
    except:
        return [0, 0]

def get_urls():
    """Get URLs directly from database"""
    from src import database
    return [{"id": item["id"], "url": item["url"]} 
            for item in database.data if item.get("url")]

def update_status(items):
    """Update status cache directly"""
    from src import network
    network.update_status_cache(items)

def check_all_urls():
    """Check all URLs in parallel and update status"""
    data = get_urls()
    if not data:
        return
    
    results = []
    
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

def _run():
    """Main loop - check URLs every 5 minutes"""
    global _running
    
    print("🔄 Pinger service started - checking every 5 minutes")
    
    # Wait a bit for app initialization
    time.sleep(5)
    
    while _running:
        try:
            check_all_urls()
        except Exception as e:
            print(f"Error in ping loop: {e}")
        
        # Sleep for 5 minutes
        time.sleep(300)

def start():
    """Start the pinger service in background thread"""
    global _running, _thread
    
    if not _running:
        _running = True
        _thread = threading.Thread(target=_run, daemon=True)
        _thread.start()

def stop():
    """Stop the pinger service"""
    global _running
    _running = False