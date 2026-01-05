import jwt
from datetime import datetime, timedelta
from flask import app, current_app, abort
import json

# -------------------------------
# JWT Token Generation Utilities
# -------------------------------

def generate_jwt_for_user(user_id, email):
    """
    Generate a short-lived JWT access token (valid for 30 minutes).

    Args:
        user_id (int): The user's ID.
        email (str): The user's email address.

    Returns:
        str: Encoded JWT token.
    """
    SECRET_KEY = current_app.config["SECRET_TOKEN_KEY"]
    ALGORITHM = "HS256"
    payload = {
                    "sub": str(user_id), 
                    "email": email,
                    "exp": datetime.utcnow()+timedelta(minutes=30),
                    "iat": datetime.utcnow()
                    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token



def generate_refresh_token(user_id, email):
    """
    Generate a long-lived refresh token (valid for 7 days).

    Args:
        user_id (int): The user's ID.
        email (str): The user's email address.

    Returns:
        str: Encoded JWT refresh token.

    NOTE:
    Be sure to match this with cookie expiration (max_age in routes/auth.py) if you change refreshtoken exp here!
    """
    SECRET_KEY = current_app.config["SECRET_REFRESH_KEY"]
    ALGORITHM = "HS256"
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


# -------------------------------
# JWT Token Parsing
# -------------------------------

def parse_jwt_token(auth_header):
    """
    Decode and validate a JWT from the Authorization header.

    Args:
        auth_header (str): The full Authorization header (e.g., "Bearer <token>").

    Returns:
        str: user_id from the token's payload.

    Raises:
        Exception: If token is missing, expired, or invalid.
    """
    SECRET_KEY = current_app.config["SECRET_TOKEN_KEY"]

    if not auth_header:
        raise  Exception("Missing authorization header")
    
    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["sub"]

        if user_id is None:
            raise  Exception("Invalid token payload")
        
        return user_id
    
    except jwt.ExpiredSignatureError:
        print("Token has expired. User must re-authenticate.")
        raise  Exception("Token expired")
    except jwt.InvalidTokenError:
        print("Invalid JWT token provided.")
        raise  Exception("Invalid token")
    


