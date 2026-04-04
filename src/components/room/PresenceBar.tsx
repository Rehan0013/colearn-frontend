"use client";
import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserMinus, Users, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { kickMember } from "@/store/slices/roomSlice";
import type { AppDispatch, RootState } from "@/store";
import type { PresenceUser } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props { 
    users: PresenceUser[];
    isAdmin?: boolean;
    roomId?: string;
}

export const PresenceBar = memo(({ users, isAdmin = false, roomId }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((s: RootState) => s.user.data);

    const handleKick = async (memberId: string, name: string) => {
        if (!roomId) return;
        if (!window.confirm(`Are you sure you want to kick ${name}?`)) return;

        try {
            await dispatch(kickMember({ roomId, memberId })).unwrap();
            toast.success(`${name} kicked from room`);
        } catch (err: any) {
            toast.error(err || "Failed to kick member");
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5 h-full bg-transparent overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--accent-soft)]">
                        <Users size={14} className="text-[var(--accent)]" />
                    </div>
                    <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-widest">
                        Room Presence
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--green)]/10 rounded-full border border-[var(--green)]/20">
                    <Activity size={10} className="text-[var(--green)]" />
                    <span className="text-[10px] font-bold text-[var(--green)] uppercase tabular-nums">
                        {users.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center opacity-40">
                        <Users size={32} strokeWidth={1.5} />
                        <p className="text-[11px] font-medium uppercase tracking-wider">
                            Syncing presence...
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                            {users.map((u, idx) => (
                                <motion.div 
                                    key={u.userId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between group p-2 rounded-xl hover:bg-[var(--bg-elevated)]/50 transition-all border border-transparent hover:border-[var(--border)]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative">
                                            <Avatar
                                                src={u.avatar}
                                                firstName={u.name.split(" ")[0]}
                                                lastName={u.name.split(" ")[1] ?? ""}
                                                size="sm"
                                                online={true}
                                                className="shadow-sm ring-2 ring-white dark:ring-black/20"
                                            />
                                            {u.userId === currentUser?._id && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)]" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={cn(
                                                    "text-[13px] font-bold truncate",
                                                    u.userId === currentUser?._id ? "text-[var(--accent)]" : "text-[var(--text)]"
                                                )}>
                                                    {u.name}
                                                </span>
                                                {u.userId === currentUser?._id && (
                                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase px-1.5 py-0.5 bg-[var(--accent-soft)] rounded-md">You</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-[var(--text-muted)] opacity-60">
                                                In workspace
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && u.userId !== currentUser?._id && (
                                        <button
                                            onClick={() => handleKick(u.userId, u.name)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                            title={`Kick ${u.name}`}
                                        >
                                            <UserMinus size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="pt-4 mt-auto border-t border-[var(--border)] opacity-50">
                <div className="flex items-center gap-2 px-2">
                    <ShieldCheck size={12} className={cn(isAdmin ? "text-[var(--green)]" : "text-[var(--text-muted)]")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {isAdmin ? "Admin view active" : "ReadOnly view"}
                    </span>
                </div>
            </div>
        </div>
    );
});

PresenceBar.displayName = "PresenceBar";
