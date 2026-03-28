"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchCurrentUser, logoutUser } from "@/store/slices/userSlice";
import type { RootState, AppDispatch } from "@/store";

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: user, loading, error } = useSelector((s: RootState) => s.user);
    const router = useRouter();

    useEffect(() => {
        if (!user) dispatch(fetchCurrentUser());
    }, []);

    const logout = async () => {
        await dispatch(logoutUser());
        router.push("/login");
    };

    return { user, loading, error, logout };
};
