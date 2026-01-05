"""
auth.py

Defines the authentication routes for OAuth login, token management, and user session handling.

Endpoints:
    - GET /auth/login → Starts GitLab OAuth2 login flow
    - GET /auth/gitlab/callback → Handles GitLab redirect, creates user, stores session and tokens
    - POST /auth/refresh → Issues a new access token using a valid refresh token
    - GET /auth/logout → Clears user session and refresh token cookie
    - GET /auth/profile → Returns the current user's session data (if logged in)

Security:
    - Access tokens are short-lived and returned in redirect URL after login
    - Refresh tokens are stored in secure HttpOnly cookies, scoped to `/auth/refresh`

"""


from flask import  request, jsonify, current_app,session, redirect, url_for
import jwt
from flask_smorest import Blueprint
from flask import make_response, redirect, current_app
from app.models.db_models import Document, User, UserSettings
from app.extensions import db
from app.services.oauth_setup import oauth
from app.models.db_models import User
from app.utils.default_prompts import (
    INITIAL_PROMPT,
    CONVERSATION_HISTORY_PROMPT,
    USER_PROMPT_INSTRUCTIONS,
    DICTIONARY_INSTRUCTIONS
)
from app.utils.tokens import generate_jwt_for_user, generate_refresh_token


auth_bp = Blueprint('auth', 'auth', url_prefix='/auth')


@auth_bp.route('/gitlab/callback', methods=['GET'])
def authorize():
    """
    Handles the callback from GitLab OAuth2 after successful login.

    - Fetches GitLab access token and user info
    - Creates a new user and default settings if they do not exist
    - Stores session data and issues JWT and refresh token

    Returns:
        Redirect to frontend with access token in query param.
    """
    error = request.args.get("error")
    
    PORT = "5000" if current_app.config["IS_PRODUCTION"] else "5173"
    DOMAIN = current_app.config["FRONTEND_DOMAIN"] 

    if error:
        return redirect(f'http://{DOMAIN}:{PORT}/login?success=false')
    token  = oauth.gitlab.authorize_access_token()
    user_data = oauth.gitlab.get('user').json() 
    user = User.query.filter_by(email=user_data['email']).first()

    # Create new user
    if user is None:
        user = User(email=user_data['email'])
        db.session.add(user)
        db.session.commit()

    # Check if there is UserSettings
    settings = UserSettings.query.filter_by(user_id=user.id).first()

    # Create default settings/prompts if they do not already exist
    if not settings:
        settings = UserSettings(
            user_id=user.id,
            initial_prompt=INITIAL_PROMPT,
            conversation_history_prompt=CONVERSATION_HISTORY_PROMPT,
            user_prompt_instructions=USER_PROMPT_INSTRUCTIONS,
            dictionary_instructions=DICTIONARY_INSTRUCTIONS
        )
        db.session.add(settings)
        db.session.commit()

    else:
        print("User already has settings with id:", settings.id)

    # Save user to session
    session['user_id'] = user.id
    session['email'] = user.email

    app_token = generate_jwt_for_user(user.id, user.email)
    refresh_token = generate_refresh_token(user.id, user.email)

    response = make_response(redirect(f'http://{DOMAIN}:{PORT}/profile?token={app_token}'))
    response.set_cookie(
        "refresh_token",        # name
        refresh_token,          # value
        httponly=True,          # no JS access
        secure=True,            # HTTPS only
        samesite="Strict",      # CSRF protection
        max_age=7 * 24 * 3600,  # exp: 7 days (in seconds)
        path='/auth/refresh'    # only into this endpoint
    )
    return response


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """
    Issues a new access token using a valid refresh token stored in cookies.

    Returns:
        200 OK with new access token if successful
        401 Unauthorized if token is invalid or expired
    """
    data = request.get_json()
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return jsonify({"msg": "Missing refresh token"}), 400

    try:
        payload = jwt.decode(refresh_token, current_app.config["SECRET_REFRESH_KEY"], algorithms=["HS256"])
        user_id = payload["sub"]
        email = payload["email"]
        new_access_token = generate_jwt_for_user(user_id, email)
        return jsonify({"access_token": new_access_token}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"msg": "Refresh token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"msg": "Invalid refresh token"}), 401


@auth_bp.route('/login', methods=['GET'])
def login():
    """
    Initiates the GitLab OAuth2 login process.

    Redirects user to GitLab's authorization page.
    """
    redirect_uri = url_for('auth.authorize', _external=True) 
    return oauth.gitlab.authorize_redirect(redirect_uri)


@auth_bp.route('/logout')
def profile():
        """
        Clears the current user's session and deletes refresh token cookie.

        Returns:
            Redirect to home page.
        """
        session.clear()
        response = redirect('/')
        response.set_cookie('refresh_token', '', expires=0, path='/auth/refresh')
        return response
        

@auth_bp.route('/profile')
def profile():
        """
        Returns current user session information if logged in.

        Returns:
        - User session dict if logged in
        - Redirect to home page otherwise
        """
        user = session.get('user')
        if user:
            return user
        return redirect('/')
