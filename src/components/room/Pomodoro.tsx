"use client";
import { memo } from "react";
import { useSelector } from "react-redux";
import { Play, Pause, RotateCcw, ShieldCheck, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store";
import { formatSeconds, cn } from "@/lib/utils";
import type { PomodoroMode } from "@/types";

interface Props {
    startPomodoro: (mode?: string) => void;
    pausePomodoro: () => void;
    resetPomodoro: (mode?: string) => void;
    isAdmin?: boolean;
}

const modeConfig: Record<PomodoroMode, { label: string; color: string; bg: string }> = {
    focus:       { label: "Focus",       color: "text-[var(--accent)]", bg: "bg-[var(--accent)]" },
    short_break: { label: "Short",       color: "text-[var(--green)]", bg: "bg-[var(--green)]" },
    long_break:  { label: "Long",        color: "text-[var(--amber)]", bg: "bg-[var(--amber)]" },
};

export const Pomodoro = memo(({ startPomodoro, pausePomodoro, resetPomodoro, isAdmin = false }: Props) => {
    const pomodoro = useSelector((s: RootState) => s.pomodoro);
    
    if (!pomodoro) return null;

    const { remaining, duration, isRunning, mode } = pomodoro;
    const progress = duration > 0 ? (remaining / duration) : 1;
    const config = modeConfig[mode];

    // Circle math
    const r = 58;
    const circ = 2 * Math.PI * r;
    const offset = progress * circ;

    return (
        <div className="flex flex-col items-center justify-between p-4 h-full bg-transparent min-h-[320px]">
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-elevated)] rounded-full border border-[var(--border)] shadow-sm">
                    <Timer size={12} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Workspace Timer
                    </span>
                </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 bg-[var(--bg-elevated)]/50 backdrop-blur-md rounded-2xl p-1 border border-[var(--border)] shadow-inner w-full max-w-[240px]">
                {(Object.keys(modeConfig) as PomodoroMode[]).map((m) => (
                    <button
                        key={m}
                        disabled={!isAdmin}
                        onClick={() => resetPomodoro(m)}
                        className={cn(
                            "flex-1 px-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all",
                            mode === m
                                ? "bg-[var(--bg-surface)] text-[var(--text)] shadow-md scale-[1.02]"
                                : "text-[var(--text-muted)] hover:text-[var(--text)]",
                            !isAdmin && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        {modeConfig[m].label}
                    </button>
                ))}
            </div>

            {/* Circular Timer */}
            <div className="relative group/timer my-2">
                <motion.div
                    animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                >
                    <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
                        {/* Track */}
                        <circle
                            cx="70" cy="70" r={r}
                            fill="none"
                            stroke="var(--border)"
                            strokeWidth="5"
                            className="opacity-30"
                        />
                        {/* Progress */}
                        <motion.circle
                            cx="70" cy="70" r={r}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1, ease: "linear" }}
                            transform="rotate(-90 70 70)"
                            className={cn("transition-colors duration-500", config.color)}
                        />
                    </svg>
                </motion.div>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={cn("font-display text-3xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors duration-500", config.color)}>
                        {formatSeconds(remaining)}
                    </span>
                    <motion.span 
                        key={mode}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]"
                    >
                        {config.label}
                    </motion.span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-5">
                    <button
                        disabled={!isAdmin}
                        onClick={() => resetPomodoro(mode)}
                        className={cn(
                            "p-3 rounded-2xl text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all active:scale-90",
                            !isAdmin && "opacity-20 cursor-not-allowed"
                        )}
                        title={isAdmin ? "Reset Timer" : "Admin Only"}
                    >
                        <RotateCcw size={18} />
                    </button>
                    
                    <button
                        disabled={!isAdmin}
                        onClick={() => isRunning ? pausePomodoro() : startPomodoro(mode)}
                        className={cn(
                            "group relative w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/20",
                            !isAdmin ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] opacity-30 cursor-not-allowed shadow-none" : "bg-[var(--accent)] text-white hover:shadow-[var(--accent)]/40",
                        )}
                    >
                        {isRunning ? (
                            <Pause size={24} fill="currentColor" />
                        ) : (
                            <Play size={24} className="ml-1" fill="currentColor" />
                        )}
                        
                        {/* Pulse effect when running */}
                        {isRunning && isAdmin && (
                            <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-20 pointer-events-none" />
                        )}
                    </button>

                    <div className="relative group">
                        <div className={cn(
                            "p-3 rounded-2xl transition-all",
                            isAdmin ? "text-[var(--green)] bg-[var(--green)]/5" : "text-[var(--text-muted)] opacity-20"
                        )}>
                            <ShieldCheck size={18} />
                        </div>
                        {!isAdmin && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                ADMIN ONLY
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                        Live Sync Active
                    </p>
                </div>
            </div>
        </div>
    );
});

Pomodoro.displayName = "Pomodoro";
