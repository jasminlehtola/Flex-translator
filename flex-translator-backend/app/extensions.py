from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance globally.
# This is later bound to the Flask app in create_app().
db = SQLAlchemy()
