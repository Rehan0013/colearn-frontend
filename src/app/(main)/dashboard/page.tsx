"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
    Flame, Clock, Zap, BookOpen, ArrowRight, TrendingUp,
} from "lucide-react";
import { sessionApi, roomApi } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/index";
import { Spinner } from "@/components/ui/index";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { formatMinutes, getStreakEmoji, timeAgo } from "@/lib/utils";
import type { RootState } from "@/store";
import type { UserStats, ChartDataPoint, Room } from "@/types";

export default function DashboardPage() {
    const user = useSelector((s: RootState) => s.user.data);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [myRooms, setMyRooms] = useState<Room[]>([]);
    const [chartRange, setChartRange] = useState<"week" | "month">("week");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, chartRes, roomsRes] = await Promise.all([
                    sessionApi.get("/api/sessions/stats"),
                    sessionApi.get(`/api/sessions/charts?range=${chartRange}`),
                    roomApi.get("/api/rooms/my-rooms"),
                ]);
                setStats(statsRes.data.stats);
                setChartData(chartRes.data.data);
                setMyRooms(roomsRes.data.rooms.slice(0, 4));
            } catch {
                // silently fail — empty state shown
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [chartRange]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    const firstName = user?.fullName.firstName ?? "";

    return (
        <div className="flex flex-col gap-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-[var(--text)]">
                        {getGreeting()}, {firstName} {getStreakEmoji(stats?.streak ?? 0)}
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">
                        {stats?.streak
                            ? `You're on a ${stats.streak}-day streak. Keep it up!`
                            : "Start studying to build your streak."}
                    </p>
                </div>
                <Link href="/rooms">
                    <Button size="sm">
                        Find a Room <ArrowRight size={14} />
                    </Button>
                </Link>
            </div>

            {/* ── Stats row ────────────────────────────────────────────────── */}
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

            {/* ── Chart + Rooms ────────────────────────────────────────────── */}
            <div className="grid md:grid-cols-3 gap-4">

                {/* Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Study Activity</CardTitle>
                        <div className="flex gap-1">
                            {(["week", "month"] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setChartRange(r)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        chartRange === r
                                            ? "bg-[var(--accent)] text-white"
                                            : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                                    }`}
                                >
                                    {r === "week" ? "7 days" : "30 days"}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <StudyChart data={chartData} />
                </Card>

                {/* My rooms */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Rooms</CardTitle>
                        <Link href="/rooms" className="text-xs text-[var(--accent)] hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    {myRooms.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <BookOpen size={28} className="text-[var(--text-muted)]" />
                            <p className="text-sm text-[var(--text-muted)]">
                                You haven't joined any rooms yet.
                            </p>
                            <Link href="/rooms">
                                <Button size="sm" variant="outline">Browse Rooms</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {myRooms.map((room) => (
                                <Link
                                    key={room._id}
                                    href={`/rooms/${room._id}`}
                                    className="flex items-center justify-between p-2.5 rounded-[var(--radius)] hover:bg-[var(--bg-elevated)] transition-all group"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm font-medium text-[var(--text)] truncate">
                                            {room.name}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {timeAgo(room.lastActivity)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="default">{room.subject}</Badge>
                                        <ArrowRight
                                            size={14}
                                            className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Streak calendar ──────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle>Study Calendar</CardTitle>
                    <span className="text-xs text-[var(--text-muted)]">Last 12 weeks</span>
                </CardHeader>
                <StreakCalendar chartData={chartData} />
            </Card>

        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};
