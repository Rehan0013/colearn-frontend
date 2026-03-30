"use client";
import React from "react";
import { Flame, Clock, Zap, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatMinutes } from "@/lib/utils";
import type { UserStats } from "@/types";

interface DashboardStatsProps {
    stats: UserStats | null;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
                icon={<Flame size={18} className="text-orange-500" />}
                label="Current Streak"
                value={`${stats?.streak ?? 0} days`}
                sub={stats?.longestStreak ? `Best: ${stats.longestStreak}d` : undefined}
            />
            <StatCard
                icon={<Clock size={18} className="text-[var(--accent)]" />}
                label="Today"
                value={formatMinutes(stats?.todayMinutes ?? 0)}
                sub="studied today"
            />
            <StatCard
                icon={<TrendingUp size={18} className="text-[var(--green)]" />}
                label="Total Time"
                value={formatMinutes(stats?.totalStudyMinutes ?? 0)}
                sub="all time"
            />
            <StatCard
                icon={<Zap size={18} className="text-amber-500" />}
                label="Longest Streak"
                value={`${stats?.longestStreak ?? 0} days`}
                sub="personal best"
            />
        </div>
    );
}

const StatCard = ({
    icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
    <Card padding="sm">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className="font-display text-xl font-bold text-[var(--text)]">
                {value}
            </span>
            {sub && <span className="text-xs text-[var(--text-muted)]">{sub}</span>}
        </div>
    </Card>
);
