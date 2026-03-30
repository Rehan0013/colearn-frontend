"use client";
import React from "react";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import type { ChartDataPoint } from "@/types";

interface DashboardHistoryProps {
    chartData: ChartDataPoint[];
}

export function DashboardHistory({ chartData }: DashboardHistoryProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Streak calendar */}
            <Card>
                <CardHeader>
                    <CardTitle>Study Calendar</CardTitle>
                    <span className="text-xs text-[var(--text-muted)]">Last 12 weeks</span>
                </CardHeader>
                <div className="p-4 pt-0">
                    <StreakCalendar chartData={chartData} />
                </div>
            </Card>

            {/* Session History */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-[var(--accent)]" />
                    <h2 className="font-display text-xl font-bold text-[var(--text)] text-left">Study Logs</h2>
                </div>
                <Card>
                    <div className="p-4">
                        <SessionHistory />
                    </div>
                </Card>
            </div>
        </div>
    );
}
