import { useMutation } from '@tanstack/react-query';
import { translateChunk } from '../api/chunksApiClient';

export function useTranslateChunk() {
  return useMutation({
    mutationFn: translateChunk,
    onSuccess: (data) => {
      console.log('Translation successful:', data);
    },
  });
}
