"use client";
import { useEffect, useRef, useState, memo } from "react";
import { useSelector } from "react-redux";
import { Send, Paperclip, Smile, Loader2, Play, Volume2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { cn, timeAgo } from "@/lib/utils";
import type { Message } from "@/types";
import { chatApi } from "@/lib/api";
import toast from "react-hot-toast";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉"];

interface Props {
    roomId: string;
    sendMessage: (content: string, fileUrl?: string, fileType?: string) => void;
    reactToMessage: (messageId: string, emoji: string) => void;
    sendTyping: (isTyping: boolean) => void;
}

export const Chat = memo(({ roomId, sendMessage, reactToMessage, sendTyping }: Props) => {
    const { messages, typingUsers } = useSelector((s: RootState) => s.chat);
    const user = useSelector((s: RootState) => s.user.data);
    const [input, setInput] = useState("");
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<{ url: string; type: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = () => {
        const text = input.trim();
        if (!text && !pendingFile) return;
        sendMessage(text, pendingFile?.url, pendingFile?.type || undefined);
        setInput("");
        setPendingFile(null);
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check: 50MB
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File is too large (max 50MB)");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await chatApi.post("/api/chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setPendingFile({ url: res.data.url, type: res.data.type });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "File upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const isMine = (msg: Message) => msg.userId === user?._id;

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-2">
                            <Send size={24} className="text-[var(--accent)] opacity-40 -rotate-12" />
                        </div>
                        <p className="text-sm font-medium text-[var(--text)]">No messages yet</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            Start the conversation with your peers!
                        </p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id || msg._id || idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex gap-2 group",
                                isMine(msg) && "flex-row-reverse"
                            )}
                            onMouseEnter={() => setHoveredMsg(msg.id || msg._id || null)}
                            onMouseLeave={() => setHoveredMsg(null)}
                        >
                            {/* Avatar */}
                            {!isMine(msg) && (
                                <Avatar
                                    src={msg.userData?.avatar}
                                    firstName={msg.userData?.name?.split(" ")[0] ?? "?"}
                                    size="sm"
                                    className="shrink-0 mt-0.5 shadow-sm border border-[var(--border)]"
                                />
                            )}

                            <div className={cn("flex flex-col gap-1 max-w-[80%]", isMine(msg) && "items-end")}>
                                {/* Name + time */}
                                {!isMine(msg) && (
                                    <span className="text-[11px] font-medium text-[var(--text-muted)] px-1">
                                        {msg.userData?.name ?? "Unknown"}
                                    </span>
                                )}

                                {/* Bubble */}
                                <div className={cn(
                                    "relative rounded-2xl text-sm leading-relaxed overflow-hidden shadow-sm transition-all",
                                    isMine(msg)
                                        ? "bg-[var(--accent)] text-white rounded-tr-sm"
                                        : "bg-[var(--bg-elevated)] text-[var(--text)] rounded-tl-sm border border-[var(--border)]/50",
                                    (msg.fileUrl) ? "p-1.5" : "px-3 py-2"
                                )}>
                                    {/* File Content */}
                                    {msg.fileUrl && (
                                        <div className="mb-1 rounded-xl overflow-hidden bg-black/5 ring-1 ring-white/10">
                                            {msg.fileType === "image" && (
                                                <img
                                                    src={msg.fileUrl || undefined}
                                                    alt="attachment"
                                                    className="max-w-full h-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                                                    onClick={() => window.open(msg.fileUrl || undefined, "_blank")}
                                                />
                                            )}
                                            {msg.fileType === "video" && (
                                                <div className="relative group/video">
                                                    <video 
                                                        controls 
                                                        src={msg.fileUrl || undefined} 
                                                        className="max-w-full aspect-video bg-black" 
                                                    />
                                                </div>
                                            )}
                                            {msg.fileType === "audio" && (
                                                <div className="p-2 bg-[var(--bg-surface)] rounded-lg m-1 border border-[var(--border)]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Volume2 size={14} className="text-[var(--accent)]" />
                                                        <span className="text-[10px] font-medium truncate opacity-70">Voice/Audio Message</span>
                                                    </div>
                                                    <audio controls src={msg.fileUrl || undefined} className="w-full h-8 scale-90 origin-left" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {msg.content && <p className={cn("whitespace-pre-wrap", msg.fileUrl && "px-2 pb-1")}>{msg.content}</p>}

                                    {/* Time */}
                                    <span className={cn(
                                        "text-[9px] font-medium block px-2 pb-0.5 mt-0.5",
                                        isMine(msg) ? "text-white/60 text-right" : "text-[var(--text-muted)] opacity-70"
                                    )}>
                                        {timeAgo(msg.createdAt)}
                                    </span>
                                </div>

                                {/* Reactions */}
                                {mounted && Object.keys(msg.reactions ?? {}).length > 0 && (
                                    <div className={cn("flex flex-wrap gap-1 mt-1", isMine(msg) ? "justify-end" : "justify-start")}>
                                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                                            <button
                                                key={emoji}
                                                onClick={() => reactToMessage(msg.id || msg._id || "", emoji)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] border transition-all active:scale-95",
                                                    users.includes(user?._id ?? "")
                                                        ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]"
                                                        : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)]"
                                                )}
                                            >
                                                <span className="select-none text-xs">{emoji}</span>
                                                <span className="font-semibold opacity-70">{users.length}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reaction picker on hover */}
                            {mounted && hoveredMsg === (msg.id || msg._id) && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8, x: isMine(msg) ? -10 : 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className={cn(
                                        "self-center flex gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-2 py-1 shadow-lg z-10",
                                        isMine(msg) ? "mr-1" : "ml-1"
                                    )}
                                >
                                    {EMOJIS.map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => reactToMessage(msg.id || msg._id || "", e)}
                                            className="p-1 hover:scale-125 transition-transform hover:bg-[var(--bg-elevated)] rounded-full"
                                        >
                                            <span className="text-sm leading-none select-none">{e}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                    {typingUsers.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex items-center gap-3 px-2 py-1"
                        >
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <span className="text-[11px] font-medium text-[var(--text-muted)] italic">
                                {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Overlay */}
            {pendingFile && (
                <div className="px-4 pt-2">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="p-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] flex items-center gap-3 shadow-md"
                    >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[var(--border)]">
                            {pendingFile.type === "image" ? (
                                <img src={pendingFile.url} className="w-full h-full object-cover" alt="preview" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play size={16} className="text-[var(--accent)]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--text)] truncate">Attached {pendingFile.type}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">Ready to send</p>
                        </div>
                        <button 
                            onClick={() => setPendingFile(null)}
                            className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                        >
                            <X size={16} /> 
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 shrink-0">
                <div className="flex items-end gap-2 bg-[var(--bg-surface)] rounded-2xl px-3 py-2 border border-[var(--border)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10 transition-all relative shadow-sm">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*"
                    />
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all shrink-0 active:scale-95"
                        title="Attach file"
                    >
                        {uploading ? (
                            <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
                        ) : (
                            <Paperclip size={18} />
                        )}
                    </button>

                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={uploading ? "Uploading file..." : "Type a message..."}
                        disabled={uploading}
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none outline-none max-h-32 py-2.5 font-medium"
                    />
                    
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !pendingFile) || uploading}
                        className="p-2.5 rounded-xl bg-[var(--accent)] text-white disabled:opacity-30 disabled:grayscale transition-all hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-95 shrink-0"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                        Shift+Enter for new line
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                        {input.length}/1000
                    </p>
                </div>
            </div>
        </div>
    );
});

Chat.displayName = "Chat";
