/**
 * OriginalTextPanel.tsx
 *
 * A collapsible panel that displays the original source text of the document.
 * Users can toggle the panel open or closed to view the full unedited text.
 * The text is shown in rendered Markdown format.
 * Useful during the translation process for reference and comparison.
 *
 * Props:
 * - `document`: The full document object containing the original text or chunked content.
 *
 * Behavior:
 * - Clicking the panel header toggles visibility of the translated content.
 * - If `document.original_text` is available, it will be shown.
 * - If not, the panel falls back to joining all individual chunk contents as the original text.
 * - The content is scrollable and formatted using Markdown styling.
 */

import MDEditor from '@uiw/react-md-editor';
import ButtonHelp from '../general/ButtonHelp';
import { useState } from 'react';
import type { Document } from '../../types/types';

interface OriginalTextPanelProps {
  document: Document;
}

export default function OriginalTextPanel({ document }: OriginalTextPanelProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <section className="flex flex-col justify-center items-center w-full bg-white hover:bg-gray-100">
      {/* Toggle-button */}
      <div
        className="w-full flex justify-between py-3 px-4 bg-white hover:bg-gray-100 border-b border-gray-300 cursor-pointer"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        <h3 className="text-xl select-none">Original text</h3>
        <ButtonHelp tooltipText="Here you can see the original text as it is in the source language. You can use it for comparison and checking during the translation process." />
      </div>

      {showOriginal && (
        <div className="p-3 w-full overflow-y-auto max-h-[450px]">
          <MDEditor.Markdown
            className="whitespace-pre-wrap px-2 py-1 pb-4 w-full"
            source={document.original_text || document.chunks.map((c) => c.chunk_content).join('\n\n')}
          />
        </div>
      )}
    </section>
  );
}
