# Data Model: RAG Testing Portal

## OPFS File Layout

```
OPFS Root /
├── models/
│   └── all-MiniLM-L6-v2/       ← Xenova/transformers cache
│       ├── config.json
│       ├── tokenizer.json
│       └── onnx/model.onnx      ← ~23 MB
│
├── index/
│   └── <doc-id: nanoid(10)>/
│       ├── meta.json            ← DocumentMeta (see below)
│       ├── chunks.json          ← string[] (raw chunk text)
│       └── vectors.bin          ← Float32Array[N × 384] as ArrayBuffer
│
└── config/
    └── settings.json            ← AppSettings (no API keys)
```

---

## TypeScript Interfaces

```typescript
// Stored in meta.json
interface DocumentMeta {
  docId: string;           // nanoid(10), e.g. "V1StGXR8_Z"
  name: string;            // Original filename, e.g. "biology.pdf"
  chunkCount: number;      // Number of chunks (= length of chunks.json array)
  createdAt: string;       // ISO 8601, e.g. "2026-05-31T10:23:00Z"
  settings: ChunkSettings; // Settings used at ingestion time
}

interface ChunkSettings {
  chunkSize: number;       // Approx tokens per chunk (default: 512)
  overlap: number;         // Approx overlapping tokens (default: 64)
}

// Runtime only — never persisted
interface SearchResult {
  chunkIndex: number;      // Index into chunks.json array
  docId: string;
  docName: string;         // From DocumentMeta.name
  text: string;            // The chunk text
  score: number;           // Cosine similarity, range [0, 1]
  page?: number;           // PDF page number if available
}

// Stored in settings.json (API keys excluded)
interface AppSettings {
  chunkSize: number;               // default 512
  overlap: number;                 // default 64
  topK: number;                    // default 5
  systemPromptTemplate: string;    // default (see plan.md)
  llmProvider: 'anthropic' | 'openai' | 'ollama' | null;
  ollamaBaseUrl: string;           // default "http://localhost:11434"
  ollamaModel: string;             // default "llama3"
  anthropicModel: string;          // default "claude-sonnet-4-20250514"
  openaiModel: string;             // default "gpt-4o"
}

// Runtime only (sessionStorage lifetime)
interface SessionSecrets {
  anthropicKey?: string;
  openaiKey?: string;
}

// Preflight
interface PreflightResult {
  name: string;       // e.g. "OPFS", "WebAssembly"
  pass: boolean;
  error?: string;     // Human-readable failure reason
  remediation?: string; // How to fix it
}
```

---

## Binary Vector Format (`vectors.bin`)

```
Offset 0 ... N*384*4 bytes

Layout: Row-major Float32Array
  Row i = embedding for chunk i
  Each row = 384 float32 values (IEEE 754, little-endian)

Read:
  const buf = await fileHandle.getFile().then(f => f.arrayBuffer());
  const vecs = new Float32Array(buf);
  const chunkVec = vecs.slice(i * 384, (i + 1) * 384);

Write:
  const flat = new Float32Array(chunks.length * 384);
  vectors.forEach((v, i) => flat.set(v, i * 384));
  const stream = await fileHandle.createWritable();
  await stream.write(flat.buffer);
  await stream.close();
```