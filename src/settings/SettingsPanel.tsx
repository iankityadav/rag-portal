import React from 'react'
import { useState } from 'react'

export function SettingsPanel() {
    const [open, setOpen] = useState(false)
    return (
        <div style={{ padding: 12 }}>
            <button onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Settings'}</button>
            {open && (
                <div style={{ marginTop: 8, border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
                    <div><label>Top-K <input type="number" defaultValue={5} /></label></div>
                    <div style={{ marginTop: 8 }}><label>Chunk size <input type="number" defaultValue={512} /></label></div>
                </div>
            )}
        </div>
    )
}
