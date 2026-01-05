"""
translation_service.py

Provides translation functionality using OpenAI GPT and DeepL.
Supports both plain text and document translation, with user-specific prompt customization.
"""

from openai import OpenAI
import deepl
from flask import current_app
from io import BytesIO
import os
from pathlib import Path
from app.models.db_models import UserSettings
from app.utils.default_prompts import (
    GPT_MODEL,
    INITIAL_PROMPT,
    CONVERSATION_HISTORY_PROMPT,
    USER_PROMPT_INSTRUCTIONS,
    DICTIONARY_INSTRUCTIONS
)



class TranslationService:
  def __init__(self, openai_api_key: str, deepl_api_key: str):
    """
    Initializes the TranslationService with OpenAI and DeepL API keys.
    """
    self.chatgpt_translator = OpenAI(api_key=openai_api_key)
    self.deepl_translator = deepl.Translator(deepl_api_key)
    self.deepl_key = f"DeepL-Auth-Key {deepl_api_key}"


  def _get_user_prompts(self, user_id: int):
    """
    Fetch user-specific prompt configurations from the database.

    Returns default values if no user settings are found.
    """
    user_settings = UserSettings.query.filter_by(user_id=user_id).first()
    if user_settings:
        return {
            "initial_prompt": user_settings.initial_prompt,
            "conversation_history_prompt": user_settings.conversation_history_prompt,
            "user_prompt_instructions": user_settings.user_prompt_instructions,
            "dictionary_instructions": user_settings.dictionary_instructions
        }
    else:
        return {
            "initial_prompt": INITIAL_PROMPT,
            "conversation_history_prompt": CONVERSATION_HISTORY_PROMPT,
            "user_prompt_instructions": USER_PROMPT_INSTRUCTIONS,
            "dictionary_instructions": DICTIONARY_INSTRUCTIONS
        }


  def translate_chatgpt(
        self, 
        user_id: int, 
        prompt: str, 
        conversation_history=None, 
        temperature=1, 
        user_prompts=None,
        current_translation=None
  ):
    """
    Translates or edits a text using ChatGPT with user-specific prompt configuration.

    Returns:
        str: Translated or edited content.
    """
    
    # Get user-specific settings
    prompts_config = self._get_user_prompts(user_id) 
    messages = []
    messages.append({"role": "system", "content": prompts_config["initial_prompt"]})

    if conversation_history:
      messages.append({
         "role": "user", 
         "content": prompts_config["conversation_history_prompt"] + conversation_history
    })
      
    # Send user’s last saved edit as context
    if current_translation:
      messages.append({
        "role": "user",
        "content": "You are assisting a translator editing an existing translation."
    }) 
      """"
      messages.append({
        "role": "user",
        "content": (
            f"Here’s my current version of this paragraph:\n"
            f"{current_translation}\n"
            "Your task: Improve grammar, flow, and vocabulary, but *do not* add any content that is not already present. "
            "Never reintroduce content that was removed. Do not retranslate the original text. Only edit what you see here."
        )
    })"""
      
    else:
      # Fallback to normal translation
      messages.append({"role": "user", "content": prompt})


    # Extract dictionaries and custom prompts
    dictionary = (user_prompts or {}).get("dictionary") or []
    prompts_list = (user_prompts or {}).get("prompts") or []

    if dictionary:
        text = DICTIONARY_INSTRUCTIONS
        for entry in dictionary:
                text += f";{entry['input']}->{entry['output']}"
        messages.append({"role":"user", "content": text})

    if prompts_list:
        text = USER_PROMPT_INSTRUCTIONS
        for prompt in prompts_list:
            text += prompt["instruction"]+", "
        messages.append({"role": "user", "content": text})

    print("DEBUG user id:", user_id)
    print("DEBUG user_prompts:", user_prompts)
    print("DEBUG prompts:", prompts_list)
    print("DEBUG dictionary:", dictionary)

    try:
      response = self.chatgpt_translator.chat.completions.create(
        model=GPT_MODEL,
        messages=messages,
        temperature=temperature,
        n=1,
        top_p=0.8
      )
      variations = [choice.message.content for choice in response.choices]
      return variations[0]
    except Exception as e:
      current_app.logger.error(f"An error occurred: {e}")
      raise ValueError("Translation failed.")



  def translate_deepl(self, text: str):
    """
    Translate a plain text string using DeepL.

    Args:
        text (str): Text to translate.

    Returns:
        str: Translated text.
    """
    try:
      result = self.deepl_translator.translate_text(text, target_lang="EN-GB")
      return result.text
    except Exception as e:
      current_app.logger.error(f"DeepL translation error: {e}")
      raise


  def handle_temp_file(self, byte_stream: bytes, filename):
    """
    Saves a byte stream to a temporary file and returns the path.

    Args:
        byte_stream (bytes): File content.
        filename (str): Desired filename.

    Returns:
        str: Path to temporary file.
    """
    # Resolve relative path to /app/temp from current file location
    base_path = Path(__file__).resolve().parent  # current file's directory
    folder_path = base_path / "temp"             # relative to that

    # Ensure folder exists
    folder_path.mkdir(parents=True, exist_ok=True)

    file_path = folder_path / filename
   
    # Write the file
    with open(file_path, "wb") as f:
        f.write(byte_stream)
    print(f"Temp file written: {file_path}")
    return file_path  
  
 
  def deepl_translate_document(self, file_stream: bytes, filename: str):
    """
    Uses DeepL to translate an uploaded document file.

    Args:
        file_stream (bytes): Original file content.
        filename (str): Name of the uploaded file.

    Returns:
        BytesIO or None: Translated file as byte stream or None on failure.
    """

    try:
      # Uploads and translates the document
      path = self.handle_temp_file(file_stream, filename)
      output_path = filename +"_translated.docx"

      self.deepl_translator.translate_document(
        input_document = open(path, "rb"), 
        output_document = open(output_path, "wb"), 
        filename=filename,             
        target_lang="EN-US",
        source_lang="FI",
        output_format="docx"
      )

      with open(output_path, "rb") as f:
        buffer = BytesIO(f.read())

      # Removes temporary files
      os.remove(path)
      os.remove(output_path)
      return buffer
    
    except Exception as e:
        current_app.logger.error(f"DeepL document translation failed: {e}")
        return None
    
    
    
    