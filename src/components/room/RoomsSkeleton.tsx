"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export function RoomsSkeleton() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-500">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <RoomCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function RoomCardSkeleton() {
    return (
        <Card className="h-[200px] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton variant="rounded" width="60%" height={20} />
                    </div>
                    <Skeleton variant="rounded" width="90%" height={12} className="opacity-50" />
                    <Skeleton variant="rounded" width="70%" height={12} className="opacity-50" />
                </div>
                <Skeleton variant="rounded" width={20} height={20} />
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-auto">
                <Skeleton variant="rounded" width={80} height={24} className="rounded-full" />
                <Skeleton variant="rounded" width={60} height={24} className="rounded-full" />
                <Skeleton variant="rounded" width={70} height={24} className="rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width={14} height={14} />
                    <Skeleton variant="rounded" width={40} height={12} />
                </div>
                <Skeleton variant="rounded" width={60} height={12} />
            </div>
        </Card>
    );
}
