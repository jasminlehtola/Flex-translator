"""
progress_service.py

This service tracks document translation progress in memory.
Used to monitor the status of ongoing chunk translation processes.
"""

# Global in-memory store for document progress
progress_store = {}  

class ProgressService:
    def set_progress(self, doc_id: int, currentChunk: int, totalChunks: int):
        """
        Save progress for a given document.

        Args:
            doc_id (int): Document ID.
            current_chunk (int): Current translated chunk index.
            total_chunks (int): Total number of chunks in the document.
        """
        progress_store[doc_id] = {"currentChunk": currentChunk, "totalChunks": totalChunks}
        print(f"[DEBUG] set_progress: {progress_store}")


    def get_progress(self, doc_id: int):
        """
        Get progress for a specific document.

        Args:
            doc_id (int): Document ID.

        Returns:
            dict or None: Progress dictionary or None if not found.
        """
        result = progress_store.get(doc_id)
        print(f"[DEBUG] get_progress({doc_id}): {result}")
        return result


    def clear_progress(self, doc_id: int):
        """
        Clear progress tracking for a document.

        Args:
            doc_id (int): Document ID.
        """
        progress_store.pop(doc_id, None)
        

# Create a global instance for use in the app
progress_service = ProgressService()