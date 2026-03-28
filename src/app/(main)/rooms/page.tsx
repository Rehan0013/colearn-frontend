"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Lock, Users, ArrowRight, Hash } from "lucide-react";
import Link from "next/link";
import { fetchPublicRooms } from "@/store/slices/roomSlice";
import type { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/index";
import { Spinner } from "@/components/ui/index";
import { Modal } from "@/components/ui/index";
import { CreateRoomForm } from "@/components/room/CreateRoomForm";
import { JoinByCodeForm } from "@/components/room/JoinByCodeForm";
import { timeAgo, cn } from "@/lib/utils";
import type { Room } from "@/types";

const SUBJECTS = ["All", "Mathematics", "Science", "History", "Language", "CS", "Arts", "Other"];

export default function RoomsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { list: rooms, loading } = useSelector((s: RootState) => s.room);
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("All");
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [tab, setTab] = useState<"browse" | "mine">("browse");

    useEffect(() => {
        dispatch(fetchPublicRooms({ subject: subject !== "All" ? subject : undefined }));
    }, [subject]);

    const filtered = rooms.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-5">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold text-[var(--text)]">
                    Study Rooms
                </h1>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
                        <Hash size={14} /> Join by Code
                    </Button>
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <Plus size={14} /> Create Room
                    </Button>
                </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-[var(--radius)] w-fit">
                {(["browse", "mine"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            "px-4 py-1.5 rounded-[calc(var(--radius)-2px)] text-sm font-medium transition-all",
                            tab === t
                                ? "bg-[var(--bg-surface)] text-[var(--text)] shadow-[var(--shadow)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        )}
                    >
                        {t === "browse" ? "Browse" : "My Rooms"}
                    </button>
                ))}
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Input
                        placeholder="Search rooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search size={15} />}
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {SUBJECTS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSubject(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                subject === s
                                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Room grid ───────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size="lg" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-[var(--text-muted)]">No rooms found.</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus size={14} /> Create one
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((room) => (
                        <RoomCard key={room._id} room={room} />
                    ))}
                </div>
            )}

            {/* ── Modals ──────────────────────────────────────────────────── */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Room">
                <CreateRoomForm onSuccess={() => setShowCreate(false)} />
            </Modal>
            <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join by Invite Code">
                <JoinByCodeForm onSuccess={() => setShowJoin(false)} />
            </Modal>
        </div>
    );
}

// ── Room Card ─────────────────────────────────────────────────────────────────

const RoomCard = ({ room }: { room: Room }) => (
    <Link href={`/rooms/${room._id}`}>
        <Card hoverable className="h-full flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        {room.isPrivate && (
                            <Lock size={12} className="text-[var(--text-muted)] shrink-0" />
                        )}
                        <span className="font-display font-semibold text-[var(--text)] truncate">
                            {room.name}
                        </span>
                    </div>
                    {room.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                            {room.description}
                        </p>
                    )}
                </div>
                <ArrowRight size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-auto">
                <Badge variant="accent">{room.subject}</Badge>
                {room.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                ))}
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                <div className="flex items-center gap-1">
                    <Users size={12} />
                    {room.members.length}/{room.maxMembers}
                </div>
                <span>{timeAgo(room.lastActivity)}</span>
            </div>
        </Card>
    </Link>
);
