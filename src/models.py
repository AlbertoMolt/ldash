from src import database


def get_item_profiles():
    return sorted({item["profile"] for item in database.data})


def get_items_categories():
    return sorted({item["category"] for item in database.data})


def get_items_ids():
    return [item["id"] for item in database.data]


def get_usable_id():
    ids = get_items_ids()
    return max(ids) + 1 if ids else 1