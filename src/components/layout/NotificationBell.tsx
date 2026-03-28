"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { markAsRead, markAllAsRead, clearAll, NotificationItem } from "@/store/slices/notificationSlice";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
    info: <Info size={14} className="text-blue-500" />,
    success: <CheckCircle size={14} className="text-green-500" />,
    warning: <AlertTriangle size={14} className="text-amber-500" />,
    error: <XCircle size={14} className="text-red-500" />,
};

export const NotificationBell = () => {
    const dispatch = useDispatch();
    const { items, unreadCount } = useSelector((s: RootState) => s.notification);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "relative p-2 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-all duration-200",
                    open && "bg-[var(--bg-elevated)] text-[var(--text)]"
                )}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                        <span className="text-sm font-semibold text-[var(--text)]">Notifications</span>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => dispatch(markAllAsRead())}
                                    className="text-[10px] font-medium text-[var(--accent)] hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button
                                onClick={() => dispatch(clearAll())}
                                className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                                title="Clear all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                                <Bell size={32} className="text-[var(--text-muted)]" />
                                <p className="text-xs text-[var(--text-muted)]">No notifications yet</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => dispatch(markAsRead(item.id))}
                                    className={cn(
                                        "group flex gap-3 p-3 rounded-[var(--radius)] transition-all duration-150 cursor-pointer",
                                        item.read ? "opacity-70 grayscale-[0.5]" : "bg-[var(--accent-soft)]/20 hover:bg-[var(--accent-soft)]/30"
                                    )}
                                >
                                    <div className="mt-1 shrink-0">{iconMap[item.type]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className={cn("text-xs font-semibold truncate", !item.read && "text-[var(--accent)]")}>
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>
                                    {!item.read && (
                                        <div className="mt-1.5 shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
