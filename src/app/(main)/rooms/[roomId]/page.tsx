"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageSquare, FileText, Timer, Users } from "lucide-react";
import { fetchRoomById } from "@/store/slices/roomSlice";
import { clearChat } from "@/store/slices/chatSlice";
import { clearNotes } from "@/store/slices/notesSlice";
import { clearPomodoro } from "@/store/slices/pomodoroSlice";
import type { RootState, AppDispatch } from "@/store";
import { useSocket } from "@/hooks/useSocket";
import { Chat } from "@/components/room/Chat";
import { Notes } from "@/components/room/Notes";
import { Pomodoro } from "@/components/room/Pomodoro";
import { PresenceBar } from "@/components/room/PresenceBar";
import { Spinner } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Panel = "chat" | "notes" | "timer" | "people";

const panels = [
    { id: "chat" as Panel,   label: "Chat",   icon: MessageSquare },
    { id: "notes" as Panel,  label: "Notes",  icon: FileText },
    { id: "timer" as Panel,  label: "Timer",  icon: Timer },
    { id: "people" as Panel, label: "People", icon: Users },
];

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const roomId = params.roomId as string;

    const { current: room, loading, presenceUsers } = useSelector((s: RootState) => s.room);
    const [activePanel, setActivePanel] = useState<Panel>("chat");

    // Connect socket and register all event handlers
    const socketActions = useSocket(roomId);

    useEffect(() => {
        dispatch(fetchRoomById(roomId));
        return () => {
            // Clean up all room state on leave
            dispatch(clearChat());
            dispatch(clearNotes());
            dispatch(clearPomodoro());
        };
    }, [roomId]);

    if (loading || !room) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">

            {/* ── Room header ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                <Link
                    href="/rooms"
                    className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-all"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex flex-col min-w-0">
                    <h1 className="font-display font-semibold text-[var(--text)] truncate">
                        {room.name}
                    </h1>
                    <span className="text-xs text-[var(--text-muted)]">{room.subject}</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                        {presenceUsers.length} online
                    </span>
                    <div className="flex -space-x-2">
                        {presenceUsers.slice(0, 4).map((u) => (
                            <img
                                key={u.userId}
                                src={u.avatar}
                                alt={u.name}
                                title={u.name}
                                className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface)] object-cover"
                            />
                        ))}
                        {presenceUsers.length > 4 && (
                            <div className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)]">
                                +{presenceUsers.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Desktop: side-by-side panels */}
                <div className="hidden lg:flex flex-1 overflow-hidden">
                    <div className="flex-1 border-r border-[var(--border)] overflow-hidden">
                        <Chat roomId={roomId} {...socketActions} />
                    </div>
                    <div className="w-80 flex flex-col overflow-hidden border-r border-[var(--border)]">
                        <Notes roomId={roomId} updateNote={socketActions.updateNote} />
                    </div>
                    <div className="w-72 flex flex-col overflow-hidden">
                        <div className="flex-1 border-b border-[var(--border)]">
                            <Pomodoro {...socketActions} />
                        </div>
                        <div className="flex-1 overflow-auto">
                            <PresenceBar users={presenceUsers} />
                        </div>
                    </div>
                </div>

                {/* Mobile: tabbed panels */}
                <div className="flex flex-col flex-1 lg:hidden overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        {activePanel === "chat"   && <Chat roomId={roomId} {...socketActions} />}
                        {activePanel === "notes"  && <Notes roomId={roomId} updateNote={socketActions.updateNote} />}
                        {activePanel === "timer"  && <Pomodoro {...socketActions} />}
                        {activePanel === "people" && <PresenceBar users={presenceUsers} />}
                    </div>

                    {/* Bottom tab bar */}
                    <div className="flex border-t border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                        {panels.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActivePanel(id)}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all",
                                    activePanel === id
                                        ? "text-[var(--accent)]"
                                        : "text-[var(--text-muted)]"
                                )}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
