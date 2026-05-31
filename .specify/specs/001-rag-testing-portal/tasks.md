# Tasks: RAG Testing Portal

**Plan**: `specs/001-rag-testing-portal/plan.md`
**Branch**: `001-rag-testing-portal`

Legend: `[P]` = can run in parallel with other `[P]` tasks in the same group.

---

> ⚠️ Before starting any task, complete the **Prerequisites** in `plan.md → Prerequisites / Dev Setup`.
> The repo must already be scaffolded, dependencies installed, and COOP/COEP headers verified.

## Group 1 — Preflight Module

- [ ] **T-001** `[P]` · Create `src/shared/types.ts` with all shared interfaces from plan
  - `DocumentMeta`, `ChunkSettings`, `SearchResult`, `AppSettings`, `PreflightResult`
  - _Acceptance_: TypeScript compiles with no errors

- [ ] **T-002** `[P]` · Write tests for `preflight/checks.ts`
  - Unit test: `checkWASM()` returns `{ pass: true }` in Vitest/jsdom
  - Unit test: `checkCrossOriginIsolated()` returns `{ pass: false }` when
    `window.crossOriginIsolated` is `false`
  - Unit test: `runAllChecks()` returns array of 4 results
  - _Acceptance_: Tests written, confirmed failing (red phase)

- [ ] **T-003** `[P]` · Implement `preflight/checks.ts`
  - Implement `checkOPFS`, `checkWASM`, `checkCrossOriginIsolated`, `checkStorageQuota`
  - Implement `runAllChecks()` — runs all, returns `PreflightResult[]`
  - _Acceptance_: All T-002 tests pass (green phase)

- [ ] **T-004** · Build `PreflightError.tsx` component
  - Full-screen panel showing failed check name, description, and remediation steps
  - Show remediation per check type (see plan.md table)
  - _Acceptance_: Renders correctly when passed a mock failed `PreflightResult[]`

- [ ] **T-005** · Build `PreflightGate.tsx` component
  - On mount: calls `runAllChecks()`
  - While checking: spinner with "Checking browser compatibility…"
  - On failure: renders `<PreflightError>`
  - On pass: renders `{children}`
  - Wrap `<App>` in `main.tsx` with `<PreflightGate>`
  - _Acceptance_: Mock `checkOPFS` to fail → error panel shown; mock all pass → app shown

---

## Group 2 — OPFS Storage Layer ([P] with Group 1)

- [ ] **T-006** `[P]` · Write tests for `ingestion/opfsStore.ts`
  - Test: `writeDocument` then `readDocument` returns same chunks + vectors
  - Test: `listDocuments` returns correct metadata
  - Test: `deleteDocument` removes OPFS directory
  - Test: `getStorageUsage` returns `{ usedMB, quotaMB }` with correct types
  - Note: Use `mock-fs` or Vitest's fake filesystem; OPFS mocking guide in `docs/testing.md`
  - _Acceptance_: Tests written, confirmed failing

- [ ] **T-007** `[P]` · Implement `ingestion/opfsStore.ts`
  - Implement all functions per API contract in plan.md
  - Binary vector format: `Float32Array` → `ArrayBuffer` → OPFS file
  - _Acceptance_: All T-006 tests pass

---

## Group 3 — Chunker & Embedder ([P] with Groups 1–2)

- [ ] **T-008** `[P]` · Write tests for `ingestion/chunker.ts`
  - Test: 1000-char text with size=200, overlap=50 → correct chunk count
  - Test: chunks overlap correctly (last 50 chars of chunk N appear in chunk N+1)
  - Test: empty string → `[]`
  - Test: text shorter than chunk size → single chunk
  - _Acceptance_: Tests written, confirmed failing

- [ ] **T-009** `[P]` · Implement `ingestion/chunker.ts`
  - Sentence-boundary split, accumulate, overlap by backtracking
  - _Acceptance_: All T-008 tests pass

- [ ] **T-010** · Implement `ingestion/embedder.ts`
  - `isModelCached()` — checks OPFS `/models/` directory
  - `downloadModel(onProgress)` — uses `@xenova/transformers` with OPFS cache dir
  - `loadModel()` — initializes pipeline from cache
  - `embedBatch(texts, onProgress)` — batches of 32, normalizes output to unit vectors
  - _Acceptance_: Can embed `["hello world"]` and receive a `Float32Array` of length 384

- [ ] **T-011** · Build model download modal UI
  - Shows model name, size (~23 MB), and privacy notice (downloaded once, stays local)
  - Progress bar driven by `embedder.downloadModel(onProgress)`
  - Dismiss only allowed after download completes
  - _Acceptance_: Modal renders; progress bar updates correctly in Storybook / manual test

---

## Group 4 — Ingestion UI (depends on Groups 2 and 3)

- [ ] **T-012** · Build `DocumentUpload.tsx` (drag-and-drop + file picker)
  - Accepts `.pdf`, `.txt`, `.md`
  - On drop/select: calls ingestion pipeline (parse → chunk → embed → store)
  - Shows per-document progress: "Chunking… 24/80", "Embedding… 24/80"
  - On completion: document appears in `DocumentList`
  - _Acceptance_: Upload a 10-page PDF → document visible in list with correct chunk count

- [ ] **T-013** · Build `DocumentList.tsx`
  - Lists all documents from `opfsStore.listDocuments()`
  - Shows: filename, chunk count, date added
  - Delete button: calls `opfsStore.deleteDocument`, removes from list
  - _Acceptance_: Add 2 docs, delete 1, verify list updates

---

## Group 5 — Search & Query (depends on Group 2)

- [ ] **T-014** `[P]` · Write tests for `query/search.ts`
  - Test: `cosineSimilarity([1,0,0], [1,0,0])` → `1.0`
  - Test: `cosineSimilarity([1,0,0], [0,1,0])` → `0.0`
  - Test: `topK` with 10 vectors returns K results sorted descending by score
  - _Acceptance_: Tests written, confirmed failing

- [ ] **T-015** `[P]` · Implement `query/search.ts`
  - `cosineSimilarity` using dot product (unit vectors)
  - `topK` loads all indexes from OPFS, scores, sorts, slices
  - _Acceptance_: All T-014 tests pass

- [ ] **T-016** `[P]` · Implement `query/promptBuilder.ts`
  - `assemblePrompt(chunks, query, template)` — replaces `{{chunks}}` and `{{query}}`
  - Chunks formatted as numbered list with doc name + score
  - _Acceptance_: Unit test: given 2 chunks → prompt string contains both chunk texts

- [ ] **T-017** `[P]` · Implement `query/llm.ts`
  - `callAnthropic(prompt, apiKey, model, onToken)`
  - `callOpenAI(prompt, apiKey, model, onToken)`
  - `callOllama(prompt, baseUrl, model, onToken)`
  - All use `fetch` with SSE streaming; call `onToken` for each streamed token
  - _Acceptance_: Manual test against real Ollama / API

---

## Group 6 — Query UI (depends on Groups 4 and 5)

- [ ] **T-018** · Build `QueryBox.tsx`
  - Text input + submit button (also triggers on Enter)
  - Disabled while query is in flight
  - _Acceptance_: Pressing Enter triggers `onSubmit` callback

- [ ] **T-019** · Build `ResultsPanel.tsx`
  - Shows `SearchResult[]` as cards: score badge, doc name, text excerpt
  - Each card expandable (uses `Collapsible.tsx`) to show full text + truncated vector
  - Streaming LLM answer below results
  - Collapsible "Prompt sent" block showing raw prompt
  - Timing display: embed Xms / search Xms / LLM first-token Xms
  - _Acceptance_: Renders correctly with mock `SearchResult[]` and streamed text

---

## Group 7 — Settings ([P] with Groups 1–5)

- [ ] **T-020** `[P]` · Implement `settings/settingsStore.ts`
  - Zustand store with `AppSettings` shape
  - `loadSettings()` — reads from OPFS `/config/settings.json`; falls back to defaults
  - `saveSettings(partial)` — merges, writes to OPFS
  - API key fields (`anthropicKey`, `openaiKey`) are in-memory only (not persisted)
  - _Acceptance_: Save settings, reload store, verify non-key fields persisted

- [ ] **T-021** `[P]` · Build `SettingsPanel.tsx`
  - Sections: Chunking (size, overlap), Retrieval (top-K), LLM Provider (tabs:
    Anthropic / OpenAI / Ollama), System Prompt template (textarea)
  - API key inputs: type=password, not autofilled, labeled "Session only – not saved"
  - Reset to defaults button
  - _Acceptance_: Change top-K, close panel, reopen → value persisted

---

## Group 8 — Integration & Polish (depends on all previous groups)

- [ ] **T-022** · Assemble main layout (`App.tsx`)
  - Sidebar (DocumentList + Upload) + main area (QueryBox + ResultsPanel) + nav (Settings)
  - Footer: OPFS storage usage gauge
  - Responsive: sidebar collapses on narrow viewport
  - _Acceptance_: Full flow works end-to-end (upload → query → answer)

- [ ] **T-023** · Add shared `Progress.tsx` component
  - Props: `value: number` (0–100), `label?: string`
  - Used by: model download, ingestion, embedding
  - _Acceptance_: Visual progress bar renders correctly at 0, 50, 100

- [ ] **T-024** · Add `Collapsible.tsx` component
  - Toggle open/closed with animated chevron
  - _Acceptance_: Renders children when open, hides when closed

- [ ] **T-025** · End-to-end smoke test (manual)
  - Upload a PDF, query it, verify LLM answer references correct content
  - Run in Chrome, Firefox, and Safari
  - Document any browser-specific issues

- [ ] **T-026** · Write `README.md`
  - How to run locally (`npm install && npm run dev`)
  - Browser requirements
  - LLM provider setup (Anthropic key, OpenAI key, Ollama)
  - Architecture diagram (link to plan.md)

---

## Parallel Execution Summary

```
Group 1 (preflight)        [P with Groups 2, 3, 7]
Group 2 (OPFS layer)       [P with Groups 1, 3, 7]
Group 3 (chunker/embedder) [P with Groups 1, 2, 7]
Group 7 (settings)         [P with Groups 1, 2, 3]
    └── Group 4 (ingestion UI)      ← needs Groups 2 + 3
    └── Group 5 (search/query logic) ← needs Group 2
          └── Group 6 (query UI)    ← needs Groups 4 + 5
                └── Group 8 (integration) ← needs all
```