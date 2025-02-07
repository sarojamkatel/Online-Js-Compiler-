import { IDiagnosticError } from "../interface/lsp";

export const errorsDiv = document.getElementById("errors") as HTMLDivElement;

/**
 * Displays a list of error diagnostics in the `errorsDiv` element.
 * The `errorsDiv` element is shown if there are any diagnostics and hidden if there are none.
 * Each diagnostic error is displayed with its code, message, line, and column information.
 *
 * @param {IDiagnosticError[]} diagnostics - An array of diagnostic errors to display.
 */
export function showErrors(diagnostics: IDiagnosticError[]) {
  if (Object.keys(diagnostics).length >= 1) {
    errorsDiv.style.display = "block";
  } else {
    errorsDiv.style.display = "none";
  }
  errorsDiv.innerHTML = "";
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "x";
  closeBtn.classList.add("closeBtn");
  errorsDiv.appendChild(closeBtn);
  closeBtn.addEventListener("click", () => {
    errorsDiv.style.display = "none";
  });

  diagnostics.forEach((error: IDiagnosticError) => {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = `Error (${error.code}): ${error.text} at line ${error.start.line}, column ${error.start.offset}`;
    errorsDiv.appendChild(errorDiv);
  });
}
