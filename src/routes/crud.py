from flask import Blueprint, jsonify, request

from src import database
import src.models as models

crud_bp = Blueprint("crud", __name__)


# Create item
@crud_bp.route("/api/items", methods=["POST"])
def create_item():
    new_item_data = request.get_json()
    new_item_data["id"] = models.get_usable_id()

    database.data.append(new_item_data)
    database.update_database()

    return jsonify({"success": True})


# Delete item
@crud_bp.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    for i, item in enumerate(database.data):
        if item["id"] == item_id:
            database.data.pop(i)
            database.update_database()
            return jsonify({"success": True})

    return jsonify({"success": False, "error": "Item not found"}), 404


# Delete category
@crud_bp.route("/api/items/categories/<string:category_name>&<string:profile_name>", methods=["DELETE"])
def delete_category(category_name, profile_name):
    new_data = [
        item for item in database.data
        if not (item["category"] == category_name and item["profile"] == profile_name)
    ]

    if len(new_data) == len(database.data):
        return jsonify({"success": False, "error": "No matches found"}), 404

    database.data[:] = new_data
    database.update_database()
    return jsonify({"success": True})


# Edit item
@crud_bp.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data_received = request.get_json()

    for i, item in enumerate(database.data):
        if item["id"] == item_id:
            database.data[i] = {
                "id": item_id,
                "name": data_received["name"],
                "item_type": data_received["item_type"],
                "icon": data_received["icon"],
                "url": data_received["url"],
                "category": data_received["category"],
                "tab_type": data_received["tab_type"],
                "profile": data_received["profile"],
            }
            database.update_database()
            return jsonify({"success": True})

    return jsonify({"success": False, "error": "Item not found"}), 404


# Edit item's category
@crud_bp.route("/api/items/<int:item_id>/category", methods=["PUT"])
def update_item_category(item_id):
    data_received = request.get_json()

    for i, item in enumerate(database.data):
        if item["id"] == item_id:
            database.data[i] = {
                "id": item_id,
                "name": item["name"],
                "item_type": item["item_type"],
                "icon": item["icon"],
                "url": item["url"],
                "category": data_received["category"],
                "tab_type": item["tab_type"],
                "profile": item["profile"],
            }
            database.update_database()
            return jsonify({"success": True})

    return jsonify({"success": False, "error": "Item not found"}), 404


# Edit category
@crud_bp.route("/api/items/categories/<string:category_name>&<string:profile_name>", methods=["PUT"])
def update_category(category_name, profile_name):
    data_received = request.get_json()
    found = False

    for item in database.data:
        if item["category"] == category_name and item["profile"] == profile_name:
            item["category"] = data_received["name"]
            found = True

    if found:
        database.update_database()
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "No items found for this category/profile"}), 404