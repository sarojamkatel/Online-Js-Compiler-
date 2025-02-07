import { editor, suggestions } from ".";
import { updateHighlighting } from "../highlight";
import { ICompletionItem } from "../interface/lsp";
import "../style.css";
import { MovementDelta } from "../types/lsp";
import { errorsDiv } from "./errors";
export let selectedIndex = -1;
export let currentCompletions: ICompletionItem[] = [];

/**
 * Displays the completion suggestions in the suggestions box.
 * @param {ICompletionItem[]} completions - The list of completion items to display.
 */
export function showSuggestions(completions: ICompletionItem) {
  if (!Array.isArray(completions)) {
    console.error("Received invalid completion data:", completions);
    return;
  }

  const cursorPosition = editor.selectionStart;
  const code = editor.value.substring(0, cursorPosition);
  const match = code.match(/(?:\w+|\.)+$/);
  const lastWord = match ? match[0] : "";

  // Filter completions based on the last word
  currentCompletions = completions.filter((item) =>
    item.name
      .toLowerCase()
      .startsWith(lastWord.split(".").pop()?.toLowerCase() || "")
  );

  suggestions.innerHTML = "";
  selectedIndex = -1;
  if (currentCompletions.length === 0 || lastWord.trim().length === 0) {
    suggestions.style.display = "none";
    return;
  }

  currentCompletions.forEach((item, index) => {
    const div = document.createElement("div");
    div.textContent = `${item.name} (${item.kind})`;
    // to apply suggestion with  arrow key
    div.dataset.index = String(index);
    div.onclick = () => {
      applySuggestion(item.name);
    };
    suggestions.appendChild(div);
  });
  positionSuggestions();
  suggestions.style.display = "block";
}

/**
 * Positions the suggestions box based on the editor's scroll and cursor position.
 */
export function positionSuggestions() {
  const rect = editor.getBoundingClientRect();
  // The Window.getComputedStyle() method returns an object containing
  // the values of all CSS properties of an element,
  const lineHeight = parseFloat(window.getComputedStyle(editor).lineHeight);
  const charWidth = 8;
  const offset = 45;

  const lines = editor.value.substring(0, editor.selectionStart).split("\n");
  const currentLineNumber = lines.length;
  const currentColumnNumber = lines[lines.length - 1].length;

  // Calculate the position based on scroll and cursor position
  const top =
    rect.top + (currentLineNumber - 1) * lineHeight - editor.scrollTop + offset;
  const left = rect.left + currentColumnNumber * charWidth - editor.scrollLeft;

  // Set the position of the suggestions box
  suggestions.style.left = `${left}px`;
  suggestions.style.top = `${top}px`;
}
/**
 * Moves the selection of the suggestion box up or down.
 * @param {MovementDelta} delta - The direction to move the selection. `-1` for up, `1` for down.
 */
export function moveSelection(delta: MovementDelta) {
  const items = suggestions.querySelectorAll("div");
  if (items.length === 0) return;

  selectedIndex = (selectedIndex + delta + items.length) % items.length;
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("selected");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("selected");
    }
  });
}
/**
 * Applies the selected suggestion to the editor.
 * @param {string} name - The name of the suggestion to apply.
 */
export function applySuggestion(name: string) {
  const currentValue = editor.value;
  const cursorPosition = editor.selectionStart;
  const beforeCursor = currentValue.substring(0, cursorPosition);
  const afterCursor = currentValue.substring(cursorPosition);
  const lastDotIndex = beforeCursor.lastIndexOf(".");
  const lastWordStartIndex = beforeCursor.search(/\S+$/);

  let newValue;
  if (lastDotIndex > lastWordStartIndex) {
    newValue = beforeCursor.substring(0, lastDotIndex + 1) + name + afterCursor;
  } else {
    newValue =
      beforeCursor.substring(0, lastWordStartIndex) + name + afterCursor;
  }

  editor.value = newValue;
  const newCursorPosition = newValue.length - afterCursor.length;
  editor.setSelectionRange(newCursorPosition, newCursorPosition);
  editor.focus();

  // Hide suggestions
  suggestions.style.display = "none";
  currentCompletions = [];

  // Update highlighting after applying suggestion
  updateHighlighting();

  // clear error after apply changes
  clearErrors();
}

/**
 * Clears all displayed errors.
 */
export function clearErrors() {
  errorsDiv.style.display = "none";
  errorsDiv.innerHTML = "";
}
