import { HuffmanNode } from "../interfaces/file";
export type HuffmanTree = HuffmanNode | null;

/**
 * Convert a binary string to Uint8Array with efficient bit packing
 */
function binaryStringToUint8Array(binString: string): { data: Uint8Array, paddingBits: number } {
  const padding = 8 - (binString.length % 8);
  const paddedLength = binString.length + (padding === 8 ? 0 : padding);
  const bytes = new Uint8Array(paddedLength / 8);

  for (let i = 0; i < paddedLength; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      const bitIndex = i + j;
      if (bitIndex < binString.length && binString[bitIndex] === '1') {
        byte |= 1 << (7 - j);
      }
    }
    bytes[i / 8] = byte;
  }

  return { data: bytes, paddingBits: padding === 8 ? 0 : padding };
}

/**
 * Convert Uint8Array back to binary string
 */

function uint8ArrayToBinaryString(bytes: Uint8Array, paddingBits: number): string {
  let binString = "";
  for (let i = 0; i < bytes.length; i++) {
    binString += bytes[i].toString(2).padStart(8, "0");
  }
  return binString.slice(0, binString.length - paddingBits);
}

/**
 * Build an optimized Huffman tree
 */
function buildHuffmanTree(data: string): HuffmanTree {
  const freqArray = new Uint32Array(65536); // Support for full UTF-16

  for (let i = 0; i < data.length; i++) {
    freqArray[data.charCodeAt(i)]++;
  }

  const nodes: HuffmanNode[] = [];
  for (let i = 0; i < freqArray.length; i++) {
    if (freqArray[i] > 0) {
      nodes.push({
        char: String.fromCharCode(i),
        freq: freqArray[i]
      });
    }
  }

  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({
      freq: left.freq + right.freq,
      left,
      right
    });
  }

  return nodes[0];
}

/**
 * Serialize tree to binary format
 */
function serializeTree(node: HuffmanTree): Uint8Array {
  if (!node) return new Uint8Array();

  const parts: number[] = [];

  function serialize(node: HuffmanNode) {
    if (node.char !== undefined) {
      parts.push(1); // Leaf node
      parts.push(node.char.charCodeAt(0));
    } else {
      parts.push(0); // Internal node
      if (node.left) serialize(node.left);
      if (node.right) serialize(node.right);
    }
  }

  serialize(node);
  return new Uint8Array(parts);
}

/**
 * Deserialize tree from binary format
 */
function deserializeTree(data: Uint8Array): HuffmanTree {
  let index = 0;

  function deserialize(): HuffmanNode {
    const nodeType = data[index++];

    if (nodeType === 1) { // Leaf node
      return {
        char: String.fromCharCode(data[index++]),
        freq: 0 // Frequency not needed for decompression
      };
    } else { // Internal node
      const node: HuffmanNode = { freq: 0 };
      node.left = deserialize();
      node.right = deserialize();
      return node;
    }
  }

  return data.length > 0 ? deserialize() : null;
}

/**
 * Generate Huffman codes
 */
function generateHuffmanCode(node: HuffmanTree): Record<string, string> {
  const codes: Record<string, string> = {};

  function traverse(node: HuffmanNode, code: string) {
    if (node.char !== undefined) {
      codes[node.char] = code;
    }
    if (node.left) traverse(node.left, code + '0');
    if (node.right) traverse(node.right, code + '1');
  }

  if (node) traverse(node, '');
  return codes;
}

/**
 * Compress data using optimized Huffman coding
 */
export function huffmanCompress(data: string): {
  compressedData: Uint8Array,
  tree: Uint8Array,
  paddingBits: number,
  originalSize: number,
  compressedSize: number
} {
  if (!data) {
    return {
      compressedData: new Uint8Array(),
      tree: new Uint8Array(),
      paddingBits: 0,
      originalSize: 0,
      compressedSize: 0
    };
  }

  const originalSize = new TextEncoder().encode(data).length;
  const tree = buildHuffmanTree(data);
  const codes = generateHuffmanCode(tree);

  const binaryString = Array.from(data).map(char => codes[char]).join('');
  const { data: compressedData, paddingBits } = binaryStringToUint8Array(binaryString);
  const serializedTree = serializeTree(tree);

  const compressedSize = compressedData.length + serializedTree.length + 8; // +8 for metadata

  return {
    compressedData,
    tree: serializedTree,
    paddingBits,
    originalSize,
    compressedSize
  };
}

/**
 * Decompress data using Huffman coding
 */
export function huffmanDecompress(
  compressedData: Uint8Array,
  tree: Uint8Array,
  paddingBits: number
): string {
  if (!compressedData.length || !tree.length) return "";

  const huffmanTree = deserializeTree(tree);
  const binaryString = uint8ArrayToBinaryString(compressedData, paddingBits);

  let decoded = "";
  let currentNode = huffmanTree;

  for (const bit of binaryString) {
    if (!currentNode) break;
    currentNode = bit === "0" ? currentNode.left! : currentNode.right!;

    if (currentNode?.char !== undefined) {
      decoded += currentNode.char;
      currentNode = huffmanTree;
    }
  }

  return decoded;
}
