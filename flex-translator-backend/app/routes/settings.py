"""
settings.py

Routes for managing user-specific translation settings (prompts).

Includes:
- Fetching user settings
- Updating user settings
- Resetting to defaults
- Getting default prompt values
"""

from flask import Blueprint, request, jsonify
from app.models.db_models import UserSettings
from app import db
from app.routes.wrappers import require_user_access
from app.utils.default_prompts import (
    INITIAL_PROMPT,
    CONVERSATION_HISTORY_PROMPT,
    USER_PROMPT_INSTRUCTIONS,
    DICTIONARY_INSTRUCTIONS
)

settings_bp = Blueprint('settings', 'settings', url_prefix='/settings')


@settings_bp.route("/<int:user_id>", methods=["GET"])
@require_user_access
def get_user_settings(user_id):
    """
    Fetch the saved translation settings (prompts) for a specific user.

    Returns:
        - 200 OK with settings data
        - 404 if user settings not found
    """
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    db.session.add(settings)
    db.session.commit()
    
    return jsonify({
        "initial_prompt": settings.initial_prompt,
        "conversation_history_prompt": settings.conversation_history_prompt,
        "user_prompt_instructions": settings.user_prompt_instructions,
        "dictionary_instructions": settings.dictionary_instructions,
    }), 200


@settings_bp.route("/defaults", methods=["GET"])
def get_default_settings():
    """
    Return the default values for all system prompts.

    Returns:
        - 200 OK with default prompts
    """
    return jsonify({
        "initial_prompt": INITIAL_PROMPT,
        "conversation_history_prompt": CONVERSATION_HISTORY_PROMPT,
        "user_prompt_instructions": USER_PROMPT_INSTRUCTIONS,
        "dictionary_instructions": DICTIONARY_INSTRUCTIONS,
    }), 200


@settings_bp.route("/<int:user_id>", methods=["POST"])
@require_user_access
def update_user_settings(user_id):
    """
    Update a user's prompt settings.

    Request JSON:
        {
            "initial_prompt": "...",
            "conversation_history_prompt": "...",
            "user_prompt_instructions": "...",
            "dictionary_instructions": "..."
        }

    Returns:
        - 200 OK when update succeeds
        - 404 if settings not found
    """
    data = request.get_json()
    settings = UserSettings.query.filter_by(user_id=user_id).first()

    settings.initial_prompt = data.get("initial_prompt", settings.initial_prompt)
    settings.conversation_history_prompt = data.get("conversation_history_prompt", settings.conversation_history_prompt)
    settings.user_prompt_instructions = data.get("user_prompt_instructions", settings.user_prompt_instructions)
    settings.dictionary_instructions = data.get("dictionary_instructions", settings.dictionary_instructions)

    db.session.commit()
    return jsonify({"message": "Settings updated successfully"}), 200


@settings_bp.route("/<int:user_id>", methods=["DELETE"])
@require_user_access
def reset_user_settings(user_id):
    """
    Reset user's prompts back to default values.

    Returns:
        - 200 OK on successful reset
        - 404 if settings not found
    """
    settings = UserSettings.query.filter_by(user_id=user_id).first()

    settings.initial_prompt = INITIAL_PROMPT
    settings.conversation_history_prompt = CONVERSATION_HISTORY_PROMPT
    settings.user_prompt_instructions = USER_PROMPT_INSTRUCTIONS
    settings.dictionary_instructions = DICTIONARY_INSTRUCTIONS

    db.session.commit()
    return jsonify({"message": "Settings reset to defaults."}), 200





