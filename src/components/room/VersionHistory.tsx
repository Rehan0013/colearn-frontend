"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, RotateCcw, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { RootState } from "@/store";
import { setVersions, setNoteContent, toggleHistory } from "@/store/slices/notesSlice";
import { notesApi } from "@/lib/api";
import { Spinner } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
    roomId: string;
    onRestore: (content: string) => void;
}

export const VersionHistory = ({ roomId, onRestore }: Props) => {
    const dispatch = useDispatch();
    const { versions } = useSelector((s: RootState) => s.notes);
    const [loading, setLoading] = useState(true);
    const [previewing, setPreviewing] = useState<string | null>(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await notesApi.get(`/api/notes/${roomId}/history`);
                dispatch(setVersions(res.data.versions));
            } catch (err) {
                toast.error("Failed to fetch version history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [roomId, dispatch]);

    const handleRestore = async (versionId: string) => {
        setRestoring(true);
        try {
            const res = await notesApi.post(`/api/notes/${roomId}/restore/${versionId}`);
            dispatch(setNoteContent(res.data.content));
            onRestore(res.data.content);
            toast.success("Version restored");
            dispatch(toggleHistory());
        } catch (err) {
            toast.error("Failed to restore version");
        } finally {
            setRestoring(false);
        }
    };

    const handlePreview = async (versionId: string) => {
        setLoading(true);
        try {
            const res = await notesApi.get(`/api/notes/${roomId}/version/${versionId}`);
            setPreviewing(res.data.version.content);
        } catch (err) {
            toast.error("Failed to fetch version content");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-y-0 right-0 w-80 bg-[var(--bg-surface)] border-l border-[var(--border)] shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--accent)]" />
                    <h3 className="text-sm font-bold text-[var(--text)]">Version History</h3>
                </div>
                <button 
                    onClick={() => dispatch(toggleHistory())}
                    className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-muted)] transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {loading && (
                    <div className="flex justify-center py-10">
                        <Spinner size="md" />
                    </div>
                )}

                {!loading && versions.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-xs text-[var(--text-muted)]">No versions saved yet.</p>
                    </div>
                )}

                {versions.map((v) => (
                    <div 
                        key={v.id}
                        className="p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-all group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                {format(new Date(v.savedAt), "MMM d, HH:mm")}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] font-medium">
                                {v.label}
                            </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mb-3 bg-[var(--bg-elevated)] p-2 rounded italic">
                            "{v.preview}"
                        </p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="flex-1 text-[10px]"
                                onClick={() => handlePreview(v.id)}
                            >
                                Preview
                            </Button>
                            <Button 
                                size="sm" 
                                variant="primary" 
                                className="flex-1 text-[10px]"
                                loading={restoring}
                                onClick={() => handleRestore(v.id)}
                            >
                                <RotateCcw size={10} className="mr-1" /> Restore
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {previewing && (
                <div className="absolute inset-0 bg-[var(--bg-surface)] z-30 flex flex-col animate-in fade-in duration-200">
                    <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
                        <h3 className="text-sm font-bold text-[var(--text)]">Version Preview</h3>
                        <button onClick={() => setPreviewing(null)} className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-muted)]">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-[var(--text-muted)]">
                        {previewing}
                    </div>
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
                        <Button 
                            fullWidth 
                            variant="primary"
                            loading={restoring}
                            onClick={() => {
                                // Find correct ID for current preview
                                const v = versions.find(v => v.preview === previewing.slice(0, 100) + (previewing.length > 100 ? "..." : ""));
                                if (v) handleRestore(v.id);
                            }}
                        >
                            Restore this version
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
