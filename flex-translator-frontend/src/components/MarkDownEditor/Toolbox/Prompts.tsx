/**
 * Prompts.tsx
 *
 * This component manages user-defined translation prompts used during the translation process.
 * Users can create custom instructions, enable/disable them, and delete prompts as needed.
 * The prompt state is stored in localStorage per document ID and synced with the parent component via callback.
 *
 * Features:
 * - Lists existing prompts with an ON/OFF toggle and delete option
 * - Allows user to add new prompts through an input form
 * - Stores prompts in localStorage using the document's ID
 * - Automatically loads saved prompts when the document ID changes
 * - Sends the currently active prompts to the parent via `handleUserPrompt`
 *
 * Props:
 * - handleUserPrompt: callback function to pass active (used) prompts to the parent
 * - documentId: unique ID used to store and retrieve prompt state from localStorage
 *
 * Internal Components:
 * - `Prompt`: renders a single prompt with status toggle and delete button
 */

import { useState, useEffect } from 'react';
import ButtonSmall from '../../general/ButtonSmall';
import ButtonRoundSmall from '../../general/ButtonRoundSmall';
import type { Prompt, PromptProps, UserPrompts } from '../../../types/types';

interface PromptsProps {
  handleUserPrompt: (prompts: UserPrompts) => void;
  documentId: number;
}

const Prompt = ({ prompt, deletePrompt, index, changePromptState }: PromptProps) => {
  // Käyttäjän asettamien promptiruutujen ulkoasu + on/off-nappi
  return (
    <div>
      <li className="flex justify-between items-center bg-white shadow-md rounded-lg p-1 break-words" key={prompt.key}>
        <span className="flex-1 pr-2">{prompt.instruction}</span>

        <button
          onClick={() => changePromptState(prompt.key)}
          className={`
            px-3
            py-1
			      mr-3
			      pt-2
			      pb-2
            font-medium
            ${prompt.used ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}
          `}
        >
          {prompt.used ? 'ON' : 'OFF'}
        </button>

        <div className="flex items-center space-x-2">
          <ButtonRoundSmall buttonType="delete" onClick={() => deletePrompt(prompt.key)}>
            ✕
          </ButtonRoundSmall>
        </div>
      </li>
    </div>
  );
};

export default function Prompts({ handleUserPrompt, documentId }: PromptsProps) {
  //TO-DO move promptState to prompts
  const defaultText: Prompt[] = [
    {
      instruction: 'Change Finnish names, company names and cultural things into names that are used in England.',
      used: false,
      key: 0,
    },
    { instruction: 'Make this text shorter than original.', used: false, key: 1 },
  ];
  const [prompts, setPrompts] = useState<Prompt[]>(defaultText);
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [doc_id, setDoc_id] = useState<number | undefined>(undefined);

  // Retrieve prompts from localStorage if previously saved
  useEffect(() => {
    const storedPrompts = localStorage.getItem(`prompts-${documentId}`);
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    }
  }, [documentId]); // When documentId changes, a new one is retrieved.

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNewPrompt(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPrompt.trim()) {
      return;
    }

    const nextKey = prompts.length > 0 ? Math.max(...prompts.map((p) => p.key)) + 1 : 1;
    const newPromptObject = {
      instruction: newPrompt,
      used: false,
      key: nextKey,
    };

    setPrompts((oldPrompts) => {
      const updated = [...oldPrompts, newPromptObject];

      // Saving prompts to localStorage
      localStorage.setItem(`prompts-${documentId}`, JSON.stringify(updated));
      console.log('New user prompt added:', newPromptObject);

      return updated;
    });

    // Clear input-field
    setNewPrompt('');
  };

  const changePromptState = (key: number) => {
    const newPrompts = prompts.map((prompt) => {
      if (prompt.key == key) {
        prompt.used = !prompt.used;
        return prompt;
      } else {
        return prompt;
      }
    });
    handleUserPrompt({ prompts: newPrompts.filter((prompt) => prompt.used) });
  };

  const deletePrompt = (key: number) => {
    const newPrompts = prompts.filter((prompt) => prompt.key !== key);
    setPrompts(newPrompts);
    localStorage.setItem(`prompts-${documentId}`, JSON.stringify(newPrompts));
    handleUserPrompt({ prompts: prompts.filter((prompt) => prompt.used) });
  };

  return (
    <div className="w-full">
      <ul className="list-disc list-inside space-y-2 max-w-[90%]">
        {prompts.map((prompt, idx) => (
          <Prompt
            key={prompt.key}
            prompt={prompt}
            index={idx}
            deletePrompt={deletePrompt}
            changePromptState={changePromptState}
          />
        ))}
      </ul>

      <div>
        <form>
          <input
            className="border border-gray-300 bg-gray-100 max-w-[90%] rounded w-full mt-5 p-1 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            name="newPrompt"
            value={newPrompt}
            placeholder="Write new prompt"
            onChange={handlePromptChange}
          />
          <div className="pt-3 pb-5">
            <ButtonSmall onClick={handleSubmit} buttonType="primary">
              Add
            </ButtonSmall>
          </div>
        </form>
      </div>
    </div>
  );
}
