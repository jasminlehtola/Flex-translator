
//----------------- Inner helper functions START -----------------
function containsOnlyWhitespace(str: string) {
    return /^\s*$/.test(str);
  }

  function appendWhitespaceElements(strings: string[]): string[] {
    if (strings.length === 0) {
      return []; // Return an empty array if input is empty
    }

    let result: string[] = [];
    let whitespaceBuffer: string = '';

    for (let i = 0; i < strings.length; i++) {
      if (containsOnlyWhitespace(strings[i])) {
        // Accumulate whitespace elements in a buffer
        whitespaceBuffer += strings[i];
      } else {
        if (whitespaceBuffer.length > 0) {
          if (result.length > 0) {
            // Append whitespace to the previous non-whitespace element
            result[result.length - 1] += whitespaceBuffer;
          } else {
            // If there is no previous element, append whitespace to the current element
            strings[i] = whitespaceBuffer + strings[i];
          }
          // Clear the whitespace buffer after appending
          whitespaceBuffer = '';
        }
        result.push(strings[i]);
      }
    }

    // If there's whitespace at the end, append it to the last element
    if (whitespaceBuffer.length > 0 && result.length > 0) {
      result[result.length - 1] += whitespaceBuffer;
    }

    return result;
  }

//----------------- Inner helper functions END -----------------
  /**
   *
   * @param input a individual chunk that is broken down into paragraphs and code blocks.
   * @returns array of the input paragraphs.
   */
  export function splitInputIntoCodeAndTextChunks(input: string): string[] {
    const chunks: string[] = [];
    let buffer = '';
    let isCodeBlock = false;
    // if input is null, return empty array instead of null
    if (input === null) return []
    const lines = input.split('\n');

    lines.forEach((line) => {
      const lineIsEmptyOrContainsOnlyWhiteSpace = containsOnlyWhitespace(line) || line === "";
      const isSeparator = (!!(line.match(/^\s*```/)) || !line.includes("```")) && !lineIsEmptyOrContainsOnlyWhiteSpace;
      //console.log(line +"  " + isSeparator)
      if (isSeparator && !isCodeBlock) {
        // Start a new chunk
        if (buffer) {
          chunks.push(buffer);
          buffer = '';
        }
        buffer += line + '\n';
        if (line.match(/^\s*```/)) {
          isCodeBlock = true;
        }
        // Code block ends so save the current buffer to chunks and set the buffer ''
      } else if (isCodeBlock && line.match(/^\s*```/)) {
        buffer += line + '\n';
        if (buffer) {
          chunks.push(buffer);
          buffer = '';
        }
        isCodeBlock = false;
      } else if (isCodeBlock) {
        buffer += line + '\n';
      }
      else {
        // Just save the line to buffer
        buffer += line + '\n';
        if (buffer && !lineIsEmptyOrContainsOnlyWhiteSpace) {
          chunks.push(buffer);
          buffer = '';
        }
      }
    });

    if (buffer) {
      chunks.push(buffer);
    }
    const answer = appendWhitespaceElements(chunks);
    return answer;
  }

