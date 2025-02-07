import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import "./style.css";

const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
export const highlightedCode = document.getElementById(
  "highlighted-code"
) as HTMLPreElement;
const highlightDiv = document.getElementById("highlight") as HTMLDivElement;

/**
 * Updates the syntax highlighting of the code in the textarea.
 */
export function updateHighlighting() {
  let code = textarea.value;

  const highlightedHTML = Prism.highlight(
    code,
    Prism.languages.javascript,
    "javascript"
  );

  highlightedCode.innerHTML = highlightedHTML;

  // Synchronize scroll position between the textarea and highlighted code
  highlightedCode.scrollTop = textarea.scrollTop;
  highlightedCode.scrollLeft = textarea.scrollLeft;
}

/**
 * Adjusts the height of the textarea to fit its content.
 */
export function resizeTextarea() {
  // textarea.style.height = "auto";
  // textarea.style.height = textarea.scrollHeight + "px";
}

/**
 * Updates the position and height of the highlight div based on the current selection.
 */
export const handleSelectionChange = () => {
  if (document.activeElement === textarea) {
    const start = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, start);
    const linesBefore = textBefore.split("\n");
    const currentLineNumber = linesBefore.length;

    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const lineTop = (currentLineNumber - 1) * lineHeight;

    highlightDiv.style.top = `${lineTop}px`;
    highlightDiv.style.height = `${lineHeight}px`;
  }
};
