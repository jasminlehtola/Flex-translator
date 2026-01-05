"""
analytics_service.py

Handles storing user translation analytics into the database.
"""

from flask import request
from datetime import datetime
from app.models.db_models import Analytics
from app.utils.tokens import parse_jwt_token
from app.extensions import db


def save_analytics_entry(data: dict):
    """
    Saves an analytics entry for a user translation interaction.

    Extracts the user ID from JWT token in Authorization header and logs
    information such as:
      - Source type (pdf, docx, paste)
      - Translation model (gpt, deepl)
      - Whether the result was edited
      - Original and final translations
      - Used prompts and dictionaries

    Parameters:
        data (dict): Dictionary containing analytics fields. Expected keys:
            - document_id (int)
            - chunk_id (int)
            - source_type (str): 'paste', 'pdf', or 'docx'
            - translation_mode (str): 'auto', 'manual' or 'deeplAPIAuto'
            - chosen_model (str): 'gpt' or 'deepl'
            - original_text (str)
            - user_final (str)
            - user_prompts (list of str)
            - user_dictionary (list of str)
            - edited (bool)
            - time_spent_sec (int) (!! currently not calculating anything, gives just 0)

    Raises:
        Exception: If saving to database fails (will be handled by caller)
    """

    auth_header = request.headers.get("Authorization")
    user_id = parse_jwt_token(auth_header)
    document_id = data.get('document_id')
    chunk_id = data.get('chunk_id')
    source_type = data.get('source_type')  # 'paste' or 'pdf' or 'docx'
    translation_mode = data.get('translation_mode')
    chosen_model = data.get('chosen_model')  # 'gpt' or 'deepl'
    original_text = data.get('original_text')
    user_final = data.get('user_final')
    user_prompts = '\n\n'.join(data.get('user_prompts') or [])
    user_dictionary = '\n'.join(data.get('user_dictionary') or [])
    edited = bool(data.get('edited'))
    time_spent_sec = data.get('time_spent_sec')



    new_entry = Analytics(
        user_id=user_id,
        document_id=document_id,
        chunk_id=chunk_id,
        source_type=source_type,
        translation_mode=translation_mode,
        chosen_model=chosen_model,
        original_text=original_text,
        user_final=user_final,
        edited=edited,
        user_prompts=user_prompts,
        user_dictionary=user_dictionary,
        time_spent_sec=time_spent_sec,
    )

    db.session.add(new_entry)
    db.session.commit()

    print("Saved analytics for user:", user_id)

