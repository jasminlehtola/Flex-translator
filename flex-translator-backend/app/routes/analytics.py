"""
analytics.py

Defines the /analytics endpoint for storing user interaction data during translation.

Blueprint:
    - Name: 'analytics'
    - URL prefix: /analytics

Requires user authentication for all routes via @require_user_access.
"""

from flask import jsonify, request, current_app
from flask_smorest import Blueprint
from app.extensions import db
from app.models.db_models import Analytics
from datetime import datetime
from app.routes.wrappers import require_user_access
from app.services.analytics_service import save_analytics_entry

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')



@analytics_bp.route('', methods=['POST'])
@require_user_access
def create_analytics_entry():
    """
    Handle POST request to save a new analytics entry.

    Request JSON Body:
        {
            "document_id": int,
            "chunk_id": int or null,
            "source_type": str,
            "translation_mode": str,
            "chosen_model": str,
            "original_text": str,
            "user_final": str,
            "edited": bool,
            "user_prompts": list[str],
            "user_dictionary": list[str],
            "time_spent_sec": int or null
        }

    Returns:
        201: Entry saved successfully.
        500: Database save failed.
    """
    data = request.get_json()
    try:
        save_analytics_entry(data)
        return jsonify({"message": "Analytics entry created"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create analytics entry"}), 500




# old one
"""
@analytics_bp.route('/post-analytics-of-selected-service/', methods=['POST'])
def post_analytics_of_selected_service():
    data = request.get_json()
    doc_id = data.get("docId")
    user_id = data.get("userId")
    chunk_id = data.get("chunkId")
    action_type = data.get("actionType")
    details = data.get("details")

    if not doc_id or not user_id or not chunk_id or not action_type:
        return jsonify(error="Please fill in the required fields"), 400
    
    try:
        analytics_entry = Analytics(
            doc_id=doc_id,
            user_id=user_id,
            chunk_id=chunk_id,
            action_type=action_type,
            details=details,
            timestamp=datetime.now()
        )

        db.session.add(analytics_entry)
        db.session.commit()

        return jsonify({"message": "Analytics data inserted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding analytics data: {e}")
        return jsonify(error=str(e)), 500
"""