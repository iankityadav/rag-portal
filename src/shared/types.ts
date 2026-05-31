export interface ChunkSettings {
  chunkSize: number; // approximate tokens (default 512)
  overlap: number; // approximate tokens (default 64)
}

export interface DocumentMeta {
  docId: string; // nanoid()
  name: string; // original filename
  chunkCount: number;
  createdAt: string; // ISO 8601
  settings: ChunkSettings;
}

export interface SearchResult {
  chunkIndex: number;
  docId: string;
  docName: string;
  text: string;
  score: number; // cosine similarity 0..1
  page?: number;
}

export interface AppSettings {
  chunkSize: number;
  overlap: number;
  topK: number;
  systemPromptTemplate: string;
  llmProvider: "anthropic" | "openai" | "ollama" | null;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  anthropicModel?: string;
  openaiModel?: string;
}

export interface PreflightResult {
  id: "opfs" | "wasm" | "crossOriginIsolated" | "storageQuota";
  pass: boolean;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}
