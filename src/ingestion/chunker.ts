import { ChunkSettings } from "../shared/types";

export function splitIntoChunks(
  text: string,
  settings: ChunkSettings,
): string[] {
  const { chunkSize, overlap } = settings;
  if (!text) return [];

  // Split on sentence boundaries first
  const sentences = text.split(/(?<=[\.\?!])\s+/);

  // If the text has no sentence boundaries (single long "sentence")
  // fallback to slicing by characters.
  if (sentences.length === 1) {
    const chunks: string[] = [];
    const stride = Math.max(1, chunkSize - overlap);
    let i = 0;
    while (i < text.length) {
      const chunk = text.slice(i, i + chunkSize);
      chunks.push(chunk);
      if (i + chunkSize >= text.length) break;
      i += stride;
    }
    return chunks;
  }

  const chunks: string[] = [];
  let buffer = "";
  for (const element of sentences) {
    const s = element;
    if ((buffer + (buffer ? " " : "") + s).length <= chunkSize) {
      buffer = buffer ? buffer + " " + s : s;
      continue;
    }
    // emit buffer
    if (buffer) {
      chunks.push(buffer);
      // carry overlap chars
      const carry = buffer.slice(-overlap);
      buffer = carry + (s.length <= chunkSize ? (carry ? " " : "") + s : s);
    } else {
      // single sentence larger than chunkSize — slice it
      let pos = 0;
      const stride = Math.max(1, chunkSize - overlap);
      while (pos < s.length) {
        const piece = s.slice(pos, pos + chunkSize);
        chunks.push(piece);
        pos += stride;
      }
      buffer = "";
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}
