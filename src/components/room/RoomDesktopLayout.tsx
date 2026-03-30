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
        <div className="hidden lg:flex flex-1 overflow-hidden">
            <Group orientation="horizontal">
                {/* Chat Panel */}
                <Panel defaultSize={45} minSize={30} className="flex flex-col bg-[var(--bg-surface)]">
                    <Chat roomId={roomId} {...socketActions} />
                </Panel>

                <Separator className="w-1.5 bg-transparent hover:bg-[var(--accent)]/10 transition-colors cursor-col-resize group flex items-center justify-center">
                    <div className="w-[1px] h-12 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors" />
                </Separator>

                {/* Notes Panel */}
                <Panel defaultSize={30} minSize={20} collapsible={true} className="flex flex-col border-x border-[var(--border)] bg-[var(--bg-surface)]">
                    <Notes roomId={roomId} updateNote={socketActions.updateNote} />
                </Panel>

                <Separator className="w-1.5 bg-transparent hover:bg-[var(--accent)]/10 transition-colors cursor-col-resize group flex items-center justify-center">
                    <div className="w-[1px] h-12 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors" />
                </Separator>

                {/* Pomodoro & Presence Panel */}
                <Panel defaultSize={25} minSize={20} collapsible={true} className="flex flex-col bg-[var(--bg-surface)]">
                    <div className="flex-1 border-b border-[var(--border)] overflow-hidden">
                        <Pomodoro {...socketActions} isAdmin={isAdmin} />
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <PresenceBar users={presenceUsers} isAdmin={isAdmin} roomId={roomId} />
                    </div>
                </Panel>
            </Group>
        </div>
    );
}
