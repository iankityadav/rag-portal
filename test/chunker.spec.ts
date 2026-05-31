import { describe, it, expect } from "vitest";
import { splitIntoChunks } from "../src/ingestion/chunker";

describe("chunker", () => {
  it("empty string => []", () => {
    expect(splitIntoChunks("", { chunkSize: 200, overlap: 50 })).toEqual([]);
  });

  it("shorter than chunk size => single chunk", () => {
    const t = "short text";
    expect(splitIntoChunks(t, { chunkSize: 200, overlap: 50 })).toEqual([t]);
  });

  it("1000-char text with size=200 overlap=50 produces multiple chunks", () => {
    const t = "a".repeat(1000);
    const chunks = splitIntoChunks(t, { chunkSize: 200, overlap: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    // check overlap
    for (let i = 0; i < chunks.length - 1; i++) {
      const a = chunks[i];
      const b = chunks[i + 1];
      expect(a.slice(-50)).toEqual(b.slice(0, 50));
    }
  });
});
