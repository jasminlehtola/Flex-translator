/**
 * wordDifference.ts
 *
 * Utility function for comparing two strings and highlighting word-level differences.
 * Uses the `diffWords` function from the `diff` library to detect added or removed words.
 *
 * Features:
 * - Identifies and labels added and deleted words between original and modified strings
 * - Returns a formatted string describing the changes
 * - Ignores unchanged words
 *
 * Example output:
 *   Added: "new word" | Deleted: "old word"
 *
 * Used in:
 * - Analytics or audit features to track user edits to translations
 * - Debugging or logging tools to show what's been changed
 */

import { diffWords } from 'diff';

export default function wordDifference(original: string, modified: string): string {
  const changes = diffWords(original, modified);
  return changes
    .map((part) => {
      if (part.added) return `Added: "${part.value.trim()}"`;
      if (part.removed) return `Deleted: "${part.value.trim()}"`;
      return '';
    })
    .filter(Boolean)
    .join(' | ');
}

// THE OLD ONE: TREATS CHANGES WORD BY WORD
/* export default function wordDifference(oldString: string, newString: string): string | null {
  if (oldString.trim() === newString.trim()) return null;

  const oldWords = oldString.trim().split(/\s+/);
  const newWords = newString.trim().split(/\s+/);

  // Jos toinen teksti on tyhjä
  if (oldWords.length === 0) return `"" → ${newWords.join(' ')}`;
  if (newWords.length === 0) return `${oldWords.join(' ')} → ""`;

  const diffs: string[] = [];
  let i = 0,
    j = 0;

  while (i < oldWords.length || j < newWords.length) {
    const oldWord = oldWords[i];
    const newWord = newWords[j];

    if (oldWord === newWord) {
      i++;
      j++;
    } else {
      const oldStart = i;
      const newStart = j;

      // find the end of the change sequence
      while (i < oldWords.length && j < newWords.length && oldWords[i] !== newWords[j]) {
        i++;
        j++;
      }

      // jos kumpikaan ei liikkunut, siirrytään eteenpäin ettei jäädytä
      if (i === oldStart && j === newStart) {
        i++;
        j++;
      }

      const oldSegment = oldWords.slice(oldStart, i).join(' ') || '""';
      const newSegment = newWords.slice(newStart, j).join(' ') || '""';
      diffs.push(`${oldSegment} → ${newSegment}`);
    }
  }

  return diffs.length ? diffs.join(' | ') : null;
}
*/

/*
// THIS WORKS FINE IF THE MODIFICATIONS ARE MINOR, CONSISTING OF SINGULAR WORDS
// FOR EXAMPLE "2010" TO "1999"

export default function wordDifference(oldString: string, newString: string): string | null {
  if (oldString.trim() === newString.trim()) return null;

  const oldWords = oldString.split(/\s+/);
  const newWords = newString.split(/\s+/);

  const changes: string[] = [];
  const length = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < length; i++) {
    if (oldWords[i] !== newWords[i]) {
      changes.push(`${oldWords[i] ?? '""'} → ${newWords[i] ?? '""'}`);
    }
  }
  return changes.length ? changes.join(', ') : null;
}
*/
