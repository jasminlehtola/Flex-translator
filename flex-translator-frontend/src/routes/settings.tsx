/**
 * /settings.tsx
 *
 * This route displays and manages user-specific translation settings (system prompts) used by ChatGPT during manual translations.
 *
 * Features:
 * - Fetches existing user prompts from the backend
 * - Allows editing each individual prompt via toggled input fields
 * - Persists changes to the backend via `saveSettings` mutation
 * - Allows resetting all prompts back to default values with confirmation
 * - Describes each prompt to help users understand their impact on translation behavior
 *
 * Prompts (fields):
 * - initial_prompt: global system prompt to define AI's translation behavior
 * - conversation_history_prompt: context prompt to provide previous paragraph info
 * - user_prompt_instructions: specific per-paragraph instructions
 * - dictionary_instructions: guidance for word-level replacements using dictionary
 *
 * Route loader:
 * - Preloads user's documents (via `documentsByUserQueryOptions`) to ensure the user is authenticated
 *
 * Internal state:
 * - `localPrompts`: local copy of prompt values (editable)
 * - `editMode`: tracks which prompt field is currently being edited
 */

import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth.ts';
import { useState, useEffect } from 'react';
import Button from '../components/general/Button';
import ButtonSmall from '../components/general/ButtonSmall';
import { documentsByUserQueryOptions } from '../utils/queryOptions.ts';
import LoadingComponent from '../components/general/Loading.tsx';
import { useSettings } from '../hooks/useSettings';
import type { UserSettings } from '../types/types';

export const Route = createFileRoute('/settings')({
  loader: ({ context: { queryClient, getUserId }, params: { docId } }) => {
    const user_id = getUserId();
    return queryClient.ensureQueryData(documentsByUserQueryOptions(Number(user_id)));
  },
  component: SettingsPage,
});

function SettingsPage() {
  const auth = useAuth();
  const userId = auth.user_id;
  const { settings, query, saveSettings, resetSettings } = useSettings(Number(userId));

  const [localPrompts, setLocalPrompts] = useState<UserSettings | null>(null);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({}); // edited field

  useEffect(() => {
    if (settings) {
      setLocalPrompts(settings);
      setEditMode({}); // resets edit-state when data is fetched
    }
  }, [settings]);

  const handlePromptChange = (key: keyof typeof settings, value: string) => {
    if (!localPrompts) return;
    setLocalPrompts({
      ...localPrompts,
      [key]: value,
    });
  };

  // Toggles edit-mode when user clicks Edit prompt
  const toggleEdit = (key: string) => {
    setEditMode((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Saves new user-made settings
  const handleSavePrompt = (key: keyof typeof settings) => {
    if (!localPrompts) return;

    // Create new settings-object with all fields requiring strings
    const updatedSettings: UserSettings = {
      initial_prompt: localPrompts.initial_prompt ?? '',
      conversation_history_prompt: localPrompts.conversation_history_prompt ?? '',
      user_prompt_instructions: localPrompts.user_prompt_instructions ?? '',
      dictionary_instructions: localPrompts.dictionary_instructions ?? '',
    };

    // Update only one field
    updatedSettings[key] = localPrompts[key] ?? '';

    saveSettings.mutate(updatedSettings);

    setEditMode((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const handleCancelEdit = (key: keyof typeof settings) => {
    if (!settings) return;

    // Restore original value from database
    setLocalPrompts({
      ...localPrompts!,
      [key]: settings[key],
    });

    setEditMode((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  // Resets settings back to default values
  const handleResetSettings = () => {
    if (!window.confirm('Are you sure you want to reset the prompts back to defaults?')) {
      return;
    }
    resetSettings.mutate(undefined, {
      onSuccess: () => {
        console.log('Settings reset to defaults.');
      },
      onError: () => {
        console.error('Failed to reset settings.');
      },
    });
  };

  const promptDescriptions: Record<keyof UserSettings, string> = {
    initial_prompt:
      'This prompt is used as the system message for the translator AI. It defines the tone and approach for translations.',
    conversation_history_prompt: 'This prompt provides context from the previous translations to maintain consistency.',
    user_prompt_instructions: 'This gives instructions to the translator for each paragraph.',
    dictionary_instructions:
      'These are specific dictionary mappings and they are sended when changing individual words.',
  };

  if (query.isLoading || !localPrompts) {
    return <LoadingComponent />;
  }

  if (query.isError) {
    return <p> Failed to load settings. </p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="max-w-lg text-center mx-auto text-m text-gray-600">
        Allows you to view and customize the system prompts used by the ChatGPT-powered translation engine. These
        prompts control translation tone, style, and specific instructions for handling text. Prompts only influence
        editable translations — they are not used for one-click automatic file translations.
      </div>
      <hr className="h-px my-8 bg-gray-300 border-0"></hr>

      <div>
        <div className="flex flex-row justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Translation prompts (ChatGPT)</h1>
            <h2 className="mb-8 text-sm text-gray-600">
              {' '}
              Editing these can significantly change translation behavior. Use with caution.{' '}
            </h2>
          </div>

          {/* Reset all settings */}
          <div className="items-end">
            <Button onClick={handleResetSettings}>
              {resetSettings.isPending ? 'Resetting...' : 'Reset all to defaults'}
            </Button>
          </div>
        </div>

        {/* Prompt component */}
        {(
          [
            ['initial_prompt', 'Initial prompt'],
            ['conversation_history_prompt', 'Conversation history prompt'],
            ['user_prompt_instructions', 'User prompt instructions'],
            ['dictionary_instructions', 'Dictionary instructions'],
          ] as [keyof typeof settings, string][]
        ).map(([key, label]) => (
          <div key={key} className="mb-6">
            <label className="block font-medium text-lg mb-1">{label}</label>
            <p className="text-gray-500 text-sm mb-2">{promptDescriptions[key]}</p>
            <textarea
              value={localPrompts[key]}
              onChange={(e) => handlePromptChange(key, e.target.value)}
              className={`w-full border rounded p-2 ${editMode[key] ? '' : 'bg-gray-100 text-gray-600'}`}
              rows={4}
              readOnly={!editMode[key]}
            />
            <div className="flex gap-2">
              {!editMode[key] ? (
                <ButtonSmall onClick={() => toggleEdit(key)}>Edit</ButtonSmall>
              ) : (
                <>
                  <ButtonSmall onClick={() => handleSavePrompt(key)} disabled={saveSettings.isPending}>
                    {saveSettings.isPending ? 'Saving...' : 'Save'}
                  </ButtonSmall>

                  <ButtonSmall onClick={() => handleCancelEdit(key)}>Cancel</ButtonSmall>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
