/**
 * AddToGroupSelector.tsx
 *
 * Dropdown component for adding a document to a group.
 * Filters out groups the document already belongs to or those explicitly excluded.
 *
 * Props:
 * - documentId: ID of the document to add to a group
 * - groups: list of all available groups
 * - onAdd: callback triggered when a group is selected
 * - excludeGroupIds (optional): group IDs to exclude from the dropdown
 * - feedbackLabel (optional): label shown after adding (default: "Added!")
 * - addedToGroupName (optional): if present, triggers feedback display
 */

import Select from 'react-select';
import type { Group } from '../types/types.ts';

interface AddToGroupSelectorProps {
  documentId: number;
  groups: Group[];
  onAdd: (docId: number, groupId: number) => void;
  excludeGroupIds?: number[];
  feedbackLabel?: string;
  addedToGroupName?: string | null;
}

const AddToGroupSelector = ({
  documentId,
  groups,
  onAdd,
  excludeGroupIds = [],
  feedbackLabel = '✅ Added!',
  addedToGroupName = null,
}: AddToGroupSelectorProps) => {
  // Filter out groups that already include the document or are explicitly excluded
  const availableGroups = groups.filter(
    (group) => !group.documents.includes(documentId) && !excludeGroupIds.includes(group.id)
  );

  return (
    <Select
      className={`w-38 text-sm transition duration-300 ${addedToGroupName ? 'bg-green-100 border-green-400' : ''}`}
      options={availableGroups.map((group) => ({
        value: group.id,
        label: `Add to ${group.name}`,
      }))}
      value={addedToGroupName ? { value: '', label: `${feedbackLabel}` } : null}
      onChange={(option) => {
        if (option) onAdd(Number(option.value), documentId);
      }}
      placeholder="Add to group"
      isSearchable={false}
    />
  );
};

export default AddToGroupSelector;
