/**
 * RenameInput.tsx
 *
 * This component renders an inline form for renaming a document.
 * It includes input validation, handles save and cancel actions, and shows error feedback.
 *
 * Props:
 * - documentId: ID of the document to be renamed
 * - currentTitle: current title of the document (used as initial input value)
 * - userId: ID of the user performing the rename (used in the mutation)
 * - onClose: callback to close the input (e.g. after success or cancel)
 *
 * Features:
 * - Input field pre-filled with the current title
 * - Prevents empty title submission
 * - Shows loading state while saving
 * - Displays error message if rename fails
 */

import { useState } from 'react';
import { useRenameDocument } from '../hooks/useRenameDocument';
import ButtonSmall from './general/ButtonSmall';

interface RenameInputProps {
  documentId: number;
  currentTitle: string;
  userId: number;
  onClose: () => void;
  onRenameSuccess: () => void;
}

const RenameInput = ({ documentId, currentTitle, userId, onClose, onRenameSuccess }: RenameInputProps) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const renameMutation = useRenameDocument(userId);

  const handleRename = async () => {
    if (!newTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      await renameMutation.mutateAsync({
        docId: documentId,
        title: newTitle,
      });
      console.log('Document renamed successfully!');
      onRenameSuccess();
      onClose();
    } catch (error: any) {
      console.error('Rename failed:', error);
      setError('Failed to rename document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 mx-5 border rounded-md bg-gray-100">
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Enter new document name"
        className="border px-2 py-1 rounded bg-gray-200"
        disabled={isSaving}
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex gap-4 justify-center">
        <ButtonSmall onClick={handleRename} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </ButtonSmall>
        <ButtonSmall onClick={onClose} buttonType="secondary">
          Cancel
        </ButtonSmall>
      </div>
    </div>
  );
};

export default RenameInput;
