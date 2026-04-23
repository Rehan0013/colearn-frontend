"use client";
import {
    useState, useEffect, useRef, forwardRef,
    ButtonHTMLAttributes, InputHTMLAttributes, ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Loader2, User, Camera, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { useDispatch } from "react-redux";
import { authApi } from "@/lib/api";
import { setUser } from "@/store/slices/userSlice";
import type { AppDispatch } from "@/store";

const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(" ");

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-10 h-10" />;
    return (
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-all bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm"
            aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean; fullWidth?: boolean; variant?: "primary" | "ghost"; }
const Btn = forwardRef<HTMLButtonElement, BtnProps>(({ loading, fullWidth, variant = "primary", className, children, disabled, ...p }, ref) => (
    <button ref={ref} disabled={disabled || loading}
        className={cn("inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:scale-[0.98]",
            variant === "primary" ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-md hover:shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]",
            fullWidth && "w-full", className)}
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

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
);

type Step = "register" | "verify";

export default function RegisterPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [step, setStep] = useState<Step>("register");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return void toast.error("Image must be less than 5MB");
        }

        setProfileImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setErrors((p) => ({ ...p, [e.target.name]: "" }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            if (profileImage) data.append("avatar", profileImage);
            await authApi.post("/api/auth/register", data, { headers: { "Content-Type": "multipart/form-data" } });
            setEmail(form.email);
            toast.success("OTP sent to your email!");
            setStep("verify");
        } catch (err: any) {
            const fieldErrors = err.response?.data?.errors;
            if (fieldErrors) {
                const map: Record<string, string> = {};
                fieldErrors.forEach((e: any) => { map[e.path] = e.msg; });
                setErrors(map);
            } else {
                toast.error(err.response?.data?.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

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

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) return void toast.error("Enter the full 6-digit OTP");
        setLoading(true);
        try {
            const res = await authApi.post("/api/auth/verify-registration", { email, otp: code });
            dispatch(setUser(res.data.user));
            toast.success("Welcome to Colearn! 🎉");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            if (profileImage) data.append("avatar", profileImage);
            await authApi.post("/api/auth/register", data, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("OTP resent!");
        } catch {
            toast.error("Failed to resend OTP");
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--accent)] selection:text-white">
            
            {/* Left Panel - Premium Decorative Background (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 md:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-[var(--bg)] border-r border-[var(--border)]">
                {/* Dynamic animated abstract background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[10%] w-[70%] h-[70%] bg-purple-500/20 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: "10s" }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent)]/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
                    <div className="absolute top-[40%] left-[-20%] w-[40%] h-[40%] bg-blue-500/15 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: "12s", animationDelay: "1s" }} />
                </div>

                {/* Left Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="font-display font-bold text-3xl tracking-tight text-[var(--text)] group">
                        co<span className="text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">learn</span>
                    </Link>
                </div>

                {/* Left Body Content */}
                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-4xl lg:text-5xl font-display font-bold text-[var(--text)] mb-6 leading-[1.15]">
                        Supercharge your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-500">
                            learning journey.
                        </span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-10">
                        Connect with peers worldwide. Stay accountable with shared pomodoro timers, collaborative notes, and real-time study rooms.
                    </p>
                    
                    {/* Feature list */}
                    <div className="flex flex-col gap-5">
                        {[
                            { title: "Real-time Study Rooms", desc: "Join tailored rooms matching your subjects." },
                            { title: "Built-in Productivity", desc: "Shared Pomodoro timers to stay accountable." },
                            { title: "Collaborative Notes", desc: "Take synced notes with your entire room." }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/20">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[var(--text)] font-semibold text-sm">{feature.title}</span>
                                    <span className="text-[var(--text-muted)] text-sm">{feature.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex flex-col relative w-full lg:w-1/2 md:w-7/12 overflow-y-auto">
                {/* Mobile Header elements */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="font-display font-bold text-2xl tracking-tight text-[var(--text)]">
                        co<span className="text-[var(--accent)]">learn</span>
                    </Link>
                </div>
                
                {/* Theme toggle pinned top right */}
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-[440px] m-auto px-6 py-20 min-h-full flex flex-col justify-center">
                    
                    {/* Header */}
                    <div className="mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">
                            {step === "register" ? "Create an account" : "Check your inbox"}
                        </h1>
                        <p className="text-[var(--text-muted)] text-base">
                            {step === "register"
                                ? "Join thousands of students and start studying together today."
                                : <>We sent a verification code to <span className="text-[var(--text)] font-semibold">{email}</span></>
                            }
                        </p>
                    </div>

                    {step === "register" ? (
                        <>
                            {/* Google Auth */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
                                <a href={`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/google`}
                                    className="flex items-center justify-center gap-3 w-full border-2 border-[var(--border)] rounded-xl py-3.5 px-4 text-sm font-semibold text-[var(--text)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-muted)] transition-all shadow-sm active:scale-[0.98]">
                                    <GoogleIcon /> Sign up with Google
                                </a>

                                <div className="flex items-center gap-4 my-8">
                                    <div className="flex-1 h-px bg-[var(--border)]" />
                                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Or sign up with email</span>
                                    <div className="flex-1 h-px bg-[var(--border)]" />
                                </div>
                            </div>

                            {/* Main Form */}
                            <form onSubmit={handleRegister} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                                
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center gap-3 mb-2">
                                    <div className="relative group">
                                        <div className={cn(
                                            "w-24 h-24 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden transition-all bg-[var(--bg-surface)] group-hover:border-[var(--accent)] group-hover:bg-[var(--bg-elevated)]",
                                            previewUrl && "border-solid border-[var(--accent)] border-2"
                                        )}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                                                    <Camera size={24} />
                                                    <span className="text-[10px] font-bold uppercase mt-1">Upload</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            title="Choose profile picture"
                                        />

                                        {previewUrl && (
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveImage}
                                                className="absolute -top-1 -right-1 bg-[var(--red)] text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        {!previewUrl && (
                                            <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] font-medium">Add a profile picture (optional)</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-5 sm:gap-4">
                                    <Inp 
                                        label="First name" 
                                        name="firstName" 
                                        placeholder="Alex" 
                                        value={form.firstName} 
                                        onChange={handleChange} 
                                        error={errors.firstName} 
                                        leftIcon={<User size={18} />} 
                                        required 
                                        className="sm:pr-4"
                                    />
                                    <Inp 
                                        label="Last name" 
                                        name="lastName" 
                                        placeholder="Chen" 
                                        value={form.lastName} 
                                        onChange={handleChange} 
                                        error={errors.lastName} 
                                        required 
                                    />
                                </div>
                                <Inp 
                                    label="Email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="you@email.com" 
                                    value={form.email} 
                                    onChange={handleChange} 
                                    error={errors.email} 
                                    leftIcon={<Mail size={18} />} 
                                    autoComplete="email" 
                                    required 
                                />
                                <Inp 
                                    label="Password" 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Min 8 characters" 
                                    value={form.password} 
                                    onChange={handleChange} 
                                    error={errors.password} 
                                    leftIcon={<Lock size={18} />}
                                    rightIcon={
                                        <button type="button" onClick={() => setShowPassword(p => !p)} className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1" aria-label="Toggle password visibility">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    autoComplete="new-password" 
                                    required 
                                />
                                
                                <Btn type="submit" fullWidth loading={loading} className="mt-4 text-[15px] h-12">
                                    Create account
                                </Btn>
                            </form>
                            
                            {/* Footer link */}
                            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                                <p className="text-[15px] text-[var(--text-muted)]">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-[var(--text)] font-semibold border-b border-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all pb-0.5">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleVerify} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            {/* OTP boxes */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-semibold text-[var(--text)] text-center mb-1">Enter 6-digit code</label>
                                <div className="flex gap-2 sm:gap-3 justify-center">
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
                                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-display bg-[var(--bg-surface)] border-2 border-[var(--border)] rounded-xl text-[var(--accent)] focus:border-[var(--accent)] focus:bg-[var(--bg)] outline-none transition-all shadow-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <Btn type="submit" fullWidth loading={loading} className="text-[15px] h-12">
                                    Verify &amp; continue
                                </Btn>
                                <button type="button" onClick={handleResend}
                                    className="text-sm text-center font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors h-10 px-4 rounded-xl hover:bg-[var(--bg-elevated)] w-max mx-auto">
                                    Didn&apos;t receive it? Resend code
                                </button>
                            </div>
                            
                            <div className="mt-4 text-center border-t border-[var(--border)] pt-8">
                                <button onClick={() => setStep("register")}
                                    className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center justify-center gap-2 mx-auto">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    Back to registration
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
