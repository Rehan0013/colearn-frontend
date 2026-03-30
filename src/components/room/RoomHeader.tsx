"use client";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Room, PresenceUser } from "@/types";

interface RoomHeaderProps {
    room: Room;
    isConnected: boolean;
    presenceUsers: PresenceUser[];
    isAdmin: boolean;
    endingSession: boolean;
    onEndSession: () => void;
    onOpenSettings: () => void;
}

export function RoomHeader({
    room,
    isConnected,
    presenceUsers,
    isAdmin,
    endingSession,
    onEndSession,
    onOpenSettings
}: RoomHeaderProps) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0 shadow-sm z-10">
            <Link
                href="/rooms"
                className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-all"
            >
                <ArrowLeft size={18} />
            </Link>
            <div className="flex flex-col min-w-0">
                <h1 className="font-display font-semibold text-[var(--text)] truncate text-base leading-tight">
                    {room.name}
                </h1>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{room.subject}</span>
                    <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isConnected ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                        )} />
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                            {isConnected ? "Live" : "Offline"}
                        </span>
                    </div>
                    {!room.isActive && (
                        <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30">
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tighter">
                                Deactivated
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex ml-4 px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Code:</span>
                <span className="text-xs font-mono font-bold text-[var(--accent)]">{room.inviteCode}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 mr-4 pr-4 border-r border-[var(--border)]">
                    <span className="text-xs text-[var(--text-muted)]">
                        {presenceUsers.length} online
                    </span>
                    <div className="flex -space-x-2">
                        {presenceUsers.slice(0, 3).map((u) => (
                            <img
                                key={u.userId}
                                src={u.avatar}
                                alt={u.name}
                                className="w-6 h-6 rounded-full border-2 border-[var(--bg-surface)] object-cover shadow-sm"
                            />
                        ))}
                        {presenceUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)]">
                                +{presenceUsers.length - 3}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    loading={endingSession}
                    onClick={onEndSession}
                    className="h-8 text-xs px-3"
                >
                    <LogOut size={14} className="mr-2" /> Leave Room
                </Button>

                {isAdmin && (
                    <button
                        onClick={onOpenSettings}
                        className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all ml-1 border border-transparent hover:border-[var(--border)]"
                    >
                        <Settings size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
