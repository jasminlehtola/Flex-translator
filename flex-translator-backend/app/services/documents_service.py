"""
documents_service.py

Service responsible for:
- Creating documents (PDF or pasted text)
- Splitting and storing text into chunks
- Finalizing documents by joining translated chunks
- Deleting documents (individually or in batch)
"""

from app.extensions import db
from app.models.db_models import Document
from flask import current_app
from datetime import datetime
from .pdf_service import extract_text_from_pdf, pdf2docx_encode_b64


class DocumentsService:
  def create_document(self, user_id: int, title: str, content: str):
    """
        Creates a new document and splits its content into chunks.

        Parameters:
            user_id (int): ID of the user creating the document
            title (str): Title of the document
            content (str): Either base64-encoded PDF ('b64...') or pasted text

        Returns:
            Document object
        """
    if not (user_id and title and content):
      raise ValueError("Missing required fields")
    
    if content[0:3] == "b64":
      content = pdf2docx_encode_b64(content)
      source_type = 'pdf'
    else:
      source_type = 'paste'

    doc = Document(
      user_id=user_id,
      title=title,
      original_text=content,
      source_type=source_type
    )
    db.session.add(doc)

    try:
      db.session.commit()
    except Exception as e:
      db.session.rollback()
      current_app.logger.error("Error adding document")
      raise 

    # Extract clean text for chunking
    org_text=doc.original_text
    if content[0:3] == "b64":
      org_text = extract_text_from_pdf(doc.original_text)

    # Split and store chunks
    current_app.chunk_service.split_and_store_chunks(doc.id, org_text)

    return doc
  

  def finalize_document_by_id(self, doc_id: int):
    """
        Joins all translated chunks into a final translation.

        Parameters:
            doc_id (int): ID of the document

        Returns:
            Updated Document with final_translation populated
    """
    if not doc_id:
      raise ValueError("Missing required fields")

    doc = Document.query.get(doc_id)
    if not doc:
      raise ValueError("Document not found")
    
    chunks = current_app.chunk_service.get_chunks_by_document_id(doc_id)
    if not chunks:
      raise ValueError("No chunks found for this document")

    final_translation_chunks = []
    for chunk in chunks:
      if chunk["final_chunk_translation"]:
        final_translation_chunks.append(chunk["final_chunk_translation"])
      else:
        raise ValueError("Some chunks are not translated")
      
    doc.final_translation = "\n\n".join(final_translation_chunks)
    #print(doc.final_translation)
    doc.modified_at = datetime.now()
    db.session.commit()

    return doc
  

  def delete_document_by_id(self, doc_id: int):
    """
        Deletes a document by its ID.

        Parameters:
            doc_id (int): ID of the document

        Returns:
            True on success
    """
    doc = Document.query.get(doc_id)
    if not doc:
      raise ValueError("Document not found")

    db.session.delete(doc)
    db.session.commit()
    return True
  

  def delete_documents_by_ids(self, doc_ids: list[int]) -> dict:
    """
    Deletes multiple documents in a batch.

    Parameters:
        doc_ids (list[int]): List of document IDs

    Returns:
        dict with success flag and deleted IDs
    """
    if not doc_ids:
        raise ValueError("No document IDs provided.")

    try:
        docs_to_delete = Document.query.filter(Document.id.in_(doc_ids)).all()
        if not docs_to_delete:
            raise ValueError("No matching documents found.")

        for doc in docs_to_delete:
            db.session.delete(doc)

        db.session.commit()
        return {"success": True, "deleted_ids": doc_ids}
    
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Error deleting documents: {str(e)}")


