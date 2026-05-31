import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleProps {
    label: string;
    badge?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    mono?: boolean;
}

export function Collapsible({ label, badge, defaultOpen = false, children, mono }: Readonly<CollapsibleProps>) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`collapsible ${open ? "collapsible--open" : ""}`}>
            <button className="collapsible-trigger" onClick={() => setOpen((o) => !o)}>
                <ChevronDown size={12} className="collapsible-chevron" />
                <span className={mono ? "mono" : ""}>{label}</span>
                {badge && <span className="collapsible-badge">{badge}</span>}
            </button>
            {open && <div className="collapsible-body">{children}</div>}
        </div>
    );
}