import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  checkCrossOriginIsolated,
  checkWASM,
  runPreflightChecks,
} from "../src/preflight/checks";

describe("preflight checks", () => {
  const orig: any = {};

  // Capture only the properties we touch
  beforeEach(() => {
    // noop
  });

  afterEach(() => {
    // clean up known test globals
    // @ts-ignore
    delete (globalThis as any).navigator;
    // @ts-ignore
    delete (globalThis as any).crossOriginIsolated;
    // @ts-ignore
    delete (globalThis as any).WebAssembly;
    // @ts-ignore
    delete (globalThis as any).__TEST_STORAGE_ESTIMATE;
    // restore any other props if needed
    Object.assign(globalThis, orig);
  });

  it("checkWASM returns pass true when WebAssembly is present", () => {
    // @ts-ignore
    globalThis.WebAssembly = {};
    const res = checkWASM();
    expect(res.pass).toBe(true);
  });

  it("checkCrossOriginIsolated returns pass false when crossOriginIsolated is false", () => {
    // @ts-ignore
    globalThis.crossOriginIsolated = false;
    const res = checkCrossOriginIsolated();
    expect(res.pass).toBe(false);
  });

  it("runPreflightChecks returns results for all checks", () => {
    // setup globals so all checks can run
    // @ts-ignore
    globalThis.WebAssembly = {};
    // @ts-ignore
    globalThis.crossOriginIsolated = true;
    // @ts-ignore
    globalThis.navigator = { storage: { getDirectory: () => {} } };
    // provide test storage estimate
    (globalThis as any).__TEST_STORAGE_ESTIMATE = { quota: 500 * 1024 * 1024 };

    const res = runPreflightChecks();
    expect(res).toHaveProperty("results");
    expect(res.results).toHaveProperty("opfs");
    expect(res.results).toHaveProperty("coi");
    expect(res.results).toHaveProperty("wasm");
    expect(res.results).toHaveProperty("quota");
  });
});
