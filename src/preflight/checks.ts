import type { PreflightResult } from "../shared/types";

export async function checkOPFS(): Promise<PreflightResult> {
  try {
    await navigator.storage.getDirectory();
    return { name: "OPFS", pass: true };
  } catch {
    return {
      name: "OPFS",
      pass: false,
      error: "Origin Private File System is not available in this browser.",
      remediation: "Use Chrome 86+, Firefox 111+, or Safari 15.2+.",
    };
  }
}

export function checkWASM(): PreflightResult {
  const pass = typeof WebAssembly === "object";
  return {
    name: "WebAssembly",
    pass,
    error: pass ? undefined : "WebAssembly is not available.",
    remediation: pass ? undefined : "Enable WebAssembly in your browser flags.",
  };
}

export function checkCrossOriginIsolated(): PreflightResult {
  const pass = globalThis.crossOriginIsolated === true;
  return {
    name: "Cross-Origin Isolation",
    pass,
    error: pass
      ? undefined
      : "Page is not cross-origin isolated. SharedArrayBuffer is unavailable.",
    remediation: pass
      ? undefined
      : "Add these response headers to your dev server:\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp",
  };
}

export async function checkStorageQuota(minMB = 200): Promise<PreflightResult> {
  try {
    const est = await navigator.storage.estimate();
    const availableMB = ((est.quota ?? 0) - (est.usage ?? 0)) / 1024 / 1024;
    const pass = availableMB >= minMB;
    return {
      name: "Storage Quota",
      pass,
      error: pass
        ? undefined
        : `Only ${Math.round(availableMB)} MB available (need ${minMB} MB).`,
      remediation: pass
        ? undefined
        : "Free up browser storage in your browser settings.",
    };
  } catch {
    return {
      name: "Storage Quota",
      pass: false,
      error: "Could not estimate available storage.",
      remediation: "Try a different browser or clear existing site data.",
    };
  }
}

export async function runAllChecks(): Promise<PreflightResult[]> {
  const [opfs, quota] = await Promise.all([checkOPFS(), checkStorageQuota()]);
  return [opfs, checkWASM(), checkCrossOriginIsolated(), quota];
}
