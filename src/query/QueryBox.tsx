import React, { useState } from 'react';

export function QueryBox({ onSubmit }: { onSubmit: (q: string) => void }) {
    const [val, setVal] = useState('');
    const submit = () => { if (!val) return; onSubmit(val); setVal(''); };
    return (
        <div>
            <input value={val} onChange={e => setVal((e.target as HTMLInputElement).value)} />
            <button onClick={submit}>Ask</button>
        </div>
    );
}
