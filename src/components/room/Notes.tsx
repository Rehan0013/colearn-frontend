"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, History, Download } from "lucide-react";
import { localEdit, setIsSaving } from "@/store/slices/notesSlice";
import type { RootState } from "@/store";
import { notesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
    roomId: string;
    updateNote: (content: string) => void;
}

export const Notes = ({ roomId, updateNote }: Props) => {
    const dispatch = useDispatch();
    const { content, isDirty, isSaving } = useSelector((s: RootState) => s.notes);
    const broadcastTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Debounced broadcast to other users via socket
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        dispatch(localEdit(val));

        clearTimeout(broadcastTimer.current);
        broadcastTimer.current = setTimeout(() => {
            updateNote(val);
        }, 500);
    };

    const handleManualSave = async () => {
        dispatch(setIsSaving(true));
        try {
            await notesApi.post(`/api/notes/${roomId}/save`, { content });
            toast.success("Note saved");
        } catch {
            toast.error("Failed to save note");
        } finally {
            dispatch(setIsSaving(false));
        }
    };

    const handleExport = (format: "md" | "pdf") => {
        window.open(
            `${process.env.NEXT_PUBLIC_NOTES_URL}/api/notes/${roomId}/export?format=${format}`,
            "_blank"
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                <span className="text-sm font-medium text-[var(--text)]">Shared Notes</span>
                <div className="flex items-center gap-1">
                    {isDirty && (
                        <span className="text-[10px] text-[var(--text-muted)]">unsaved</span>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleManualSave}
                        loading={isSaving}
                        title="Save"
                    >
                        <Save size={14} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExport("md")}
                        title="Export as Markdown"
                    >
                        <Download size={14} />
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <textarea
                value={content}
                onChange={handleChange}
                placeholder="Start taking notes... (Markdown supported)"
                className="flex-1 w-full bg-[var(--bg-surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none outline-none p-4 font-mono leading-relaxed"
                spellCheck={false}
            />

            {/* Export bar */}
            <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-surface)] flex items-center gap-2 shrink-0">
                <span className="text-xs text-[var(--text-muted)] mr-auto">Export:</span>
                <button
                    onClick={() => handleExport("md")}
                    className="text-xs text-[var(--accent)] hover:underline"
                >
                    .md
                </button>
                <span className="text-[var(--border)]">·</span>
                <button
                    onClick={() => handleExport("pdf")}
                    className="text-xs text-[var(--accent)] hover:underline"
                >
                    .pdf
                </button>
            </div>
        </div>
    );
};
