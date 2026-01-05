"""
chunk_service.py

Service for handling chunk operations:
- Splitting documents into manageable chunks
- Saving and retrieving chunk data
"""

from app.extensions import db
from app.models.db_models import Chunk

class ChunkService:
    def get_chunks_by_document_id(self, document_id: int):
        """
        Retrieves all chunks related to a document.

        Parameters:
            document_id (int): ID of the document

        Returns:
            List of chunk dictionaries with keys:
                - id
                - chunk_number
                - chunk_content
                - final_chunk_translation
                - created_at (ISO string)
            or None if no document_id provided
        """
        if not document_id:
            return None
        
        chunks = Chunk.query.filter_by(document_id=document_id).order_by(Chunk.chunk_number).all()

        return [
            {
                "id": chunk.id,
                "chunk_number": chunk.chunk_number,
                "chunk_content": chunk.chunk_content,
                "final_chunk_translation": chunk.final_chunk_translation,
                "created_at": chunk.created_at.isoformat(),
            } for chunk in chunks
        ]
    

    def split_and_store_chunks(self, document_id: int, full_text: str, max_words: int = 300):
        """
        Splits the full document text into chunks and saves them to the database.

        Parameters:
            document_id (int): ID of the document to associate the chunks with
            full_text (str): The raw content of the document
            max_words (int): Maximum word count per chunk (default: 300)

        Returns:
            List of chunk strings
        """
        # Remove existing chunks before inserting new ones
        Chunk.query.filter_by(document_id=document_id).delete()
        db.session.commit()

        lines = full_text.split("\n")
        chunks = []
        current_chunk = []
        word_count = 0
        in_code_block = False
        chunk_index = 0

        for line in lines:
            line_word_count = len(line.split())

            if line.strip().startswith("```"):
                in_code_block = not in_code_block

            # If outside code block and limit exceeded, save current chunk
            if not in_code_block and (word_count + line_word_count) > max_words:
                chunk_str = "\n".join(current_chunk)
                # print(chunk_str)
                self._save_chunk(document_id, chunk_index, chunk_str)
                chunks.append(chunk_str)
                chunk_index += 1

                current_chunk = [line]
                word_count = line_word_count
            else:
                # print(line) 
                current_chunk.append(line)
                word_count += line_word_count
        
        # Save final chunk
        if current_chunk:
            chunk_str = "\n".join(current_chunk)
            self._save_chunk(document_id, chunk_index, chunk_str)
            chunks.append(chunk_str)

        return chunks


    def _save_chunk(self, doc_id: int, idx: int, content: str):
        """
        Internal helper to save a chunk to the database.

        Parameters:
            doc_id (int): Document ID
            idx (int): Chunk index number
            content (str): Chunk content
        """
        chunk = Chunk(
            document_id=doc_id,
            chunk_number=idx,
            chunk_content=content
        )
        db.session.add(chunk)
        db.session.commit()
