"use client";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Chat } from "@/components/room/Chat";
import { Notes } from "@/components/room/Notes";
import { Pomodoro } from "@/components/room/Pomodoro";
import { PresenceBar } from "@/components/room/PresenceBar";
import type { PresenceUser } from "@/types";

interface RoomDesktopLayoutProps {
    roomId: string;
    socketActions: any;
    isAdmin: boolean;
    presenceUsers: PresenceUser[];
}

export function RoomDesktopLayout({
    roomId,
    socketActions,
    isAdmin,
    presenceUsers
}: RoomDesktopLayoutProps) {
    return (
        <div className="hidden lg:flex flex-1 overflow-hidden p-2 gap-2 bg-[var(--bg)]">
            <Group orientation="horizontal" className="gap-2">
                {/* Chat Panel */}
                <Panel defaultSize={45} minSize={30} className="flex flex-col glass rounded-xl overflow-hidden shadow-sm border border-white/20 dark:border-white/5">
                    <Chat roomId={roomId} {...socketActions} />
                </Panel>

                <Separator className="w-1 bg-transparent hover:bg-[var(--accent)]/10 transition-colors cursor-col-resize group flex items-center justify-center rounded-full">
                    <div className="w-[2px] h-8 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-all rounded-full group-active:h-12" />
                </Separator>

                {/* Notes Panel */}
                <Panel defaultSize={30} minSize={20} collapsible={true} className="flex flex-col glass rounded-xl overflow-hidden shadow-sm border border-white/20 dark:border-white/5">
                    <Notes roomId={roomId} updateNote={socketActions.updateNote} />
                </Panel>

                <Separator className="w-1 bg-transparent hover:bg-[var(--accent)]/10 transition-colors cursor-col-resize group flex items-center justify-center rounded-full">
                    <div className="w-[2px] h-8 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-all rounded-full group-active:h-12" />
                </Separator>

                {/* Pomodoro & Presence Panel */}
                <Panel defaultSize={25} minSize={20} collapsible={true} className="flex flex-col glass rounded-xl overflow-hidden shadow-sm border border-white/20 dark:border-white/5">
                    <div className="flex-[1.4] border-b border-[var(--border)] overflow-y-auto custom-scrollbar">
                        <Pomodoro {...socketActions} isAdmin={isAdmin} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <PresenceBar users={presenceUsers} isAdmin={isAdmin} roomId={roomId} />
                    </div>
                </Panel>
            </Group>
        </div>
    );
}
