import React from 'react';
import { SearchResult } from '../shared/types';

export function ResultsPanel({ results }: { results: SearchResult[] }) {
    return (
        <div>
            {results.map((r) => (
                <div key={`${r.docId}-${r.chunkIndex}`}>
                    <strong>[{r.score.toFixed(2)}]</strong> {r.docName}
                    <div>{r.text}</div>
                </div>
            ))}
        </div>
    );
}
