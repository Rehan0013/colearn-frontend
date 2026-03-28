"use client";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { UserCircle, Camera, Save, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { fetchCurrentUser, logoutUser, setUser } from "@/store/slices/userSlice";
import { RootState, AppDispatch } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { data: user } = useSelector((s: RootState) => s.user);

    const [firstName, setFirstName] = useState(user?.fullName?.firstName || "");
    const [lastName, setLastName] = useState(user?.fullName?.lastName || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state if user loads later
    useEffect(() => {
        if (user) {
            setFirstName(user.fullName.firstName);
            setLastName(user.fullName.lastName);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) return toast.error("File size must be less than 2MB");
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!firstName) return toast.error("First name is required");
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("firstName", firstName);
            if (lastName) formData.append("lastName", lastName);
            if (avatarFile) formData.append("avatar", avatarFile);

            const res = await authApi.patch("/api/auth/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Profile updated successfully!");
            dispatch(setUser(res.data.user)); // Update Redux instantly
            setAvatarFile(null); // Clear pending file
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoutAll = async () => {
        if (!confirm("Are you sure you want to sign out of all other devices? You will be signed out from here as well.")) return;
        setLoggingOutAll(true);
        try {
            await authApi.post("/api/auth/logout-all");
            toast.success("Signed out of all devices");
            dispatch(logoutUser());
            router.push("/login");
        } catch (err: any) {
            toast.error("Failed to revoke sessions");
        } finally {
            setLoggingOutAll(false);
        }
    };

    if (!user) return null; // handled by layout

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold text-[var(--text)]">Profile Settings</h1>
                <p className="text-[var(--text-muted)] mt-1">Manage your account details and security.</p>
            </div>

            <Card className="border-[var(--border)] shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--text)]">
                        <UserCircle size={20} className="text-[var(--accent)]" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>Update your photo and personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-all bg-[var(--bg-surface)]" />
                            ) : (
                                <Avatar src={user.avatar} firstName={user.fullName.firstName} lastName={user.fullName.lastName} size="xl" className="w-24 h-24 text-2xl" />
                            )}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileChange} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Profile Photo</h3>
                            <p className="text-xs text-[var(--text-muted)] mb-3">Accepted formats: JPG, PNG, WEBP. Max size: 2MB.</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                                {avatarFile && (
                                    <Button variant="ghost" size="sm" className="text-[var(--red)]" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}>
                                        Cancel change
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text)]">First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)}
                                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text)]">Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)}
                                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text)]">Email Address</label>
                        <input 
                            type="email" 
                            value={user.email} 
                            disabled
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed"
                        />
                        <p className="text-xs text-[var(--text-muted)]">Your email address cannot be changed.</p>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={saving || (!avatarFile && firstName === user.fullName.firstName && lastName === user.fullName.lastName)} className="gap-2 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[var(--red)]/20 shadow-sm bg-gradient-to-br from-[var(--bg-surface)] to-[var(--red)]/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--red)]">
                        <ShieldAlert size={20} />
                        Security & Sessions
                    </CardTitle>
                    <CardDescription>Manage your active devices and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--red)]/10 bg-[var(--bg)]">
                        <div>
                            <h4 className="text-sm font-semibold text-[var(--text)]">Sign out of all devices</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[400px]">
                                If you spot suspicious activity on your account, you can forcefully sign out of all active sessions across all devices immediately.
                            </p>
                        </div>
                        <Button variant="danger" size="sm" onClick={handleLogoutAll} disabled={loggingOutAll} className="gap-2 whitespace-nowrap bg-[var(--red)] text-white hover:bg-[var(--red)]/90">
                            {loggingOutAll ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            Revoke Sessions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
