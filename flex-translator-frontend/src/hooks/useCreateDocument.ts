import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDocument } from '../api/documentsApiClient';
import { documentsByUserQueryOptions } from '../utils/queryOptions';

export function useCreateDocument(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      content,
      file,
      source_type,
    }: {
      title: string;
      content: string;
      file: File | null;
      source_type: 'pdf' | 'paste';
    }) => createDocument(title, content, userId, file, source_type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentsByUserQueryOptions(userId).queryKey,
      });
    },
  });
}
