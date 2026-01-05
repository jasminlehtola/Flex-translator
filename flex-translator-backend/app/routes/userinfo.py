"""
userinfo.py

Route to return authenticated user's basic information (user ID and email).
"""

from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from app.models.db_models import User
from app.extensions import db
from app.utils.tokens import parse_jwt_token
from app.routes.wrappers import require_user_access 
user_bp = Blueprint("userinfo", "userinfo", url_prefix="/userinfo")

@user_bp.route("/current_user", methods=['GET'])
@require_user_access
def get_user_info():
    """
    Get info of the currently authenticated user.

    Headers:
        - Authorization: Bearer <access_token>

    Returns:
        - 200 OK with user ID and email
        - 401 Unauthorized if token is invalid or missing
    """
    auth_header = request.headers.get("Authorization")
    try:
        user_id = parse_jwt_token(auth_header)
    except: 
        return "error parsing token", 401
    user = User.query.get(user_id)	
    user = {
            "user_id": user.id,
            "email" : user.email
            }
    return jsonify(user)

	
