from app import create_app, db
from app.models.db_models import UserSettings
from app.utils.default_prompts import DICTIONARY_INSTRUCTIONS

def init_dictionary_instructions():
    app = create_app()

    with app.app_context():
        print("Start using default dictionary...")

        # Hae kaikki käyttäjien asetukset
        settings_list = UserSettings.query.all()
        updated_count = 0

        for settings in settings_list:
            if not settings.dictionary_instructions or settings.dictionary_instructions.strip() == "":
                settings.dictionary_instructions = DICTIONARY_INSTRUCTIONS
                updated_count += 1

        if updated_count > 0:
            db.session.commit()
            print(f" Updated {updated_count} default dictionary_instructions.")
        else:
            print("All users have already dictionary_instructions.")

if __name__ == "__main__":
    init_dictionary_instructions()