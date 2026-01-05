/**
 * Route: /translate/:docId
 * This is the **document translation screen** for a specific document.
 *
 *  What it does:
 * - Loads the document data for the given :docId (via documentByIdQueryOptions).
 * - Lets the user work on translations chunk-by-chunk in <MarkDownEditor />.
 * - Handles finishing the document, deleting it, and managing local state
 *   (e.g. current chunk index, isFinished, isEditing).
 * - If translation is finished and finalized, shows <CompletedScreen /> instead.
 * - A previously finalized document is flagged to localstorage as 'completedScreen-${documentId}'.
 *
 *  Location: src/routes/translate/$docId/index.tsx
 *  URL: /translate/:docId
 *
 *  Notes:
 * - Used as the parent route for child routes like `/autoTranslate`.
 * - This is the former `translate.$docId.tsx` refactored to folder-based routing.
 */

import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { documentByIdQueryOptions } from '../../../utils/queryOptions.ts';
import { useSuspenseQuery } from '@tanstack/react-query';
import MarkDownEditor from '../../../components/MarkDownEditor/MarkDownEditor.tsx';
import { useDeleteDocument } from '../../../hooks/useDeleteDocument.ts';
import ButtonSmall from '../../../components/general/ButtonSmall.tsx';
import { useAuth } from '../../../utils/auth.tsx';
import RenameInput from '../../../components/RenameInput.tsx';
import { Pencil } from 'lucide-react';
import type { UserPrompts } from '../../../types/types.ts';

export const Route = createFileRoute('/translate/$docId/')({
  loader: ({ context: { queryClient }, params: { docId } }) => {
    return queryClient.ensureQueryData(documentByIdQueryOptions(Number(docId)));
  },
  //errorComponent: DocumentErrorComponent,
  component: function DocumentRouteComponent() {
    const { docId } = Route.useParams();
    return <DocumentPageComponent key={docId} />;
  },
});

function DocumentPageComponent() {
  const navigate = useNavigate();
  const auth = useAuth();
  const USER_ID = Number(auth.user_id);
  const documentId = Number(Route.useParams().docId);

  const { data: document, refetch } = useSuspenseQuery(documentByIdQueryOptions(Number(documentId)));

  // Check if document is already completed
  useEffect(() => {
    const completed = localStorage.getItem(`completedScreen-${documentId}`) === 'true';
    if (completed) {
      console.log('Document is completed, redirecting to completed screen');
      navigate({ to: `/translate/${documentId}/completedScreen` });
    }
  }, [documentId, navigate]);

  // flag set when pressing Review
  const [currentChunkIndex, setCurrentChunkIndex] = useState(() => {
    const isReviewed = localStorage.getItem(`reviewed-${documentId}`) === 'true';
    if (isReviewed) return 0;

    const savedChunk = localStorage.getItem(`lastChunk-${documentId}`);
    return savedChunk !== null
      ? Number(savedChunk)
      : document.chunks.findIndex((c) => !(c.final_chunk_translation ?? '').trim()) || 0;
  });

  // This ensures the flag is used once and then immediately cleared.
  useEffect(() => {
    localStorage.removeItem(`reviewed-${documentId}`);
  }, [documentId]);

  const [isFinished, setIsFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [finalTranslation, setFinalTranslation] = useState(() => {
    return localStorage.getItem(`finalTranslation-${documentId}`) ?? '';
  });

  // Gets user prompts from localstorage at startup. Then passes change function to toolbox.
  const [userPrompts, setUserPrompts] = useState<UserPrompts>({
    prompts: null,
    dictionary: null,
  });

  const deleteDocumentMutation = useDeleteDocument(USER_ID);
  const handleDeleteDocument = () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    deleteDocumentMutation
      .mutateAsync(documentId)
      .then(() => {
        navigate({ to: '/translate' });
      })
      .catch((error) => {
        console.error('Error deleting document:', error);
      });

    console.log('Deleted successfully!');
    localStorage.removeItem(`isReadyToFinish-${documentId}`);
    localStorage.removeItem(`finalTranslation-${documentId}`);
    console.log('Cleared localStorage..');
  };

  //
  //
  const handleFinish = async () => {
    console.log('Starting handleFinish');

    const updated = await refetch();
    if (!updated.data) {
      console.error('No document data after refetch');
      return;
    }

    const chunks = updated.data.chunks ?? [];
    const translation =
      updated.data.final_translation ?? chunks.map((c) => c.final_chunk_translation ?? '').join('\n\n');

    setFinalTranslation(translation);
    localStorage.setItem(`finalTranslation-${documentId}`, translation);

    setIsFinished(true);

    localStorage.removeItem(`lastChunk-${documentId}`);
  };
  //
  //
  const handleReview = () => {
    setCurrentChunkIndex(0);
    console.log('Starting over');
    localStorage.removeItem(`finalTranslation-${documentId}`);
  };
  //
  //
  const handleUserPrompt = (prompts: UserPrompts): void => {
    setUserPrompts((oldPrompt) => {
      console.log('Sending dictionary:', userPrompts.dictionary);
      return {
        prompts: prompts.prompts ?? oldPrompt.prompts,
        dictionary: prompts.dictionary ?? oldPrompt.dictionary,
      };
    });
  };
  //
  //
  const handleNextChunk = () => {
    if (currentChunkIndex < document.chunks.length - 1) {
      setCurrentChunkIndex(currentChunkIndex + 1);
    }
  };
  const handlePreviousChunk = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(currentChunkIndex - 1);
    }
  };

  return (
    <div className="flex flex-col p-3">
      <header className="flex-row text-center pb-5">
        <h2 className="text-2xl mb-2">Document title:</h2>
        <div className="flex-col inline-flex items-center">
          <h2 className="text-2xl max-w-[40ch] truncate">{document.title}</h2>
          <div className="flex flex-row items-center justify-center gap-5 mt-2">
            {isEditing ? (
              <RenameInput
                documentId={documentId}
                currentTitle={document.title}
                userId={USER_ID}
                onClose={() => setIsEditing(false)}
                onRenameSuccess={() => refetch()}
              />
            ) : (
              <div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded hover:bg-gray-200 align-bottom"
                  title="Rename document"
                >
                  <Pencil size={22} />
                </button>
              </div>
            )}

            <ButtonSmall onClick={handleDeleteDocument} buttonType="delete" title="Delete document">
              ✕
            </ButtonSmall>
          </div>
        </div>
      </header>

      <MarkDownEditor
        document={document}
        currentChunkIndex={currentChunkIndex}
        setCurrentChunkIndex={setCurrentChunkIndex}
        handleNextChunk={handleNextChunk}
        handlePreviousChunk={handlePreviousChunk}
        onNextChunk={() => setCurrentChunkIndex((i) => i + 1)}
        onFinish={handleFinish}
        onReview={handleReview}
        userPrompts={userPrompts}
        isFinished={isFinished}
        setIsFinished={setIsFinished}
        handleUserPrompt={handleUserPrompt}
      />
    </div>
  );
}
