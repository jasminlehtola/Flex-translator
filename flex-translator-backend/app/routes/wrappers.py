"""
wrappers.py

Authorization decorator to verify user access to routes containing:
- user_id
- doc_id
- chunk_id

If token is missing, invalid, or access is forbidden, the request is aborted.
"""

from functools import wraps
from flask import abort, current_app, request
from app.utils.tokens import parse_jwt_token
from app.models.db_models import Document, Chunk
from app.extensions import db
import jwt


def require_user_access(func):
    """
    Decorator to restrict access to resources based on JWT token.

    Checks user ownership of:
    - document (/documents/<doc_id>)
    - chunk (/chunks/<chunk_id>)
    - user-specific data (/user/<user_id> or ?user_id=...)

    Aborts with:
        - 401: If token is missing or invalid
        - 403: If access is forbidden

    Returns:
        - The wrapped function if access is valid
    """
    @wraps(func)
    def wrapper( *args, **kwargs):
        SECRET_KEY = current_app.config["SECRET_TOKEN_KEY"]
        auth_header = request.headers.get("Authorization")
        try:
            token_user_id = parse_jwt_token(auth_header)
        except Exception as e:
            print("Token parsing error:", e)
            abort(401, description="Invalid or expired token")

        if token_user_id == None:
            abort(403, description="User ID not found in token")

        # 1. Check access to document by ID (/documents/<doc_id>)
        doc_id = kwargs.get('doc_id')
        if doc_id:
            document = db.session.query(Document).get(doc_id)
            if not document or int(document.user_id) != int(token_user_id):
                abort(403, description="Forbidden: invalid document access")
            return func(*args, **kwargs)
        
        # 2. Check access to chunk by ID (/chunks/<chunk_id>)
        chunk_id = kwargs.get('chunk_id')
        if chunk_id:
            chunk = db.session.query(Chunk).get(chunk_id)
            if not chunk or chunk.document.user_id != int(token_user_id):
                abort(403, description="Forbidden: invalid chunk access")
            return func(*args, **kwargs)

        # 3. Check access to user by ID (/user/<user_id> or /?user_id=...)
        user_id = kwargs.get('user_id') or request.args.get('user_id')
        if user_id:
            if int(user_id) != int(token_user_id):
                abort(403, description="Forbidden: user mismatch")
            return func(*args, **kwargs)
        
        print(f"[AUTH] token_user_id={token_user_id}, route_user_id={kwargs.get('user_id')}, doc_id={kwargs.get('doc_id')}")

        # 4. Fallback: allow access if no relevant resource is protected
        return func(*args, **kwargs)
    

    return wrapper

