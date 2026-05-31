export interface DocumentMeta {
  docId: string;
  name: string;
  chunkCount: number;
  createdAt: string;
  settings: ChunkSettings;
}

export interface ChunkSettings {
  chunkSize: number;
  overlap: number;
}

export interface SearchResult {
  chunkIndex: number;
  docId: string;
  docName: string;
  text: string;
  score: number;
  page?: number;
}

export interface AppSettings {
  chunkSize: number;
  overlap: number;
  topK: number;
  systemPromptTemplate: string;
  llmProvider: "anthropic" | "openai" | "ollama" | null;
  ollamaBaseUrl: string;
  ollamaModel: string;
  anthropicModel: string;
  openaiModel: string;
}

export interface PreflightResult {
  name: string;
  pass: boolean;
  error?: string;
  remediation?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  chunkSize: 512,
  overlap: 64,
  topK: 5,
  systemPromptTemplate:
    'You are a helpful assistant. Answer the question using ONLY the context provided.\nIf the answer is not in the context, say "I don\'t know."\n\nContext:\n{{chunks}}\n\nQuestion: {{query}}',
  llmProvider: null,
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3",
  anthropicModel: "claude-sonnet-4-6",
  openaiModel: "gpt-4o",
};
