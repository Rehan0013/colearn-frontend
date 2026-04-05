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

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg)]">
                <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-[var(--shadow)]">
                    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                        <div className="font-display text-xl font-bold text-[var(--text)]">
                            co<span className="text-[var(--accent)]">learn</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />
                            <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />
                        </div>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
                    <div className="w-48 h-8 bg-[var(--border)] rounded-lg animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-64 bg-[var(--border)] rounded-2xl animate-pulse opacity-50" />
                        <div className="h-64 bg-[var(--border)] rounded-2xl animate-pulse opacity-50" />
                    </div>
                </main>
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
