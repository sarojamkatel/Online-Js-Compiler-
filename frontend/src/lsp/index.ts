import io from "socket.io-client";
import { resizeTextarea, updateHighlighting } from "../highlight";
import "../style.css";
import { showErrors } from "./errors";
import {
  applySuggestion,
  currentCompletions,
  moveSelection,
  positionSuggestions,
  selectedIndex,
  showSuggestions,
} from "./suggestion";
export const errorsDiv = document.getElementById("errors") as HTMLDivElement;
export const socket = io("http://localhost:8080", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
export const editor = document.getElementById(
  "textarea"
) as HTMLTextAreaElement;
export const suggestions = document.getElementById(
  "suggestions"
) as HTMLDivElement;

socket.on("connect", () => {
  console.log("Connected to server");
});

editor.addEventListener("input", () => {
  const code = editor.value;
  updateHighlighting();
  resizeTextarea();
  if (code.length === 0) {
    suggestions.style.display = "none";
    return;
  }
  socket.emit("codeUpdate", code);
  positionSuggestions();
});

/**
 * Handles error diagnostics received from the server.
 * Displays errors in the `errorsDiv` element.
 * @param {IDiagnosticError[]} diagnostics - The list of diagnostic errors.
 */
socket.on("diagnostics", (diagnostics) => {
  showErrors(diagnostics);
});

/**
 * Handles completion suggestions received from the server.
 * Displays suggestions in the `suggestions` element.
 *
 * @param {any} data - The completion data from the server.
 */
socket.on("completion", (data) => {
  let entries;
  if (Array.isArray(data)) {
    entries = data;
  } else if (data && Array.isArray(data.entries)) {
    entries = data.entries;
  } else {
    return;
  }
  showSuggestions(entries);
});

editor.addEventListener("scroll", positionSuggestions);
window.addEventListener("resize", positionSuggestions);
editor.addEventListener("scroll", () => {
  if (suggestions.style.display === "block") {
    positionSuggestions();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    suggestions.style.display = "none";
  }
});

editor.addEventListener("keydown", (e) => {
  if (suggestions.style.display === "block") {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < currentCompletions.length) {
        applySuggestion(currentCompletions[selectedIndex].name);
      }
    }
  }
});
