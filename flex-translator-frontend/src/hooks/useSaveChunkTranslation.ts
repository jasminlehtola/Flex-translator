import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveChunkTranslation } from '../api/chunksApiClient';
import type { Document } from '../types/types';

export function useSaveChunkTranslation(docId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: saveChunkTranslation,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['document', docId] });
      const previous = qc.getQueryData<Document>(['document', docId]);
      qc.setQueryData<Document>(['document', docId], (old) =>
        old
          ? {
              ...old,
              chunks: old.chunks.map((c) =>
                c.id === vars.chunkId ? { ...c, final_chunk_translation: vars.final_translation || '' } : c
              ),
            }
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['document', docId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['document', docId] }),
  });
}
