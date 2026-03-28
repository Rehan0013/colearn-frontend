"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, ArrowLeft, MessageSquare, FileText, Timer, Users, Settings, Trash2, MoreVertical } from "lucide-react";
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
import { Spinner, Modal, Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

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

    const user = useSelector((s: RootState) => s.user.data);
    const { current: room, loading, presenceUsers, isConnected } = useSelector((s: RootState) => s.room);
    const [activePanel, setActivePanel] = useState<Panel>("chat");
    const [showSettings, setShowSettings] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [endingSession, setEndingSession] = useState(false);

    const isAdmin = room?.createdBy && (
        typeof room.createdBy === "string" 
            ? room.createdBy === user?._id 
            : room.createdBy._id === user?._id
    );

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

    const handleEndSession = async () => {
        setEndingSession(true);
        try {
            await sessionApi.post("/api/sessions/end", { roomId });
            toast.success("Session ended and statistics updated");
            router.push("/dashboard");
        } catch {
            // Even if the API fails (e.g. session already ended), let the user leave
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
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">{room.subject}</span>
                        <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                            )} />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                {isConnected ? "Live" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
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

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="hidden sm:flex"
                            loading={endingSession}
                            onClick={handleEndSession}
                        >
                            <LogOut size={16} className="mr-2" /> Leave & End Session
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="flex sm:hidden p-2"
                            loading={endingSession}
                            onClick={handleEndSession}
                            title="Leave & End Session"
                        >
                            <LogOut size={16} />
                        </Button>

                        {isAdmin && (
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Room Settings">
                <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Update Form */}
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

                    <div className="border-t border-[var(--border)] pt-6">
                        <div className="p-4 rounded-[var(--radius)] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                                <Trash2 size={14} /> Danger Zone
                            </h3>
                            <p className="text-xs text-red-500/80 mb-3">
                                Once you delete a room, all its data including chat history and shared notes will be permanently removed.
                            </p>
                            <Button
                                variant="danger"
                                size="sm"
                                fullWidth
                                loading={deleting}
                                onClick={handleDelete}
                            >
                                Delete Room Permanently
                            </Button>
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
                        Invite Code: <code className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[var(--accent)] font-bold tracking-widest">{room.inviteCode}</code>
                    </p>
                </div>
            </Modal>

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
