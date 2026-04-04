"use client";
import { motion } from "framer-motion";

export const RoomSkeleton = () => {
    return (
        <div className="h-screen w-full flex flex-col bg-[var(--bg-surface)] overflow-hidden">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--border)] animate-pulse" />
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 bg-[var(--border)] rounded-md animate-pulse" />
                        <div className="w-20 h-3 bg-[var(--border)] rounded-md animate-pulse opacity-50" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-24 h-9 rounded-xl bg-[var(--border)] animate-pulse" />
                    <div className="w-9 h-9 rounded-xl bg-[var(--border)] animate-pulse" />
                </div>
            </div>

            {/* Layout Skeleton */}
            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left Panel - Pomodoro & Presence */}
                <div className="w-[300px] flex flex-col gap-4 shrink-0">
                    <div className="flex-1 bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border flex flex-col items-center justify-center p-8">
                        <div className="w-32 h-32 rounded-full border-4 border-[var(--border)] animate-pulse flex items-center justify-center">
                            <div className="w-16 h-8 bg-[var(--border)] rounded-lg" />
                        </div>
                        <div className="mt-8 flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--border)] animate-pulse" />
                            <div className="w-12 h-12 rounded-full bg-[var(--border)] animate-pulse" />
                        </div>
                    </div>
                    <div className="h-[250px] bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border p-6 flex flex-col gap-4">
                        <div className="w-24 h-4 bg-[var(--border)] rounded-md animate-pulse" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />
                                <div className="w-24 h-3 bg-[var(--border)] rounded-md animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Panel - Notes */}
                <div className="flex-1 bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border overflow-hidden flex flex-col">
                    <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
                        <div className="w-32 h-4 bg-[var(--border)] rounded-md animate-pulse" />
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse" />
                            <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-full h-4 bg-[var(--border)] rounded-md animate-pulse opacity-30" />
                        ))}
                    </div>
                </div>

                {/* Right Panel - Chat */}
                <div className="w-[350px] bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border shrink-0 flex flex-col overflow-hidden">
                    <div className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0">
                        <div className="w-24 h-4 bg-[var(--border)] rounded-md animate-pulse" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col-reverse gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse shrink-0" />
                                <div className={`h-12 bg-[var(--border)] rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-[var(--border)]">
                        <div className="w-full h-12 rounded-2xl bg-[var(--border)] animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};
