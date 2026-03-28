"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { roomApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Hash } from "lucide-react";
import toast from "react-hot-toast";

interface Props { onSuccess: () => void }

export const JoinByCodeForm = ({ onSuccess }: Props) => {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 8) {
            toast.error("Invite code must be 8 characters");
            return;
        }
        setLoading(true);
        try {
            const res = await roomApi.post("/api/rooms/join", { inviteCode: code.trim() });
            toast.success("Joined room!");
            onSuccess();
            router.push(`/rooms/${res.data.room._id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid invite code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-muted)]">
                Enter the 8-character invite code shared by the room admin.
            </p>
            <Input
                label="Invite Code"
                placeholder="e.g. aB3xKp2Z"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 8))}
                leftIcon={<Hash size={15} />}
                maxLength={8}
                required
            />
            <Button type="submit" fullWidth loading={loading}>
                Join Room
            </Button>
        </form>
    );
};
