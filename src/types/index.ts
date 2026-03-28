// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
    _id: string;
    email: string;
    fullName: {
        firstName: string;
        lastName: string;
    };
    avatar: string;
    streak: number;
    totalStudyMinutes: number;
    isVerified: boolean;
    googleId?: string;
    createdAt: string;
}

// ── Room ──────────────────────────────────────────────────────────────────────

export interface RoomMember {
    user: {
        _id: string;
        fullName: { firstName: string; lastName: string };
    };
    role: "admin" | "member";
    joinedAt: string;
}

export interface Room {
    _id: string;
    name: string;
    description: string;
    subject: string;
    isPrivate: boolean;
    inviteCode: string;
    createdBy: { _id: string; fullName: { firstName: string; lastName: string } };
    members: RoomMember[];
    maxMembers: number;
    tags: string[];
    lastActivity: string;
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type FileType = "image" | "audio" | "video" | null;

export interface Message {
    id: string;
    _id?: string;
    roomId: string;
    userId: string;
    userData: { userId: string; name: string; avatar: string } | null;
    content: string;
    fileUrl: string | null;
    fileType: FileType;
    reactions: Record<string, string[]>; // { "👍": ["userId1", ...] }
    createdAt: string;
}

// ── Presence ──────────────────────────────────────────────────────────────────

export interface PresenceUser {
    userId: string;
    name: string;
    avatar: string;
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────

export type PomodoroMode = "focus" | "short_break" | "long_break";

export interface PomodoroState {
    roomId: string;
    mode: PomodoroMode;
    duration: number;
    remaining: number;
    isRunning: boolean;
    startedBy: string | null;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export interface Note {
    roomId: string;
    content: string;
    lastEditedBy: string | null;
    updatedAt: string;
}

export interface NoteVersion {
    id: string;
    savedBy: string;
    savedAt: string;
    label: string;
    preview: string;
}

// ── Session / Stats ───────────────────────────────────────────────────────────

export interface UserStats {
    totalStudyMinutes: number;
    streak: number;
    longestStreak: number;
    lastStudyDate: string | null;
    todayMinutes: number;
}

export interface ChartDataPoint {
    date: string;
    minutes: number;
    sessions: number;
}

export interface Session {
    _id: string;
    roomId: string;
    subject: string;
    joinedAt: string;
    leftAt: string | null;
    durationMinutes: number;
    isActive: boolean;
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    message: string;
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}
