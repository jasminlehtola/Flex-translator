from pathlib import Path
from sqlalchemy import text
from app import create_app
from app.extensions import db
from app.models.db_models import User

def db_init():
    """Initializes the database and inserts a test user."""
    app = create_app()

    with app.app_context():
        # Create tables based on SQLAlchemy models
        db.create_all()
        print("Tables created (or already existed).")

        # Insert a test user if not already present
        if not User.query.filter_by(email="testi@utu.fi").first():
            test_user = User(email="testi@utu.fi")
            db.session.add(test_user)
            db.session.commit()
            print("Test user added.")
        else:
            print("Test user already exists.")
        

if __name__ == "__main__":
    db_init()
