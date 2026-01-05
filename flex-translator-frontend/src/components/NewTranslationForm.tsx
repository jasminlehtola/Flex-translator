/**
 * NewTranslationForm.tsx
 *
 * This component renders a form for creating a new translation document.
 * The user can either:
 * - Enter a title and paste raw text content
 * - Or upload a PDF file with a title
 *
 * Additionally, the user selects a translation mode:
 * - "Manual": go to an editor to translate paragraph by paragraph (chunks)
 * - "Auto": immediately run full-text translation
 *
 * The form handles submission logic, error validation, and redirects upon success.
 *
 * Features:
 * - Title and content or file upload
 * - File input reset and removal
 * - Validation to prevent submitting both raw text and PDF
 * - Customizable translation mode (manual or auto)
 * - Handles document creation via mutation hook
 * - Shows loading and error messages
 */

import { useState, useRef, FormEvent } from 'react';
import { useCreateDocument } from '../hooks/useCreateDocument';
import { useNavigate } from '@tanstack/react-router';
import Button from './general/Button';
import { useAuth } from '../utils/auth.tsx';
import LoadingComponent from './general/Loading';

function NewTranslationForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();
  const user_id = auth.user_id;
  const createDocumentMutation = useCreateDocument(Number(user_id));

  const [translationMode, setTranslationMode] = useState<'manual' | 'auto'>('manual');

  // Checks if necessary fields are filled, disables the submit-button if not
  const isPdfUpload = Boolean(file);
  const hasTitle = Boolean(title.trim());
  const hasContent = Boolean(content.trim());
  const isValidPdf = isPdfUpload && hasTitle && !hasContent;
  const isValidText = !isPdfUpload && hasTitle && hasContent;
  const isDisabled = !(isValidPdf || isValidText);
  const showAllFieldsError = isPdfUpload && hasTitle && hasContent;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    await createDocumentMutation.mutateAsync(
      { title, content, file, source_type: file ? 'pdf' : 'paste' },
      {
        onSuccess: async (newDoc) => {
          setTitle('');
          setContent('');

          if (translationMode === 'manual') {
            // Manual mode: step-by-step editor
            navigate({
              to: '/translate/$docId',
              params: { docId: String(newDoc.document_id) },
            });
          } else {
            // Auto mode: navigate to autoTranslate route
            navigate({
              to: '/translate/$docId/autoTranslate',
              params: { docId: String(newDoc.document_id) },
            });
          }
        },
        onError: (error) => {
          console.error('Error creating document:', error);
          alert('Failed to create document. Please try again.');
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 pt-8 pb-40 mb-40">
      <div className="max-w-lg text-center mx-auto text-m text-gray-600">
        Use this tool to paste text or upload a PDF, choose between manual or automatic translation, and make edits. All
        your translations are stored in your account for future access.
        <hr className="h-px my-8 bg-gray-300 border-0"></hr>
      </div>
      <div className="mt-4 pb-7 text-2xl font-thin">
        <p> Step 1: Add the text or PDF file you want to translate </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow-md"
      >
        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">Add new text</h3>

        {createDocumentMutation.isPending ? <LoadingComponent /> : null}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 p-3 w-full text-base rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 p-3 w-full h-36 text-base rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <h3 className="mt-5 mb-4 text-xl font-semibold text-left text-gray-800 dark:text-white">
          Or upload a PDF-file
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
            file:mr-6 file:ml-8 file:py-2 file:px-4 file:rounded-md
            file:border-0 file:text-sm file:font-semibold
           file:bg-gray-300 file:text-black
           hover:file:bg-gray-400
            
          "
          />
          {file && (
            <button
              type="button"
              onClick={removeFile}
              className="text-red-400 hover:text-red-700"
              aria-label="Remove file"
            >
              ✕
            </button>
          )}
        </div>

        {/* Translation Mode */}
        <div className="flex flex-col items-center w-full mt-15">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Translation mode</h3>

          <div className="flex flex-row w-full max-w-3xl gap-6">
            <div className="flex flex-col flex-1 items-center border rounded-lg p-4">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="translationMode"
                  value="manual"
                  checked={translationMode === 'manual'}
                  onChange={() => setTranslationMode('manual')}
                  className="mr-2"
                />
                <span className="font-medium text-gray-800 dark:text-white">Manual translate</span>
              </label>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                You work on individual paragraphs and edit the text as you wish with the help of chatGPT tools.
              </p>
            </div>

            <div className="flex flex-col flex-1 items-center border rounded-lg p-4">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="translationMode"
                  value="auto"
                  checked={translationMode === 'auto'}
                  onChange={() => setTranslationMode('auto')}
                  className="mr-2"
                />
                <span className="font-medium text-gray-800 dark:text-white">Auto-translate</span>
              </label>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                Translates the whole text with one click. It is still possible to edit individual paragraphs after
                translation. Perfect for longer texts and when you don't need that many changes.
              </p>
            </div>
          </div>
        </div>

        <div className="disabled:opacity-50 disabled:cursor-not-allowed justify-center items-center mt-7">
          <Button submitButton disabled={isDisabled}>
            Submit
          </Button>
        </div>

        {/* Error messages */}
        {showAllFieldsError ? (
          <div className="bg-red-100 text-red-800 p-2 mb-4 rounded text-center">
            Error: Both content and PDF added. Remove one.
          </div>
        ) : isPdfUpload && !hasTitle ? (
          <div className="bg-red-100 text-red-800 p-2 mb-4 rounded text-center">Add a title to the PDF-file.</div>
        ) : hasContent && !hasTitle ? (
          <div className="bg-red-100 text-red-800 p-2 mb-4 rounded text-center">Add a title for the content.</div>
        ) : null}
      </form>
    </div>
  );
}

export default NewTranslationForm;
