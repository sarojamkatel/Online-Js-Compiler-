import { textArea } from "../main";
export const lineNumbers = document.getElementById(
  "line-numbers"
) as HTMLDivElement;

/**
 * Updates the line numbers in the `lineNumbers` element based on the current content of the `textArea`.
 * This function calculates the number of lines in the text area and updates the line numbers accordingly.
 */
export const updateLineNumbers = () => {
  const lines = textArea.value.split("\n").length;
  let lineNumberText = "";
  for (let i = 1; i <= lines; i++) {
    lineNumberText += `${i}\n`;
  }
  lineNumbers.textContent = lineNumberText;
};
