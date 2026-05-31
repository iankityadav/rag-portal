import React, { useState } from 'react';

export function Collapsible({ children, title }: { children: React.ReactNode; title: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(!open)}>{title} {open ? '▾' : '▸'}</button>
            {open && <div>{children}</div>}
        </div>
    );
}
