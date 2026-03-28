import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ─────────────────────────────────────────────────────
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// ── Time formatting ───────────────────────────────────────────────────────────

export const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatSeconds = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ── String helpers ────────────────────────────────────────────────────────────

export const getInitials = (firstName: string, lastName: string): string =>
    `${firstName[0]}${lastName[0]}`.toUpperCase();

export const getDisplayName = (fullName: {
    firstName: string;
    lastName: string;
}): string => `${fullName.firstName} ${fullName.lastName}`;

// ── Streak helpers ────────────────────────────────────────────────────────────

export const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "✨";
    if (streak >= 3) return "💪";
    return "📚";
};
