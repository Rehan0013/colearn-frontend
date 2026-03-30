"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { fetchRoomById, deleteRoom } from "@/store/slices/roomSlice";
import { endSessionAction } from "@/actions/sessionActions";
import { clearChat } from "@/store/slices/chatSlice";
import { clearNotes } from "@/store/slices/notesSlice";
import { clearPomodoro } from "@/store/slices/pomodoroSlice";
import type { RootState, AppDispatch } from "@/store";
import { useSocket } from "@/hooks/useSocket";

import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomDesktopLayout } from "@/components/room/RoomDesktopLayout";
import { RoomMobileLayout } from "@/components/room/RoomMobileLayout";
import { RoomSettingsModal } from "@/components/room/RoomSettingsModal";
import { Spinner } from "@/components/ui/index";

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const roomId = params.roomId as string;

    const user = useSelector((s: RootState) => s.user.data);
    const { current: room, loading, presenceUsers, isConnected, error } = useSelector((s: RootState) => s.room);
    
    const [showSettings, setShowSettings] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [endingSession, setEndingSession] = useState(false);

    const isAdmin = !!(room?.members?.some(m => {
        const mUserId = typeof m.user === 'string' ? m.user : m.user?._id;
        return String(mUserId) === String(user?._id) && m.role === "admin";
    }) || (room?.createdBy && (
        String(typeof room.createdBy === 'string' ? room.createdBy : (room.createdBy as any)._id) === String(user?._id)
    )));

    const socketActions = useSocket(roomId, !!isAdmin);

    useEffect(() => {
        dispatch(fetchRoomById(roomId));
        return () => {
            dispatch(clearChat());
            dispatch(clearNotes());
            dispatch(clearPomodoro());
        };
    }, [roomId, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            router.push("/dashboard");
        }
    }, [error, router]);

    const handleEndSession = async () => {
        setEndingSession(true);
        try {
            const res = await endSessionAction(roomId);
            if (res.success) {
                toast.success("Session ended and statistics updated");
            }
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
            <RoomHeader
                room={room}
                isConnected={isConnected}
                presenceUsers={presenceUsers}
                isAdmin={isAdmin}
                endingSession={endingSession}
                onEndSession={handleEndSession}
                onOpenSettings={() => setShowSettings(true)}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <RoomDesktopLayout
                    roomId={roomId}
                    socketActions={socketActions}
                    isAdmin={isAdmin}
                    presenceUsers={presenceUsers}
                />
                <RoomMobileLayout
                    roomId={roomId}
                    socketActions={socketActions}
                    isAdmin={isAdmin}
                    presenceUsers={presenceUsers}
                />
            </div>

            <RoomSettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
                room={room}
                roomId={roomId}
                isAdmin={isAdmin}
                deleting={deleting}
                onDelete={handleDelete}
                onRoomUpdate={() => {
                    dispatch(fetchRoomById(roomId));
                    setShowSettings(false);
                }}
            />
        </div>
    );
}
