"use client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, History, Download, FileText, FileCode } from "lucide-react";
import { localEdit, setIsSaving, toggleHistory, setNoteContent } from "@/store/slices/notesSlice";
import type { RootState } from "@/store";
import { notesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { VersionHistory } from "./VersionHistory";
import toast from "react-hot-toast";

interface Props {
    roomId: string;
    updateNote: (content: string) => void;
}

export const Notes = ({ roomId, updateNote }: Props) => {
    const dispatch = useDispatch();
    const { content, isDirty, isSaving, showHistory } = useSelector((s: RootState) => s.notes);
    const [localContent, setLocalContent] = useState(content);
    const isTyping = useRef(false);
    const broadcastTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Sync local content from Redux ONLY when not typing
    useEffect(() => {
        if (!isTyping.current) {
            setLocalContent(content);
        }
    }, [content]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalContent(val);
        isTyping.current = true;
        dispatch(localEdit(val));

        clearTimeout(broadcastTimer.current);
        broadcastTimer.current = setTimeout(() => {
            updateNote(val);
            isTyping.current = false;
        }, 300); // Faster sync
    };

    const handleManualSave = async () => {
        dispatch(setIsSaving(true));
        try {
            await notesApi.post(`/api/notes/${roomId}/save`, { content: localContent });
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
        <div className="flex flex-col h-full bg-[var(--bg-surface)] relative overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[var(--accent)]" />
                    <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Shared Notes</span>
                    {isDirty && (
                        <span className="text-[10px] text-[var(--accent)] animate-pulse font-mono font-bold tracking-tighter">UNSAVED</span>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => dispatch(toggleHistory())}
                        title="Version History"
                        className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text)] transition-all"
                    >
                        <History size={16} />
                    </button>
                    
                    <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

                    <div className="flex items-center bg-[var(--bg-surface)] rounded-[var(--radius)] border border-[var(--border)] p-0.5">
                        <button 
                            onClick={() => handleExport("md")}
                            title="Export as Markdown"
                            className="p-1 px-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all text-[10px] font-bold"
                        >
                            MD
                        </button>
                        <div className="w-[1px] h-3 bg-[var(--border)]" />
                        <button 
                            onClick={() => handleExport("pdf")}
                            title="Export as PDF"
                            className="p-1 px-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all text-[10px] font-bold"
                        >
                            PDF
                        </button>
                    </div>

                    <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={handleManualSave}
                        loading={isSaving}
                        className="ml-1 h-7 text-[10px] px-2"
                    >
                        <Save size={12} className="mr-1" /> Save
                    </Button>
                </div>
            </div>

            {/* Version History Sidebar */}
            {showHistory && (
                <VersionHistory 
                    roomId={roomId} 
                    onRestore={(newContent) => {
                        setLocalContent(newContent);
                    }} 
                />
            )}

            {/* Editor */}
            <textarea
                value={localContent}
                onChange={handleChange}
                placeholder="Start taking notes... (Markdown supported)"
                className="flex-1 w-full bg-[var(--bg-surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none outline-none p-4 font-mono leading-relaxed"
                spellCheck={false}
            />

        </div>
    );
};
