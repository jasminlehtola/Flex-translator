import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsByUserQueryOptions } from '../utils/queryOptions';
import {
  fetchGroups,
  createGroup as apiCreateGroup,
  deleteGroup as apiDeleteGroup,
  addDocumentToGroup as apiAddDocumentToGroup,
  removeDocumentFromGroup as apiRemoveDocumentFromGroup,
} from '../api/groupsApiClient';

export const useGroups = (userId: number) => {
  const queryClient = useQueryClient();

  const query = useQuery(groupsByUserQueryOptions(userId));
  // const { data: groups = [], ...query } = useQuery(groupsByUserQueryOptions(userId));

  const createGroup = useMutation({
    mutationFn: (data: { name: string; documents: number[] }) => apiCreateGroup(userId, data.name, data.documents),
    onSuccess: () => {
      console.log('Group created.');
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: (groupId: number) => apiDeleteGroup(groupId),
    onSuccess: () => {
      console.log('Group deleted.');
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
  });

  const addDocumentToGroup = useMutation({
    mutationFn: ({ groupId, documentId }: { groupId: number; documentId: number }) =>
      apiAddDocumentToGroup(groupId, documentId),
    onSuccess: () => {
      console.log('Document added to group.');
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
  });

  const removeDocumentFromGroup = useMutation({
    mutationFn: ({ groupId, documentId }: { groupId: number; documentId: number }) =>
      apiRemoveDocumentFromGroup(groupId, documentId),
    onSuccess: () => {
      console.log('Group deleted.');
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
  });

  return {
    groups: query.data ?? [],
    query,
    createGroup: createGroup,
    deleteGroup: deleteGroup,
    addDocument: addDocumentToGroup,
    removeDocument: removeDocumentFromGroup,
  };
};
