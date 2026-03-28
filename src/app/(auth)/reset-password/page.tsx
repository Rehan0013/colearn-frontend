"use client";
import { useState, useRef, useEffect, forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(" ");

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean; fullWidth?: boolean; }
const Btn = forwardRef<HTMLButtonElement, BtnProps>(({ loading, fullWidth, className, children, disabled, ...p }, ref) => (
    <button ref={ref} disabled={disabled || loading}
        className={cn("inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-3.5 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] shadow-md hover:shadow-lg active:scale-[0.98]", fullWidth && "w-full", className)}
        {...p}>
        {loading && <Loader2 size={16} className="animate-spin" />}{children}
    </button>
));
Btn.displayName = "Btn";

interface InpProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; leftIcon?: ReactNode; rightIcon?: ReactNode; }
const Inp = forwardRef<HTMLInputElement, InpProps>(({ label, error, leftIcon, rightIcon, className, id, ...p }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className="flex flex-col gap-2">
            {label && <label htmlFor={inputId} className="text-sm font-semibold text-[var(--text)]">{label}</label>}
            <div className="relative group">
                {leftIcon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none transition-colors group-focus-within:text-[var(--accent)]">{leftIcon}</span>}
                <input ref={ref} id={inputId}
                    className={cn("w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition-all hover:border-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--bg)]", error && "border-[var(--red)] focus:border-[var(--red)]", leftIcon ? "pl-11" : "", rightIcon ? "pr-11" : "", className)}
                    {...p} />
                {rightIcon && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{rightIcon}</span>}
            </div>
            {error && <p className="text-xs font-medium text-[var(--red)] animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
});
Inp.displayName = "Inp";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultEmail = searchParams.get("email") || "";

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState(defaultEmail);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email && defaultEmail) {
            setEmail(defaultEmail);
        }
    }, [defaultEmail, email]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value.slice(-1);
        setOtp(updated);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) return void toast.error("Enter the full 6-digit OTP");
        if (newPassword.length < 8) return void toast.error("Password must be at least 8 characters");

        setLoading(true);
        try {
            const res = await authApi.post("/api/auth/reset-password", { email, otp: code, newPassword });
            toast.success(res.data.message || "Password reset successfully!");
            router.push("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col relative w-full lg:w-1/2 justify-center">
            <div className="absolute top-6 left-6 lg:hidden">
                <Link href="/" className="font-display font-bold text-2xl tracking-tight text-[var(--text)]">
                    co<span className="text-[var(--accent)]">learn</span>
                </Link>
            </div>

            <div className="w-full max-w-[420px] mx-auto px-6 py-12">
                <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">Set new password</h1>
                    <p className="text-[var(--text-muted)] text-base">Enter the 6-digit OTP sent to <span className="text-[var(--text)] font-semibold">{email || "your email"}</span> and pick a new password.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                    
                    {/* OTP boxes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[var(--text)] mb-1">6-digit code</label>
                        <div className="flex gap-2 sm:gap-3">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    required
                                    className="w-full h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-display bg-[var(--bg-surface)] border-2 border-[var(--border)] rounded-xl text-[var(--accent)] focus:border-[var(--accent)] focus:bg-[var(--bg)] outline-none transition-all shadow-sm"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <Inp 
                            label="New password" 
                            name="newPassword" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Min 8 characters" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            leftIcon={<Lock size={18} />}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1" aria-label="Toggle password visibility">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            required 
                        />
                    </div>

                    <Btn type="submit" fullWidth loading={loading} className="mt-4 text-[15px] h-12">
                        Reset password
                    </Btn>
                </form>

                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                    <p className="text-[15px] text-[var(--text-muted)]">
                        Remember your password?{" "}
                        <Link href="/login" className="text-[var(--text)] font-semibold border-b border-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all pb-0.5">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--accent)] selection:text-white">
            
            {/* Left Panel - Premium Decorative Background */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--bg)] border-r border-[var(--border)]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-[var(--accent)]/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "11s" }} />
                    <div className="absolute bottom-[20%] left-[10%] w-[60%] h-[60%] bg-blue-500/15 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: "13s", animationDelay: "1s" }} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="font-display font-bold text-3xl tracking-tight text-[var(--text)] group">
                        co<span className="text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">learn</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-20">
                    <h2 className="text-4xl lg:text-5xl font-display font-bold text-[var(--text)] mb-6 leading-[1.15]">
                        Secure your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-500">
                            account natively.
                        </span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8">
                        Pick a strong unique password to ensure your learning progress and real-time study data stays safe.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[var(--accent)]" /></div>}>
                <ResetPasswordForm />
            </Suspense>
            
        </div>
    );
}
