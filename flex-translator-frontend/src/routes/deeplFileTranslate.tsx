/**
 * /deeplFileTranslate.tsx
 *
 * Page component that provides a simple interface for translating a PDF or DOCX file using the DeepL API.
 * The translated file is downloaded directly after the translation completes – no editing or saving to user account.
 *
 * Features:
 * - Allows the user to upload a `.pdf` or `.docx` file
 * - Submits the file to the backend which uses DeepL to translate it
 * - Automatically downloads the translated `.docx` file after translation
 *   (docx so that user can edit the document in Word and save it in .docx or .pdf if desired)
 * - Preserves original layout and formatting
 * - Tracks user interaction with a basic analytics payload
 * - Analytics has some extra information that are set as Null
 *   (because it uses the same database table as other more detailed analytics data, due to limited development time)
 * - Shows a spinner while waiting for the translated file
 * - Option to re-download the translated file if needed
 *
 * Flow:
 * 1. User uploads a file
 * 2. File is submitted to backend via `translateDeepLFile`
 * 3. Backend returns a translated .docx file as a Blob
 * 4. Component downloads the Blob to the user's machine
 *
 * Notes:
 * - Translations are not saved to the user's account (TODO if further development is done!)
 * - Local state holds both the file and Blob URL for download
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { translateDeepLFile } from '../api/documentsApiClient.ts';
import LoadingDeepLSpinner from '../components/general/LoadingDeepL.tsx';
import Button from '../components/general/Button.tsx';
import { removeFileExtension } from '../utils/removeFileExtension.tsx';

import { useAuth } from '../utils/auth.tsx';
import { useSendAnalytics } from '../hooks/useSendAnalytics.ts';

export const Route = createFileRoute('/deeplFileTranslate')({
  component: DeepLLoadingScreen,
});

function DeepLLoadingScreen() {
  const auth = useAuth();
  const sendAnalytics = useSendAnalytics();
  const user_id = auth.user_id;

  const [isLoading, setIsLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function DownloadBlobLink(blob: Blob) {
    // Create loading link
    const url = window.URL.createObjectURL(blob);
    setBlobUrl(url);

    // Download file automatically
    const link = window.document.createElement('a');
    const safeTitle = (removeFileExtension(file.name) || 'translated_document').replace(/[<>:"/\\|?*]+/g, '_');
    console.log('doctitle:', file?.name, ', safetitle:', safeTitle);
    link.href = url;
    link.download = `${safeTitle || 'translated_document'}.docx`;

    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    console.log('Document made to pdf!');
  }

  const deepLTranslation = async () => {
    if (!file) return;
    console.log('Starting DeepLTranslation.');
    setIsLoading(true);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const sourceType = extension === 'pdf' ? 'pdf' : 'docx';

      const payload = {
        document_id: null,
        chunk_id: null,
        source_type: sourceType,
        translation_mode: 'deeplAPIAuto',
        chosen_model: 'deepl',
        original_text: null,
        user_final: null,
        edited: false,
        user_prompts: null,
        user_dictionary: null,
        time_spent_sec: null,
      };
      await sendAnalytics.mutateAsync(payload);
      console.log('[ANALYTICS PAYLOAD]', payload);

      const blob = await translateDeepLFile(Number(user_id), removeFileExtension(file.name), file);
      setBlob(blob);
      // Check if blob is a real file and not an error
      if (!blob || !(blob instanceof Blob) || blob.size === 0) {
        console.error('No file returned from translation');
        return;
      }
      console.log('data:', blob, typeof blob);

      DownloadBlobLink(blob);
    } catch (err) {
      console.error('Translation failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col justify-center bg-gray-100 pt-8 pb-40 items-center">
      {isLoading ? (
        <LoadingDeepLSpinner />
      ) : (
        <>
          <div className="max-w-lg text-center mx-auto text-m text-gray-600">
            Upload a PDF or Word document to translate it instantly and preserve the original layout. The translated
            file is ready to be downloaded immediately after translation process. Nothing is saved to your account, so
            make sure you save the translated document on your computer.
            <hr className="h-px my-8 bg-gray-300 border-0"></hr>
          </div>

          <form className="flex flex-col items-center w-full mt-6 max-w-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="mt-5 text-xl font-semibold text-left text-gray-800 dark:text-white">Upload a file</h3>
            <p className="text-[14px] text-gray-500 mb-3 mt-2"> Supported file types: .pdf and .docx</p>
            <ul className="list-disc list-inside mt-3 mb-6 text-[15px] text-gray-700 dark:text-white">
              <li>No editing in Flex Translator – upload your file and get the translation back</li>
              <li>Creates a .docx file that downloads automatically after the translation</li>
              <li>Fast and good-looking results – original layout and formatting are preserved</li>
              <li>Uses DeepL API for translation</li>
            </ul>

            <div className="flex items-center space-x-2 mt-5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500
                  file:mr-6 file:ml-8 file:py-2 file:px-5 file:rounded-md
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-gray-300 file:text-black
                  hover:file:bg-gray-400"
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

            <div className="disabled:opacity-50 disabled:cursor-not-allowed justify-center items-center mt-7">
              <Button onClick={deepLTranslation}>Submit</Button>
            </div>

            {!isLoading && blobUrl && (
              <div>
                <p className="mt-10 text-center text-2xl text-green-500">Translation done!</p>
                {file && blob && (
                  <button
                    type="button"
                    className="text-blue-500 underline items-center mt-4 mb-3"
                    onClick={(e) => {
                      e.preventDefault();
                      DownloadBlobLink(blob);
                    }}
                  >
                    Re-download your translated document
                  </button>
                )}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
