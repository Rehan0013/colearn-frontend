"use client";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/index";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { timeAgo } from "@/lib/utils";
import type { Room, ChartDataPoint } from "@/types";

interface DashboardMainContentProps {
    chartData: ChartDataPoint[];
    chartRange: "week" | "month";
    onChartRangeChange: (range: "week" | "month") => void;
    myRooms: Room[];
}

export function DashboardMainContent({
    chartData,
    chartRange,
    onChartRangeChange,
    myRooms
}: DashboardMainContentProps) {
    return (
        <div className="grid md:grid-cols-3 gap-4">
            {/* Chart */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Study Activity</CardTitle>
                    <div className="flex gap-1">
                        {(["week", "month"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => onChartRangeChange(r)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${chartRange === r
                                        ? "bg-[var(--accent)] text-white"
                                        : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                                    }`}
                            >
                                {r === "week" ? "7 days" : "30 days"}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <div className="p-4 pt-0">
                    <StudyChart data={chartData} />
                </div>
            </Card>

            {/* My rooms */}
            <Card>
                <CardHeader>
                    <CardTitle>My Rooms</CardTitle>
                    <Link href="/rooms?tab=joined" className="text-xs text-[var(--accent)] hover:underline">
                        View all
                    </Link>
                </CardHeader>
                <div className="p-4 pt-0">
                    {myRooms.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <BookOpen size={28} className="text-[var(--text-muted)]" />
                            <p className="text-sm text-[var(--text-muted)]">
                                You don't have any active rooms.
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
                </div>
            </Card>
        </div>
    );
}
