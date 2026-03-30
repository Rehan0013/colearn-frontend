"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStreakEmoji } from "@/lib/utils";

interface DashboardHeaderProps {
    firstName: string;
    streak: number;
}

export function DashboardHeader({ firstName, streak }: DashboardHeaderProps) {
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-display text-2xl font-bold text-[var(--text)]">
                    {getGreeting()}, {firstName} {getStreakEmoji(streak)}
                </h1>
                <p className="text-[var(--text-muted)] text-sm mt-0.5">
                    {streak
                        ? `You're on a ${streak}-day streak. Keep it up!`
                        : "Start studying to build your streak."}
                </p>
            </div>
            <Link href="/rooms">
                <Button size="sm">
                    Find a Room <ArrowRight size={14} className="ml-2" />
                </Button>
            </Link>
        </div>
    );
}
