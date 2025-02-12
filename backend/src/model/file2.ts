import fs from "fs/promises";
import path from "path";
import { IFile } from "../interfaces/file";

/**
 * Class to handle file operations for user-specific directories.
 */
export class FileModal {
  /**
   * Gets the directory path for user files.
   * @param userId - The ID of the user.
   * @returns The directory path as a string.
   */
  private static getFilesDir(userId: string): string {
    return path.join(__dirname, `../code/${userId}`);
  }

  /**
   * Creates a new file for a specific user.
   * @param fileName - The name of the file to create.
   * @param userId - The ID of the user.
   * @param fileData - The content to write into the file.
   * @throws Will throw an error if file creation fails.
   */
  static async createFile(fileName: string, userId: string, fileData: string) {
    const FILES_DIR = this.getFilesDir(userId);

    // Ensure files directory exists
    try {
      await fs.access(FILES_DIR);
    } catch {
      // Directory does not exist, create it recursively
      await fs.mkdir(FILES_DIR, { recursive: true });
    }

    const filePath = path.join(FILES_DIR, fileName);

    // Write the file content
    try {
      await fs.writeFile(filePath, fileData, "utf8");
      console.log(`File created successfully at ${filePath}`);
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Could not create file: ${error.message}`);
    }
  }

  /**
   * Retrieves all files for a specific user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of files.
   * @throws Will throw an error if file reading fails.
   */
  static async getFiles(userId: string): Promise<IFile[]> {
    const FILES_DIR = this.getFilesDir(userId);
    console.log("it comes in getfile", FILES_DIR);

    try {
      await fs.access(FILES_DIR);
    } catch {
      // If the directory doesn't exist, return an empty array
      return [];
    }

    const fileNames = await fs.readdir(FILES_DIR);
    const files: IFile[] = [];

    for (const fileName of fileNames) {
      const filePath = path.join(FILES_DIR, fileName);
      const fileData = await fs.readFile(filePath, "utf-8");
      files.push({ fileName, fileData });
    }

    return files;
  }

  /**
   * Deletes a specific file for a user.
   * @param fileName - The name of the file to delete.
   * @param userId - The ID of the user.
   * @throws Will throw an error if file deletion fails.
   */
  static async deleteFile(fileName: string, userId: string): Promise<void> {
    const FILES_DIR = this.getFilesDir(userId);
    const filePath = path.join(FILES_DIR, fileName);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error("File not found");
      }
      throw error;
    }
  }

  /**
   * Renames a specific file for a user.
   * @param oldFileName - The current name of the file.
   * @param newFileName - The new name of the file.
   * @param userId - The ID of the user.
   * @throws Will throw an error if file renaming fails.
   */
  static async renameFile(
    oldFileName: string,
    newFileName: string,
    userId: string
  ): Promise<void> {
    const FILES_DIR = this.getFilesDir(userId);
    const oldFilePath = path.join(FILES_DIR, oldFileName);
    const newFilePath = path.join(FILES_DIR, newFileName);

    try {
      // Check if the old file exists
      await fs.access(oldFilePath);

      // Check if the new file name already exists
      try {
        await fs.access(newFilePath);
        throw new Error("A file with the new name already exists");
      } catch (error) {
        // If the new file doesn't exist, proceed with renaming
        if (error.code === "ENOENT") {
          await fs.rename(oldFilePath, newFilePath);
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error("File not found");
      }
      throw error;
    }
  }
}
