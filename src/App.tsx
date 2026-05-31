import React, { useEffect, useState } from 'react'
import { PreflightGate } from './preflight/PreflightGate'
import { QueryBox } from './query/QueryBox'
import { ResultsPanel } from './query/ResultsPanel'
import { SearchResult } from './shared/types'
import { DocumentUpload } from './ingestion/DocumentUpload'
import { DocumentList } from './ingestion/DocumentList'
import { SettingsPanel } from './settings/SettingsPanel'
import { getStorageUsage } from './ingestion/opfsStore'

export default function App() {
    const [results, setResults] = useState<SearchResult[]>([])
    const [usage, setUsage] = useState<{ usedMB: number; quotaMB: number } | null>(null)

    useEffect(() => { (async () => setUsage(await getStorageUsage()))() }, [])

    const onSubmit = (q: string) => {
        const r: SearchResult = {
            chunkIndex: 0,
            docId: 'demo-1',
            docName: 'demo.txt',
            text: `You asked: ${q}`,
            score: 0.91,
        }
        setResults([r])
    }

    return (
        <PreflightGate>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, padding: 16, minHeight: '100vh' }}>
                <aside style={{ borderRight: '1px solid #eee', paddingRight: 12 }}>
                    <h2>Documents</h2>
                    <DocumentUpload onDone={async () => setUsage(await getStorageUsage())} />
                    <DocumentList />
                    <SettingsPanel />
                </aside>

                <section style={{ paddingLeft: 12 }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>RAG Portal</h1>
                        <div>{usage ? `${usage.usedMB}MB / ${usage.quotaMB}MB` : '—'}</div>
                    </header>

                    <main style={{ marginTop: 12 }}>
                        <QueryBox onSubmit={onSubmit} />
                        <ResultsPanel results={results} />
                    </main>
                </section>
            </div>
        </PreflightGate>
    )
}
