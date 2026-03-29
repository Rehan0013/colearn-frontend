"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, ArrowLeft, MessageSquare, FileText, Timer, Users, Settings, Trash2 } from "lucide-react";
import { fetchRoomById, updateRoom, deleteRoom } from "@/store/slices/roomSlice";
import { sessionApi } from "@/lib/api";
import { clearChat } from "@/store/slices/chatSlice";
import { clearNotes } from "@/store/slices/notesSlice";
import { clearPomodoro } from "@/store/slices/pomodoroSlice";
import type { RootState, AppDispatch } from "@/store";
import { useSocket } from "@/hooks/useSocket";
import { Chat } from "@/components/room/Chat";
import { Notes } from "@/components/room/Notes";
import { Pomodoro } from "@/components/room/Pomodoro";
import { PresenceBar } from "@/components/room/PresenceBar";
import { CreateRoomForm } from "@/components/room/CreateRoomForm";
import { Spinner, Modal } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import { Panel, Group, Separator } from "react-resizable-panels";

type ActivePanel = "chat" | "notes" | "timer" | "people";

const panels = [
    { id: "chat" as ActivePanel,   label: "Chat",   icon: MessageSquare },
    { id: "notes" as ActivePanel,  label: "Notes",  icon: FileText },
    { id: "timer" as ActivePanel,  label: "Timer",  icon: Timer },
    { id: "people" as ActivePanel, label: "People", icon: Users },
];

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const roomId = params.roomId as string;

    const user = useSelector((s: RootState) => s.user.data);
    const { current: room, loading, presenceUsers, isConnected } = useSelector((s: RootState) => s.room);
    const [activePanel, setActivePanel] = useState<ActivePanel>("chat");
    const [showSettings, setShowSettings] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [endingSession, setEndingSession] = useState(false);

    const isAdmin = room?.createdBy && (
        typeof room.createdBy === "string" 
            ? room.createdBy === user?._id 
            : (room.createdBy as any)._id === user?._id
    );

    const socketActions = useSocket(roomId);

    useEffect(() => {
        dispatch(fetchRoomById(roomId));
        return () => {
            dispatch(clearChat());
            dispatch(clearNotes());
            dispatch(clearPomodoro());
        };
    }, [roomId, dispatch]);

    const handleEndSession = async () => {
        setEndingSession(true);
        try {
            await sessionApi.post("/api/sessions/end", { roomId });
            toast.success("Session ended and statistics updated");
            router.push("/dashboard");
        } catch {
            router.push("/dashboard");
        } finally {
            setEndingSession(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
        setDeleting(true);
        try {
            await dispatch(deleteRoom(roomId)).unwrap();
            toast.success("Room deleted");
            router.push("/rooms");
        } catch (err: any) {
            toast.error(err || "Failed to delete room");
        } finally {
            setDeleting(false);
        }
    };

    if (loading || !room) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-3.5rem)]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[var(--bg-body)]">

            {/* ── Room header ──────────────────────────────────────────────── */}
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
                    </div>
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
                        onClick={handleEndSession}
                        className="h-8 text-xs px-3"
                    >
                        <LogOut size={14} className="mr-2" /> Leave Room
                    </Button>

                    {isAdmin && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all ml-1 border border-transparent hover:border-[var(--border)]"
                        >
                            <Settings size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Desktop: Resizable Panels */}
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

                {/* Mobile: Tabbed View */}
                <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-hidden bg-[var(--bg-surface)]">
                        {activePanel === "chat"   && <Chat roomId={roomId} {...socketActions} />}
                        {activePanel === "notes"  && <Notes roomId={roomId} updateNote={socketActions.updateNote} />}
                        {activePanel === "timer"  && <Pomodoro {...socketActions} isAdmin={isAdmin} />}
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
            </div>

            {/* Settings Modal */}
            <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Room Settings">
                <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1 flex-1 py-2">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                            <h3 className="text-sm font-semibold text-[var(--text)]">Edit Room Details</h3>
                        </div>
                        <CreateRoomForm
                            isUpdate
                            initialData={room}
                            onSuccess={() => {
                                dispatch(fetchRoomById(roomId));
                                setShowSettings(false);
                            }}
                        />
                    </div>

                    <div className="border-t border-[var(--border)] pt-6 mt-2">
                        <div className="p-4 rounded-[var(--radius)] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                                <Trash2 size={14} /> Danger Zone
                            </h3>
                            <p className="text-[11px] text-red-500/80 mb-4 leading-relaxed">
                                Once deleted, all data including chat history and notes will be permanently lost. This cannot be undone.
                            </p>
                            <Button
                                variant="danger"
                                size="sm"
                                fullWidth
                                loading={deleting}
                                onClick={handleDelete}
                                className="font-bold tracking-tight shadow-sm"
                            >
                                Delete Room Permanently
                            </Button>
                        </div>
                    </div>

                    <div className="text-center pb-2">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-elevated)] py-1.5 px-3 rounded-full inline-block border border-[var(--border)]">
                            Invite Code: <span className="text-[var(--accent)] font-bold ml-1">{room.inviteCode}</span>
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
