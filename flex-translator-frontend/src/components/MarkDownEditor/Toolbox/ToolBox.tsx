/**
 * ToolBox.tsx
 *
 * Provides tools for improving translation quality. Allows the user to
 * manage custom prompts and update translation dictionaries.
 *
 * Structure:
 * - Prompt input fields for custom instructions
 * - ON/OFF-button to turn prompts on or off
 * - Dictionary editor for word-level replacements
 * - Submit button to apply updates
 *
 * Responsibilities:
 * - Display prompt and dictionary editing UI
 * - Trigger prompt updates via API or local handlers
 * - Enhance translation results by allowing user-controlled input
 *
 * Props:
 * - `documentId`: ID of the document for which prompts apply
 * - `handleUserPrompt`: Function to trigger user-defined prompt updates
 */

import Prompts from './Prompts';
import TranslationDictionary from './TranslationDictionary';
import ButtonHelp from '../../general/ButtonHelp';
import type { UserPrompts } from '../../../types/types';

interface ToolboxProps {
  handleUserPrompt: (prompts: UserPrompts) => void;
  documentId: number;
}

export default function ToolBox({ handleUserPrompt, documentId }: ToolboxProps) {
  return (
    <div>
      <p className="text-sm"> *Prompts and dictionary only apply to chatGPT's translation </p>
      <div className="flex flex-row w-full pt-8 pb-4 mb-3 gap-6 justify-center border-2 border-gray-200">
        <div className="flex justify-center ">
          <div className="flex flex-row">
            <Prompts handleUserPrompt={handleUserPrompt} documentId={documentId} />

            <TranslationDictionary handleUserPrompt={handleUserPrompt} documentId={documentId} />
          </div>
        </div>
        <div className="">
          <ButtonHelp tooltipText="Add custom ChatGPT prompts or dictionary entries to guide the translation. You can toggle prompts ON/OFF for each paragraph individually. In the dictionary, you can enter the word to be replaced in Finnish or English, but the replacement word must be in English. After making changes, click 'Translate' to apply them." />
        </div>
      </div>
    </div>
  );
}
