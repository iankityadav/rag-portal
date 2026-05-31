import { useState } from "react";
import { PreflightGate } from "./preflight/PreflightGate";
import { DocumentList } from "./ingestion/DocumentList";
import { DocumentUpload } from "./ingestion/DocumentUpload";
import { QueryBox } from "./query/QueryBox";
import { ResultsPanel } from "./query/ResultsPanel";
import { SettingsPanel } from "./settings/SettingsPanel";
import { StorageBar } from "./shared/StorageBar";
import type { DocumentMeta, SearchResult } from "./shared/types";
import { Settings, Database, Zap, ChevronRight } from "lucide-react";

type View = "query" | "settings";

export default function App() {
    const [view, setView] = useState<View>("query");
    const [documents, setDocuments] = useState<DocumentMeta[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [answer, setAnswer] = useState("");
    const [isQuerying, setIsQuerying] = useState(false);
    const [activeDoc, setActiveDoc] = useState<string | null>(null);

    return (
        <PreflightGate>
            <div className="app-shell">
                {/* Top nav bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="logo-mark">
                            <Zap size={14} strokeWidth={2.5} />
                        </div>
                        <span className="logo-text">RAG<span className="logo-accent">Portal</span></span>
                        <span className="logo-divider">/</span>
                        <span className="logo-sub">local testing suite</span>
                    </div>
                    <nav className="topbar-nav">
                        <button
                            className={`nav-btn ${view === "query" ? "active" : ""}`}
                            onClick={() => setView("query")}
                        >
                            <Database size={13} />
                            Query
                        </button>
                        <button
                            className={`nav-btn ${view === "settings" ? "active" : ""}`}
                            onClick={() => setView("settings")}
                        >
                            <Settings size={13} />
                            Settings
                        </button>
                    </nav>
                    <div className="topbar-right">
                        <StorageBar />
                    </div>
                </header>

                {view === "settings" ? (
                    <SettingsPanel />
                ) : (
                    <div className="workspace">
                        {/* Left sidebar */}
                        <aside className="sidebar">
                            <div className="sidebar-header">
                                <span className="sidebar-title">Documents</span>
                                <span className="doc-count">{documents.length}</span>
                            </div>
                            <DocumentUpload
                                onDocumentAdded={(doc) => setDocuments((d) => [...d, doc])}
                            />
                            <DocumentList
                                documents={documents}
                                activeDoc={activeDoc}
                                onSelect={setActiveDoc}
                                onDelete={(id) => setDocuments((d) => d.filter((x) => x.docId !== id))}
                            />
                        </aside>

                        {/* Main area */}
                        <main className="main-area">
                            <div className="query-section">
                                <div className="section-label">
                                    <ChevronRight size={11} />
                                    Query
                                </div>
                                <QueryBox
                                    disabled={documents.length === 0 || isQuerying}
                                    onQuery={(q) => {
                                        setIsQuerying(true);
                                        setResults([]);
                                        setAnswer("");
                                        // Stub: real pipeline wired in tasks T-015 through T-017
                                        setTimeout(() => {
                                            setResults([
                                                {
                                                    chunkIndex: 0,
                                                    docId: documents[0]?.docId ?? "",
                                                    docName: documents[0]?.name ?? "—",
                                                    text: `This is a retrieved chunk relevant to: "${q}". Wire up opfsStore + search.ts in T-015 to replace this stub.`,
                                                    score: 0.91,
                                                    page: 1,
                                                },
                                                {
                                                    chunkIndex: 1,
                                                    docId: documents[0]?.docId ?? "",
                                                    docName: documents[0]?.name ?? "—",
                                                    text: "Another highly relevant passage from the document. Cosine similarity search will rank real results here.",
                                                    score: 0.84,
                                                },
                                            ]);
                                            setAnswer("This is a stub LLM answer. Configure an LLM provider in Settings and implement llm.ts (T-017) to see real responses streamed here.");
                                            setIsQuerying(false);
                                        }, 1200);
                                    }}
                                />
                            </div>

                            <ResultsPanel
                                results={results}
                                answer={answer}
                                isLoading={isQuerying}
                            />
                        </main>
                    </div>
                )}
            </div>
        </PreflightGate>
    );
}