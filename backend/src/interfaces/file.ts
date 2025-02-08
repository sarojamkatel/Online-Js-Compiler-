export interface IFile {
  fileName: string;
  fileData: string;
}
export interface HuffmanNode {
  char?: string;
  freq?: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}
