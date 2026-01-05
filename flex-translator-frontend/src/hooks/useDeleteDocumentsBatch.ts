import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocumentsBatch } from '../api/documentsApiClient';
import { documentsByUserQueryOptions } from '../utils/queryOptions';
import { groupsByUserQueryOptions } from '../utils/queryOptions';

export function useDeleteDocumentsBatch(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedDocIds: number[]) => {
      await deleteDocumentsBatch(selectedDocIds);
    },
    onSuccess: (_, selectedDocIds) => {
      console.log('Successfully deleted all the documents.');

      selectedDocIds.forEach((docId) => {
        localStorage.removeItem(`isReadyToFinish-${docId}`);
        localStorage.removeItem(`showComplete-${docId}`);
        localStorage.removeItem(`finalTranslation-${docId}`);
        console.log('Cleared localStorage.');
      });

      queryClient.invalidateQueries({ queryKey: documentsByUserQueryOptions(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
    onError: (error) => {
      console.error('Failed to delete documents batch:', error);
    },
  });
}
