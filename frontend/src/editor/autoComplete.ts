import { resizeTextarea, updateHighlighting } from "../highlight";
import { textArea } from "../main";

/**
 * Automatically completes brackets and quotes when the user types an opening character.
 * @param {KeyboardEvent} event - The keyboard event triggered by the user.
 */
export function astAutoComplete(event: KeyboardEvent) {
  const char = event.key;

  if (["(", "{", "[", '"', "'", "`"].includes(char)) {
    event.preventDefault();

    const cursorPos = textArea.selectionStart;

    const value = textArea.value;
    let insertText;
    switch (char) {
      case "(":
        insertText = "()";
        break;
      case "{":
        insertText = "{}";
        break;
      case "[":
        insertText = "[]";
        break;
      case '"':
        insertText = '""';
        break;
      case "'":
        insertText = "''";
        break;
      case "`":
        insertText = "``";
        break;
    }

    textArea.value =
      value.substring(0, cursorPos) + insertText + value.substring(cursorPos);
    updateHighlighting();
    resizeTextarea();

    textArea.selectionStart = textArea.selectionEnd = cursorPos + 1;
  }
}
