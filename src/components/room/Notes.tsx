"use client";
import { useEffect, useRef, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, History, Download, FileText, Check, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { localEdit, setIsSaving, toggleHistory } from "@/store/slices/notesSlice";
import type { RootState } from "@/store";
import { notesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { VersionHistory } from "./VersionHistory";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
    roomId: string;
    updateNote: (content: string) => void;
}

export const Notes = memo(({ roomId, updateNote }: Props) => {
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
            toast.success("Snapshot created");
        } catch {
            toast.error("Failed to save snapshot");
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
        <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
            {/* Toolbar */}
            <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 backdrop-blur-sm shrink-0"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[var(--accent-soft)]">
                        <FileText size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider">Collaborative Editor</span>
                        <div className="flex items-center gap-2">
                            <AnimatePresence mode="wait">
                                {isSaving ? (
                                    <motion.div 
                                        key="saving"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Loader2 size={10} className="text-[var(--accent)] animate-spin" />
                                        <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-tighter">Syncing...</span>
                                    </motion.div>
                                ) : isDirty ? (
                                    <motion.div 
                                        key="dirty"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Sparkles size={10} className="text-[var(--amber)] animate-pulse" />
                                        <span className="text-[9px] font-bold text-[var(--amber)] uppercase tracking-tighter">Drafting</span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="saved"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Check size={10} className="text-[var(--green)]" />
                                        <span className="text-[9px] font-bold text-[var(--green)] uppercase tracking-tighter">Synced</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => dispatch(toggleHistory())}
                        title="Version History"
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] transition-all active:scale-95"
                    >
                        <History size={16} />
                    </button>
                    
                    <div className="w-[1px] h-4 bg-[var(--border)] mx-1 opacity-50" />

                    <div className="flex items-center bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-0.5 shadow-sm">
                        <button 
                            onClick={() => handleExport("md")}
                            title="Export as Markdown"
                            className="p-1 px-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all text-[10px] font-bold"
                        >
                            MD
                        </button>
                        <div className="w-[1px] h-3 bg-[var(--border)] opacity-50" />
                        <button 
                            onClick={() => handleExport("pdf")}
                            title="Export as PDF"
                            className="p-1 px-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all text-[10px] font-bold"
                        >
                            PDF
                        </button>
                    </div>

                    <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={handleManualSave}
                        loading={isSaving}
                        className="ml-1 h-8 text-[10px] px-3 font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--accent)]/10"
                    >
                        Save
                    </Button>
                </div>
            </motion.div>

            {/* Version History Sidebar */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-20"
                    >
                        <VersionHistory 
                            roomId={roomId} 
                            onRestore={(newContent) => {
                                setLocalContent(newContent);
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor */}
            <div className="flex-1 relative group">
                <textarea
                    value={localContent}
                    onChange={handleChange}
                    placeholder="Start documenting your thoughts here... (Markdown supported)"
                    className="absolute inset-0 w-full h-full bg-transparent text-[15px] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 resize-none outline-none p-6 font-mono leading-[1.7] selection:bg-[var(--accent)]/20 custom-scrollbar"
                    spellCheck={false}
                />
            </div>
        </div>
    );
});

Notes.displayName = "Notes";
