import React from 'react';
import { PreflightResult } from '../shared/types';

export function PreflightError({ results }: Readonly<{ results: PreflightResult[] }>) {
    const failed = results.filter(r => !r.pass);
    return (
        <div style={{ padding: 24 }}>
            <h1>Browser compatibility checks failed</h1>
            {failed.map((f) => (
                <div key={(f as any).id} style={{ marginTop: 12 }}>
                    <h3>{(f as any).id}</h3>
                    <p>{f.message || f.error || 'Unknown issue'}</p>
                </div>
            ))}
            <div style={{ marginTop: 24 }}>
                <p>Please follow the remediation steps shown for each failure.</p>
            </div>
        </div>
    );
}
