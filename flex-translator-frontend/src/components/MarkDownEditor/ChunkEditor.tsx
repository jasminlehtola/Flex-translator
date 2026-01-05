/**
 * ChunkEditor.tsx
 *
 * Paragraph-level editor for translating and editing individual chunks of the document.
 * This component handles displaying the current chunk, generating translations,
 * showing translation alternatives (GPT and DeepL), and saving the user's chosen version.
 *
 * Structure:
 * - Stepper for navigating between chunks
 * - Toolbox toggle for translation tools and prompt editing
 * - Markdown editor for editing translations
 * - AI translation suggestions (GPT and DeepL) with "Choose" buttons
 *
 * Responsibilities:
 * - Displays the current chunk and translation editor
 * - Triggers translation via `useTranslateChunk`
 * - Lets the user pick and apply a preferred AI translation
 * - Saves chunk-level edits via `useSaveChunkTranslation`
 * - Updates and flags the editor state as dirty if edits are made
 * - Tracks user edits and flags them with `editedFlags`
 * - Tracks which translation model was chosen for each chunk (`chosenModels`)
 * - Calls analytics hook for interaction tracking
 * - Persists current chunk index in localStorage
 *
 * Props:
 * - document: full document object with chunk data
 * - currentChunkIndex: index of the currently active paragraph
 * - setCurrentChunkIndex: setter for switching active chunk
 * - translations: array of translated paragraph strings
 * - setTranslations: setter for translation array
 * - onSaveChanges: function that persists any changes
 * - dirty: whether current translation contains unsaved changes
 * - setDirty: setter to update dirty flag
 * - userPrompts: translation prompt data (e.g. dictionary, instructions)
 * - handleUserPrompt: function for updating prompt state
 * - isFinished: whether document has been fully translated
 * - setIsFinished: setter to update finished flag
 * - chosenModels: array tracking which model was selected per chunk
 * - setChosenModels: setter for updating chosenModels
 * - editedFlags: array indicating which chunks were manually edited
 * - setEditedFlags: setter for updating edit flags
 */

import { useState, useEffect, useRef } from 'react';
import { ErrorComponent } from '@tanstack/react-router';
import MDEditor from '@uiw/react-md-editor';
import Button from '../general/Button';
import ButtonHelp from '../general/ButtonHelp';
import Stepper from './Stepper';
import ToolBox from './Toolbox/ToolBox';
import LoadingComponentLight from '../general/LoadingLight';

import { useTranslateChunk } from '../../hooks/useTranslateChunk';
import { useSaveChunkTranslation } from '../../hooks/useSaveChunkTranslation';
import { useSendAnalytics } from '../../hooks/useSendAnalytics';

import type { Document, UserPrompts } from '../../types/types';

type TranslatorKey = 'gpt' | 'deepl';
const AI_TRANSLATORS: TranslatorKey[] = ['gpt', 'deepl'];

interface ChunkEditorProps {
  document: Document;
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  translations: string[];
  setTranslations: (translations: string[]) => void;
  onSaveChanges: () => void;
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  userPrompts: UserPrompts;
  handleUserPrompt: () => void;
  isFinished: boolean;
  setIsFinished: (isFinished: boolean) => void;
  chosenModels: TranslatorKey[];
  setChosenModels: React.Dispatch<React.SetStateAction<TranslatorKey[]>>;
  editedFlags: boolean[];
  setEditedFlags: React.Dispatch<React.SetStateAction<boolean[]>>;
}

export default function ChunkEditor({
  document,
  currentChunkIndex,
  setCurrentChunkIndex,
  translations,
  setTranslations,
  onSaveChanges,
  dirty,
  setDirty,
  userPrompts,
  handleUserPrompt,
  isFinished,
  setIsFinished,
  chosenModels,
  setChosenModels,
  editedFlags,
  setEditedFlags,
}: ChunkEditorProps) {
  const [showToolbox, setShowToolbox] = useState(false);

  const chunk = document.chunks[currentChunkIndex];
  const isLast = currentChunkIndex === document.chunks.length - 1;
  const isAfterLastChunk = currentChunkIndex === document.chunks.length;

  const saveChoice = useSaveChunkTranslation(document.id);
  const translate = useTranslateChunk();
  const sendAnalytics = useSendAnalytics();
  const startTimeRef = useRef(Date.now());
  const chunkOpenTextRef = useRef<string>('');

  const isTranslating = translate.isPending;

  useEffect(() => {
    localStorage.setItem(`lastChunk-${document.id}`, currentChunkIndex.toString());
  }, [currentChunkIndex, document.id]);

  useEffect(() => {
    if (translate.data) {
      const newTranslations = [...translations];

      AI_TRANSLATORS.forEach((model) => {
        const newTranslation = translate.data[model];

        // AI suggestion overwrites the current chunk every time you hit Translate.
        if (newTranslation) {
          newTranslations[currentChunkIndex] = newTranslation;
        }
      });

      setTranslations(newTranslations);
    }
  }, [translate.data, currentChunkIndex]);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentChunkIndex]);

  useEffect(() => {
    if (currentChunkIndex < document.chunks.length) {
      chunkOpenTextRef.current = translations[currentChunkIndex] || document.chunks[currentChunkIndex].chunk_content;
    }
  }, [currentChunkIndex, translations, document.chunks]);

  async function handleTranslate() {
    const differences = await onSaveChanges();
    console.log('handleTranslate userPrompts:', userPrompts);
    console.log('Sending currentTranslation:', translations[currentChunkIndex]);
    await translate.mutateAsync({
      chunkId: document.chunks[currentChunkIndex].id,
      conversationHistory: differences || undefined,
      userPrompts,
      currentTranslation: translations[currentChunkIndex],
    });
  }

  const handleChooseTranslation = async (translation: string, model: 'gpt' | 'deepl') => {
    await saveChoice.mutateAsync({
      chunkId: chunk.id,
      final_translation: translation,
    });

    const updatedModels = [...chosenModels];
    updatedModels[currentChunkIndex] = model;
    setChosenModels(updatedModels);

    const updated = [...translations];
    updated[currentChunkIndex] = translation; // saves only chosen translation
    setTranslations(updated);
    setDirty(true);
    translate.reset();

    // Move to the next chunk or to finish
    if (isLast) {
      setIsFinished(true); // Show Finish-button
      setCurrentChunkIndex(document.chunks.length);
    } else {
      setCurrentChunkIndex((prev) => prev + 1); // Moving forward only if not in the last chunk
    }
  };

  function handleEditorChange(val: string | undefined) {
    if (val === undefined) return;
    const updated = [...translations];
    updated[currentChunkIndex] = val;
    setTranslations(updated);
    setDirty(true);

    // Marks chunk as edited
    const updatedFlags = [...editedFlags];
    updatedFlags[currentChunkIndex] = true;
    setEditedFlags(updatedFlags);
  }

  return (
    <>
      {/* Toolbox & Stepper */}
      <div className="flex flex-wrap w-full items-center justify-between pb-3 pt-8 gap-2">
        {showToolbox && (
          <div className="w-full">
            <ToolBox handleUserPrompt={handleUserPrompt} documentId={document.id} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Stepper
            currentChunkIndex={currentChunkIndex}
            setCurrentChunkIndex={setCurrentChunkIndex}
            totalChunks={document.chunks.length}
            document={document}
          />
        </div>

        <div
          className="flex items-center cursor-pointer bg-blue-200 px-4 py-2 mr-4 rounded hover:bg-gray-300 ml-auto text-lg"
          onClick={() => setShowToolbox(!showToolbox)}
        >
          <h3 className="font-bold select-none">{showToolbox ? 'Toolbox' : 'Toolbox'}</h3>
        </div>
      </div>

      {/* Chunk editor */}
      <section className="flex justify-center items-center w-full pb-3 bg-white">
        <div className="w-full">
          <div className="flex items-center justify-between whitespace-pre-wrap p-3">
            <h3 className="text-xl">
              {chunk ? `Paragraph ${currentChunkIndex + 1} / ${document.chunks.length}` : 'Done'}
            </h3>

            {!isAfterLastChunk && (
              <div className="flex items-center gap-4 ml-auto">
                <Button onClick={handleTranslate} disabled={isTranslating}>
                  Translate
                </Button>
                <Button onClick={onSaveChanges} disabled={!dirty}>
                  Save changes
                </Button>
                <ButtonHelp tooltipText="Here you work on individual paragraphs: translate, choose the best AI translation, and edit if necessary. Use stepper buttons to move from one paragraph to another and click Toolbox to open more editing features." />
              </div>
            )}
          </div>

          {/* AI suggestions or default editor */}
          {isAfterLastChunk ? (
            <div className="text-green-600 text-lg font-medium text-center my-2">
              All paragraphs translated. You can finish document or go back to edit any paragraph.
              <ButtonHelp tooltipText="Use numbered stepper buttons to change paragraps. Translate the chosen paragraph again to apply new prompts/dictionary rules. Click 'Finish document' when you are happy with final translation." />
            </div>
          ) : translate.data ? (
            <div className="flex flex-col gap-5">
              {AI_TRANSLATORS.map((model) => (
                <fieldset key={model}>
                  <legend className="text-lg font-semibold mb-2">{model.toUpperCase()}</legend>
                  <MDEditor
                    height="auto"
                    preview="edit"
                    highlightEnable={true}
                    onChange={(val) => {
                      handleEditorChange(val);
                    }}
                    onBlur={() => onSaveChanges()}
                    value={translate.data[model]}
                  />
                  <div className="flex justify-center mt-3">
                    <Button onClick={() => handleChooseTranslation(translate.data[model], model)}>
                      Choose {model}
                    </Button>
                  </div>
                </fieldset>
              ))}
            </div>
          ) : (
            <div className="relative">
              <fieldset className="flex flex-col justify-start items-start">
                <legend></legend>
                <MDEditor
                  className="whitespace-pre-wrap px-2 py-1 w-full shadow-md"
                  height="initial"
                  highlightEnable={true}
                  preview="edit"
                  onChange={handleEditorChange}
                  onBlur={onSaveChanges}
                  value={translations[currentChunkIndex] !== '' ? translations[currentChunkIndex] : chunk.chunk_content}
                />
              </fieldset>

              {isTranslating && (
                <div className="absolute inset-0 flex justify-center items-center z-10">
                  <LoadingComponentLight />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {/* Error handler */}
      <div>{translate.isError && <ErrorComponent error={translate.error} />}</div>
    </>
  );
}
