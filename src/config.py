import json

DATABASE_FILE = "data/database.csv"
CONFIG_FILE = "config.json"
ITEMS_STATUS_FILE = "status.json"

HOST = "0.0.0.0"

DATABASE_HEADER_LIST = ["id", "name", "item_type", "icon", "url", "category", "tab_type", "profile"]


def get_port():
    with open(CONFIG_FILE) as f:
        config = json.load(f)
    return config["port"]