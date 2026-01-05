import { ReactNode } from 'react';

export interface InputChunk {
  id: number;
  chunk_number: number;
  chunk_content: string;
}

export interface PasteChunkEditor {
  pasteChunkToEditor: (optionKey: string, text: string) => void;
}

// -------------------- NEW:

export interface Document {
  id: number;
  user_id: number;
  title: string;
  original_text: string;
  final_translation: string;
  source_type: 'paste' | 'pdf' | 'docx';
  created_at: string;
  modified_at: string;
  chunks: Chunk[];
}

export interface DocumentMinimal {
  id: ReactNode;
  document_id: number;
  title: string;
  created_at: string;
  modified_at: string;
}

export interface Chunk {
  id: number;
  doc_id?: number;
  chunk_number: number;
  chunk_content: string;
  final_chunk_translation: string;
  created_at: string;
}

// -------------------- VERY NEW:

export type Prompt = {
  instruction: string;
  used: boolean;
  key: number;
};

export type PromptProps = {
  prompt: Prompt;
  deletePrompt: (key: number) => void;
  index: number;
  changePromptState: (key: number) => void;
};

export type UserPrompts = {
  prompts?: Prompt[] | null;
  dictionary?: Record<string, string> | null;
};

export interface Group {
  id: number;
  name: string;
  user_id: number;
  documents: number[];
}

export type UserSettings = {
  initial_prompt: string;
  conversation_history_prompt: string;
  user_prompt_instructions: string;
  dictionary_instructions: string;
};

// -----------------------

export interface AnalyticsData {
  document_id: number | null;
  chunk_id: number | null;
  source_type: 'paste' | 'pdf' | 'docx' | null;
  translation_mode: 'auto' | 'manual' | 'deeplAPIAuto' | null;
  chosen_model: 'gpt' | 'deepl' | null;
  original_text: string | null;
  user_final: string | null;
  edited: boolean | null;
  user_prompts: string[] | null;
  user_dictionary: string[] | null;
  time_spent_sec: number | null;
}
