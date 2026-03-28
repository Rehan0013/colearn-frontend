"use client";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Send, Paperclip, Smile } from "lucide-react";
import type { RootState } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { cn, timeAgo } from "@/lib/utils";
import type { Message } from "@/types";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉"];

interface Props {
    roomId: string;
    sendMessage: (content: string, fileUrl?: string, fileType?: string) => void;
    reactToMessage: (messageId: string, emoji: string) => void;
    sendTyping: (isTyping: boolean) => void;
}

export const Chat = ({ roomId, sendMessage, reactToMessage, sendTyping }: Props) => {
    const { messages, typingUsers } = useSelector((s: RootState) => s.chat);
    const user = useSelector((s: RootState) => s.user.data);
    const [input, setInput] = useState("");
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        sendMessage(text);
        setInput("");
        sendTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        sendTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => sendTyping(false), 2000);
    };

    const isMine = (msg: Message) => msg.userId === user?._id;

    return (
        <div className="flex flex-col h-full">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <p className="text-sm text-[var(--text-muted)]">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-2 group",
                            isMine(msg) && "flex-row-reverse"
                        )}
                        onMouseEnter={() => setHoveredMsg(msg.id)}
                        onMouseLeave={() => setHoveredMsg(null)}
                    >
                        {/* Avatar */}
                        {!isMine(msg) && (
                            <Avatar
                                src={msg.userData?.avatar}
                                firstName={msg.userData?.name?.split(" ")[0] ?? "?"}
                                size="sm"
                                className="shrink-0 mt-0.5"
                            />
                        )}

                        <div className={cn("flex flex-col gap-1 max-w-[72%]", isMine(msg) && "items-end")}>
                            {/* Name + time */}
                            {!isMine(msg) && (
                                <span className="text-[11px] text-[var(--text-muted)] px-1">
                                    {msg.userData?.name ?? "Unknown"}
                                </span>
                            )}

                            {/* Bubble */}
                            <div className={cn(
                                "relative px-3 py-2 rounded-2xl text-sm leading-relaxed",
                                isMine(msg)
                                    ? "bg-[var(--accent)] text-white rounded-tr-sm"
                                    : "bg-[var(--bg-elevated)] text-[var(--text)] rounded-tl-sm"
                            )}>
                                {/* File */}
                                {msg.fileUrl && msg.fileType === "image" && (
                                    <img
                                        src={msg.fileUrl}
                                        alt="attachment"
                                        className="max-w-full rounded-lg mb-1"
                                    />
                                )}
                                {msg.fileUrl && msg.fileType === "audio" && (
                                    <audio controls src={msg.fileUrl} className="max-w-full" />
                                )}
                                {msg.fileUrl && msg.fileType === "video" && (
                                    <video controls src={msg.fileUrl} className="max-w-full rounded-lg" />
                                )}
                                {msg.content && <p>{msg.content}</p>}

                                {/* Time */}
                                <span className={cn(
                                    "text-[10px] mt-0.5 block",
                                    isMine(msg) ? "text-white/60 text-right" : "text-[var(--text-muted)]"
                                )}>
                                    {timeAgo(msg.createdAt)}
                                </span>
                            </div>

                            {/* Reactions */}
                            {Object.keys(msg.reactions ?? {}).length > 0 && (
                                <div className="flex flex-wrap gap-1 px-1">
                                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                                        <button
                                            key={emoji}
                                            onClick={() => reactToMessage(msg.id, emoji)}
                                            className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-all",
                                                users.includes(user?._id ?? "")
                                                    ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]"
                                                    : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)]"
                                            )}
                                        >
                                            {emoji} <span>{users.length}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reaction picker on hover */}
                        {hoveredMsg === msg.id && (
                            <div className={cn(
                                "self-center flex gap-0.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-2 py-1 shadow-[var(--shadow-md)]",
                                "opacity-0 group-hover:opacity-100 transition-opacity"
                            )}>
                                {EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => reactToMessage(msg.id, e)}
                                        className="text-sm hover:scale-125 transition-transform"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-1">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                            {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                        </span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                <div className="flex items-end gap-2 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] px-3 py-2 border border-[var(--border)] focus-within:border-[var(--accent)] transition-all">
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none outline-none max-h-32"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-1.5 rounded-lg bg-[var(--accent)] text-white disabled:opacity-40 transition-all hover:opacity-90 shrink-0"
                    >
                        <Send size={15} />
                    </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 px-1">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};
