import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renameDocument } from '../api/documentsApiClient';
import { documentsByUserQueryOptions } from '../utils/queryOptions';
import { groupsByUserQueryOptions } from '../utils/queryOptions';

export function useRenameDocument(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, title }: { docId: number; title: string }) => renameDocument(docId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsByUserQueryOptions(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsByUserQueryOptions(userId).queryKey });
    },
  });
}
