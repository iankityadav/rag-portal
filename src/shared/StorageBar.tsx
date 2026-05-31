import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

export function StorageBar() {
    const [used, setUsed] = useState(0);
    const [quota, setQuota] = useState(0);

    useEffect(() => {
        navigator.storage?.estimate().then((est) => {
            setUsed(Math.round((est.usage ?? 0) / 1024 / 1024));
            setQuota(Math.round((est.quota ?? 0) / 1024 / 1024));
        });
    }, []);

    const pct = quota > 0 ? (used / quota) * 100 : 0;

    return (
        <div className="storage-bar">
            <HardDrive size={11} />
            <div className="storage-track">
                <div className="storage-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="storage-label">{used} MB</span>
        </div>
    );
}