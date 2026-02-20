
items_status_cache = {}

def update_status_cache(new_statuses):
    for item in new_statuses:
        items_status_cache[item["id"]] = item

def get_items_status():
    return list(items_status_cache.values())