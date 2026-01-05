"""
chunks.py

Defines endpoints for retrieving, translating, and updating text chunks of documents.

Endpoints:
    - POST   /chunks                   → Get all chunks for a document
    - GET    /chunks/<chunk_id>        → Get single chunk by ID
    - GET    /chunks/<doc_id>/progress → Get translation progress for document chunks
    - POST   /chunks/<chunk_id>/translate → Translate a chunk using ChatGPT & DeepL
    - POST   /chunks/<chunk_id>/save   → Save final translation for a chunk
    - PATCH  /chunks/<chunk_id>        → Update chunk translation

All mutations require that the chunk exists, and some require user authorization.

"""

from flask import request, jsonify, current_app, session
from flask_smorest import Blueprint
from app.models.db_models import Chunk
from app.routes.wrappers import require_user_access
from app.extensions import db

chunks_bp = Blueprint('chunks', 'chunks', url_prefix='/chunks')

@chunks_bp.route('', methods=['POST'])
def get_chunks():
    """
    chunks.py

    Defines endpoints for retrieving, translating, and updating text chunks of documents.

    Endpoints:
        - POST   /chunks                    → Get all chunks for a document
        - GET    /chunks/<chunk_id>        → Get single chunk by ID
        - GET    /chunks/<doc_id>/progress → Get translation progress for document chunks
        - POST   /chunks/<chunk_id>/translate → Translate a chunk using ChatGPT & DeepL
        - POST   /chunks/<chunk_id>/save   → Save final translation for a chunk
        - PATCH  /chunks/<chunk_id>        → Update chunk translation

    All mutations require that the chunk exists, and some require user authorization.
    """
    data = request.get_json()
    doc_id = data.get("doc_id")

    if not doc_id:
        return jsonify(error="Please fill in the required fields"), 400

    chunks = current_app.chunk_service.get_chunks_by_document_id(doc_id)

    return jsonify({
        "chunks": chunks
    }), 200


@chunks_bp.route('/<int:chunk_id>', methods=['GET'])
def get_chunk(chunk_id):
    """
    Returns metadata and content for a single chunk.

    Returns:
        - 200 OK with chunk info
        - 404 Not Found if chunk does not exist
    """
    chunk = Chunk.query.get(chunk_id)
    if not chunk:
        return jsonify(error="Chunk not found"), 404
    
    return jsonify({
        "id": chunk.id,
        "chunk_number": chunk.chunk_number,
        "chunk_content": chunk.chunk_content,
        "final_chunk_translation": chunk.final_chunk_translation
    }), 200


@chunks_bp.route('/<int:doc_id>/progress', methods=['GET'])
def get_translation_progress(doc_id):
    """
    Calculates translation progress (translated vs. total) for a document's chunks.

    Returns:
        - 200 OK with count of translated and total chunks
        - 404 Not Found if no chunks are found
    """
    chunks = current_app.chunk_service.get_chunks_by_document_id(doc_id)

    translated = sum ([1 if chunk["final_chunk_translation"] else 0 for chunk in chunks])
    total = len(chunks)

    if not chunks:
        return jsonify(error="Chunk not found"), 404
    
    return jsonify({
        "translated": translated,
        "total": total
    }), 200


@chunks_bp.route('/<int:chunk_id>/translate', methods=['POST'])
@require_user_access
def translate_chunk(chunk_id):
    """
    Translates a chunk using ChatGPT and DeepL.

    Expects JSON payload:
        {
            "conversation_history": [...],
            "user_prompts": [...],
            "current_translation": "<optional edited text>"
        }

    Returns:
        - 200 OK with GPT and DeepL translations
        - 404 Not Found if chunk doesn't exist
        - 500 Internal Server Error if translation fails
    """
    try: 
        user_id = session.get('user_id') or 1  # pitääkö olla 1 tossa?
        data = request.get_json()
        conversation_history = data.get("conversation_history", [])
        user_prompts = data.get("user_prompts", [])
        current_translation = data.get("current_translation", "").strip()

        chunk = Chunk.query.get(chunk_id)
        if not chunk:
            return jsonify(error="Chunk not found"), 404
    
        translation_service = current_app.translation_service
        
        gpt_translation = translation_service.translate_chatgpt(
            user_id=user_id,
            prompt=current_translation if current_translation else chunk.chunk_content,  
            conversation_history=conversation_history, 
            user_prompts=user_prompts
        )
        deepl_translation = translation_service.translate_deepl(current_translation if current_translation else chunk.chunk_content)

        return jsonify({
            "gpt": gpt_translation,
            "deepl": deepl_translation
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error in translate_chunk: {e}")
        return jsonify({"error": "Translation failed."}), 500



@chunks_bp.route('/<int:chunk_id>/save', methods=['POST'])
def save_chunk_translation(chunk_id):
    """
    Saves the final translation for a chunk.

    Expects JSON payload:
        {
            "final_translation": "<translated text>"
        }

    Returns:
        - 200 OK on success
        - 404 Not Found if chunk doesn't exist
    """
    chunk = Chunk.query.get(chunk_id)
    if not chunk:
        return jsonify(error="Chunk not found"), 404

    data = request.get_json()
    final_translation = data.get("final_translation")

    chunk.final_chunk_translation = final_translation
    db.session.commit()

    return jsonify(message="Translation saved successfully"), 200




@chunks_bp.route('/<int:chunk_id>', methods=['PATCH'])
def update_chunk(chunk_id):
    chunk = Chunk.query.get(chunk_id)
    if not chunk:
        return jsonify(error="Chunk not found"), 404

    data = request.get_json()
    chunk.final_chunk_translation = data.get("final_chunk_translation", chunk.final_chunk_translation)

    db.session.commit()

    return jsonify(message="Chunk updated successfully"), 200
