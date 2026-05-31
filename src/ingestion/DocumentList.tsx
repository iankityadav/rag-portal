import { FileText, Trash2, Layers } from "lucide-react";
import type { DocumentMeta } from "../shared/types";

interface DocumentListProps {
    documents: DocumentMeta[];
    activeDoc: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export function DocumentList({ documents, activeDoc, onSelect, onDelete }: Readonly<DocumentListProps>) {
    if (documents.length === 0) {
        return (
            <div className="doclist-empty">
                <Layers size={20} className="doclist-empty-icon" />
                <p>No documents yet</p>
                <span>Upload a file above to get started</span>
            </div>
        );
    }

    return (
        <div className="doclist">
            {documents.map((doc) => (
                <div
                    key={doc.docId}
                    className={`doclist-item ${activeDoc === doc.docId ? "doclist-item--active" : ""}`}
                    onClick={() => onSelect(doc.docId)}
                >
                    <div className="doclist-item-left">
                        <FileText size={12} className="doclist-icon" />
                        <div className="doclist-meta">
                            <span className="doclist-name">{doc.name}</span>
                            <span className="doclist-chunks">{doc.chunkCount} chunks</span>
                        </div>
                    </div>
                    <button
                        className="doclist-delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(doc.docId); }}
                        title="Remove document"
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            ))}
        </div>
    );
}