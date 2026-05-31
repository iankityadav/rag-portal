import React, { useState } from 'react'
import { nanoid } from 'nanoid'
import { writeDocument } from './opfsStore'
import { DocumentMeta } from '../shared/types'

export function DocumentUpload({ onDone }: { onDone?: () => void }) {
    const [busy, setBusy] = useState(false)

    const onFile = async (f?: File) => {
        if (!f) return
        setBusy(true)
        const text = await f.text()
        const chunks = [text]
        const meta: DocumentMeta = {
            docId: nanoid(),
            name: f.name,
            chunkCount: chunks.length,
            createdAt: new Date().toISOString(),
            settings: { chunkSize: 512, overlap: 64 },
        }
        // deterministic fake embedding for demo
        const vec = new Float32Array(384)
        vec[0] = 1
        await writeDocument(meta, chunks, vec)
        setBusy(false)
        onDone?.()
    }

    return (
        <div style={{ padding: 12, border: '1px dashed #ccc', borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>Upload document (.txt/.md/.pdf)</div>
            <input type="file" onChange={e => onFile(e.target.files?.[0])} />
            {busy && <div>Processing…</div>}
        </div>
    )
}
