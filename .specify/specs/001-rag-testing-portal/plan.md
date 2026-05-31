# Implementation Plan: RAG Testing Portal

**Spec**: `specs/001-rag-testing-portal/spec.md`
**Branch**: `001-rag-testing-portal`
**Status**: Draft

---

## Prerequisites / Dev Setup

Complete these steps manually before running any task from `tasks.md`.
These are one-time setup steps, not feature work.

### 1. Scaffold the project

```bash
npm create vite@latest rag-portal -- --template react-ts
cd rag-portal
npm install tailwindcss @tailwindcss/vite zustand nanoid pdfjs-dist @xenova/transformers
npm install -D vitest jsdom @vitest/ui
```

### 2. Configure Tailwind

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* src/index.css */
@import "tailwindcss";
```

### 3. Enable COOP/COEP headers (required for WASM SharedArrayBuffer)

```ts
// vite.config.ts — add to server config
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  }
}
```

Verify: open browser console after `npm run dev` — `crossOriginIsolated` must be `true`.

### 4. tsconfig adjustments

```json
{
  "compilerOptions": {
    "useDefineForClassFields": true,
    "isolatedModules": false
  }
}
```

### Ready check

- [ ] `npm run dev` renders blank page without errors
- [ ] `crossOriginIsolated === true` in browser console
- [ ] `npm run test` runs without configuration errors

---

## Phase -1: Pre-Implementation Gates

### Simplicity Gate (Constitution Article V)
- [x] Using ≤ 3 top-level modules? → `preflight`, `ingestion`, `query` ✅
- [x] No future-proofing abstractions? ✅
- [x] No backend scaffolding? ✅

### Browser-First Gate (Constitution Article I)
- [x] All storage via OPFS only?  ✅
- [x] No server-side calls except user-configured LLM endpoint? ✅

### Privacy Gate (Constitution Article VII)
- [x] API keys session-only? ✅
- [x] No telemetry? ✅

---

## Technology Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, excellent WASM support, widely known |
| Styling | Tailwind CSS v3 | Zero-runtime, pairs well with component isolation |
| OPFS access | Native `navigator.storage.getDirectory()` | No abstraction needed for v1 |
| PDF parsing | `pdfjs-dist` (worker mode) | De-facto standard, runs in browser |
| Embedding model | `@xenova/transformers` + `all-MiniLM-L6-v2` | 23MB, 384-dim, runs via ONNX WASM |
| Similarity search | Pure JS cosine similarity on `Float32Array` | No library needed at ≤50k chunks |
| LLM calls | Native `fetch` (Anthropic / OpenAI / Ollama) | No SDK weight in the bundle |
| Testing | Vitest + jsdom | Fast, Vite-native |
| State management | Zustand | Minimal boilerplate, no context hell |

---

## Architecture

```
src/
├── main.tsx                  # Entry point — mounts <PreflightGate>
│
├── preflight/
│   ├── PreflightGate.tsx     # Wraps entire app; shows check UI or children
│   ├── checks.ts             # Pure functions: checkOPFS, checkWASM, checkQuota, checkCOI
│   └── PreflightError.tsx    # Full-screen error panel with remediation guide
│
├── ingestion/
│   ├── DocumentUpload.tsx    # Drag-and-drop / file picker UI
│   ├── chunker.ts            # splitIntoChunks(text, size, overlap) → string[]
│   ├── embedder.ts           # loadModel(), embedBatch(chunks) → Float32Array[]
│   ├── opfsStore.ts          # writeIndex(docId, chunks, vectors), readIndex(docId),
│   │                         # deleteIndex(docId), listDocuments()
│   └── DocumentList.tsx      # Sidebar list of ingested documents
│
├── query/
│   ├── QueryBox.tsx          # Input + submit, calls queryPipeline()
│   ├── search.ts             # cosineSimilarity(), topK(queryVec, index, k)
│   ├── llm.ts                # callAnthropic(), callOpenAI(), callOllama()
│   ├── promptBuilder.ts      # assemblePrompt(chunks, query, template) → string
│   └── ResultsPanel.tsx      # Renders retrieved chunks + LLM answer
│
├── settings/
│   ├── SettingsPanel.tsx     # Chunk size, overlap, top-K, LLM config, system prompt
│   └── settingsStore.ts      # Zustand store + OPFS persistence
│
└── shared/
    ├── Progress.tsx          # Reusable progress bar component
    ├── Collapsible.tsx       # Expandable panel for debug views
    └── types.ts              # Shared TypeScript interfaces
```

---

## Module Plans

### Module 1 — `preflight`

**Goal**: Determine browser capability synchronously before loading any heavy modules.

**Key decisions**:
- Preflight runs before React hydration (inline script in `index.html`) to avoid
  loading the WASM runtime on unsupported browsers.
- `crossOriginIsolated` check: if `false`, display instructions to add
  `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`
  headers (needed by SharedArrayBuffer which ONNX WASM requires).
- Quota check: request `navigator.storage.estimate()`, require ≥ 200 MB available.

**Checks and remediation messages**:

| Check | Failure message | Remediation |
|---|---|---|
| OPFS | Browser does not support OPFS | Use Chrome 86+, Firefox 111+, or Safari 15.2+ |
| WebAssembly | WebAssembly not available | Enable WASM in browser flags |
| crossOriginIsolated | Page not cross-origin isolated | Server must send COOP/COEP headers |
| Storage quota | Less than 200 MB available | Free up browser storage |

---

### Module 2 — `ingestion`

**Goal**: Accept a document → chunk → embed → write to OPFS.

**OPFS file layout**:
```
/                              ← OPFS root
├── models/
│   └── all-MiniLM-L6-v2/    ← Cached ONNX model files
├── index/
│   └── <doc-id>/
│       ├── meta.json         ← { docId, name, chunkCount, createdAt, settings }
│       ├── chunks.json       ← string[] — raw chunk texts
│       └── vectors.bin       ← Float32Array serialized as binary (384 * N * 4 bytes)
└── config/
    └── settings.json
```

**Chunking algorithm** (`chunker.ts`):
- Split by sentence boundary first (`.`, `?`, `!` followed by whitespace).
- Accumulate sentences into a chunk until token estimate (chars / 4) reaches `chunkSize`.
- Emit chunk, then backtrack `overlap` tokens for the next chunk.
- [NEEDS CLARIFICATION: confirm token vs character overlap preference]

**Embedding pipeline** (`embedder.ts`):
- Use `@xenova/transformers` `pipeline('feature-extraction', model)`.
- Batch chunks in groups of 32 to avoid OOM on large documents.
- Normalize embeddings to unit vectors (required for cosine similarity via dot product).

**OPFS binary format** (`vectors.bin`):
- `Float32Array` of shape `[N, 384]` serialized with `buffer.slice()`.
- Written as a single `FileSystemWritableFileStream` write for atomicity.

---

### Module 3 — `query`

**Goal**: Embed query → cosine search → assemble prompt → call LLM → stream response.

**Search** (`search.ts`):
- Load all `vectors.bin` files from OPFS into memory as `Float32Array`.
- Compute dot product (unit vectors → equivalent to cosine similarity).
- Return top-K `{ chunkIndex, docId, score }` objects.
- For N ≤ 50,000 chunks this is synchronous and takes < 100ms.

**Prompt template** (default):
```
You are a helpful assistant. Answer the question using ONLY the context provided.
If the answer is not in the context, say "I don't know."

Context:
{{chunks}}

Question: {{query}}
```

**LLM adapters** (`llm.ts`):
- Each adapter takes `(prompt: string, onToken: (t: string) => void): Promise<void>`.
- Anthropic: uses `/v1/messages` with `stream: true`, SSE parsing.
- OpenAI: uses `/v1/chat/completions` with `stream: true`, SSE parsing.
- Ollama: uses `/api/chat` with streaming response.

---

## Data Models

```typescript
// types.ts

interface DocumentMeta {
  docId: string;          // nanoid()
  name: string;           // original filename
  chunkCount: number;
  createdAt: string;      // ISO 8601
  settings: ChunkSettings;
}

interface ChunkSettings {
  chunkSize: number;      // default 512 (approx tokens)
  overlap: number;        // default 64
}

interface SearchResult {
  chunkIndex: number;
  docId: string;
  docName: string;
  text: string;
  score: number;          // cosine similarity 0–1
  page?: number;          // from PDF metadata if available
}

interface AppSettings {
  chunkSize: number;
  overlap: number;
  topK: number;
  systemPromptTemplate: string;
  llmProvider: 'anthropic' | 'openai' | 'ollama' | null;
  ollamaBaseUrl: string;
  ollamaModel: string;
  anthropicModel: string;
  openaiModel: string;
}
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  RAG Portal           [Settings ⚙]  [Storage: 42MB] │
├──────────────┬──────────────────────────────────────┤
│  Documents   │  Query                               │
│  ──────────  │  ┌──────────────────────────────┐    │
│  + Upload    │  │ Ask a question...          [→]│   │
│              │  └──────────────────────────────┘    │
│  > bio.pdf   │                                      │
│    52 chunks │  Retrieved Chunks (top 5)            │
│  > notes.txt │  ┌────────────────────────────────┐  │
│    18 chunks │  │ [0.91] bio.pdf p.3 ▼           │  │
│              │  │ "The mitochondria is the powe…"│  │
│              │  └────────────────────────────────┘  │
│              │  ┌────────────────────────────────┐  │
│              │  │ [0.87] bio.pdf p.3 ▼           │  │
│              │  └────────────────────────────────┘  │
│              │                                      │
│              │  LLM Answer                          │
│              │  ┌────────────────────────────────┐  │
│              │  │ The mitochondria is responsible│  │
│              │  │ for producing ATP via...       │  │
│              │  └────────────────────────────────┘  │
│              │  [Prompt sent ▼] [Timing: 1.2s]      │
└──────────────┴──────────────────────────────────────┘
```

---

## API Contracts

### `checks.ts`
```typescript
checkOPFS(): Promise<{ pass: boolean; error?: string }>
checkWASM(): { pass: boolean; error?: string }
checkCrossOriginIsolated(): { pass: boolean; error?: string }
checkStorageQuota(minMB: number): Promise<{ pass: boolean; available: number; error?: string }>
runAllChecks(): Promise<PreflightResult[]>
```

### `chunker.ts`
```typescript
splitIntoChunks(text: string, settings: ChunkSettings): string[]
```

### `embedder.ts`
```typescript
isModelCached(): Promise<boolean>
downloadModel(onProgress: (pct: number) => void): Promise<void>
loadModel(): Promise<void>
embedBatch(texts: string[], onProgress?: (i: number, total: number) => void): Promise<Float32Array[]>
```

### `opfsStore.ts`
```typescript
writeDocument(meta: DocumentMeta, chunks: string[], vectors: Float32Array[]): Promise<void>
readDocument(docId: string): Promise<{ meta: DocumentMeta; chunks: string[]; vectors: Float32Array[] }>
listDocuments(): Promise<DocumentMeta[]>
deleteDocument(docId: string): Promise<void>
getStorageUsage(): Promise<{ usedMB: number; quotaMB: number }>
```

### `search.ts`
```typescript
cosineSimilarity(a: Float32Array, b: Float32Array): number
topK(queryVec: Float32Array, docs: LoadedIndex[], k: number): SearchResult[]
```

---

## Quickstart Validation Scenarios

1. **Happy path**: Open in Chrome 120+, all preflight checks pass → main UI shown.
2. **OPFS fail**: Open in a context without OPFS → preflight error panel shown with
   correct failure name.
3. **Model cache**: Upload a doc, close tab, reopen → model loads from OPFS with no
   network request.
4. **Ingestion**: Upload `test.txt` (1000 words, chunk=512, overlap=64) → 3 chunks
   produced and visible in document list.
5. **Retrieval**: Query "mitochondria" against bio.pdf → top result score > 0.85.
6. **LLM call**: Configure Ollama URL, query → streamed answer appears token-by-token.
7. **Settings persist**: Set top-K to 10, close tab, reopen → top-K still 10.