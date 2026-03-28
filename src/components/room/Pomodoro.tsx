"use client";
import { useSelector } from "react-redux";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { RootState } from "@/store";
import { formatSeconds, cn } from "@/lib/utils";
import type { PomodoroMode } from "@/types";

interface Props {
    startPomodoro: (mode?: string) => void;
    pausePomodoro: () => void;
    resetPomodoro: (mode?: string) => void;
}

const modeConfig: Record<PomodoroMode, { label: string; color: string }> = {
    focus:       { label: "Focus",       color: "text-[var(--accent)]" },
    short_break: { label: "Short Break", color: "text-[var(--green)]" },
    long_break:  { label: "Long Break",  color: "text-amber-500" },
};

export const Pomodoro = ({ startPomodoro, pausePomodoro, resetPomodoro }: Props) => {
    const { remaining, duration, isRunning, mode } = useSelector(
        (s: RootState) => s.pomodoro
    );

    const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
    const config = modeConfig[mode];

    // Circle math
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = circ - (progress / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-4 p-5 h-full justify-center">

            <span className="text-xs font-medium text-[var(--text-muted)]">
                Pomodoro Timer
            </span>

            {/* Mode tabs */}
            <div className="flex gap-1 bg-[var(--bg-elevated)] rounded-full p-1">
                {(Object.keys(modeConfig) as PomodoroMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => resetPomodoro(m)}
                        className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                            mode === m
                                ? "bg-[var(--bg-surface)] text-[var(--text)] shadow-[var(--shadow)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        )}
                    >
                        {modeConfig[m].label}
                    </button>
                ))}
            </div>

            {/* Circle timer */}
            <div className="relative">
                <svg width="128" height="128" viewBox="0 0 128 128">
                    {/* Track */}
                    <circle
                        cx="64" cy="64" r={r}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="6"
                    />
                    {/* Progress */}
                    <circle
                        cx="64" cy="64" r={r}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={dash}
                        transform="rotate(-90 64 64)"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("font-display text-2xl font-bold tabular-nums", config.color)}>
                        {formatSeconds(remaining)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => resetPomodoro(mode)}
                    className="p-2 rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-all"
                    title="Reset"
                >
                    <RotateCcw size={16} />
                </button>
                <button
                    onClick={() => isRunning ? pausePomodoro() : startPomodoro(mode)}
                    className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-[var(--shadow-md)]"
                >
                    {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] text-center max-w-[180px]">
                Timer is shared with everyone in the room
            </p>
        </div>
    );
};
