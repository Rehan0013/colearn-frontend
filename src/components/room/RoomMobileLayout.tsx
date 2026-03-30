"use client";
import { useState } from "react";
import { MessageSquare, FileText, Timer, Users } from "lucide-react";
import { Chat } from "@/components/room/Chat";
import { Notes } from "@/components/room/Notes";
import { Pomodoro } from "@/components/room/Pomodoro";
import { PresenceBar } from "@/components/room/PresenceBar";
import { cn } from "@/lib/utils";
import type { PresenceUser } from "@/types";

type ActivePanel = "chat" | "notes" | "timer" | "people";

const panels = [
    { id: "chat" as ActivePanel, label: "Chat", icon: MessageSquare },
    { id: "notes" as ActivePanel, label: "Notes", icon: FileText },
    { id: "timer" as ActivePanel, label: "Timer", icon: Timer },
    { id: "people" as ActivePanel, label: "People", icon: Users },
];

interface RoomMobileLayoutProps {
    roomId: string;
    socketActions: any;
    isAdmin: boolean;
    presenceUsers: PresenceUser[];
}

export function RoomMobileLayout({
    roomId,
    socketActions,
    isAdmin,
    presenceUsers
}: RoomMobileLayoutProps) {
    const [activePanel, setActivePanel] = useState<ActivePanel>("chat");

    return (
        <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-[var(--bg-surface)]">
                {activePanel === "chat" && <Chat roomId={roomId} {...socketActions} />}
                {activePanel === "notes" && <Notes roomId={roomId} updateNote={socketActions.updateNote} />}
                {activePanel === "timer" && <Pomodoro {...socketActions} isAdmin={isAdmin} />}
                {activePanel === "people" && <PresenceBar users={presenceUsers} isAdmin={isAdmin} roomId={roomId} />}
            </div>

            {/* Mobile Navigation */}
            <div className="h-16 border-t border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-around px-2 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {panels.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setActivePanel(p.id)}
                        className={cn(
                            "flex flex-col items-center gap-1.5 min-w-[4rem] transition-all relative py-1",
                            activePanel === p.id
                                ? "text-[var(--accent)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        )}
                    >
                        <p.icon size={20} strokeWidth={activePanel === p.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{p.label}</span>
                        {activePanel === p.id && (
                            <div className="absolute -top-1 w-8 h-1 bg-[var(--accent)] rounded-full animate-in fade-in zoom-in duration-300" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
