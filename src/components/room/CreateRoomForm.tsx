"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { roomApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Props { onSuccess: () => void }

export const CreateRoomForm = ({ onSuccess }: Props) => {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "", subject: "", description: "",
        isPrivate: false, maxMembers: 10,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await roomApi.post("/api/rooms", form);
            toast.success("Room created!");
            onSuccess();
            router.push(`/rooms/${res.data.room._id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label="Room Name"
                placeholder="e.g. Calculus Study Group"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
            />
            <Input
                label="Subject"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                required
            />
            <Input
                label="Description (optional)"
                placeholder="What will you study?"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex items-center gap-3">
                <Input
                    label="Max Members"
                    type="number"
                    min={2}
                    max={50}
                    value={form.maxMembers}
                    onChange={(e) => setForm((p) => ({ ...p, maxMembers: Number(e.target.value) }))}
                    className="w-28"
                />
                <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input
                        type="checkbox"
                        checked={form.isPrivate}
                        onChange={(e) => setForm((p) => ({ ...p, isPrivate: e.target.checked }))}
                        className="accent-[var(--accent)] w-4 h-4"
                    />
                    <span className="text-sm text-[var(--text)]">Private room</span>
                </label>
            </div>
            <Button type="submit" fullWidth loading={loading} className="mt-1">
                Create Room
            </Button>
        </form>
    );
};
