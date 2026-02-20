from flask import Blueprint, jsonify, request
from src import database, network

internal_bp = Blueprint("internal", __name__)

@internal_bp.route("/internal/status/update", methods=["POST"])
def update_status():
    payload = request.get_json()
    if not payload:
        return jsonify({"success": False, "error": "No data received"}), 400
    
    network.update_status_cache(payload)
    return jsonify({"success": True})

@internal_bp.route("/internal/database/data", methods=["GET"])
def get_item_id_url_mapping():
    return jsonify([{"id": item["id"], "url": item["url"]} for item in database.data])