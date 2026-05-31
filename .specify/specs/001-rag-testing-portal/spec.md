# Feature Specification: RAG Testing Portal

**Feature ID**: 001
**Branch**: `001-rag-testing-portal`
**Status**: Draft
**Created**: 2026-05-31

---

## Overview

A fully local, zero-server RAG (Retrieval-Augmented Generation) testing portal
implemented as a React SPA. All operations — document ingestion, vector storage,
similarity search, and LLM answer generation — run entirely in the user's browser
using OPFS for persistence.

### Problem Statement

Developers and AI engineers testing RAG pipelines currently need a running backend,
a hosted vector database, and cloud credentials just to iterate on chunking strategy
or retrieval quality. This portal eliminates all of that: open a browser tab, upload
a document, ask a question, inspect what was retrieved and why.

### Target Users

- AI/ML engineers prototyping RAG pipelines
- Developers evaluating chunk size / overlap tradeoffs
- Researchers who need a private, offline-capable RAG sandbox

---

## User Stories

### US-001: Browser Capability Check
> As a user opening the portal for the first time, I want to immediately know whether
> my browser can support all required features, so I am not surprised by failures
> mid-session.

**Acceptance Criteria**:
- [ ] On load, the app checks OPFS, WASM, `crossOriginIsolated`, and storage quota.
- [ ] If all checks pass, the main UI is shown.
- [ ] If any check fails, a full-screen error panel shows which check failed and why.
- [ ] The error panel links to a "how to fix" section for each failure type.
- [ ] No main UI modules are loaded until all checks pass.

---

### US-002: Model Download & Caching
> As a user, I want the embedding model downloaded once and cached locally, so
> subsequent sessions are instant.

**Acceptance Criteria**:
- [ ] On first run (after preflight pass), a modal explains the model download
  (~23 MB) and asks for confirmation.
- [ ] A progress bar shows download progress (MB downloaded / total).
- [ ] The model is saved to OPFS at `/models/all-MiniLM-L6-v2/`.
- [ ] On subsequent loads, the cached model is used with no network call.
- [ ] User can force re-download from Settings.

---

### US-003: Document Ingestion
> As a user, I want to upload PDF or plain-text files and have them chunked,
> embedded, and stored, so I can query them.

**Acceptance Criteria**:
- [ ] Supports `.pdf` (via `pdfjs-dist`) and `.txt` / `.md` files.
- [ ] User can configure chunk size (default 512 tokens) and overlap (default 64).
- [ ] Each chunk is embedded using the cached model.
- [ ] Chunks + vectors are stored in OPFS under `/index/<doc-id>/`.
- [ ] A document list panel shows all ingested documents with chunk counts.
- [ ] User can delete a document (removes its OPFS data).
- [ ] Ingestion progress is shown per document (chunks processed / total).

**Out of Scope**:
- DOCX, HTML, image OCR — future iterations.

---

### US-004: Query & Retrieval
> As a user, I want to type a natural-language question and retrieve the most
> relevant chunks, so I can verify retrieval quality before sending to an LLM.

**Acceptance Criteria**:
- [ ] Query input box with submit on Enter or button click.
- [ ] Query is embedded using the same model as ingestion.
- [ ] Top-K results (default 5, configurable 1–20) returned using cosine similarity.
- [ ] Results panel shows: chunk text, source document, page/position, similarity score.
- [ ] Results are shown even if no LLM provider is configured (retrieval-only mode).

---

### US-005: LLM Answer Generation
> As a user, I want to send retrieved chunks to an LLM to get a synthesized answer,
> so I can evaluate end-to-end RAG quality.

**Acceptance Criteria**:
- [ ] Settings panel allows configuring one of:
  - Anthropic API key (calls `api.anthropic.com`)
  - OpenAI API key (calls `api.openai.com`)
  - Ollama base URL (default `http://localhost:11434`)
- [ ] API keys stored in `sessionStorage` only.
- [ ] Retrieved chunks are assembled into a prompt with a configurable system prompt template.
- [ ] LLM response streams into a response panel.
- [ ] Prompt sent to LLM is visible/collapsible for debugging.
- [ ] If no provider configured, a "Configure LLM" nudge is shown instead.

---

### US-006: Inspection & Debugging Panel
> As a developer, I want to inspect the full RAG pipeline state — chunks, vectors,
> scores, and the exact prompt — so I can diagnose retrieval failures.

**Acceptance Criteria**:
- [ ] Each result card is expandable to show the raw embedding vector (truncated).
- [ ] The assembled prompt is shown in a collapsible code block.
- [ ] A "Pipeline trace" section shows timing for: embed query → search → LLM call.
- [ ] OPFS storage usage is shown in the footer (MB used / quota).

---

### US-007: Settings & Persistence
> As a user, I want my configuration (chunk size, top-K, LLM provider URL, system
> prompt template) saved across sessions.

**Acceptance Criteria**:
- [ ] Configuration saved to OPFS at `/config/settings.json`.
- [ ] Settings panel accessible from nav.
- [ ] Reset to defaults option available.
- [ ] API keys explicitly excluded from persistence (session-only).

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| First meaningful paint (preflight result) | < 500ms |
| Model load time (cached) | < 3s |
| Embedding throughput | ≥ 20 chunks/sec on modern laptop |
| Query latency (embed + search, 10k chunks) | < 2s |
| OPFS write for 100-page PDF | < 30s |
| Works offline (after model cached) | Yes (except LLM API calls) |

---

## Out of Scope (v1)

- Multi-user / shared index
- Re-ranking (cross-encoder)
- Hybrid search (BM25 + vector)
- Document versioning
- Export / import of the vector index
- Mobile layout optimization

---

## Open Questions

- [NEEDS CLARIFICATION: should chunk overlap be token-based or character-based?]
- [NEEDS CLARIFICATION: should the portal support multiple embedding models, or is
  `all-MiniLM-L6-v2` fixed for v1?]
- [NEEDS CLARIFICATION: which Anthropic model should be the default? claude-sonnet-4-20250514?]