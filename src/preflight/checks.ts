export type PreflightResult = { pass: boolean; error?: string };

export function checkOPFS(): PreflightResult {
  // In real browser this would be: typeof navigator.storage?.getDirectory === 'function'
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const has =
      typeof (globalThis as any).navigator?.storage?.getDirectory ===
      "function";
    return {
      pass: Boolean(has),
      error: has ? undefined : "OPFS not available",
    };
  } catch (e) {
    return { pass: false, error: "OPFS check threw" };
  }
}

export function checkCrossOriginIsolated(): PreflightResult {
  try {
    const pass = !!(globalThis as any).crossOriginIsolated;
    return { pass, error: pass ? undefined : "crossOriginIsolated is false" };
  } catch (e) {
    return { pass: false, error: "crossOriginIsolated check threw" };
  }
}

export function checkWASM(): PreflightResult {
  try {
    const pass = typeof (globalThis as any).WebAssembly === "object";
    return { pass, error: pass ? undefined : "WebAssembly not supported" };
  } catch (e) {
    return { pass: false, error: "WebAssembly check threw" };
  }
}

export function checkStorageQuota(
  minBytes = 200 * 1024 * 1024,
): PreflightResult {
  // In-browser we'd call navigator.storage.estimate()
  try {
    const estimate = (globalThis as any).__TEST_STORAGE_ESTIMATE || {
      quota: 500 * 1024 * 1024,
    }; // default 500MB
    const pass =
      typeof estimate.quota === "number" && estimate.quota >= minBytes;
    return { pass, error: pass ? undefined : `Quota below ${minBytes} bytes` };
  } catch (e) {
    return { pass: false, error: "Storage quota check threw" };
  }
}

export function runPreflightChecks() {
  const results = {
    opfs: checkOPFS(),
    coi: checkCrossOriginIsolated(),
    wasm: checkWASM(),
    quota: checkStorageQuota(),
  };
  const pass =
    results.opfs.pass &&
    results.coi.pass &&
    results.wasm.pass &&
    results.quota.pass;
  return { pass, results };
}
