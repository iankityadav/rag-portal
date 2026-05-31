// Minimal deterministic embedder for tests and local use.
export function isModelCached(): Promise<boolean> {
  // In real app we'd check OPFS /models/
  return Promise.resolve(Boolean((globalThis as any).__MODEL_CACHED));
}

export function downloadModel(
  onProgress?: (downloaded: number, total: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const total = 100;
    let d = 0;
    const t = setInterval(() => {
      d += 20;
      onProgress?.(d, total);
      if (d >= total) {
        clearInterval(t);
        (globalThis as any).__MODEL_CACHED = true;
        resolve();
      }
    }, 5);
  });
}

export function loadModel(): Promise<void> {
  return Promise.resolve();
}

function simpleHash(s: string, dim = 8) {
  const out = new Float32Array(dim);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  for (let i = 0; i < dim; i++) out[i] = ((h >>> (i % 16)) & 0xff) / 255;
  // normalize
  let sum = 0;
  for (let i = 0; i < dim; i++) sum += out[i] * out[i];
  sum = Math.sqrt(sum) || 1;
  for (let i = 0; i < dim; i++) out[i] /= sum;
  return out;
}

export async function embedBatch(
  texts: string[],
  onProgress?: (i: number, total: number) => void,
): Promise<Float32Array[]> {
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i++) {
    out.push(simpleHash(texts[i], 8));
    onProgress?.(i + 1, texts.length);
  }
  return out;
}
