# RAG Testing Portal — Constitution

> The immutable principles governing how this project is built and evolved.

---

## Article I: Browser-First, Zero-Server Principle

All data processing — ingestion, chunking, embedding, similarity search — MUST run
entirely in the browser. No backend server shall be introduced. If a capability cannot
be achieved client-side, it must be deferred or replaced with a browser-compatible
alternative.

- OPFS (Origin Private File System) is the ONLY persistent storage layer.
- IndexedDB may be used for lightweight metadata only.
- `localStorage` / `sessionStorage` are FORBIDDEN for vector or document data.

---

## Article II: Pre-Flight Check Mandate

The application MUST perform a Browser Capability Check before loading any feature.
This check is NON-NEGOTIABLE and runs synchronously on every cold start.

Required checks (all must pass before the app proceeds):
1. `navigator.storage.getDirectory()` — OPFS availability
2. `crossOriginIsolated` — SharedArrayBuffer support (required by ONNX WASM)
3. Available storage quota ≥ 200 MB
4. WebAssembly support (`typeof WebAssembly === 'object'`)

If any check fails, the app MUST display a human-readable error with remediation
instructions. It MUST NOT proceed to load the main UI.

---

## Article III: Embedding Model Constraints

- The embedding model (`Xenova/all-MiniLM-L6-v2`) is downloaded ONCE and cached
  in OPFS under `/models/`.
- Model download only happens after the user explicitly confirms (modal prompt).
- The app MUST display download progress (bytes downloaded / total).
- No embedding request shall be made to any external API unless the user explicitly
  configures an API-key-based embedding provider in Settings.

---

## Article IV: LLM Provider Agnosticism

The LLM layer (answer generation) MUST be provider-agnostic:
- Anthropic Claude (API key, user-supplied)
- OpenAI (API key, user-supplied)
- Ollama (local, `http://localhost:11434`)

API keys MUST be stored in `sessionStorage` ONLY (cleared on tab close).
They MUST NEVER be written to OPFS, IndexedDB, or any persistent store.

---

## Article V: Simplicity Gate

- Maximum 3 top-level feature modules for initial implementation.
- No abstraction layers wrapping browser-native APIs unless justified in writing.
- No build-time code generation; no backend scaffolding tools.

Initial modules:
1. `preflight` — Browser capability checks
2. `ingestion` — Document loading, chunking, embedding, OPFS storage
3. `query` — Similarity search, context assembly, LLM call, result display

---

## Article VI: Test-First Imperative

All logic (chunking, cosine similarity, OPFS read/write helpers) MUST have unit
tests written BEFORE implementation. Tests run in-browser via Vitest.

---

## Article VII: Privacy by Design

- No telemetry, no analytics, no external calls except:
  - Model CDN (Hugging Face) for one-time model download
  - User-configured LLM API endpoint
- Document content never leaves the browser unless the user initiates an LLM call.

---

## Article VIII: Amendment Process

Changes to this constitution require:
1. A written rationale in the PR description
2. Explicit acknowledgment that the change does not violate browser-first or privacy
   principles
3. Update to the version line below

**Version**: 1.0.0 — Initial