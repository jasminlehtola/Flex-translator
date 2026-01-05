import { queryOptions } from '@tanstack/react-query';
import { fetchDocumentById, fetchDocumentsByUserId } from '../api/documentsApiClient';
import { fetchChunks } from '../api/chunksApiClient';
import { fetchGroups } from '../api/groupsApiClient';
import { fetchUserSettings } from '../api/settingsApiClient';

// Fetches all documents belonging to the specified user
export const documentsByUserQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['documents', userId],
    queryFn: () => fetchDocumentsByUserId(userId),
  });

// Fetches a single document by its ID
export const documentByIdQueryOptions = (docId: number) =>
  queryOptions({
    queryKey: ['document', docId],
    queryFn: () => fetchDocumentById(docId),
  });

// Fetches all chunks associated with a document
export const chunksByDocQueryOptions = (docId: number) =>
  queryOptions({
    queryKey: ['document', docId, 'chunks'],
    queryFn: () => fetchChunks(docId),
  });

// Fetches all document groups belonging to the user
export const groupsByUserQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['groups', userId],
    queryFn: () => fetchGroups(userId),
  });

// Fetches user-specific translation settings (ChatGPT system prompts)
export const settingsQueryOptions = (userId: number) => ({
  queryKey: ['settings', userId],
  queryFn: () => fetchUserSettings(userId),
});
