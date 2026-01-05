from .translation_service import TranslationService
from .chunk_service import ChunkService
from .documents_service import DocumentsService
from .progress_service import ProgressService
from flask import current_app

def get_translation_service():
  return TranslationService(
    openai_api_key=current_app.config['OPENAI_API_KEY'],
    deepl_api_key=current_app.config['DEEPL_API_KEY']
  )

def get_chunk_service():
  return ChunkService()

def get_documents_service():
  return DocumentsService()

def get_progress_service():
  return ProgressService()
