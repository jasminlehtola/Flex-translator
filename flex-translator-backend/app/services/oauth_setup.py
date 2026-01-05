"""
oauth_setup.py

Initializes OAuth authentication for GitLab integration.

This module configures an OAuth 2.0 client using Authlib for GitLab
and provides a setup function to initialize it within a Flask application.
"""

from authlib.integrations.flask_client import OAuth 
from flask import current_app, url_for

oauth = OAuth()


def init_oauth(app):
    """
    Initializes OAuth login for the given Flask application.

    Registers GitLab as an OAuth provider using the application's
    configuration settings.

    Args:
        app (Flask): The Flask application instance where OAuth will be initialized.
    """
    oauth.init_app(app)
    oauth.register( 
               name='gitlab',
               client_id= current_app.config['GITLAB_CLIENT_ID'],
               client_secret=current_app.config['GITLAB_CLIENT_SECRET'],
               access_token_url = 'https://gitlab-ext.utu.fi/oauth/token',
               authorize_url = 'https://gitlab-ext.utu.fi/oauth/authorize',
               api_base_url = 'https://gitlab-ext.utu.fi/api/v4/',
               client_kwargs =  {'scope' : 'read_user' }
               )


