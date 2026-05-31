import React, { useEffect, useState } from 'react'
import { listDocuments, deleteDocument } from './opfsStore'
import { DocumentMeta } from '../shared/types'

export function DocumentList() {
    const [docs, setDocs] = useState<DocumentMeta[]>([])

    const reload = async () => {
        setDocs(await listDocuments())
    }

    useEffect(() => { reload() }, [])

    return (
        <div style={{ padding: 12 }}>
            <h3>Documents</h3>
            {docs.map(d => (
                <div key={d.docId} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>{d.name} <small>({d.chunkCount} chunks)</small></div>
                        <button onClick={async () => { await deleteDocument(d.docId); reload() }}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
