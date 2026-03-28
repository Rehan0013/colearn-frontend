"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { RootState, AppDispatch } from "@/store";
import { fetchHistory } from "@/store/slices/sessionSlice";
import { formatMinutes } from "@/lib/utils";
import { Spinner } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";

export const SessionHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { history, loading } = useSelector((s: RootState) => s.session);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchHistory({ page, limit: 10 }));
    }, [dispatch, page]);

    if (loading && history.length === 0) {
        return (
            <div className="flex justify-center py-10">
                <Spinner size="md" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-10 bg-[var(--bg-elevated)] rounded-[var(--radius)] border border-dashed border-[var(--border)]">
                <BookOpen size={24} className="mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
                <p className="text-xs text-[var(--text-muted)]">No study sessions recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)]">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-elevated)] text-[var(--text-muted)] border-b border-[var(--border)]">
                            <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Subject</th>
                            <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {history.map((session) => (
                            <tr key={session._id} className="hover:bg-[var(--bg-elevated)] transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={13} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                                        <span className="text-[13px] text-[var(--text)]">
                                            {format(new Date(session.joinedAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-[13px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                                        {session.subject}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5 font-medium text-[var(--text)]">
                                        <Clock size={13} className="text-[var(--text-muted)]" />
                                        {formatMinutes(session.durationMinutes)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-tighter">
                   Recent Sessions
                </span>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-xs font-mono text-[var(--text)] min-w-[3ch] text-center">{page}</span>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        disabled={history.length < 10}
                        onClick={() => setPage(p => p + 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
