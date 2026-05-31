import { DocumentMeta } from "../shared/types";

// Minimal OPFS wrapper used for tests. In a browser, navigator.storage.getDirectory()
// would be used directly. For tests we support a global __OPFS_MOCK providing
// a Map-like API.

type StoredDoc = {
  meta: DocumentMeta;
  chunks: string[];
  vectors: ArrayBuffer | SharedArrayBuffer;
};

const root = (globalThis as any).__OPFS_MOCK || new Map<string, StoredDoc>();

export async function writeDocument(
  meta: DocumentMeta,
  chunks: string[],
  vectors: Float32Array,
): Promise<void> {
  const buf = vectors.buffer.slice(0);
  (root as Map<string, StoredDoc>).set(meta.docId, {
    meta,
    chunks,
    vectors: buf,
  });
}

export async function readDocument(docId: string) {
  const rec = (root as Map<string, StoredDoc>).get(docId);
  if (!rec) throw new Error("not found");
  return {
    meta: rec.meta,
    chunks: rec.chunks,
    vectors: new Float32Array(rec.vectors),
  };
}

export async function listDocuments() {
  const out: DocumentMeta[] = [];
  for (const [, v] of (root as Map<string, StoredDoc>).entries())
    out.push(v.meta);
  return out;
}

export async function deleteDocument(docId: string) {
  (root as Map<string, StoredDoc>).delete(docId);
}

export async function getStorageUsage() {
  // approximate: sum of vectors bytes + chunks text length
  let used = 0;
  for (const [, v] of (root as Map<string, StoredDoc>).entries()) {
    used += v.vectors.byteLength;
    for (const c of v.chunks) used += c.length;
  }
  const quota =
    (globalThis as any).__TEST_STORAGE_ESTIMATE?.quota || 500 * 1024 * 1024;
  return {
    usedMB: Math.round((used / 1024 / 1024) * 100) / 100,
    quotaMB: Math.round((quota / 1024 / 1024) * 100) / 100,
  };
}
