/**
 * GroupTable.tsx
 *
 * This component displays documents either:
 * - In all groups ("All documents" view), or
 * - In a specific group selected by the user
 *
 * Features:
 * - Lists documents in a table format
 * - Allows deleting single or multiple documents
 * - Allows adding/removing documents from groups
 * - Shows document metadata (name, date, groups)
 * - Sorts the table by name or creation date (ascending/descending)
 *    > Default sort: by creation date, descending (newest first)
 *
 * Props:
 * - selectedGroup: currently selected group ID as a string
 * - groups: list of all available groups
 * - documents: list of all documents
 * - addedToGroup: temporary status map of documents added to a group
 * - selectedForDelete: list of selected document IDs for batch deletion
 * - setSelectedForDelete: callback to update the selection
 * - onAdd: handler for adding a document to a group
 * - onRemove: handler for removing a document from a group
 * - onDelete: handler for deleting a single document
 * - onDeleteGroup: handler for deleting a group
 * - onDeleteMany: handler for batch deletion
 */

import { useState } from 'react';

import ButtonSmall from './general/ButtonSmall';
import LinkButtonSmall from './general/LinkButtonSmall';
import AddToGroupSelector from './AddToGroupSelector';

import type { Document, Group } from '../types/types';

interface Props {
  selectedGroup: string;
  groups: Group[];
  documents: Document[];
  addedToGroup: Record<number, string | null>;
  selectedForDelete: number[];
  setSelectedForDelete: (ids: number[]) => void;
  onAdd: (groupId: number, docId: number) => void;
  onRemove: (groupId: number, docId: number) => void;
  onDelete: (docId: number) => void;
  onDeleteGroup: (groupId: number) => void;
  onDeleteMany: () => void;
}

const GroupTable = ({
  selectedGroup,
  groups,
  documents,
  addedToGroup,
  selectedForDelete,
  setSelectedForDelete,
  onAdd,
  onRemove,
  onDelete,
  onDeleteGroup,
  onDeleteMany,
}: Props) => {
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: 'name' | 'date') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortDocuments = (docs: Document[]) => {
    return [...docs].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const sortedDocs = sortDocuments(documents);

  // ALL DOCUMENTS VIEW
  if (selectedGroup === 'all') {
    return (
      <div className="w-full mt-2 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">All documents:</h3>

        <table className="w-full table-fixed border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="w-[30%] px-2 py-2 border cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <div className="flex justify-between items-center">
                  <span>Name</span>
                  <span className="text-lg opacity-70">
                    {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </div>
              </th>

              <th className="w-[20%] px-2 py-2 border">Group(s)</th>

              <th className="w-[15%] px-2 py-2 border cursor-pointer select-none" onClick={() => toggleSort('date')}>
                <div className="flex justify-between items-center">
                  <span>Creation date</span>
                  <span className="text-lg opacity-70">
                    {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓'}
                  </span>
                </div>
              </th>

              <th className="w-[35%] px-2 py-2 border">
                <div className="flex justify-between items-center">
                  <span>Actions</span>
                  {selectedForDelete.length > 0 && (
                    <ButtonSmall buttonType="delete" onClick={onDeleteMany}>
                      Delete selected ({selectedForDelete.length})
                    </ButtonSmall>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDocs.map((doc) => {
              // Search which groups document belongs to
              const docGroups = groups.filter((g) => g.documents.includes(doc.id));

              return (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  {/* Name */}
                  <td className="px-1 py-1 border align-center">
                    <span className="block w-full truncate" title={doc.title}>
                      {doc.title}
                    </span>
                  </td>

                  {/* Groups */}
                  <td
                    className="px-1 py-1 border break-words"
                    title={docGroups.map((g) => g.name).join(', ') || 'No groups'}
                  >
                    {docGroups.length > 0 ? (
                      docGroups.map((g) => g.name).join(', ')
                    ) : (
                      <span className="text-gray-400 italic">No groups</span>
                    )}
                  </td>

                  {/* Creation date */}
                  <td className="px-1 py-1 border">{new Date(doc.created_at).toLocaleDateString()}</td>

                  {/* Actions */}
                  <td className="px-1 py-1 border">
                    <div className="flex flex-wrap gap-3 items-center">
                      <LinkButtonSmall to={`/translate/${doc.id}`}>Open</LinkButtonSmall>

                      <AddToGroupSelector
                        documentId={doc.id}
                        groups={groups}
                        onAdd={onAdd}
                        addedToGroupName={addedToGroup[doc.id]}
                      />

                      <ButtonSmall onClick={() => onDelete(doc.id)} buttonType="delete">
                        Delete
                      </ButtonSmall>

                      <input
                        type="checkbox"
                        className="transform scale-125"
                        checked={selectedForDelete.includes(doc.id)}
                        onChange={() =>
                          setSelectedForDelete(
                            selectedForDelete.includes(doc.id)
                              ? selectedForDelete.filter((id) => id !== doc.id) // Delete if already clicked
                              : [...selectedForDelete, doc.id] // Add if not clicked
                          )
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // SPECIFIC GROUP VIEW
  const group = groups.find((g) => g.id.toString() === selectedGroup);
  if (!group) return null;

  const groupDocs = documents.filter((d) => group.documents.includes(d.id));
  const sortedGroupDocs = sortDocuments(groupDocs);

  return (
    <div className="w-full mt-2 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Documents in group {group.name}:</h3>
        <ButtonSmall onClick={() => onDeleteGroup(group.id)} buttonType="delete">
          Delete Group
        </ButtonSmall>
      </div>

      <table className="w-full table-fixed border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="w-[30%] px-2 py-2 border cursor-pointer select-none" onClick={() => toggleSort('name')}>
              <div className="flex justify-between items-center">
                <span>Name</span>
                <span className="text-lg opacity-70">
                  {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓'}
                </span>
              </div>
            </th>

            <th className="w-[20%] px-2 py-2 border cursor-pointer select-none" onClick={() => toggleSort('date')}>
              <div className="flex justify-between items-center">
                <span>Creation date</span>
                <span className="text-lg opacity-70">
                  {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓'}
                </span>
              </div>
            </th>

            <th className="w-[50%] px-2 py-2 border">
              <div className="flex justify-between items-center">
                <span>Actions</span>
                {selectedForDelete.length > 0 && (
                  <ButtonSmall buttonType="delete" onClick={onDeleteMany}>
                    Delete selected ({selectedForDelete.length})
                  </ButtonSmall>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedGroupDocs.map((doc) => (
            <tr key={doc.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1 border">
                <span className="block w-full truncate" title={doc.title}>
                  {doc.title}
                </span>
              </td>
              <td className="px-2 py-1 border">{new Date(doc.created_at).toLocaleDateString()}</td>
              <td className="px-2 py-1 border">
                <div className="flex flex-wrap gap-3 items-center">
                  <LinkButtonSmall to={`/translate/${doc.id}`}>Open</LinkButtonSmall>
                  <ButtonSmall onClick={() => onRemove(group.id, doc.id)}>Remove from group</ButtonSmall>
                  <AddToGroupSelector
                    documentId={doc.id}
                    groups={groups}
                    onAdd={onAdd}
                    addedToGroupName={addedToGroup[doc.id]}
                  />
                  <ButtonSmall onClick={() => onDelete(doc.id)} buttonType="delete">
                    Delete
                  </ButtonSmall>
                  <input
                    type="checkbox"
                    className="transform scale-125"
                    checked={selectedForDelete.includes(doc.id)}
                    onChange={() =>
                      setSelectedForDelete(
                        selectedForDelete.includes(doc.id)
                          ? selectedForDelete.filter((id) => id !== doc.id)
                          : [...selectedForDelete, doc.id]
                      )
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupTable;
