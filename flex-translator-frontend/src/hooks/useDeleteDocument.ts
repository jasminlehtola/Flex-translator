import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument } from '../api/documentsApiClient';
import { documentsByUserQueryOptions } from '../utils/queryOptions';
import { groupsByUserQueryOptions } from '../utils/queryOptions';

export function useDeleteDocument(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: number) => {
      await deleteDocument(docId);
    },
    onSuccess: (_, docId) => {
      console.log('Successfully deleted document number', docId);

      localStorage.removeItem(`isReadyToFinish-${docId}`);
      localStorage.removeItem(`showComplete-${docId}`);
      localStorage.removeItem(`finalTranslation-${docId}`);
      console.log('Cleared localStorage.');

      queryClient.invalidateQueries({ queryKey: documentsByUserQueryOptions(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
    onError: (error) => {
      console.error('Failed to delete document', error);
    },
  });
}
