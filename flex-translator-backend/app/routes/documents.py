"""
documents.py

Routes for managing documents and their translations.

Includes:
- Document creation from text or file
- Retrieval of documents and translation chunks
- Automatic translation
- DeepL file-based translation (preserves layout)
- Finalization, update and deletion
- PDF post-processing (with injected translations)

"""

from flask import request, jsonify, current_app, send_file, session
from flask_smorest import Blueprint
from flask import Response, stream_with_context
from app.models.db_models import Document, Chunk
from app.extensions import db
from app.routes.wrappers import require_user_access
import base64
from PyPDF2 import PdfReader
from io import BytesIO
from app.services.pdf_service import extract_text_from_pdf, translate_text, translate_text2
from app.services.pdf_service import guess_extension
from app.services.analytics_service import save_analytics_entry

documents_bp = Blueprint('documents', 'documents', url_prefix='/documents')

@documents_bp.route('/user/<int:user_id>', methods=['GET'])
@require_user_access
def get_documents(user_id):
    """
    Get all documents belonging to a specific user.

    Returns:
        - 200 OK with list of documents
    """
    documents = [
            {
                "id": doc.id,
                "title": doc.title,
                "created_at": doc.created_at.isoformat(),
                "modified_at": doc.modified_at.isoformat() if doc.modified_at else None
            } for doc in Document.query.filter_by(user_id=user_id).all()
        ]
    return jsonify(documents), 200


@documents_bp.route('/<int:doc_id>', methods=['GET'])
@require_user_access
def get_document_and_chunks(doc_id):
    """
    Returns full document metadata and its associated chunks.

    If the document contains a base64-encoded PDF, the text is extracted.

    Returns:
        - 200 OK with document and chunks
        - 404 if document not found
    """
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify(error="Document not found"), 404
    
    chunks = current_app.chunk_service.get_chunks_by_document_id(doc_id)
    if doc.original_text[0:3] == "b64":
        org_text = extract_text_from_pdf(doc.original_text)
    else:
        org_text = doc.original_text
        
    return jsonify({
        "id": doc.id,
        "title": doc.title,
        "source_type": doc.source_type,
        "created_at": doc.created_at.isoformat(),
        "modified_at": doc.modified_at.isoformat() if doc.modified_at else None,
        "original_text": org_text,
        "final_translation": doc.final_translation,
        "chunks": chunks
    }), 200


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in  ["pdf"]


# creates new document and chunks it by calling documents_service.create_document
@documents_bp.route('', methods=['POST'])
@require_user_access
def create_document():
    """
    Creates a new document from text or uploaded file (.pdf).

    Request (form-data):
        - title: str
        - userId: int
        - upload_file (optional): PDF file
        - content (optional): pasted text

    Returns:
        - 200 OK with document metadata
        - 400 Bad request or 500 on failure
    """
    user_id = request.form.get("userId")
    print("user id " + user_id)
    title = request.form.get("title")
    file = request.files.get("upload_file")

    if file and allowed_file(file.filename):
        binary = file.read()
        print(binary[:100])
        #set some file size limit here
        #you can also validate here that it really is a valid pdf
        #and maybe now b64 encdoing is not neccessary, when you turn it straight away into docx
        b64_file = base64.b64encode(binary).decode("ascii")
        content ="b64"+b64_file 
    else:
        content = request.form.get("content") 

    try:
        doc = current_app.documents_service.create_document(
            user_id=user_id,
            title=title,
            content=content
        )
        return jsonify(document_id=doc.id, title=doc.title, created_at=doc.created_at.isoformat(), modified_at=doc.modified_at.isoformat()), 200
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        current_app.logger.error(f"Error adding document: {e}")
        return jsonify(error=str(e)), 500



@documents_bp.route('/<int:doc_id>/autoTranslate', methods=['POST'])
@require_user_access
def auto_translate_document(doc_id):
    """
    Automatically translates all chunks of a document using DeepL.

    Returns:
        - 200 OK when translation complete
        - 404 if document not found
        - 500 on failure
    """
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(error="User not logged in"), 401
    document = Document.query.get(doc_id)
    if not document:
        return jsonify(error="Document not found"), 404
    
    if document.final_translation:
        return jsonify(message="Translation already exists"), 200
    
    print(f"Starting auto-translation for document {doc_id}")

    try:
        # Get or create chunks
        chunks = Chunk.query.filter_by(document_id=doc_id).order_by(Chunk.chunk_number).all()
        if not chunks:
            full_text = document.original_text
            chunks = current_app.chunk_service.split_and_store_chunks(doc_id, full_text)
            if not chunks:
                return jsonify(error="Failed to split text into chunks"), 500

        total_chunks = len(chunks)
        translated_chunks = []

        # Translate chunks
        for idx, chunk_obj in enumerate(chunks):
            if chunk_obj.final_chunk_translation:
                # Skip already translated chunks
                translated_chunks.append(chunk_obj.final_chunk_translation)
                continue

            print(f"Translating chunk {idx + 1}/{total_chunks}...")


            deepl_translation = current_app.translation_service.translate_deepl(
                chunk_obj.chunk_content
            )
            
            # If you want to use chatGPT for auto-translation (but deepL is faster and better for pdf)
            """ gpt_translation = current_app.translation_service.translate_chatgpt(
                user_id=user_id,
                prompt=chunk_obj.chunk_content,
                conversation_history=[],
                user_prompts=[],
                current_translation=[]
            )
            if not gpt_translation:
                gpt_translation = "[Translation failed for this chunk]"
                """

            # Save translation
            chunk_obj.final_chunk_translation = deepl_translation
            db.session.add(chunk_obj)
            # Commit after each chunk so progress updates
            db.session.commit()
            translated_chunks.append(deepl_translation)

            # ---------------- Save analytics data ----------------
            try:
                analytics_data = {
                    "document_id": doc_id,
                    "chunk_id": chunk_obj.id,
                    "source_type": "paste",
                    "translation_mode": "auto",
                    "chosen_model": "deepl",
                    "original_text": chunk_obj.chunk_content,
                    "user_final": deepl_translation,
                    "edited": False,
                    "user_prompts": [],
                    "user_dictionary": [],
                    "time_spent_sec": 0,
                }

                save_analytics_entry(analytics_data)
                print("Analytics saved for chunk", chunk_obj.id)

            except Exception as e:
                current_app.logger.error(f"Analytics error for chunk {chunk_obj.id}: {e}")
    
            # -----------------------------------------------------

            print(f"Progress: {idx + 1}/{total_chunks}")


        # Join all chunks
        document.final_translation = "\n\n".join(translated_chunks)
        document.is_finalized = True
        db.session.add(document)
        db.session.commit()

        print(f"Translation complete for document {doc_id}")

        return jsonify(
            document_id=doc_id,
            title=document.title,
            created_at=document.created_at.isoformat(),
            modified_at=document.modified_at.isoformat(),
            message="Auto-translation complete"
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify(error="Auto-translation failed: " + str(e)), 500

    


@documents_bp.route('/deeplFileTranslate', methods=['POST'])
@require_user_access
def deepl_translate_file():
    """
    Translates a document file (PDF or DOCX) using DeepL API and returns a downloadable .docx file.

    Request (form-data):
        - title: str
        - userId: int
        - upload_file: file

    Returns:
        - 200 OK with translated DOCX
        - 400 or 500 on error
    """
    title = request.form.get("title")
    user_id = request.form.get("userId")
    file = request.files.get("upload_file")
    filename = file.filename

    if not file or not title or not user_id:
        return jsonify(error="Missing required fields"), 400

    try:
        file_bytes = file.read()
        extension = guess_extension(file_bytes)
        filename = title.replace(" ", "_") + extension

        file_stream = file_bytes

        # Translation
        buffer = current_app.translation_service.deepl_translate_document(
            file_stream=file_stream,
            filename=filename
        )

        if not buffer:
            return jsonify(error="Translation failed"), 500


        # Save analytics
        try:
            save_analytics_entry(filename=filename)
            current_app.logger.info(f"PDF analytics saved: {filename}")
        except Exception as e:
            current_app.logger.error(f"Analytics error for PDF translation: {e}")

        return send_file(
            buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=f"{title}.docx"
        )

    except Exception as e:
        current_app.logger.error(f"DeepL PDF translation error: {e}")
        return jsonify(error="Translation failed: " + str(e)), 500
    




@documents_bp.route('/<int:doc_id>/finalize', methods=['POST'])
@require_user_access
def finalize_document(doc_id):
    """
    Finalizes a document by locking the translation.

    Returns:
        - 200 OK with final translation
        - 400 or 500 on error
    """
    try:
        doc = current_app.documents_service.finalize_document_by_id(doc_id)
        return jsonify(final_translation=doc.final_translation), 200
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        current_app.logger.error(f"Error finalizing document: {e}")
        return jsonify(error=str(e)), 500



@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
@require_user_access
def delete_document(doc_id):
    """
    Deletes a document by ID.

    Returns:
        - 200 OK
        - 404 or 500 on error
    """
    try:
        current_app.documents_service.delete_document_by_id(doc_id)
        return jsonify(message=f"Document (id: {doc_id}) deleted successfully"), 200
    except ValueError as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting document: {e}")
        return jsonify(error=str(e)), 500
    


@documents_bp.route('/batch', methods=['DELETE'])
@require_user_access
def delete_documents_batch():
    """
    Deletes multiple documents by a list of IDs.

    Request JSON:
        {
            "document_ids": [1, 2, 3]
        }

    Returns:
        - 200 OK on success
        - 400, 404, or 500 on error
    """
    data = request.get_json()
    doc_ids = data.get('document_ids', [])
    if not doc_ids:
        return jsonify({"error": "No document IDs provided"}), 400

    try:
        result = current_app.documents_service.delete_documents_by_ids(doc_ids)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting documents: {e}")
        return jsonify({"error": str(e)}), 500



@documents_bp.route('/<int:doc_id>', methods=['PATCH'])
@require_user_access
def update_document(doc_id):
    """
    Updates document fields (e.g. title, final_translation).

    Request JSON:
        {
            "title": "New title",
            "final_translation": "..."
        }

    Returns:
        - 200 OK
        - 404 or 500 on error
    """
    document = Document.query.get(doc_id)
    if not document:
        return jsonify(error="Document not found"), 404
    
    data = request.get_json()
    # Update name if given
    if "title" in data:
        document.title = data["title"]

    document.final_translation = data.get("final_translation", document.final_translation)

    db.session.commit()
    return jsonify(message="Document updated successfully"), 200
    

@documents_bp.route('/pdf/<int:doc_id>', methods=['GET'])
@require_user_access
def get_pdf_translation(doc_id):
    """
    Reconstructs the original PDF with translated text injected and returns it as .docx.

    Returns:
        - 200 OK with docx file
        - 404 if document not found
    """
    document = Document.query.get(doc_id)
    chunks = current_app.chunk_service.get_chunks_by_document_id(doc_id)
    if not document:
        return jsonify(error="Document not found"), 404
    original = document.original_text
    final = document.final_translation
    text = [word.replace("<word>", "").strip() for word in  extract_text_from_pdf(original).split("\n")]
    final = list(map(lambda x: x.replace("<word>", "").strip(), final.split("\n")))
    buffer = translate_text(original, {translation[0]:translation[1] for translation in zip(text, final)})

    
    return send_file(
        buffer,
        mimetype='application/docx', 
        as_attachment=True,
        download_name="file.docx"
    )
    


