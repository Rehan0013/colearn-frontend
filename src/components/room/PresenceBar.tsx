import { useDispatch, useSelector } from "react-redux";
import { UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { kickMember } from "@/store/slices/roomSlice";
import type { AppDispatch, RootState } from "@/store";
import type { PresenceUser } from "@/types";
import toast from "react-hot-toast";

interface Props { 
    users: PresenceUser[];
    isAdmin?: boolean;
    roomId?: string;
}

export const PresenceBar = ({ users, isAdmin = false, roomId }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((s: RootState) => s.user.data);

    const handleKick = async (memberId: string, name: string) => {
        if (!roomId) return;
        if (!window.confirm(`Are you sure you want to kick ${name}?`)) return;

        try {
            await dispatch(kickMember({ roomId, memberId })).unwrap();
            toast.success(`${name} kicked from room`);
        } catch (err: any) {
            toast.error(err || "Failed to kick member");
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 h-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text)]">
                    In this room
                </span>
                <span className="text-xs font-medium text-[var(--text-muted)]">
                    {users.length} online
                </span>
            </div>

            {users.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                    No one else is here yet.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {users.map((u) => (
                        <div key={u.userId} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar
                                    src={u.avatar}
                                    firstName={u.name.split(" ")[0]}
                                    lastName={u.name.split(" ")[1] ?? ""}
                                    size="sm"
                                    online={true}
                                />
                                <span className="text-sm text-[var(--text)] truncate">
                                    {u.name}
                                </span>
                            </div>
                            
                            {isAdmin && u.userId !== currentUser?._id && (
                                <button
                                    onClick={() => handleKick(u.userId, u.name)}
                                    className="p-1.5 rounded-[var(--radius)] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                                    title={`Kick ${u.name}`}
                                >
                                    <UserMinus size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
