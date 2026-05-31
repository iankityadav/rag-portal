import { Loader2, Upload } from "lucide-react";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import { Progress } from "../shared/Progress";
import type { DocumentMeta } from "../shared/types";

interface DocumentUploadProps {
    onDocumentAdded: (doc: DocumentMeta) => void;
}

type UploadState = "idle" | "dragging" | "processing";

export function DocumentUpload({ onDocumentAdded }: Readonly<DocumentUploadProps>) {
    const [state, setState] = useState<UploadState>("idle");
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        setState("processing");
        setProgress(0);

        // Stub processing — T-011 (chunker) + T-010 (embedder) will replace this
        setProgressLabel(`Reading ${file.name}…`);
        await delay(300);
        setProgress(25);

        setProgressLabel("Chunking…");
        await delay(400);
        setProgress(55);

        setProgressLabel("Embedding…");
        await delay(600);
        setProgress(90);

        setProgressLabel("Saving to OPFS…");
        await delay(200);
        setProgress(100);

        const doc: DocumentMeta = {
            docId: nanoid(10),
            name: file.name,
            chunkCount: Math.floor(Math.random() * 60) + 10, // stub count
            createdAt: new Date().toISOString(),
            settings: { chunkSize: 512, overlap: 64 },
        };

        onDocumentAdded(doc);
        setState("idle");
        setProgress(0);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="upload-zone-wrap">
            {state === "processing" ? (
                <div className="upload-processing">
                    <div className="upload-processing-header">
                        <Loader2 size={12} className="spin" />
                        <span>{progressLabel}</span>
                    </div>
                    <Progress value={progress} />
                </div>
            ) : (
                <div
                    className={`upload-zone ${state === "dragging" ? "upload-zone--drag" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                    onDragLeave={() => setState("idle")}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.txt,.md"
                        style={{ display: "none" }}
                        onChange={handleChange}
                    />
                    <div className="upload-zone-inner">
                        <Upload size={14} className="upload-icon" />
                        <span className="upload-label">Drop file or click</span>
                        <span className="upload-hint">.pdf · .txt · .md</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}