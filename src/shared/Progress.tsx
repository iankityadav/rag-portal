interface ProgressProps {
    value: number; // 0–100
    label?: string;
    sublabel?: string;
    variant?: "default" | "success" | "warning";
}

export function Progress({ value, label, sublabel, variant = "default" }: ProgressProps) {
    return (
        <div className="progress-wrap">
            {(label || sublabel) && (
                <div className="progress-meta">
                    {label && <span className="progress-label">{label}</span>}
                    {sublabel && <span className="progress-sublabel">{sublabel}</span>}
                </div>
            )}
            <div className="progress-track">
                <div
                    className={`progress-fill progress-fill--${variant}`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
            <span className="progress-pct">{Math.round(value)}%</span>
        </div>
    );
}