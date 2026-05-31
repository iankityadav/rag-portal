import React from 'react';

export function Progress({ value, label }: { value: number; label?: string }) {
    return (
        <div>
            <div>{label}</div>
            <div style={{ background: '#eee', width: 200 }}>
                <div style={{ width: `${value}%`, background: 'blue', height: 8 }} />
            </div>
        </div>
    );
}
