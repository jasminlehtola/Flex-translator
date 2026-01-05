from app import create_app
from app.extensions import db
from app.models.db_models import User, UserSettings
from app.utils.default_prompts import (
    INITIAL_PROMPT,
    CONVERSATION_HISTORY_PROMPT,
    USER_PROMPT_INSTRUCTIONS,
    DICTIONARY_INSTRUCTIONS,
)

def init_user_settings():
    app = create_app()

    with app.app_context():
        users = User.query.all()
        added = 0

        for user in users:
            # Tarkista löytyykö UserSettings-rivi
            if not UserSettings.query.filter_by(user_id=user.id).first():
                default_settings = UserSettings(
                    user_id=user.id,
                    initial_prompt=INITIAL_PROMPT,
                    conversation_history_prompt=CONVERSATION_HISTORY_PROMPT,
                    user_prompt_instructions=USER_PROMPT_INSTRUCTIONS,
                    dictionary_instructions=DICTIONARY_INSTRUCTIONS,
                )
                db.session.add(default_settings)
                added += 1

        db.session.commit()
        print(f" Added default settings for {added} user(s).")

if __name__ == "__main__":
    init_user_settings()


