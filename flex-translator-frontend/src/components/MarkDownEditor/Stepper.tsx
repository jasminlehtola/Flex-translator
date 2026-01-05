/**
 * Stepper.tsx
 *
 * Renders a horizontal button-based stepper UI for navigating between document chunks (paragraphs).
 * Each chunk is represented by a numbered circle button. The buttons are color-coded to indicate status:
 *
 * - Blue = currently active chunk
 * - Gray = chunk already translated
 * - White = untranslated chunk
 *
 * Responsibilities:
 * - Visualizes the status of each chunk (translated / untranslated / current)
 * - Allows user to jump directly to any chunk by clicking its number
 *
 * Props:
 * - `currentChunkIndex`: Index of the currently active chunk
 * - `setCurrentChunkIndex`: Function to update the current chunk index
 * - `totalChunks`: Total number of chunks in the document (not used directly in this version)
 * - `document`: Document object containing chunk metadata
 */

import type { Document } from '../../types/types';

interface StepperProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  totalChunks: number;
  document: Document;
}

export default function DefaultStepper({ currentChunkIndex, setCurrentChunkIndex, document }: StepperProps) {
  return (
    <div className="flex justify-center">
      <div className="flex gap-2">
        {document.chunks.map((chunk, index) => {
          const isActive = index === currentChunkIndex;
          const isTranslated = !!chunk.final_chunk_translation?.trim();

          return (
            <button
              key={index}
              onClick={() => setCurrentChunkIndex(index)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-300
                ${
                  isActive
                    ? 'bg-blue-500 text-white border-blue-500'
                    : isTranslated
                      ? 'bg-gray-400 text-white border-gray-400 hover:bg-gray-500'
                      : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
                }
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
