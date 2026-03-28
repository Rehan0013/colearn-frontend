"use client";
import { Avatar } from "@/components/ui/Avatar";
import type { PresenceUser } from "@/types";

interface Props { users: PresenceUser[] }

export const PresenceBar = ({ users }: Props) => (
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
                    <div key={u.userId} className="flex items-center gap-2.5">
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
                ))}
            </div>
        )}
    </div>
);
