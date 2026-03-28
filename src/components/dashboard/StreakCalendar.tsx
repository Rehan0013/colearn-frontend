"use client";
import { cn } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";

interface StreakCalendarProps {
    chartData: ChartDataPoint[];
}

export const StreakCalendar = ({ chartData }: StreakCalendarProps) => {
    // Build 84 days (12 weeks) ending today
    const days: { date: string; minutes: number }[] = [];
    const dataMap = new Map(chartData.map((d) => [d.date, d.minutes]));

    for (let i = 83; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        days.push({ date: dateStr, minutes: dataMap.get(dateStr) ?? 0 });
    }

    const getIntensity = (minutes: number) => {
        if (minutes === 0) return 0;
        if (minutes < 30) return 1;
        if (minutes < 60) return 2;
        if (minutes < 120) return 3;
        return 4;
    };

    const intensityClass = [
        "bg-[var(--bg-elevated)]",
        "bg-[var(--accent)] opacity-25",
        "bg-[var(--accent)] opacity-50",
        "bg-[var(--accent)] opacity-75",
        "bg-[var(--accent)]",
    ];

    // Split into weeks
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-3 w-6 text-[10px] text-[var(--text-muted)] flex items-center">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((day, di) => {
                            const intensity = getIntensity(day.minutes);
                            return (
                                <div
                                    key={di}
                                    title={`${day.date}: ${day.minutes}m studied`}
                                    className={cn(
                                        "w-3 h-3 rounded-sm transition-all cursor-default",
                                        intensityClass[intensity]
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[10px] text-[var(--text-muted)]">Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn("w-3 h-3 rounded-sm", intensityClass[i])}
                    />
                ))}
                <span className="text-[10px] text-[var(--text-muted)]">More</span>
            </div>
        </div>
    );
};
