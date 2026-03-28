"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/slices/userSlice";
import type { RootState, AppDispatch } from "@/store";
import { Navbar } from "@/components/layout/Navbar";
import { Spinner } from "@/components/ui/index";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { data: user, loading } = useSelector((s: RootState) => s.user);

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [loading, user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
                <div className="flex flex-col items-center gap-3">
                    <span className="font-display text-2xl font-bold text-[var(--text)]">
                        co<span className="text-[var(--accent)]">learn</span>
                    </span>
                    <Spinner size="md" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
