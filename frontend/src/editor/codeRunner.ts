import { textArea } from "../main";
import { ConsoleMethod } from "../types/codeRun";

const output = document.getElementById("output") as HTMLParagraphElement;

/**
 * Executes the JavaScript code from the textarea within an iframe and captures console output and errors.
 * Updates the output element with the results or errors from the execution.
 */
export const runCode = async () => {
  const code = textArea.value;
  output.textContent = "";

  if (code.length === 0) {
    output.textContent = "Write something first";
    return;
  }

  // Create an iframe to execute the code
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // The contentWindow property returns the Window object of an HTMLIFrameElement
  //  if same origin with parents
  const iframeWindow = iframe.contentWindow as Window & { console: Console };
  const consoleMethods: ConsoleMethod[] = ["log", "error", "warn", "info"];

  consoleMethods.forEach((method) => {
    iframeWindow.console[method] = (...args: any[]) => {
      output.textContent += args.join(" ") + "\n";
    };
  });

  // output error handles
  iframeWindow.onerror = (message, source, lineno, colno, error) => {
    output.textContent += `Error: ${message} (line ${lineno}, column ${colno})\n`;
    return true;
  };

  try {
    // Execute the code within the iframe
    const script = iframeWindow.document.createElement("script");
    script.textContent = code;
    iframeWindow.document.body.appendChild(script);
  } catch (e) {
    output.textContent += `Error: ${
      e instanceof Error ? e.message : "An unknown error occurred"
    }\n`;
  } finally {
    document.body.removeChild(iframe);
  }
};
