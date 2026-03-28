"use client";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface StudyChartProps {
    data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 shadow-[var(--shadow-md)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className="text-sm font-semibold text-[var(--text)]">
                {payload[0].value}m studied
            </p>
        </div>
    );
};

export const StudyChart = ({ data }: StudyChartProps) => {
    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric",
        }),
    }));

    return (
        <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}m`}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#studyGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
