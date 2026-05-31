import { SearchResult } from "../shared/types";

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) throw new Error("vector lengths differ");
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}

type LoadedIndex = {
  docId: string;
  docName: string;
  chunks: string[];
  vectors: Float32Array[]; // parallel to chunks
};

export function topK(
  queryVec: Float32Array,
  docs: LoadedIndex[],
  k: number,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const d of docs) {
    for (let i = 0; i < d.vectors.length; i++) {
      const v = d.vectors[i];
      const score = cosineSimilarity(queryVec, v);
      results.push({
        chunkIndex: i,
        docId: d.docId,
        docName: d.docName,
        text: d.chunks[i],
        score,
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
}
