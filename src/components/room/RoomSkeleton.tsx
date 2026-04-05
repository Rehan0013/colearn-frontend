"use client";
import { Skeleton } from "@/components/ui/Skeleton";

export const RoomSkeleton = () => {
    return (
        <div className="h-screen w-full flex flex-col bg-[var(--bg-surface)] overflow-hidden">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Skeleton variant="rounded" width={40} height={40} className="rounded-xl" />
                    <div className="flex flex-col gap-2">
                        <Skeleton variant="rounded" width={128} height={16} />
                        <Skeleton variant="rounded" width={80} height={12} className="opacity-50" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" width={96} height={36} className="rounded-xl" />
                    <Skeleton variant="rounded" width={36} height={36} className="rounded-xl" />
                </div>
            </div>

            {/* Layout Skeleton */}
            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left Panel - Pomodoro & Presence */}
                <div className="w-[300px] flex flex-col gap-4 shrink-0">
                    <div className="flex-1 bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border flex flex-col items-center justify-center p-8">
                        <div className="w-32 h-32 rounded-full border-4 border-[var(--border)] flex items-center justify-center">
                            <Skeleton variant="rounded" width={64} height={32} />
                        </div>
                        <div className="mt-8 flex gap-4">
                            <Skeleton variant="circle" width={48} height={48} />
                            <Skeleton variant="circle" width={48} height={48} />
                        </div>
                    </div>
                    <div className="h-[250px] bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border p-6 flex flex-col gap-4">
                        <Skeleton variant="rounded" width={96} height={16} />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton variant="circle" width={32} height={32} />
                                <Skeleton variant="rounded" width={96} height={12} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Panel - Notes */}
                <div className="flex-1 bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border overflow-hidden flex flex-col">
                    <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
                        <Skeleton variant="rounded" width={128} height={16} />
                        <div className="flex gap-2">
                            <Skeleton variant="rounded" width={32} height={32} />
                            <Skeleton variant="rounded" width={32} height={32} />
                        </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} variant="rounded" width="100%" height={16} className="opacity-30" />
                        ))}
                    </div>
                </div>

                {/* Right Panel - Chat */}
                <div className="w-[350px] bg-[var(--bg-elevated)]/30 rounded-3xl border border-[var(--border)] glass-border shrink-0 flex flex-col overflow-hidden">
                    <div className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0">
                        <Skeleton variant="rounded" width={96} height={16} />
                    </div>
                    <div className="flex-1 p-6 flex flex-col-reverse gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <Skeleton variant="circle" width={32} height={32} className="shrink-0" />
                                <Skeleton variant="rounded" width={i % 2 === 0 ? 192 : 144} height={48} className="rounded-2xl" />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-[var(--border)]">
                        <Skeleton variant="rounded" width="100%" height={48} className="rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};
