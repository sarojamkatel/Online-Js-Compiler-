import NotFoundError from "../error/NotFoundError";
import * as FileModal from "../model/file";

/**
 * Retrieves a list of files for a specific user.
 * @param {string} userId - The ID of the user whose files are to be retrieved.
 * @returns {Promise<IFile[]>} A promise that resolves to the list of files.
 */
export function getFiles(userId: string) {
  const data = FileModal.FileModal.getFiles(userId);
  return data;
}

/**
 * Creates a new file for a specific user.
 * @param {string} fileName - The name of the file to be created.
 * @param {string} userId - The ID of the user for whom the file is created.
 * @param {string} fileData - The content of the file.
 * @returns {Promise<void>} A promise that resolves when the file is successfully created.
 */
export function createFile(fileName: string, userId: string, fileData: string) {
  FileModal.FileModal.createFile(fileName, userId, fileData);
}

/**
 * Renames an existing file for a specific user.
 * @param {string} oldFileName - The current name of the file to be renamed.
 * @param {string} newFileName - The new name for the file.
 * @param {string} userId - The ID of the user who owns the file.
 * @returns {Promise<{ oldFileName: string; newFileName: string }>} A promise that resolves with the old and new file names if successful.
 * @throws {NotFoundError} If the file to rename does not exist.
 * @throws {Error} If a file with the new name already exists.
 */
export async function updateFile(
  oldFileName: string,
  newFileName: string,
  userId: string
) {
  try {
    await FileModal.FileModal.renameFile(oldFileName, newFileName, userId);
    return { oldFileName, newFileName };
  } catch (error) {
    if (error.message === "File not found") {
      throw new NotFoundError(`File ${oldFileName} not found`);
    } else if (error.message === "A file with the new name already exists") {
      throw new Error(`A file named ${newFileName} already exists`);
    } else {
      throw error;
    }
  }
}

/**
 * Deletes a specific file for a user.
 * @param {string} fileName - The name of the file to be deleted.
 * @param {string} userId - The ID of the user who owns the file.
 * @returns {Promise<void>} A promise that resolves when the file is successfully deleted.
 * @throws {NotFoundError} If the file to delete does not exist.
 */
export async function deleteFile(fileName: string, userId: string) {
  try {
    await FileModal.FileModal.deleteFile(fileName, userId);
  } catch (error) {
    if (error.message === "File not found") {
      throw new NotFoundError(`File with name ${fileName} not found`);
    }
    throw error;
  }
}
