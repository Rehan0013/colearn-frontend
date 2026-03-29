"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import {
    setMessages, addMessage, updateReactions, setTypingUser,
} from "@/store/slices/chatSlice";
import {
    setPresenceUsers, addPresenceUser, removePresenceUser, setSocketConnected,
} from "@/store/slices/roomSlice";
import { setPomodoroState, tick } from "@/store/slices/pomodoroSlice";
import { remoteEdit } from "@/store/slices/notesSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import type { RootState } from "@/store";
import toast from "react-hot-toast";

export const useSocket = (roomId: string) => {
    const dispatch = useDispatch();
    const user = useSelector((s: RootState) => s.user.data);
    const joined = useRef(false);

    useEffect(() => {
        if (!user || !roomId || joined.current) return;

        const socket = connectSocket();
        joined.current = true;

        const userData = {
            userId: user._id,
            name: `${user.fullName.firstName} ${user.fullName.lastName}`,
            avatar: user.avatar,
        };

        const joinAndSync = () => {
            socket.emit("presence:join", { roomId, userData });
            socket.emit("chat:history", { roomId });
            socket.emit("notes:get", { roomId });
            socket.emit("pomodoro:get", { roomId });
        };

        // ── Socket Connection Events ──────────────────────────────────────────
        socket.on("connect", () => {
            dispatch(setSocketConnected(true));
            joinAndSync(); // Re-join on reconnection
        });

        socket.on("disconnect", () => {
            dispatch(setSocketConnected(false));
            toast.error("Disconnected from room", { id: "socket-disconnect" });
        });

        // ── Initial Join (if already connected) ────────────────────────────────
        if (socket.connected) {
            dispatch(setSocketConnected(true));
            joinAndSync();
        }

        // ── Presence ───────────────────────────────────────────────────────────
        socket.on("presence:update", ({ users }) => dispatch(setPresenceUsers(users)));
        socket.on("presence:joined", ({ user: u }) => {
            dispatch(addPresenceUser(u));
            if (u.userId !== user._id) {
                toast(`${u.name} joined`, { icon: "👋", duration: 2000 });
                dispatch(addNotification({
                    type: "info",
                    title: "New Member",
                    message: `${u.name} joined the room`,
                }));
            }
        });
        socket.on("presence:left", ({ userId }) => dispatch(removePresenceUser(userId)));

        // ── Chat ───────────────────────────────────────────────────────────────
        socket.on("chat:history", ({ messages, hasMore }) =>
            dispatch(setMessages({ messages, hasMore }))
        );
        socket.on("chat:receive", (msg) => {
            dispatch(addMessage(msg));
        });
        socket.on("chat:react:update", ({ messageId, reactions }) => {
            console.log("Reaction update received:", messageId, reactions);
            dispatch(updateReactions({ messageId, reactions }));
        });
        socket.on("chat:typing:update", ({ userId, userData, isTyping }) =>
            dispatch(setTypingUser({ userId, name: userData?.name, isTyping }))
        );

        // ── Pomodoro ───────────────────────────────────────────────────────────
        socket.on("pomodoro:state", (state) => dispatch(setPomodoroState(state)));
        socket.on("pomodoro:tick", ({ remaining }) => dispatch(tick(remaining)));
        socket.on("pomodoro:done", ({ mode }) => {
            const label = mode === "focus" ? "Focus" : "Break";
            toast(`${label} session complete!`, {
                icon: mode === "focus" ? "🎯" : "☕",
            });
            dispatch(addNotification({
                type: "success",
                title: "Timer Complete",
                message: `${label} session has ended.`,
            }));
        });

        // ── Notes ──────────────────────────────────────────────────────────────
        socket.on("notes:content", ({ content }) =>
            dispatch(remoteEdit({ content, editedBy: "" }))
        );
        socket.on("notes:broadcast", ({ content, editedBy }) =>
            dispatch(remoteEdit({ content, editedBy: editedBy?.userId ?? "" }))
        );

        // ── Cleanup ────────────────────────────────────────────────────────────
        return () => {
            socket.emit("presence:leave", { roomId });
            socket.off("connect");
            socket.off("disconnect");
            socket.off("presence:update");
            socket.off("presence:joined");
            socket.off("presence:left");
            socket.off("chat:history");
            socket.off("chat:receive");
            socket.off("chat:react:update");
            socket.off("chat:typing:update");
            socket.off("pomodoro:state");
            socket.off("pomodoro:tick");
            socket.off("pomodoro:done");
            socket.off("notes:content");
            socket.off("notes:broadcast");
            disconnectSocket();
            joined.current = false;
        };
    }, [roomId, user, dispatch]);

    // ── Action helpers ─────────────────────────────────────────────────────────
    const sendMessage = (content: string, fileUrl?: string, fileType?: string) => {
        getSocket().emit("chat:message", { roomId, content, fileUrl, fileType });
    };

    const reactToMessage = (messageId: string, emoji: string) => {
        getSocket().emit("chat:react", { roomId, messageId, emoji });
    };

    const sendTyping = (isTyping: boolean) => {
        const userData = user
            ? { name: `${user.fullName.firstName} ${user.fullName.lastName}` }
            : {};
        getSocket().emit("chat:typing", { roomId, userData, isTyping });
    };

    const updateNote = (content: string) => {
        const userData = user
            ? { name: `${user.fullName.firstName} ${user.fullName.lastName}` }
            : {};
        getSocket().emit("notes:update", { roomId, content, userData });
    };

    const startPomodoro = (mode = "focus") =>
        getSocket().emit("pomodoro:start", { roomId, mode });

    const pausePomodoro = () =>
        getSocket().emit("pomodoro:pause", { roomId });

    const resetPomodoro = (mode = "focus") =>
        getSocket().emit("pomodoro:reset", { roomId, mode });

    return {
        sendMessage,
        reactToMessage,
        sendTyping,
        updateNote,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
    };
};
