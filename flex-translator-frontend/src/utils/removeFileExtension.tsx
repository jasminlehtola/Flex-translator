/**
 * Removes file extension and returns only the name.
 * @param {string} filename - Whole filename
 * @returns {string} Only the nime without the extension
 */

export function removeFileExtension(filename: String) {
  if (typeof filename !== 'string') return '';

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;

  return filename.substring(0, lastDotIndex);
}
