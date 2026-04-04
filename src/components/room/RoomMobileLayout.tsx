"use client";
import { useState } from "react";
import { MessageSquare, FileText, Timer, Users, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Chat } from "@/components/room/Chat";
import { Notes } from "@/components/room/Notes";
import { Pomodoro } from "@/components/room/Pomodoro";
import { PresenceBar } from "@/components/room/PresenceBar";
import { cn } from "@/lib/utils";
import type { PresenceUser } from "@/types";

type ActivePanel = "chat" | "notes" | "timer" | "people";

interface PanelConfig {
    id: ActivePanel;
    label: string;
    icon: LucideIcon;
    color: string;
}

const panels: PanelConfig[] = [
    { id: "chat", label: "Chat", icon: MessageSquare, color: "text-[var(--accent)]" },
    { id: "notes", label: "Notes", icon: FileText, color: "text-[var(--accent)]" },
    { id: "timer", label: "Timer", icon: Timer, color: "text-[var(--accent)]" },
    { id: "people", label: "People", icon: Users, color: "text-[var(--accent)]" },
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

    const renderPanel = () => {
        switch (activePanel) {
            case "chat": return <Chat roomId={roomId} {...socketActions} />;
            case "notes": return <Notes roomId={roomId} updateNote={socketActions.updateNote} />;
            case "timer": return <Pomodoro {...socketActions} isAdmin={isAdmin} />;
            case "people": return <PresenceBar users={presenceUsers} isAdmin={isAdmin} roomId={roomId} />;
        }
    };

    return (
        <div className="flex lg:hidden flex-col flex-1 overflow-hidden bg-[var(--bg)]">
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePanel}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute inset-0 overflow-hidden"
                    >
                        {renderPanel()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Navigation */}
            <div className="h-16 border-t border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl flex items-center justify-around px-4 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-50">
                {panels.map((p) => {
                    const isActive = activePanel === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setActivePanel(p.id)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 min-w-[4.5rem] transition-all relative py-1",
                                isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-300",
                                isActive ? "bg-[var(--accent-soft)]" : "bg-transparent"
                            )}>
                                <p.icon 
                                    size={18} 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                    className="transition-transform duration-300 transform"
                                />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                isActive ? "opacity-100 scale-100" : "opacity-40 scale-90"
                            )}>
                                {p.label}
                            </span>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="mobile-nav-active"
                                    className="absolute -bottom-2 w-8 h-1 bg-[var(--accent)] rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
