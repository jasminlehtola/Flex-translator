/**
 * Groups.tsx
 *
 * This component manages document grouping in the user interface.
 * It allows users to create groups, add/remove documents to/from groups,
 * and delete documents either individually or in batch.
 *
 * Supports three main views:
 *   - Create new group (form)
 *   - All documents (both grouped and ungrouped)
 *   - Documents in the selected group
 *
 * Key features:
 *   - Group selection via dropdown (React Select)
 *   - Add documents to groups (AddToGroupSelector)
 *   - Manage documents (open, delete, batch delete)
 *   - Create and delete groups
 *
 * Hooks and components:
 *   - useGroups: handles group-related API actions
 *   - useDeleteDocument / useDeleteDocumentsBatch: handles deletion
 *   - GroupForm.tsx: the form UI for creating new groups
 *   - GroupTable.tsx: table views for documents
 *
 * Developer Notes:
 * selectedGroup is always a **string** (`'all'`, `'new'`, or group ID as string)
 *   - 'all' → show all documents
 *   - 'new' → show the group creation form
 *   - '123' → show documents in the group with that ID (as string)
 * When comparing with numeric group IDs, always use: group.id.toString() === selectedGroup
 *
 */

import React, { useState } from 'react';
import Select, { components, ControlProps } from 'react-select';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

import LoadingComponent from './general/Loading';
import { useAuth } from '../utils/auth';
import { useGroups } from '../hooks/useGroups';
import { useDeleteDocument } from '../hooks/useDeleteDocument';
import { useDeleteDocumentsBatch } from '../hooks/useDeleteDocumentsBatch';

import GroupForm from './GroupForm';
import GroupTable from './GroupTable';

import type { Document, Group } from '../types/types';

interface GroupsProps {
  documents: Document[];
}

const Groups = ({ documents }: GroupsProps) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [addedToGroup, setAddedToGroup] = useState<Record<number, string | null>>({});
  const [selectedForDelete, setSelectedForDelete] = useState<number[]>([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuth();
  const USER_ID = Number(auth.user_id);

  const { groups, createGroup, addDocument, deleteGroup, removeDocument, query } = useGroups(USER_ID);
  const deleteDocumentMutation = useDeleteDocument(USER_ID);
  const deleteDocumentsBatchMutation = useDeleteDocumentsBatch(USER_ID);

  if (!USER_ID || query.isLoading) return <LoadingComponent />;

  const groupOptions = [
    { value: 'new', label: 'Create new group', isBold: true },
    { value: 'all', label: 'All' },
    ...groups.map((group) => ({
      value: group.id.toString(),
      label: group.name,
    })),
  ];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert('Add a name to the group.');
      return;
    }

    createGroup.mutate(
      { name: newGroupName, documents: selectedDocuments },
      {
        onSuccess: () => {
          setSelectedGroup('all');
          setNewGroupName('');
          setSelectedDocuments([]);
          setIsCreatingGroup(false);
        },
        onError: (err) => console.error('Group creation failed', err),
      }
    );
  };

  const handleDocumentChange = (docId: number) => {
    setSelectedDocuments(
      (prevSelected) =>
        prevSelected.includes(docId)
          ? prevSelected.filter((id) => id !== docId) // Remove if already picked
          : [...prevSelected, docId] // Add if not picked
    );
  };

  const addDocumentToGroup = (groupId: number, docId: number) => {
    console.log('Trying to add doc', docId, 'to group', groupId);
    addDocument.mutate(
      { groupId, documentId: docId },
      {
        onSuccess: () => {
          const groupName = groups.find((g) => g.id === groupId)?.name || 'Group';
          setAddedToGroup((prev) => ({ ...prev, [docId]: groupName }));
          // Restore default text in 2 seconds
          setTimeout(() => setAddedToGroup((prev) => ({ ...prev, [docId]: null })), 2000);
        },
      }
    );
  };

  const removeDocumentFromGroup = (groupId: number, docId: number) => {
    removeDocument.mutate({ groupId, documentId: docId });
  };

  const handleDeleteGroup = (groupId: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      deleteGroup.mutateAsync(groupId, { onSuccess: () => setSelectedGroup('all') });
    }
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm('Delete this document permanently?')) {
      deleteDocumentMutation.mutateAsync(docId).catch((error) => console.error('Error deleting document:', error));
    }
  };

  const handleDeleteDocumentsBatch = async () => {
    if (confirm(`Delete ${selectedForDelete.length} documents permanently? Documents: ${selectedForDelete}`)) {
      try {
        await deleteDocumentsBatchMutation.mutateAsync(selectedForDelete);
        setSelectedForDelete([]);
      } catch (error) {
        console.error('Error deleting documents:', error);
      }
    }
  };

  // Bolds 'Create new group' -text in select-dropdown
  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`px-3 py-2 cursor-pointer ${data.isBold ? 'font-bold' : ''} hover:bg-gray-200`}
      >
        {data.label}
      </div>
    );
  };

  // Creates control component for React Select
  const ControlComponent = (props: ControlProps<any, false>) => (
    <div className="bg-gray-800 text-white pt-3 pr-2 pl-2 pb-2">
      <div className="pb-2">
        <p>Choose group</p>
      </div>
      <components.Control {...props} />
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Dropdown for Choose Group */}
      {!isCreatingGroup && (
        <div className="w-[450px] mt-12 mb-5">
          <Select
            name="choose"
            defaultValue={groupOptions.find((option) => option.value === selectedGroup)}
            components={{ Control: ControlComponent, Option: CustomOption }}
            options={groupOptions}
            onChange={(selectedOption: any) => {
              if (selectedOption.value === 'new')
                setIsCreatingGroup(true); // Show create group -form
              else setSelectedGroup(selectedOption.value); // Show selected choice
            }}
          />
        </div>
      )}

      <div className="flex justify-center w-full">
        {/* Table of documents or Create New Group */}
        <div
          className={`${
            isCreatingGroup
              ? 'inline-block px-4 py-6 mt-17 bg-gray-200 rounded shadow-md'
              : 'px-4 mb-25 md:px-10 lg:px-8 2xl:px-20 2xl:mx-80 py-6 bg-gray-200 w-full max-w-full md:max-w-[100%] lg:max-w-[95%] flex justify-center'
          }`}
        >
          {isCreatingGroup ? (
            <GroupForm
              documents={documents}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              selectedDocuments={selectedDocuments}
              onChangeDocument={handleDocumentChange}
              onCancel={() => setIsCreatingGroup(false)}
              onSubmit={handleCreateGroup}
            />
          ) : (
            <GroupTable
              selectedGroup={selectedGroup}
              groups={groups}
              documents={documents}
              addedToGroup={addedToGroup}
              selectedForDelete={selectedForDelete}
              setSelectedForDelete={setSelectedForDelete}
              onAdd={addDocumentToGroup}
              onRemove={removeDocumentFromGroup}
              onDelete={handleDeleteDocument}
              onDeleteGroup={(groupId) => handleDeleteGroup(Number(groupId))}
              onDeleteMany={handleDeleteDocumentsBatch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
