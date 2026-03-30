"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoomAction, updateRoomAction } from "@/actions/roomActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/index";
import { X, Plus, Hash } from "lucide-react";
import toast from "react-hot-toast";

const SUBJECTS = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "History", label: "History" },
    { value: "Language", label: "Language" },
    { value: "CS", label: "Computer Science" },
    { value: "Arts", label: "Arts" },
    { value: "Other", label: "Other" },
];

interface Props {
    onSuccess: () => void;
    initialData?: any;
    isUpdate?: boolean;
}

export const CreateRoomForm = ({ onSuccess, initialData, isUpdate }: Props) => {
    const router = useRouter(); 
    const [form, setForm] = useState({
        name: initialData?.name || "", 
        subject: initialData?.subject || "Mathematics", 
        description: initialData?.description || "",
        isPrivate: initialData?.isPrivate || false, 
        maxMembers: initialData?.maxMembers || 10,
    });
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [loading, setLoading] = useState(false);

    const addTag = () => {
        const val = tagInput.trim().toLowerCase();
        if (val && !tags.includes(val) && tags.length < 5) {
            setTags([...tags, val]);
            setTagInput("");
        }
    };

    const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isUpdate && initialData?._id) {
                const res = await updateRoomAction(initialData._id, { ...form, tags });
                if (res.success) {
                    toast.success("Room updated!");
                    onSuccess();
                } else {
                    toast.error(res.error || "Failed to update room");
                }
            } else {
                const res = await createRoomAction({ ...form, tags });
                if (res.success) {
                    toast.success("Room created!");
                    onSuccess();
                    router.push(`/rooms/${res.data._id}`);
                } else {
                    toast.error(res.error || "Failed to create room");
                }
            }
        } catch (err: any) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
                label="Room Name"
                placeholder="e.g. Calculus Study Group"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                maxLength={50}
            />
            
            <Select
                label="Subject"
                options={SUBJECTS}
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                required
            />

            <Input
                label="Description"
                placeholder="What will you study? (optional)"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                maxLength={200}
            />

            {/* Tags section */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[var(--text-muted)] px-1 uppercase tracking-wider">
                    Tags (max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                    {tags.map((t) => (
                        <Badge key={t} variant="accent" className="gap-1 pr-1">
                            {t}
                            <button type="button" onClick={() => removeTag(t)} className="hover:text-[var(--text)]">
                                <X size={10} />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="flex-1"
                    />
                    <Button type="button" variant="secondary" onClick={addTag} disabled={!tagInput.trim() || tags.length >= 5}>
                        <Plus size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Max Members"
                    type="number"
                    min={2}
                    max={50}
                    value={form.maxMembers}
                    onChange={(e) => setForm((p) => ({ ...p, maxMembers: Number(e.target.value) }))}
                />
                <div className="flex flex-col gap-1.5 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.isPrivate}
                            onChange={(e) => setForm((p) => ({ ...p, isPrivate: e.target.checked }))}
                            className="accent-[var(--accent)] w-4 h-4 rounded border-[var(--border)]"
                        />
                        <span className="text-sm font-medium text-[var(--text)]">Private Room</span>
                    </label>
                    <p className="text-[10px] text-[var(--text-muted)] px-6">
                        Accessible only via invite code
                    </p>
                </div>
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-2 h-11 text-base shadow-[var(--shadow-accent)]">
                {isUpdate ? "Save Changes" : "Create Room"}
            </Button>
        </form>
    );
};
