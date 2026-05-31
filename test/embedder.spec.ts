import { describe, it, expect } from "vitest";
import {
  embedBatch,
  isModelCached,
  downloadModel,
} from "../src/ingestion/embedder";

describe("embedder", () => {
  it("embedBatch returns Float32Array of expected length", async () => {
    const res = await embedBatch(["hello world"]);
    expect(res[0]).toBeInstanceOf(Float32Array);
    expect(res[0].length).toBe(8);
  });

  it("model download sets cached flag", async () => {
    (globalThis as any).__MODEL_CACHED = false;
    await downloadModel();
    expect(await isModelCached()).toBe(true);
  });
});
