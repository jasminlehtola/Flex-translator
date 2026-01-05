import { apiClient } from './api';
import { DocumentMinimal, Document } from '../types/types';

export class DocumentNotFoundError extends Error {}

/** GET /documents/user/:userId */
export async function fetchDocumentsByUserId(userId: number): Promise<DocumentMinimal[]> {
  try {
    const response = await apiClient.get(`/documents/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch documents!', error);
    throw error;
  }
}

/** GET /documents/:docId */
export async function fetchDocumentById(docId: number): Promise<Document> {
  try {
    const response = await apiClient.get(`/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch document!', error);
    throw error;
  }
}

/** POST /documents */
export async function createDocument(
  title: string,
  content: string,
  userId: number,
  file: File | null, // oli String aikaisemmin
  source_type: 'pdf' | 'paste'
): Promise<DocumentMinimal> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('userId', userId);
  formData.append('source_type', source_type);

  if (file) {
    formData.append('upload_file', file);
  }

  try {
    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create document!', error);
    throw error;
  }
}

/** POST /documents/:docId/autoTranslate */
export async function autoTranslateDocument(docId: number, options: string): Promise<void> {
  try {
    const { data } = await apiClient.post(`/documents/${docId}/autoTranslate`, { options: options });
    return data;
  } catch (error) {
    console.error('autoTranslateDocument failed:', error);
    throw error;
  }
}

/** POST /documents/deeplFileTranslate */
export async function translateDeepLFile(userId: number, title: string, file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('userId', userId);
  // formData.append('source_type', source_type);
  if (file) {
    formData.append('upload_file', file);
  }

  try {
    const response = await apiClient.post(`/documents/deeplFileTranslate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('deeplFileTranslate failed:', error);
    throw error;
  }
}

/** DELETE /documents/:docId */
export async function deleteDocument(docId: number): Promise<string> {
  try {
    const response = await apiClient.delete(`/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete document!', error);
    throw error;
  }
}

/** DELETE /documents/batch */
export async function deleteDocumentsBatch(docIds: number[]): Promise<string> {
  try {
    const response = await apiClient.delete('/documents/batch', {
      data: { document_ids: docIds },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete documents batch!', error);
    throw error;
  }
}

/** PATCH /documents/:docId */
export async function renameDocument(docId: number, newTitle: string): Promise<void> {
  try {
    await apiClient.patch(`/documents/${docId}`, {
      title: newTitle,
    });
  } catch (error) {
    console.error('Failed to rename document:', error);
    throw error;
  }
}

/** POST /documents/:docId/finalize */
export async function finalizeDocument(docId: number): Promise<Document> {
  try {
    const response = await apiClient.post(`/documents/${docId}/finalize`);
    return response.data;
  } catch (error) {
    console.error('Failed to finalize document!', error);
    throw error;
  }
}

/** GET /documents/pdf/:docId */
export async function downloadPdf(docId: number): Promise<Document> {
  try {
    const response = await apiClient.get(`/documents/pdf/${docId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Failed to download pdf document!', error);
    throw error;
  }
}
