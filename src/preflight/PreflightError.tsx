import type { PreflightResult } from "../shared/types";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface PreflightErrorProps {
    results: PreflightResult[];
}

export function PreflightError({ results }: PreflightErrorProps) {
    const failed = results.filter((r) => !r.pass);

    return (
        <div className="preflight-error-screen">
            <div className="preflight-error-card">
                <div className="preflight-error-header">
                    <AlertTriangle size={20} className="preflight-error-icon" />
                    <div>
                        <h1 className="preflight-error-title">Browser Compatibility Check Failed</h1>
                        <p className="preflight-error-sub">
                            {failed.length} of {results.length} checks failed. Resolve the issues below to continue.
                        </p>
                    </div>
                </div>

                <div className="preflight-checks-list">
                    {results.map((r) => (
                        <div key={r.name} className={`preflight-check-row ${r.pass ? "pass" : "fail"}`}>
                            <div className="preflight-check-top">
                                {r.pass
                                    ? <CheckCircle size={14} className="check-icon-pass" />
                                    : <XCircle size={14} className="check-icon-fail" />
                                }
                                <span className="preflight-check-name">{r.name}</span>
                                <span className={`preflight-check-badge ${r.pass ? "badge-pass" : "badge-fail"}`}>
                                    {r.pass ? "PASS" : "FAIL"}
                                </span>
                            </div>
                            {!r.pass && (
                                <div className="preflight-check-detail">
                                    <p className="preflight-check-error">{r.error}</p>
                                    {r.remediation && (
                                        <pre className="preflight-check-remediation">{r.remediation}</pre>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button className="preflight-retry-btn" onClick={() => window.location.reload()}>
                    Retry checks
                </button>
            </div>
        </div>
    );
}