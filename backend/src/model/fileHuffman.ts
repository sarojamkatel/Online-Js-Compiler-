import fs from "fs/promises";
import path from "path";
import { IFile } from "../interfaces/file";
import { huffmanCompress, huffmanDecompress } from "./huffman";

// 1kb = to  balances compression benefits vs overhead costs
const COMPRESSION_THRESHOLD = 1024; // Only compress files larger than 1KB

export class FileModal {
  /**
   * Gets the directory path for user files
   */
  private static getFilesDir(userId: string): string {
    return path.join(__dirname, `../code/${userId}`);
  }

  /**
   * Creates file header for compressed data
   */
  private static createFileHeader(
    paddingBits: number,
    compressedSize: number,
    treeSize: number,
    isCompressed: boolean
  ): Buffer {
    const header = new Uint8Array(9); // 1 byte for flags, 4 bytes each for sizes
    header[0] = isCompressed ? 1 : 0;
    new DataView(header.buffer).setUint32(1, compressedSize, true); // DataView -- read and write in binary  1-byte position 1(1-4)
    // 5- setUint32(4 bytes) start from 5 
    new DataView(header.buffer).setUint32(5, treeSize, true); // true -- little-endian format(Most significant byte at lowest)  (5-8)
    return Buffer.from(header);
  }

  /**
   * Reads file header and returns metadata
   */
  private static readFileHeader(headerBuffer: Buffer): {
    isCompressed: boolean;
    compressedSize: number;
    treeSize: number;
  } {
    const view = new DataView(headerBuffer.buffer);
    return {
      isCompressed: headerBuffer[0] === 1,
      compressedSize: view.getUint32(1, true),
      treeSize: view.getUint32(5, true)
    };
  }

  /**
   * Creates a new file with optional compression
   */
  static async createFile(fileName: string, userId: string, fileData: string) {
    const FILES_DIR = this.getFilesDir(userId);

    try {
      await fs.access(FILES_DIR);
    } catch {
      await fs.mkdir(FILES_DIR, { recursive: true });
    }

    const filePath = path.join(FILES_DIR, fileName);
    const originalSize = new TextEncoder().encode(fileData).length;

    // Only compress if file is larger than threshold
    if (originalSize > COMPRESSION_THRESHOLD) {
      const { compressedData, tree, paddingBits, compressedSize } = huffmanCompress(fileData);

      // Only use compression if it actually reduces size
      if (compressedSize < originalSize) {
        const header = this.createFileHeader(paddingBits, compressedData.length, tree.length, true);
        const fileBuffer = Buffer.concat([
          header,
          Buffer.from(tree), // .from() create a new buffer
          Buffer.from(compressedData)
        ]);

        await fs.writeFile(filePath, fileBuffer);
        console.log(`File compressed: ${originalSize} -> ${fileBuffer.length} bytes`);
        return;
      }
    }

    // Store uncompressed if compression isn't beneficial
    const header = this.createFileHeader(0, originalSize, 0, false);
    const fileBuffer = Buffer.concat([
      header,
      Buffer.from(fileData, 'utf8')
    ]);

    await fs.writeFile(filePath, fileBuffer);
    console.log(`File stored uncompressed: ${fileBuffer.length} bytes`);
  }

  /**
   * Retrieves all files for a user
   */
  static async getFiles(userId: string): Promise<IFile[]> {
    const FILES_DIR = this.getFilesDir(userId);

    try {
      await fs.access(FILES_DIR);
    } catch {
      return [];
    }

    const fileNames = await fs.readdir(FILES_DIR);
    const files: IFile[] = [];

    for (const fileName of fileNames) {
      try {
        const filePath = path.join(FILES_DIR, fileName);
        const fileBuffer = await fs.readFile(filePath);

        // Read at least the header
        if (fileBuffer.length < 9) continue;

        const { isCompressed, compressedSize, treeSize } = this.readFileHeader(fileBuffer.slice(0, 9));
        let fileData: string;

        if (isCompressed) {
          const tree = fileBuffer.slice(9, 9 + treeSize);
          const compressedData = fileBuffer.slice(9 + treeSize, 9 + treeSize + compressedSize);
          fileData = huffmanDecompress(
            new Uint8Array(compressedData),
            new Uint8Array(tree),
            0
          );
        } else {
          fileData = fileBuffer.slice(9).toString('utf8'); // if not compress convert buffer to utf8
        }

        files.push({ fileName, fileData });
      } catch (error) {
        console.error(`Error reading file ${fileName}:`, error);
        continue;
      }
    }

    return files;
  }

  /**
   * Updates an existing file
   */
  static async updateFile(fileName: string, userId: string, newContent: string): Promise<void> {
    const FILES_DIR = this.getFilesDir(userId);
    const filePath = path.join(FILES_DIR, fileName);

    try {
      await fs.access(filePath);
      await this.createFile(fileName, userId, newContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  /**
   * Deletes a file
   */
  static async deleteFile(fileName: string, userId: string): Promise<void> {
    const FILES_DIR = this.getFilesDir(userId);
    const filePath = path.join(FILES_DIR, fileName);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  /**
   * Renames a file
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
      await fs.access(oldFilePath);

      try {
        await fs.access(newFilePath);
        throw new Error('A file with the new name already exists');
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.rename(oldFilePath, newFilePath);
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }
}
