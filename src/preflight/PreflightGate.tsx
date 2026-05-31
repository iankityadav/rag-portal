import React, { useEffect, useState } from 'react';
import { runPreflightChecks } from './checks';
import { PreflightError } from './PreflightError';

export function PreflightGate({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const res = runPreflightChecks();
            setResults(res.results || res);
            setLoading(false);
        })();
    }, []);

    if (loading) return <div>Checking browser compatibility…</div>;
    const failed = Object.values(results).some((r: any) => !r.pass);
    if (failed) return <PreflightError results={Object.values(results)} />;
    return <>{children}</>;
}
