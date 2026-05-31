import { describe, it, expect, beforeEach } from "vitest";
import {
  writeDocument,
  readDocument,
  listDocuments,
  deleteDocument,
  getStorageUsage,
} from "../src/ingestion/opfsStore";
import { DocumentMeta } from "../src/shared/types";

describe("opfsStore", () => {
  beforeEach(() => {
    // reset mock storage
    (globalThis as any).__OPFS_MOCK = new Map();
  });

  it("writeDocument then readDocument returns same chunks and vectors", async () => {
    const meta: DocumentMeta = {
      docId: "d1",
      name: "test.txt",
      chunkCount: 2,
      createdAt: new Date().toISOString(),
      settings: { chunkSize: 512, overlap: 64 },
    };
    const chunks = ["hello", "world"];
    const vec = new Float32Array([1, 2, 3, 4]);
    await writeDocument(meta, chunks, vec);
    const r = await readDocument("d1");
    expect(r.meta.docId).toBe("d1");
    expect(r.chunks).toEqual(chunks);
    expect(Array.from(r.vectors.slice(0, 4))).toEqual(Array.from(vec));
  });

  it("listDocuments returns metadata", async () => {
    const meta: DocumentMeta = {
      docId: "d2",
      name: "a",
      chunkCount: 1,
      createdAt: new Date().toISOString(),
      settings: { chunkSize: 512, overlap: 64 },
    };
    await writeDocument(meta, ["x"], new Float32Array([0]));
    const list = await listDocuments();
    expect(list.find((l) => l.docId === "d2")).toBeDefined();
  });

  it("deleteDocument removes document", async () => {
    const meta: DocumentMeta = {
      docId: "d3",
      name: "b",
      chunkCount: 1,
      createdAt: new Date().toISOString(),
      settings: { chunkSize: 512, overlap: 64 },
    };
    await writeDocument(meta, ["x"], new Float32Array([0]));
    await deleteDocument("d3");
    await expect(readDocument("d3")).rejects.toThrow();
  });

  it("getStorageUsage returns usedMB and quotaMB", async () => {
    const meta: DocumentMeta = {
      docId: "d4",
      name: "c",
      chunkCount: 1,
      createdAt: new Date().toISOString(),
      settings: { chunkSize: 512, overlap: 64 },
    };
    await writeDocument(
      meta,
      ["hello world"],
      new Float32Array([0, 1, 2, 3, 4]),
    );
    const u = await getStorageUsage();
    expect(typeof u.usedMB).toBe("number");
    expect(typeof u.quotaMB).toBe("number");
  });
});
