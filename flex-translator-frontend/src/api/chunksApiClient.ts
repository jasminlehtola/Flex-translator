import { apiClient } from './api';
import type { Chunk, TranslationResponse } from '../types/types';

type TranslateChunkProps = {
  chunkId: number;
  conversationHistory?: string;
  userPrompts: object;
  currentTranslation: string;
};

type SaveTranslationProps = {
  chunkId: number;
  final_translation?: string;
};

/** GET /chunks/:docId */
export async function fetchChunks(docId: number): Promise<Chunk[]> {
  const { data } = await apiClient.get(`/chunks/${docId}`);
  return data;
}

/** GET /chunks/:docId/progress */
export async function fetchProgress(docId: number): Promise<Chunk[]> {
  const { data } = await apiClient.get(`/chunks/${docId}/progress`);
  return data;
}

/** POST /chunks/:id/translate  */
export async function translateChunk({
  chunkId,
  conversationHistory = '',
  userPrompts,
  currentTranslation,
}: TranslateChunkProps): Promise<TranslationResponse> {
  try {
    const payload = {
      conversation_history: conversationHistory,
      user_prompts: {
        prompts: userPrompts?.prompts ?? [],
        dictionary: userPrompts?.dictionary ?? [],
      },
      current_translation: currentTranslation,
    };

    console.log('Sending to backend:', payload);

    const { data } = await apiClient.post<TranslationResponse>(`/chunks/${chunkId}/translate`, payload);

    return data;
  } catch (error) {
    console.error('translateChunk failed:', error);
    throw error;
  }
}

/** POST /chunks/:id/save */
export async function saveChunkTranslation({ chunkId, final_translation }: SaveTranslationProps) {
  const { data } = await apiClient.post(`/chunks/${chunkId}/save`, {
    final_translation,
  });
  return data;
}
