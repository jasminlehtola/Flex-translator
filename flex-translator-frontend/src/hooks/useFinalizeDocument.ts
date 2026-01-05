import { useMutation, useQueryClient } from '@tanstack/react-query';
import { finalizeDocument } from '../api/documentsApiClient';

export function useFinalizeDocument(documentId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => finalizeDocument(documentId),
    onSuccess: finalTranslation => {
      qc.setQueryData<Document>(['document', documentId], old =>
        old ? { ...old, final_translation: finalTranslation } : old,
      );
    },
  });
}
