/**
 * GroupForm.tsx
 *
 * This component renders a form for creating a new document group.
 * It allows the user to:
 *
 * - Enter a name for the group
 * - Select documents to include in the group
 * - Submit or cancel the creation process
 *
 * Props:
 * - documents: list of all available documents
 * - newGroupName: current input value for the group name
 * - setNewGroupName: callback to update the group name
 * - selectedDocuments: IDs of currently selected documents
 * - onChangeDocument: toggle a document's selection
 * - onCancel: cancel group creation
 * - onSubmit: submit and create the new group
 */

import Button from './general/Button';
import type { Document } from '../types/types';

interface Props {
  documents: Document[];
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  selectedDocuments: number[];
  onChangeDocument: (docId: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const GroupForm = ({
  documents,
  newGroupName,
  setNewGroupName,
  selectedDocuments,
  onChangeDocument,
  onCancel,
  onSubmit,
}: Props) => (
  <div className="flex flex-col gap-3 justify-center">
    <input
      type="text"
      placeholder="Group name"
      value={newGroupName}
      onChange={(e) => setNewGroupName(e.target.value)}
      className="px-3 py-2 border rounded-md bg-gray-300 hover:bg-gray-400"
    />

    <div className="mt-4 mb-5">
      <h4 className="mb-4 text-lg">Select documents to the new group:</h4>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-4 mb-1">
            <input
              type="checkbox"
              className="transform scale-150"
              id={`doc-${doc.id}`}
              checked={selectedDocuments.includes(doc.id)}
              onChange={() => onChangeDocument(doc.id)}
            />
            <label htmlFor={`doc-${doc.id}`}>{doc.title}</label>
          </li>
        ))}
      </ul>
    </div>

    <Button onClick={onSubmit} buttonType="primary">
      Create new group
    </Button>

    <Button onClick={onCancel} buttonType="primary">
      Cancel
    </Button>
  </div>
);

export default GroupForm;
