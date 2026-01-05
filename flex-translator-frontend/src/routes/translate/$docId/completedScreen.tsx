/**
 * Route: /translate/:docId/completedScreen
 * This is the **translation completed screen**.
 *
 *  What it does:
 * - Shows the fully translated document for :docId using <MDEditor.Markdown />.
 * - Allows the user to:
 *    • Copy the translated text to clipboard.
 *    • Download the document as PDF (via downloadPdf API).
 *    • Add the document to a group with <AddToGroupSelector />.
 *    • Return to review and edit the translation again (calls onReview).
 * - Displays a loading spinner during PDF generation.
 *
 *  Location: src/routes/translate/$docId/completedScreen.tsx
 *  URL: /translate/:docId/completedScreen
 *
 *  Notes:
 * - Formerly a standalone component, now refactored as its own route.
 * - Triggered automatically after finishing manual or auto-translation.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import LoadingComponent from '../../../components/general/Loading';
import { documentByIdQueryOptions } from '../../../utils/queryOptions.ts';
import Button from '../../../components/general/Button';
import AddToGroupSelector from '../../../components/AddToGroupSelector.tsx';
import { downloadPdf } from '../../../api/documentsApiClient.ts';
import { useGroups } from '../../../hooks/useGroups';
import { useAuth } from '../../../utils/auth';

export const Route = createFileRoute('/translate/$docId/completedScreen')({
  loader: ({ context: { queryClient }, params: { docId } }) => {
    return queryClient.ensureQueryData(documentByIdQueryOptions(Number(docId)));
  },
  component: CompletedScreenRoute,
});

function CompletedScreenRoute() {
  const navigate = Route.useNavigate();

  const { docId } = Route.useParams();
  const auth = useAuth();
  const USER_ID = Number(auth.user_id);

  const [isPending, setIsPending] = useState(false);
  const { groups, addDocument } = useGroups(USER_ID);
  const [addedToGroup, setAddedToGroup] = useState<Record<number, string | null>>({});
  const [copied, setCopied] = useState(false);

  const { data: document, isLoading } = useQuery({
    ...documentByIdQueryOptions(Number(docId)),
    enabled: !!docId,
    staleTime: 0,
    retry: false,
  });

  const translation =
    typeof document.final_translation === 'string'
      ? document.final_translation
      : document.chunks?.length
        ? document.chunks.map((c) => c.final_chunk_translation ?? '').join('\n\n')
        : '';

  const handleAddToGroup = (groupId: number, documentId: number) => {
    console.log('Adding doc', documentId, 'to group', groupId);
    addDocument.mutate({ groupId, documentId });

    setAddedToGroup((prev) => ({
      ...prev,
      [documentId]: groups.find((group) => group.id === groupId)?.name || 'Group',
    }));

    setTimeout(() => {
      setAddedToGroup((prev) => ({
        ...prev,
        [documentId]: null,
      }));
    }, 2000);
  };
  //
  //
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  //
  //
  const handleSaveAsDocx = async () => {
    setIsPending(true); // Set loading state to true
    try {
      const res = await downloadPdf(Number(docId));
      const data = await res;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = window.document.createElement('a');
      link.href = url;
      const safeTitle = (document.title || 'translated_document').replace(/[<>:"/\\|?*]+/g, '_');
      console.log('doctitle:', document.title, ', safetitle:', safeTitle);
      link.download = `${safeTitle || 'translated_document'}.docx`;
      console.log('Document made to pdf!');

      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
    setIsPending(false);
  };

  const handleReview = () => {
    localStorage.removeItem(`finalTranslation-${docId}`);
    localStorage.removeItem(`completedScreen-${docId}`);
    localStorage.removeItem(`lastChunk-${docId}`); // Reset chunk index and start over
    localStorage.setItem(`reviewed-${docId}`, 'true'); // Flag so chunk index resets
    console.log('Starting over');
    navigate({ to: `/translate/${docId}` });
  };

  return (
    <div className="flex flex-col items-center gap-8 mb-15">
      <h3 className="text-2xl text-success"> Translation complete!</h3>

      <div className="w-full max-w-6xl border rounded-md shadow p-4">
        <MDEditor.Markdown source={String(translation)} />
      </div>

      <div className="flex flex-row gap-8">
        <Button onClick={handleCopyText}>{copied ? 'Copied!' : 'Copy to clipboard'}</Button>

        {document.source_type === 'pdf' && <Button onClick={handleSaveAsDocx}>Save as docx</Button>}

        <Button onClick={handleReview}>Review and translate again</Button>

        <AddToGroupSelector
          documentId={Number(docId)}
          groups={groups}
          onAdd={handleAddToGroup}
          addedToGroupName={addedToGroup[Number(docId)]}
        />
      </div>

      {isLoading ? <LoadingComponent /> : null}
    </div>
  );
}
