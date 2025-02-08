import { HuffmanNode } from "../interfaces/file";
export type HuffmanTree = HuffmanNode | null


/**
 * Build the Huffman tree based on the input data.
 * @param data The input string for which to build the tree.
 * @returns The root node of the Huffman tree.
 */
function buildHuffmanTree(data: string): HuffmanTree {
  const frequencyMap: Map<string, number> = new Map()

  for (const char of data) {
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1)
  }

  // Create a priority queue (min-heap) based on frequencies
  const nodes: HuffmanNode[] = Array.from(frequencyMap.entries()).map(([char, freq]) => ({ char, freq }))


  // If there's only one unique character
  if (nodes.length === 1) {
    return nodes[0];
  }

  // Build the tree
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;

    const newNode: HuffmanNode = {
      freq: left.freq + right.freq,
      left,
      right
    };

    nodes.push(newNode);
  }
  return nodes[0] || null
}

/**
 * Generate the Huffman codes for each character.
 * @param node The root node of the Huffman tree.
 * @returns A map of characters to their binary codes.
 */
function genereateHuffmanCode(node: HuffmanTree): Record<string, string> {
  const codes: Record<string, string> = {}

  function traverse(node: HuffmanNode, code: string) {
    if (node.char !== undefined) {
      codes[node.char] = code;
    }
    if (node.left) traverse(node.left, code + "0")
    if (node.right) traverse(node.right, code + "1")

  }
  if (node) traverse(node, "")
  return codes;
}


/**
 * Encode the input data using the generated Huffman codes.
 * @param data The input string to encode.
 * @returns The encoded binary string.
 */
export function huffmanEncode(data: string): { encodeData: string, tree: HuffmanTree } {
  if (!data) return { encodeData: "", tree: null };

  const tree = buildHuffmanTree(data)
  const codes = genereateHuffmanCode(tree)
  const encodeData = data.split("").map(char => codes[char]).join("")
  return { encodeData, tree }
}


/**
 * Decode the binary data using the Huffman tree.
 * @param encodedData The binary string to decode.
 * @param tree The Huffman tree used for decoding.
 * @returns The decoded string.
 */
export function huffmanDecode(encodeData: string, tree: HuffmanTree): string {
  if (!encodeData || !tree) return "";

  let decoded = "";
  let currentNode = tree

  for (const bit of encodeData) {
    if (!currentNode) break;

    currentNode = bit === "0" ? currentNode?.left! : currentNode?.right!
    if (currentNode?.char !== undefined) {
      decoded += currentNode.char;
      // reset the root for the next character 
      currentNode = tree

    }
  }
  return decoded;
}
