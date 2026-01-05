import { apiClient } from './api';
import { Group } from '../types/types';

/** GET /groups?user_id= */
export async function fetchGroups(userId: number): Promise<Group[]> {
  if (!userId || isNaN(userId)) {
    console.error('Invalid user ID for fetchGroups:', userId);
    throw new Error('Invalid user ID');
  }

  try {
    const response = await apiClient.get('/groups', {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    throw error;
  }
}

/** POST /groups */
export async function createGroup(userId: number, name: string, documents: number[]): Promise<Group> {
  try {
    const response = await apiClient.post('/groups', {
      user_id: userId,
      name,
      documents,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create group:', error);
    throw error;
  }
}

/** DELETE /groups/:groupId */
export async function deleteGroup(groupId: number): Promise<void> {
  try {
    await apiClient.delete(`/groups/${groupId}`);
  } catch (error) {
    console.error('Failed to delete group:', error);
    throw error;
  }
}

/** POST /groups/:groupId/documents */
export async function addDocumentToGroup(groupId: number, documentId: number): Promise<void> {
  try {
    await apiClient.post(`/groups/${groupId}/documents`, {
      document_id: documentId,
    });
  } catch (error) {
    console.error('Failed to add document to group:', error);
    throw error;
  }
}

/** DELETE /groups/:groupId/documents/:documentId */
export async function removeDocumentFromGroup(groupId: number, documentId: number): Promise<void> {
  try {
    await apiClient.delete(`/groups/${groupId}/documents/${documentId}`);
  } catch (error) {
    console.error('Failed to remove document from group:', error);
    throw error;
  }
}
