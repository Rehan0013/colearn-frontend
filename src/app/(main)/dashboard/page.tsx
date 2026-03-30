"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStats, fetchChartData } from "@/store/slices/sessionSlice";
import { fetchMyRoomsAction } from "@/actions/roomActions";
import { Spinner } from "@/components/ui/index";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardMainContent } from "@/components/dashboard/DashboardMainContent";
import { DashboardHistory } from "@/components/dashboard/DashboardHistory";
import type { RootState, AppDispatch } from "@/store";
import type { Room } from "@/types";

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((s: RootState) => s.user.data);
    const { stats, chartData, loading: statsLoading } = useSelector((s: RootState) => s.session);
    
    const [myRooms, setMyRooms] = useState<Room[]>([]);
    const [chartRange, setChartRange] = useState<"week" | "month">("week");
    const [loadingRooms, setLoadingRooms] = useState(true);

    useEffect(() => {
        dispatch(fetchStats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchChartData(chartRange));
    }, [dispatch, chartRange]);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const res = await fetchMyRoomsAction();
                if (res.success) {
                    setMyRooms(res.data.slice(0, 4));
                }
            } catch {
                // silently fail
            } finally {
                setLoadingRooms(false);
            }
        };
        loadRooms();
    }, []);

    if (statsLoading && !stats) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    const firstName = user?.fullName.firstName ?? "";

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader 
                firstName={firstName} 
                streak={stats?.streak ?? 0} 
            />

            <DashboardStats stats={stats} />

            <DashboardMainContent 
                chartData={chartData}
                chartRange={chartRange}
                onChartRangeChange={setChartRange}
                myRooms={myRooms}
            />

            <DashboardHistory chartData={chartData} />
        </div>
    );
}
