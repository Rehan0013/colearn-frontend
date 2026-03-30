"use client";
import { Trash2 } from "lucide-react";
import { Modal, Spinner } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { CreateRoomForm } from "@/components/room/CreateRoomForm";
import type { Room } from "@/types";

interface RoomSettingsModalProps {
    open: boolean;
    onClose: () => void;
    room: Room;
    roomId: string;
    isAdmin: boolean;
    deleting: boolean;
    onDelete: () => void;
    onRoomUpdate: () => void;
}

export function RoomSettingsModal({
    open,
    onClose,
    room,
    roomId,
    isAdmin,
    deleting,
    onDelete,
    onRoomUpdate
}: RoomSettingsModalProps) {
    if (!isAdmin) return null;

    return (
        <Modal open={open} onClose={onClose} title="Room Settings">
            <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1 flex-1 py-2">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        <h3 className="text-sm font-semibold text-[var(--text)]">Edit Room Details</h3>
                    </div>
                    <CreateRoomForm
                        isUpdate
                        initialData={room}
                        onSuccess={onRoomUpdate}
                    />
                </div>

                <div className="border-t border-[var(--border)] pt-6 mt-2">
                    <div className="p-4 rounded-[var(--radius)] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                            <Trash2 size={14} /> Danger Zone
                        </h3>
                        <p className="text-[11px] text-red-500/80 mb-4 leading-relaxed">
                            Once deleted, all data including chat history and notes will be permanently lost. This cannot be undone.
                        </p>
                        <Button
                            variant="danger"
                            size="sm"
                            fullWidth
                            loading={deleting}
                            onClick={onDelete}
                            className="font-bold tracking-tight shadow-sm"
                        >
                            Delete Room Permanently
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
