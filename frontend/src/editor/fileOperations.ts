import axios from "axios";
import {
  BOTTOM_OFFSET,
  LEFT_OFFSET,
  MID_SCREEN_OFFSET,
  SMALL_SCREEN_OFFSET,
} from "../constants/file";
import { HTTPSSTATUS } from "../enums/httpStatus";
import { updateHighlighting } from "../highlight";
import { addFileBtn, textArea } from "../main";
import { lineNumbers, updateLineNumbers } from "./lineNumbers";

const filesWrapper = document.getElementById("files") as HTMLDivElement;
const whiteLine = document.getElementById("whiteLine") as HTMLParagraphElement;

export const defaultFileName = "index.js";
const defaultFileData =
  '// Your JavaScript code here \nconsole.log("Hello, patan!")';
export let currentFileName = defaultFileName;

/**
 * Retrieves the access token from local storage.
 * @returns {string | null} The access token or null if not found.
 */
export const getAccessToken = (): string | null => {
  const userCredentials = sessionStorage.getItem("userCredentials");

  if (userCredentials) {
    const [accessToken] = JSON.parse(userCredentials);
    return accessToken || null;
  }
  return null;
};

/**
 * Initializes local storage with default file data if no access token is found.
 * Loads and displays files from local storage.
 */
export const initializeLocalStorage = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    clearJsFilesFromLocalStorage();
    localStorage.setItem(defaultFileName, defaultFileData);
    whiteLine.style.display = "block";
    whiteLine.style.left = "0px"; // Your JavaScript code here
  }
  await loadAndDisplayFiles();
};

/**
 * Clears all JavaScript files from local storage.
 */
export const clearJsFilesFromLocalStorage = () => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.endsWith(".js")) {
      localStorage.removeItem(key);
    }
  }
};

/**
 * Loads and displays files from local storage or backend.
 * Updates the UI with file buttons and content.
 */
export const loadAndDisplayFiles = async () => {
  filesWrapper
    .querySelectorAll(".file-button")
    .forEach((button) => button.remove());

  const accessToken = getAccessToken();
  if (accessToken) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/files`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      clearJsFilesFromLocalStorage();
      if (Array.isArray(response.data.data)) {
        response.data.data.forEach(
          (file: { fileName: string; fileData: string }) => {
            localStorage.setItem(file.fileName, file.fileData);
          }
        );
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }

  const jsFiles = Object.keys(localStorage).filter((key) =>
    key.endsWith(".js")
  );
  jsFiles.forEach(createFileButton);

  if (jsFiles.length > 0) {
    loadFile(jsFiles[0]);
  } else {
    textArea.value = "";
    updateLineNumbers();
  }
  updateHighlighting();
};

/**
 * Creates a button for each file with options to rename or delete.
 * @param {string} fileName - The name of the file.
 */
const createFileButton = (fileName: string): HTMLButtonElement => {
  const fileBtn = document.createElement("button");
  fileBtn.className = "file-button";

  const fileNameText = document.createElement("span");
  fileNameText.className = "file-name";
  fileNameText.textContent = fileName;

  const buttonWrapper = document.createElement("span");
  buttonWrapper.className = "button-wrapper";
  buttonWrapper.style.display = "flex";

  const renameButton = createRenameButton(fileNameText);
  const deleteButton = createDeleteButton(fileBtn);

  buttonWrapper.appendChild(renameButton);
  buttonWrapper.appendChild(deleteButton);

  fileBtn.appendChild(fileNameText);
  fileBtn.appendChild(buttonWrapper);

  fileBtn.addEventListener("click", () => {
    updateWhiteLinePosition(fileBtn, buttonWrapper, fileNameText);
    loadFile(fileNameText.textContent);
    updateHighlighting();
  });

  filesWrapper.insertBefore(fileBtn, addFileBtn);
  return fileBtn;
};

/**
 * Updates the position of the white line indicator.
 * @param {HTMLButtonElement} fileBtn - The button representing the file.
 * @param {HTMLSpanElement} buttonWrapper - The wrapper containing the buttons.
 * @param {HTMLSpanElement} fileNameText - The span element containing the file name.
 */
const updateWhiteLinePosition = (
  fileBtn: HTMLButtonElement,
  buttonWrapper: HTMLSpanElement,
  fileNameText: HTMLSpanElement
) => {
  requestAnimationFrame(() => {
    const rect = fileBtn.getBoundingClientRect();
    const buttonWrapperRect = buttonWrapper.getBoundingClientRect();
    console.log(buttonWrapperRect);
    const fileNameRect = fileNameText.getBoundingClientRect();
    whiteLine.style.width = `${buttonWrapperRect.width + fileNameRect.width}px`;

    whiteLine.style.top = `${rect.bottom - BOTTOM_OFFSET}px`;
    whiteLine.style.left = `${fileNameRect.left - LEFT_OFFSET}px`;
    const isMidScreen = window.innerWidth < 737;
    if (isMidScreen) {
      whiteLine.style.top = `${rect.bottom - MID_SCREEN_OFFSET}px`;
    }
    const isSmallScreen = window.innerWidth < 412;
    if (isSmallScreen) {
      whiteLine.style.top = `${rect.bottom - SMALL_SCREEN_OFFSET}px`;
    }
  });
};

/**
 * Loads the content of a file into the textarea.
 * @param {string | null} fileName - The name of the file to load.
 */
export const loadFile = (fileName: string | null) => {
  if (fileName) {
    const fileData = localStorage.getItem(fileName);
    if (fileData) {
      textArea.value = fileData;
      updateLineNumbers();
      currentFileName = fileName;
    } else {
      textArea.value = "";
      updateLineNumbers();
      currentFileName = fileName;
      whiteLine.style.display = "none";
    }
  }
  whiteLine.style.display = "block";
  textArea.style.display = "block";
  lineNumbers.style.display = "block";
};
export const saveOnLocalStorage = async (
  fileName: string,
  fileData: string
) => {
  localStorage.setItem(fileName, fileData);
};

/**
 * Saves a file to local storage and backend.
 * @param {string} fileName - The name of the file.
 * @param {string} fileData - The content of the file.
 */
export const saveFile = async (fileName: string, fileData: string) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/files`,
        {
          fileName,
          fileData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving file to backend:", error);
    }
  }
};

/**
 * Loads the first JavaScript file from local storage if available.
 */
const loadFirstFile = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(".js")) {
      loadFile(key);
      return;
    }
  }
  textArea.value = "";
  updateLineNumbers();
};

/**
 * Fetches files from the backend and updates the UI.
 * Handles token expiration and refresh logic.
 */
export const fetchFilesFromBackend = async () => {
  const accessToken = getAccessToken();
  if (accessToken) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/files`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.endsWith(".js")) {
          localStorage.removeItem(key);
        }
      }
      // Check if response.data.data exists and is an array
      if (response.data && Array.isArray(response.data.data)) {
        response.data.data.forEach(
          (file: { fileName: string; fileData: string }) => {
            localStorage.setItem(file.fileName, file.fileData);
          }
        );
      } else {
        console.error("Unexpected response structure:", response.data);
      }

      loadAndDisplayFiles();
      loadFirstFile();
      updateHighlighting();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === HTTPSSTATUS.Unauthorized
      ) {
        console.log("Token might be expired, attempting to refresh...");
      }
    }
  } else {
    loadAndDisplayFiles();
    loadFirstFile();
    updateHighlighting();
  }
};

/**
 * Adds a new JavaScript file with default content.
 */
export const addFile = async () => {
  const jsFiles = Object.keys(localStorage).filter((key) =>
    key.endsWith(".js")
  );
  const fileCount = jsFiles.length;
  const fileName = `script${fileCount + 1}.js`;
  const fileData = '// Your JavaScript code here \nconsole.log("new file")';
  await saveFile(fileName, fileData);
  const newFileButton = createFileButton(fileName);
  newFileButton.click();

  // Force the DOM to update before calculating positions
  requestAnimationFrame(() => {
    const fileNameText = newFileButton.querySelector(
      ".file-name"
    ) as HTMLSpanElement;
    const buttonWrapper = newFileButton.querySelector(
      ".button-wrapper"
    ) as HTMLSpanElement;

    updateWhiteLinePosition(newFileButton, buttonWrapper, fileNameText);
  });

  updateHighlighting();
};

/**
 * Creates a rename button for file buttons.
 * @param {HTMLSpanElement} fileNameText - The span element containing the file name.
 * @returns {HTMLButtonElement} The rename button element.
 */
const createRenameButton = (fileNameText: HTMLSpanElement) => {
  const renameButton = document.createElement("button");
  renameButton.className = "rename-button";
  renameButton.innerHTML =
    '<iconify-icon icon="solar:pen-bold"></iconify-icon>';
  renameButton.addEventListener("click", async () => {
    let newFileName = prompt(
      "Enter a new filename",
      fileNameText.textContent || ""
    );
    if (newFileName) {
      if (!newFileName.endsWith(".js")) {
        newFileName += ".js";
      }

      if (newFileName !== fileNameText.textContent) {
        const oldFileName = fileNameText.textContent!;
        const accessToken = getAccessToken();

        try {
          if (accessToken) {
            await axios.put(
              `${import.meta.env.VITE_BASE_URL}/files/rename`,
              { oldFileName, newFileName },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          }
          const fileData = localStorage.getItem(oldFileName);
          localStorage.removeItem(oldFileName);
          fileNameText.textContent = newFileName;
          localStorage.setItem(newFileName, fileData || "");
          currentFileName = newFileName;
        } catch (error) {
          console.error("Error renaming file:", error);
          alert("Failed to rename file. Please try again.");
        }
      }
    }
  });
  return renameButton;
};

/**
 * Creates a delete button for file buttons.
 * @param {HTMLButtonElement} file - The button representing the file.
 * @returns {HTMLButtonElement} The delete button element.
 */
const createDeleteButton = (file: HTMLButtonElement) => {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.innerHTML =
    '<iconify-icon icon="material-symbols:close"></iconify-icon>';
  deleteButton.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this file?")) {
      const fileName = (file.querySelector(".file-name") as HTMLSpanElement)
        .textContent!;
      file.remove();
      localStorage.removeItem(fileName);
      const accessToken = getAccessToken();
      if (accessToken) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_BASE_URL}/files/${fileName}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (error) {
          console.error("Error deleting file from backend:", error);
        }
      }

      updateCurrentFileAfterDeletion(fileName);
    }
  });
  return deleteButton;
};

/**
 * Updates the currently displayed file after a file has been deleted.
 * @param {string} deletedFileName - The name of the deleted file.
 */
const updateCurrentFileAfterDeletion = (deletedFileName: string) => {
  if (deletedFileName === currentFileName) {
    const jsFiles = Object.keys(localStorage).filter((key) =>
      key.endsWith(".js")
    );
    if (jsFiles.length > 0) {
      loadFile(jsFiles[jsFiles.length - 1]);
    } else {
      textArea.value = "";
      textArea.style.display = "none";
      lineNumbers.style.display = "none";
      currentFileName = "";
      updateLineNumbers();
    }
  }
};
