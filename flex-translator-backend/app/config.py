import os
from dotenv import load_dotenv

# Load the .env file from one directory above this file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Config:
    IS_PRODUCTION = os.getenv("FLASK_ENV") == "production"

    CORS_HEADERS = 'Content-Type'

    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    DEEPL_API_KEY = os.getenv('DEEPL_API_KEY')

    if not IS_PRODUCTION:
        DB_HOST = os.getenv('DB_HOST_DEVELOPMENT', 'localhost')

    else:
        DB_HOST = os.getenv('DB_HOST_PRODUCTION')

        
    DB_USER = os.getenv('DB_USER', 'python_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'adminadmin')
    DB_NAME = os.getenv('DB_NAME', 'translation_db')

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Smorest settings
    API_TITLE = "Translation Service API"
    API_VERSION = "v1"
    OPENAPI_VERSION = "3.0.2"
    OPENAPI_URL_PREFIX = "/api"
    OPENAPI_REDOC_PATH = "/redoc"
    OPENAPI_REDOC_URL = "https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"

    OAUTH_APP_NAME = 'gitlab'
    GITLAB_CLIENT_ID = os.getenv('GITLAB_CLIENT_ID')
    GITLAB_CLIENT_SECRET = os.getenv('GITLAB_CLIENT_SECRET')
    SESSION_SECRET_KEY = ''

    SECRET_TOKEN_KEY= os.getenv('SECRET_TOKEN_KEY')
    SECRET_REFRESH_KEY = os.getenv('SECRET_REFRESH_KEY')

    FRONTEND_DOMAIN = os.getenv('FRONTEND_DOMAIN')
   

