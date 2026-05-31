import { AppSettings } from "../shared/types";

// Default settings
const DEFAULTS: AppSettings = {
  chunkSize: 512,
  overlap: 64,
  topK: 5,
  systemPromptTemplate:
    "You are a helpful assistant. Use the context provided.",
  llmProvider: null,
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3",
  anthropicModel: "claude-sonnet-4-6",
  openaiModel: "gpt-4o",
};

// Session-only API keys (not persisted)
const sessionKeys: { anthropicKey?: string; openaiKey?: string } = {};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = (globalThis as any).__OPFS_CONFIG || null;
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch (e) {
    console.log("parsing failed, loading defaults", e);
    return { ...DEFAULTS };
  }
}

export async function saveSettings(
  partial: Partial<AppSettings>,
): Promise<AppSettings> {
  // do not persist API key secrets — ensure they are not written
  const toPersist = { ...partial } as any;
  delete toPersist.anthropicModel; // model names are okay, but not keys
  delete toPersist.openaiModel;
  // merge with existing
  const current = await loadSettings();
  const merged = { ...current, ...toPersist };
  (globalThis as any).__OPFS_CONFIG = JSON.stringify(merged);
  return merged;
}

export function setSessionKeys(keys: {
  anthropicKey?: string;
  openaiKey?: string;
}) {
  if (keys.anthropicKey) sessionKeys.anthropicKey = keys.anthropicKey;
  if (keys.openaiKey) sessionKeys.openaiKey = keys.openaiKey;
}

export function getSessionKeys() {
  return { ...sessionKeys };
}
