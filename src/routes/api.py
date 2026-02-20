import os

from flask import Blueprint, abort, jsonify, render_template, request, send_from_directory

from src import database
import src.models as models
import src.network as network
from src.config import DATABASE_FILE

api_bp = Blueprint("api", __name__)


# Export database file
@api_bp.route("/api/export/database", methods=["GET"])
def export_database():
    try:
        return send_from_directory(
            directory=os.path.dirname(DATABASE_FILE),
            path=os.path.basename(DATABASE_FILE),
            as_attachment=True,
        )
    except FileNotFoundError:
        abort(404)


# Import database file
@api_bp.route("/api/import/database", methods=["POST"])
def import_database():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    file.save(DATABASE_FILE)
    database.reload_database()
    return jsonify({"success": True})


# Get all item statuses
@api_bp.route("/api/items/status", methods=["GET"])
def get_status():
    results = network.get_items_status()

    if not results:
        return jsonify({"success": False, "error": "No status data available"}), 404

    return jsonify({"success": True, "items_status": results})


# Get item by id
@api_bp.route("/api/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    for item in database.data:
        if item["id"] == item_id:
            return jsonify({"success": True, **item})

    return jsonify({"success": False, "error": "Item not found"}), 404


# Get all profiles
@api_bp.route("/api/items/profiles", methods=["GET"])
def get_profiles():
    try:
        return jsonify({"success": True, "profiles": models.get_item_profiles()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# Get all categories
@api_bp.route("/api/items/categories", methods=["GET"])
def get_categories():
    try:
        return jsonify({"success": True, "categories": models.get_items_categories()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# Get all items (optionally filtered by profile)
@api_bp.route("/api/items", methods=["GET"])
def get_items():
    profile_filter = request.args.get("profile")

    if profile_filter:
        filtered = [item for item in database.data if item["profile"] == profile_filter]
        return jsonify({"success": True, "items": filtered})

    return jsonify({"success": True, "items": database.data})


# Home
@api_bp.route("/")
def home():
    database.reload_database()
    return render_template("index.html")