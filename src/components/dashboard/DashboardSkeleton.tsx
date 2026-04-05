"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <Skeleton variant="rounded" width={200} height={32} />
                <Skeleton variant="rounded" width={300} height={20} className="opacity-60" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} padding="sm">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Skeleton variant="circle" width={18} height={18} />
                                <Skeleton variant="rounded" width={80} height={14} />
                            </div>
                            <Skeleton variant="rounded" width="60%" height={24} />
                            <Skeleton variant="rounded" width="40%" height={12} className="opacity-50" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Chart Skeleton */}
                <Card className="md:col-span-2">
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <Skeleton variant="rounded" width={150} height={24} />
                            <div className="flex gap-2">
                                <Skeleton variant="circle" width={60} height={24} className="rounded-full" />
                                <Skeleton variant="circle" width={60} height={24} className="rounded-full" />
                            </div>
                        </div>
                        <Skeleton variant="rounded" width="100%" height={200} />
                    </div>
                </Card>

                {/* My Rooms Skeleton */}
                <Card>
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <Skeleton variant="rounded" width={100} height={24} />
                            <Skeleton variant="rounded" width={50} height={14} />
                        </div>
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-2">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Skeleton variant="rounded" width="70%" height={14} />
                                        <Skeleton variant="rounded" width="40%" height={10} className="opacity-50" />
                                    </div>
                                    <Skeleton variant="rounded" width={60} height={20} className="rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* History Skeleton */}
            <Card>
                <div className="p-6 flex flex-col gap-4">
                    <Skeleton variant="rounded" width={180} height={24} />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-[var(--border)] last:border-0">
                                <Skeleton variant="circle" width={40} height={40} />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="rounded" width="30%" height={14} />
                                    <Skeleton variant="rounded" width="20%" height={10} className="opacity-50" />
                                </div>
                                <Skeleton variant="rounded" width={80} height={24} />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
