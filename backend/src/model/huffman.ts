import { HuffmanNode } from "../interfaces/file";
export type HuffmanTree = HuffmanNode | null;

/**
 * Convert a binary string to Uint8Array with efficient bit packing
 * Uint8Array -- Each elements have 1 byte
 * Stores 8x more compactly than raw binary strings
 * Original: "01011001" (8 characters = 64 bits JS string)
 * Packed:   0x59        (1 byte = 8 bits Uint8Array)
 */
function binaryStringToUint8Array(binString: string): { data: Uint8Array, paddingBits: number } {
  const padding = 8 - (binString.length % 8); // 8-(9/8) = 7
  const paddedLength = binString.length + (padding === 8 ? 0 : padding); // 9+7 = 16 (2 byte)
  const bytes = new Uint8Array(paddedLength / 8);// 2 elements [0,0]

  for (let i = 0; i < paddedLength; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      const bitIndex = i + j;
      // 1- add 0 - not add
      if (bitIndex < binString.length && binString[bitIndex] === '1') {
        //  x<<value  x = x * 2^value 2^7 = 128, 2^6 = 64 
        byte |= 1 << (7 - j); // convert binary to decimal
      }
    }
    bytes[i / 8] = byte; // put them in array
  }

  //{ data: Uint8Array [ 170, 128 ], paddingBits: 7 } for "101010101"
  return { data: bytes, paddingBits: padding === 8 ? 0 : padding };
}

/**
 * Convert Uint8Array back to binary string
 *  Compressed data → Binary string → Huffman traversal
 *  return like "111000" (huffman code)
 */

function uint8ArrayToBinaryString(bytes: Uint8Array, paddingBits: number): string {
  let binString = "";
  for (let i = 0; i < bytes.length; i++) {
    binString += bytes[i].toString(2).padStart(8, "0"); // converts byte value to binary string and concatinate
  }
  return binString.slice(0, binString.length - paddingBits); // return "1110101"
}

/**
 * Build an optimized Huffman tree
 */
function buildHuffmanTree(data: string): HuffmanTree {
  const freqArray = new Uint32Array(65536); //  for  UTF-16

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
      parts.push(node.char.charCodeAt(0)); // [1,65,1,66]
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

  const binaryString = Array.from(data).map(char => codes[char]).join('');//join each huffman code 
  const { data: compressedData, paddingBits } = binaryStringToUint8Array(binaryString); // convert binary to Uint8Array
  const serializedTree = serializeTree(tree);

  const compressedSize = compressedData.length + serializedTree.length + 8; // +8 for metadata( information about padding bits)

  return {
    compressedData, // from binaryStringToUint8Array
    tree: serializedTree, // from serializeTree
    paddingBits, // from binaryStringToUint8Array
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
      decoded += currentNode.char; //append decoded char
      currentNode = huffmanTree; // back to root
    }
  }

  return decoded;
}
