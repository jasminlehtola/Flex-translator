/**
 * TranslationDictionary.tsx
 *
 * This component allows the user to define custom word-level translation rules.
 * It is used as part of the translation prompt system and works alongside other tools like Prompts.tsx.
 *
 * Features:
 * - Add new dictionary entries (input → output)
 * - Display and delete existing entries
 * - Persist entries in localStorage (per document ID)
 * - Notify parent component (`handleUserPrompt`) whenever the dictionary changes
 *
 * Structure:
 * - `InputForm`: form with two input fields (input & output word) + submit button
 * - `DictionaryTable`: lists added dictionary entries with a delete option
 *
 * Props:
 * - handleUserPrompt: callback to pass updated dictionary to the parent
 * - documentId: current document's ID used as a key for localStorage
 *
 * Internal state:
 * - `dictionary`: array of all user-defined word replacements
 * - `newRow`: current values from input form
 *
 * Usage:
 * Used in Toolbox as part of the manual translation flow, enabling users to define fixed word substitutions
 * that the AI should apply when generating translations.
 */

import { useState, useEffect } from 'react';
import ButtonSmall from '../../general/ButtonSmall';
import ButtonRoundSmall from '../../general/ButtonRoundSmall';
import type { UserPrompts } from '../../../types/types';

interface InputProps {
  handleSubmit: () => void;
  handleInputChange: React.ChangeEvent<HTMLInputElement>;
  newRow: {
    input: string;
    output: string;
  };
}

interface DictionaryTableProps {
  dict: DictionaryEntry[];
  handleDeleteEntry: (key: number) => void;
}

interface DictionaryProps {
  handleUserPrompt: (prompts: UserPrompts) => void;
  documentId: number;
}

interface DictionaryEntry {
  input: string;
  output: string;
  key: number;
}

const InputForm = ({ handleSubmit, handleInputChange, newRow }: InputProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor="inputText" className="mb-1 text-sm font-medium">
            Change this word (FI/EN):
          </label>
          <input
            id="inputText"
            className="border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="inputText"
            onChange={handleInputChange}
            value={newRow.input}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="outputText" className="mb-1 text-sm font-medium">
            To this word (EN):
          </label>
          <input
            id="outputText"
            className="border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="outputText"
            onChange={handleInputChange}
            value={newRow.output}
          />
        </div>
      </div>

      <div className="pt-1">
        <ButtonSmall submitButton>Add</ButtonSmall>
      </div>
    </form>
  );
};

const DictionaryTable = ({ dict, handleDeleteEntry }: DictionaryTableProps) => {
  return (
    <div className="w-full mt-6">
      <ul className="list-disc list-inside">
        {dict.map((translation: DictionaryEntry) => (
          <li
            key={translation.key}
            className="flex justify-between items-center mb-1 bg-gray-100 ml-1 px-0 py-1 rounded"
          >
            <span>
              {translation.input} → {translation.output}
            </span>
            <ButtonRoundSmall buttonType="delete" onClick={() => handleDeleteEntry(translation.key)}>
              ✕
            </ButtonRoundSmall>
          </li>
        ))}
      </ul>
      <div className="mb-8"></div>
    </div>
  );
};

export default function TranslationDictionary({ handleUserPrompt, documentId }: DictionaryProps) {
  const [dictionary, setDictionary] = useState([]);
  const [newRow, setNewRow] = useState({ input: '', output: '', key: '' });

  // Fetch dictionary from localStrorage
  useEffect(() => {
    const storedDictionary = localStorage.getItem(`dictionary-${documentId}`);
    if (storedDictionary) {
      try {
        setDictionary(JSON.parse(storedDictionary));
      } catch (e) {
        console.error('Failed to parse stored dictionary:', e);
      }
    }
  }, [documentId]);
  //
  //
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newRow.input.trim() || !newRow.output.trim()) {
      return;
    }

    let key = 0;
    if (dictionary.length > 0) {
      key = Math.max(...dictionary.map((entry) => entry.key)) + 1;
    }
    setDictionary((oldDict) => {
      const updated = [...oldDict, { ...newRow, key: key }];
      localStorage.setItem(`dictionary-${documentId}`, JSON.stringify(updated));
      console.log('New dictionary added:', updated);
      setNewRow({ input: '', output: '', key: '' });
      return updated;
    });
  };
  //
  //
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.name;
    const value = event.target.value;
    if (inputName == 'inputText') {
      setNewRow({ ...newRow, input: value });
    }
    if (inputName == 'outputText') {
      setNewRow({ ...newRow, output: value });
    }
  };
  //
  //
  const handleDeleteRow = (key: number) => {
    const newDictionary = dictionary.filter((entry) => entry.key !== key);
    setDictionary(newDictionary);

    localStorage.setItem(`dictionary-${documentId}`, JSON.stringify(newDictionary));
  };
  //
  //
  useEffect(() => {
    handleUserPrompt({ dictionary: dictionary });
  }, [dictionary]);

  return (
    <div className="w-full max-w-[40%]">
      <InputForm handleSubmit={handleSubmit} handleInputChange={handleInputChange} newRow={newRow} />
      <DictionaryTable dict={dictionary} handleDeleteEntry={handleDeleteRow} />
    </div>
  );
}
