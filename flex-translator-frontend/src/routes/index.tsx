/**
 * /index.tsx
 *
 * Home page route for Flex Translator.
 * Acts as a landing page with an introduction and usage instructions.
 *
 * Features:
 * - Explains the purpose of the app
 * - Highlights key capabilities
 * - Provides a step-by-step guide for using the app
 * - Describes the Translations and Settings pages and their functions
 *
 * This route does not require authentication and serves as an onboarding guide for new users.
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex pt-8 pb-40 px-15 max-w-[110ch]">
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-xl">Welcome to Flex Translator!</h1>
          <h2 className="mt-5">
            Flex Translator is designed to help you translate educational materials from Finnish to English quickly,
            accurately, and consistently — so you can focus on your content, not the process.
          </h2>

          <h2 className="mt-5">With Flex Translator, you can:</h2>
          <ul className="list-disc list-inside mt-2">
            <li>
              Paste or upload Finnish educational documents and translate them into clear, fluent English with AI.
            </li>
            <li>Choose between two different translation options, chatGPT and DeepL.</li>
            <li>Edit and refine translations directly within the app when using ChatGPT.</li>
            <li>Save, manage and delete your previous translations in your account.</li>
            <li>
              Translate PDF and Word documents quickly, accurately and preserving the original layout. Download
              documents to your computer after translation.
            </li>
          </ul>

          <h1 className="mt-10 text-lg font-semibold">How to use Flex Translator</h1>

          <h2 className="mt-5 font-bold text-blue-800">Translate and edit new text</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Click <strong>“Translate & Edit”</strong> to get started.
            </li>
            <li>
              Add your content by pasting text or uploading a PDF file, and provide a title for the document. Then
              choose between manual translation and automatic translation.
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>
                  <strong>Manual translation</strong> breaks the text into smaller, editable paragraphs. You can modify
                  the text, add custom ChatGPT prompts, or replace specific words. Click “Translate” to translate the
                  current paragraph and apply your changes. For each paragraph, you’ll receive two AI-generated
                  translation options — one from ChatGPT and one from DeepL. Select your preferred version, which will
                  then be saved to the database. Prompts only work with ChatGPT translations and only for editable text.
                </li>
                <li>
                  <strong>Automatic translation</strong> processes the entire text at once using DeepL. No editing or
                  prompts are available during translation. When complete, the translated version is saved to the
                  database. You can click <em>“Review”</em> to inspect and adjust paragraphs if needed.
                </li>
              </ul>
            </li>
            <li>
              Once all paragraphs are translated, click <strong>“Finish document”</strong> to complete the process. In
              auto-translate mode, this step is done automatically.The translated text is saved to you account.
            </li>
          </ol>

          <h2 className="mt-5 font-bold text-blue-800">Quick File Translation</h2>
          <p>
            Upload a PDF or Word (.docx) file and translate it instantly with DeepL. The result is downloaded
            immediately as a .docx file. <strong>No content is saved</strong> to your account and there are no editing
            options.
          </p>

          <h2 className="mt-5 font-bold text-blue-800">Translations Page</h2>
          <p>
            The <strong>Translations</strong> page contains all editable documents you’ve translated with Translate &
            Edit. Quick File Translation is not saved to your account. You can create groups, organize documents by
            group, and delete individual or multiple documents at once.
          </p>

          <h2 className="mt-5 font-bold text-blue-800">Settings Page</h2>
          <p>
            The <strong>Settings</strong> page contains system prompts used by ChatGPT during manual translations. These
            control tone, style, and translation behavior. They have no effect on DeepL translations or non-editable
            text. A reset button is available to restore default prompts at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
