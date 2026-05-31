import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface QueryBoxProps {
    disabled?: boolean;
    onQuery: (query: string) => void;
}

export function QueryBox({ disabled, onQuery }: Readonly<QueryBoxProps>) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = () => {
        if (!value.trim() || disabled || loading) return;
        setLoading(true);
        onQuery(value.trim());
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="querybox-wrap">
            <div className={`querybox ${disabled ? "querybox--disabled" : ""}`}>
                <input
                    className="querybox-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder={
                        disabled
                            ? "Upload a document first…"
                            : "Ask a question about your documents…"
                    }
                    disabled={disabled || loading}
                />
                <button
                    className="querybox-btn"
                    onClick={submit}
                    disabled={!value.trim() || disabled || loading}
                >
                    {loading
                        ? <Loader2 size={14} className="spin" />
                        : <ArrowRight size={14} />
                    }
                </button>
            </div>
        </div>
    );
}