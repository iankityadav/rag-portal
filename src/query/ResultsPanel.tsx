import { Collapsible } from "../shared/Collapsible";
import type { SearchResult } from "../shared/types";
import { FileText, Sparkles, Clock } from "lucide-react";

interface ResultsPanelProps {
    results: SearchResult[];
    answer: string;
    isLoading: boolean;
}

function ScoreBadge({ score }: Readonly<{ score: number }>) {
    const lowScoreColor = score >= 0.65 ? "score-mid" : "score-low"
    const color =
        score >= 0.85 ? "score-high" : lowScoreColor;
    return <span className={`score-badge ${color}`}>{score.toFixed(2)}</span>;
}

export function ResultsPanel({ results, answer, isLoading }: Readonly<ResultsPanelProps>) {
    if (isLoading) {
        return (
            <div className="results-loading">
                <div className="results-loading-row">
                    <span className="results-loading-dot" />
                    <span className="results-loading-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="results-loading-dot" style={{ animationDelay: "0.3s" }} />
                    <span className="results-loading-label">Searching…</span>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="results-empty">
                <p className="results-empty-text">Results will appear here after a query.</p>
            </div>
        );
    }

    return (
        <div className="results-panel">
            {/* Retrieved chunks */}
            <div className="results-section">
                <div className="results-section-header">
                    <FileText size={11} />
                    <span>Retrieved Chunks</span>
                    <span className="results-count">{results.length}</span>
                </div>
                <div className="results-chunks">
                    {results.map((r, i) => (
                        <Collapsible
                            key={i}
                            label={r.docName}
                            badge={`${r.score.toFixed(2)}`}
                            defaultOpen={i === 0}
                        >
                            <div className="chunk-detail">
                                <div className="chunk-meta-row">
                                    <ScoreBadge score={r.score} />
                                    {!!(r.page) && <span className="chunk-page">p. {r.page}</span>}
                                    <span className="chunk-index">chunk #{r.chunkIndex}</span>
                                </div>
                                <p className="chunk-text">{r.text}</p>
                            </div>
                        </Collapsible>
                    ))}
                </div>
            </div>

            {/* LLM Answer */}
            {answer && (
                <div className="results-section">
                    <div className="results-section-header">
                        <Sparkles size={11} />
                        <span>Answer</span>
                    </div>
                    <div className="answer-box">
                        <p className="answer-text">{answer}</p>
                    </div>
                </div>
            )}

            {/* Pipeline timing stub */}
            <div className="pipeline-trace">
                <Clock size={10} />
                <span className="trace-item">embed <em>~42ms</em></span>
                <span className="trace-sep">·</span>
                <span className="trace-item">search <em>~8ms</em></span>
                <span className="trace-sep">·</span>
                <span className="trace-item">llm first-token <em>~840ms</em></span>
            </div>
        </div>
    );
}