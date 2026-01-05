/**
 * MarkDownEditor.tsx
 *
 * Main component for managing the document translation process.
 * Handles paragraph-level translation, editing, saving, analytics, and finalizing the translation.
 *
 * Structure:
 * - Displays the original text (`OriginalTextPanel`)
 * - Renders an editable chunk-by-chunk translation interface (`ChunkEditor`)
 * - Shows a live preview of the final translated document (`TranslatedTextPanel`)
 * - Displays a "Finish document" button when all paragraphs are translated
 *
 * Responsibilities:
 * - Tracks and manages translation state per paragraph
 * - Persists translation edits to the backend using `useSaveChunkTranslation`
 * - Tracks if each paragraph was manually edited
 * - Records which translation model (ChatGPT or DeepL) was chosen per chunk
 * - Sends translation metadata for analytics using `useSendAnalytics`
 * - Finalizes the translation and navigates to the completed screen
 * - Caches progress in `localStorage` (e.g., current chunk index and finalized state)
 * - Saves and persists changes chunk-by-chunk (`saveChanges`)
 * - Finalizes the document and navigates to the completedScreen
 * - Flags localStorage when document has been finalized and next time navigates straight to completedScreen
 *
 * Props:
 * - `document`: Full document object including chunk data
 * - `currentChunkIndex`: Index of the currently active paragraph
 * - `setCurrentChunkIndex`: Controls navigation between paragraphs
 * - `userPrompts`: Custom translation prompts or settings
 * - `isFinished`: A boolean value that ensures that the Finish document -button is displayed when
 *    all chunks have been translated or the document is already found translated in the database
 * - `setIsFinished`: Setter to update the finished state
 * - `handleUserPrompt`: Handler for updating translation prompt settings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { DELIMITER } from '../../utils/constants';
import wordDifference from '../../utils/wordDifference';

import type { Document, UserPrompts } from '../../types/types';
import OriginalTextPanel from './OriginalTextPanel';
import ChunkEditor from './ChunkEditor';
import TranslatedTextPanel from './TranslatedTextPanel';
import Button from '../general/Button';
import ButtonHelp from '../general/ButtonHelp';

import { useSaveChunkTranslation } from '../../hooks/useSaveChunkTranslation';
import { useSendAnalytics } from '../../hooks/useSendAnalytics';
import { useFinalizeDocument } from '../../hooks/useFinalizeDocument';

type MarkDownEditorProps = {
  document: Document;
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  userPrompts: UserPrompts;
  isFinished: boolean;
  setIsFinished: (isFinished: boolean) => void;
  handleUserPrompt: () => void;
};

export default function MarkDownEditor({
  document,
  currentChunkIndex,
  setCurrentChunkIndex,
  userPrompts,
  isFinished,
  setIsFinished,
  handleUserPrompt,
}: MarkDownEditorProps) {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState<string[]>(
    document.chunks.map((chunk) => chunk.final_chunk_translation ?? '')
  );

  const [dirty, setDirty] = useState<boolean>(false);

  const saveChoice = useSaveChunkTranslation(document.id);
  const sendAnalytics = useSendAnalytics();
  const finalize = useFinalizeDocument(document.id);

  const translationEditorValue = translations.join(DELIMITER);
  const [chosenModels, setChosenModels] = useState<('gpt' | 'deepl')[]>(Array(document.chunks.length).fill(null));
  const [editedFlags, setEditedFlags] = useState<boolean[]>(Array(document.chunks.length).fill(false));

  useEffect(() => {
    localStorage.setItem(`lastChunk-${document.id}`, currentChunkIndex.toString());
  }, [currentChunkIndex, document.id]);

  useEffect(() => {
    // Is it finalized in DB?
    const alreadyFinalized = typeof document.final_translation === 'string' && document.final_translation.trim() !== '';
    // Have all chunks been translated?
    const allChunksTranslated = document.chunks.every((chunk) => (chunk.final_chunk_translation ?? '').trim() !== '');
    // User can click 'Finish document' if all chunks are translated
    setIsFinished(alreadyFinalized || allChunksTranslated);
  }, [document.final_translation, document.chunks, setIsFinished]);

  async function saveChanges(): Promise<string> {
    if (!dirty) return '';

    const differences: string[] = [];
    const pending: Promise<void>[] = [];

    translations.forEach((text, index) => {
      const original = document.chunks[index].final_chunk_translation ?? '';
      if (text.trim() !== original.trim()) {
        const id = document.chunks[index].id;

        pending.push(
          saveChoice
            .mutateAsync({ chunkId: id, final_translation: text })
            .then(() => console.log(`Saved chunk ${index + 1}`))
            .catch((err) => console.error(`Failed to save chunk ${index}`, err))
        );

        const diff = wordDifference(original, text);
        if (diff) differences.push(`Chunk ${index + 1}: ${diff}`);
      }
    });
    await Promise.all(pending);
    console.log('Saved all changes.');
    setDirty(false);
    return differences.join('\n');
  }

  return (
    <div>
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[125ch]">
          <div className="flex pb-7 pt-6 w-full items-center text-2xl font-thin mb-5">
            Step 2: Translate, choose favorite translation and edit paragraphs
          </div>

          <OriginalTextPanel document={document} />

          <ChunkEditor
            document={document}
            currentChunkIndex={currentChunkIndex}
            setCurrentChunkIndex={setCurrentChunkIndex}
            translations={translations}
            setTranslations={setTranslations}
            onSaveChanges={saveChanges}
            dirty={dirty}
            setDirty={setDirty}
            userPrompts={userPrompts}
            handleUserPrompt={handleUserPrompt}
            isFinished={isFinished}
            setIsFinished={setIsFinished}
            chosenModels={chosenModels}
            setChosenModels={setChosenModels}
            editedFlags={editedFlags}
            setEditedFlags={setEditedFlags}
          />

          <TranslatedTextPanel translationEditorValue={translationEditorValue} />

          <div className="flex justify-between items-center w-full pt-8 pb-8">
            <div className="text-2xl font-thin">Step 3: Finish document after you're done with all paragraphs</div>
            <div className="flex items-center gap-4 ml-auto">
              <Button
                buttonType="primary"
                onClick={async () => {
                  console.log('Finish button clicked for document', document.id);
                  try {
                    console.log('isFinished:', isFinished);

                    // --- 1) Export all remaining chunk changes ---
                    await saveChanges();

                    // --- 2) Send analytics ---
                    const pending: Promise<void>[] = [];

                    translations.forEach((text, index) => {
                      const original = document.chunks[index].chunk_content;
                      const chunkId = document.chunks[index].id;
                      const wasEdited = editedFlags[index];
                      const model = chosenModels[index] ?? 'gpt';

                      const isFirstFinalization =
                        !document.final_translation || document.final_translation.trim() === '';

                      // Skips unchanged chunks if not the first finalization. First time everything
                      // goes to the database.
                      if (!isFirstFinalization && !wasEdited) return;

                      const payload = {
                        document_id: document.id,
                        chunk_id: chunkId,
                        source_type: document.source_type,
                        translation_mode: 'manual',
                        chosen_model: model,
                        original_text: original,
                        user_final: text,
                        edited: wasEdited,
                        user_prompts: userPrompts.prompts ? userPrompts.prompts.map((p) => p.instruction) : [],
                        user_dictionary: userPrompts.dictionary
                          ? Object.values(userPrompts.dictionary).map((entry: any) => `${entry.input}: ${entry.output}`)
                          : [],
                        time_spent_sec: 0,
                      };

                      pending.push(sendAnalytics.mutateAsync(payload));
                      console.log('[ANALYTICS PAYLOAD]', payload);
                    });
                    await Promise.all(pending);
                    console.log('Final analytics sent.');

                    // --- 3) Finalize document on the backend and refresh the cache ---
                    await finalize.mutateAsync();
                    console.log('Document finalized successfully');

                    // --- 4) Set completed flag in localStorage ---
                    localStorage.setItem(`completedScreen-${document.id}`, 'true');

                    // --- 5) Navigate to completed screen ---
                    navigate({ to: `/translate/${document.id}/completedScreen` });
                  } catch (error) {
                    console.error('Error in finish flow:', error);
                  }
                }}
                disabled={!isFinished}
              >
                Finish document
              </Button>
              <div className="mr-4">
                <ButtonHelp tooltipText="Save all changes and finalize the entire document. This will lock the translation and take you to the review view. Everything must be translated so that the document can be finalized." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Attempts to get the highlight on changed words to work:
/*
  function highlightChangedWords(
    translated: string,
    dictionary: { input: string; output: string; key: number }[]
  ): string {
    /// Escape all dictionary outputs
    const escapedOutputs = dictionary.map(({ output }) => output.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    // Regex matches singular & plural (simple heuristic: word boundary + optional "s")
    const regex = new RegExp(`\\b(${escapedOutputs.join('|')})(s|es)?\\b`, 'gi');

    // Replace all matches in one go
    return translated.replace(regex, (match) => {
      return `<mark class="bg-yellow-300 rounded px-1">${match}</mark>`;
    });
  }

  const getHighlightedTranslationText = () => {
    const chunkList = document.chunks;

    const highlightedTranslation = chunkList.map((chunk, index) => {
      if (index === currentChunkIndex) {
        return `**${chunk.chunk_content}**`; // Korostetaan koko chunk
      }
      return chunk.chunk_content; // Muu chunk ilman korostusta
    });

    return highlightedTranslation.join('\n'); // Liitetään kaikki chunkit takaisin yhteen
  };
  */

/* const getHighlightedOriginalText = () => {
    const chunkList = document.chunks;

    const highlightChunk = chunkList
      .map((chunk, index) => {
        if (index === currentChunkIndex) {
          const currentChunk = document.chunks[currentChunkIndex].chunk_content;

          // Jaetaan teksti riveihin, jotta <mark>-elementti korostaa tekstin rivinvaihdoista huolimatta
          const chunkLines = currentChunk.split('\n');
          const highlightedText = chunkLines
            .map((line) => {
              // Korostetaan jokaista riviä <mark>-elementillä
              return `<mark style="background-color: #fef08a">${line}</mark>`;
            })
            .join('\n'); // Yhdistetään rivit takaisin yhteen
          return highlightedText;
        }
        return chunk.chunk_content; // Palautetaan muu chunk normaalisti
      })
      .join('\n\n'); // Liitetään kaikki chunkit yhteen

    return highlightChunk; // Palautetaan korostettu ja yhdistetty teksti
  };
  */
