import { useEffect, useState } from "react";
import { runAllChecks } from "./checks";
import { PreflightError } from "./PreflightError";
import type { PreflightResult } from "../shared/types";
import { Zap } from "lucide-react";

interface PreflightGateProps {
    children: React.ReactNode;
}

type Status = "checking" | "pass" | "fail";

export function PreflightGate({ children }: Readonly<PreflightGateProps>) {
    const [status, setStatus] = useState<Status>("checking");
    const [results, setResults] = useState<PreflightResult[]>([]);

    useEffect(() => {
        runAllChecks().then((r) => {
            setResults(r);
            setStatus(r.every((x) => x.pass) ? "pass" : "fail");
        });
    }, []);

    if (status === "checking") {
        return (
            <div className="preflight-loading">
                <div className="preflight-loading-inner">
                    <div className="preflight-spinner">
                        <Zap size={18} />
                    </div>
                    <p className="preflight-loading-text">Checking browser compatibility…</p>
                    <div className="preflight-dots">
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        );
    }

    if (status === "fail") {
        return <PreflightError results={results} />;
    }

    return <>{children}</>;
}