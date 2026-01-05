from pathlib import Path
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_smorest import Api
from app.extensions import db
from app.config import Config
from app.services.translation_service import TranslationService
from app.services.chunk_service import ChunkService
from app.services.documents_service import DocumentsService
from app.services.groups_service import GroupsService
from app.services.progress_service import ProgressService
from app.routes.documents import documents_bp
from app.routes.chunks import chunks_bp
from app.routes.auth import auth_bp
from app.routes.userinfo import user_bp
from app.routes.groups import groups_bp
from app.routes.settings import settings_bp
from app.routes.analytics import analytics_bp
from app.services.oauth_setup import init_oauth

def create_app():
    """Create and configure the Flask application instance."""
    dist_path = (Path(__file__).resolve().parent.parent / "dist").resolve()
    print("distpath1:", dist_path)
    app = Flask(__name__, static_folder=str(dist_path), static_url_path="")
    app.config.from_object(Config)

    # Set up CORS to allow frontend access
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)


    # Serve frontend
    @app.route("/")
    @app.route("/<path:path>")
    def serve_spa(path=""):
        print("distpath2:", dist_path)
        #full_path = dist_path / path if path else dist_path / "index.html"
        #if path and full_path.is_file():
            #return send_from_directory(dist_path, path)
        return send_from_directory(app.static_folder, "index.html")

    @app.errorhandler(404)
    def spa_fallback(e):
        # if request.path.startswith(("/api", "/openapi", "/docs", "/swagger")):
            # return e
        return send_from_directory(dist_path, "index.html")
    
    

    # Set a secure secret key
    app.secret_key = "verysecret"

    # Initialize Flask extensions
    db.init_app(app)

    # Initialize OAuth (e.g., GitLab login)
    with app.app_context():
        init_oauth(app)

    # Initialize OpenAI and DeepL API keys from config
    openai_key = app.config['OPENAI_API_KEY']
    deepl_key = app.config['DEEPL_API_KEY']

    # Attach services to app context
    app.documents_service = DocumentsService()
    app.chunk_service = ChunkService()
    app.translation_service = TranslationService(openai_key, deepl_key)
    app.groups_service = GroupsService()
    app.progress_service = ProgressService()
    
    # Register RESTful API with Blueprints
    api = Api(app)
    api.register_blueprint(documents_bp)
    api.register_blueprint(chunks_bp)
    api.register_blueprint(auth_bp)
    api.register_blueprint(user_bp)

    # Register non-RESTful blueprints
    app.register_blueprint(groups_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(analytics_bp)

    # print([str(rule) for rule in app.url_map.iter_rules()])

    
    return app

"""
    @app.route("/<path:path>")
    def serve_static(path=""):
        return send_from_directory(app.static_folder, "index.html")
        full_path = Path(app.static_folder) / path
        if full_path.exists():
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

 """
    
