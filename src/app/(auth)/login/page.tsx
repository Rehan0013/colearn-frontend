"use client";
import {
    useState, useEffect, forwardRef,
    ButtonHTMLAttributes, InputHTMLAttributes, ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Loader2 } from "lucide-react";
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

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setErrors((p) => ({ ...p, [e.target.name]: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.post("/api/auth/login", form);
            dispatch(setUser(res.data.user));
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err: any) {
            const fieldErrors = err.response?.data?.errors;
            if (fieldErrors) {
                const map: Record<string, string> = {};
                fieldErrors.forEach((e: any) => { map[e.path] = e.msg; });
                setErrors(map);
            } else {
                toast.error(err.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--accent)] selection:text-white">

            {/* Left Panel - Premium Decorative Background (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--bg)] border-r border-[var(--border)]">
                {/* Dynamic animated abstract background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent)]/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "8s" }} />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-500/20 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: "12s", animationDelay: "1s" }} />
                    <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-orange-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
                </div>

                {/* Left Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="font-display font-bold text-3xl tracking-tight text-[var(--text)] group">
                        co<span className="text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">learn</span>
                    </Link>
                </div>

                {/* Left Body Content */}
                <div className="relative z-10 max-w-lg">
                    <div className="bg-[var(--bg-surface)]/40 backdrop-blur-xl border border-[var(--border)] p-10 rounded-[2rem] shadow-2xl">
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-[var(--text)] mb-6 leading-[1.15]">
                            Study smarter, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-500">
                                together.
                            </span>
                        </h2>
                        <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8">
                            Join thousands of students learning collectively through interactive, real-time study rooms and productive pomodoro sessions.
                        </p>

                        {/* Social Proof Widget */}
                        <div className="flex flex-col xl:flex-row xl:items-center gap-4 border-t border-[var(--border)] pt-6 mt-6">
                            <div className="flex -space-x-3">
                                {["bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-emerald-500"].map((color, i) => (
                                    <div key={i} className={cn("w-10 h-10 rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-xs font-bold text-white shadow-sm hover:-translate-y-1 transition-transform cursor-default", color)}>
                                        {["AK", "JS", "MR", "+"][i]}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex gap-1 text-amber-400">
                                    {Array(5).fill(0).map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                </div>
                                <span className="text-[var(--text-muted)] text-sm font-medium mt-0.5">Over 10,000+ active learners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col relative w-full lg:w-1/2 justify-center">
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

                <div className="w-full max-w-[420px] mx-auto px-6 py-12">

                    {/* Header */}
                    <div className="mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">Welcome back</h1>
                        <p className="text-[var(--text-muted)] text-base">Sign in to your account and continue your learning streak.</p>
                    </div>

                    {/* Google Auth */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
                        <a href={`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/google`}
                            className="flex items-center justify-center gap-3 w-full border-2 border-[var(--border)] rounded-xl py-3.5 px-4 text-sm font-semibold text-[var(--text)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-muted)] transition-all shadow-sm active:scale-[0.98]">
                            <GoogleIcon /> Continue with Google
                        </a>

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-[var(--border)]" />
                            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Or log in with email</span>
                            <div className="flex-1 h-px bg-[var(--border)]" />
                        </div>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
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

                        <div className="flex flex-col gap-2">
                            <Inp
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password}
                                leftIcon={<Lock size={18} />}
                                rightIcon={
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1" aria-label="Toggle password visibility">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                autoComplete="current-password"
                                required
                            />
                            <div className="flex justify-between items-center mt-1 px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--bg-surface)] cursor-pointer" checked disabled />
                                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Remember me</span>
                                </label>
                                <Link href="/forgot-password" className="text-sm font-medium text-[var(--accent)] hover:text-opacity-80 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Btn type="submit" fullWidth loading={loading} className="mt-4 text-[15px] h-12">
                            Sign in to Colearn
                        </Btn>
                    </form>

                    {/* Footer link */}
                    <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                        <p className="text-[15px] text-[var(--text-muted)]">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-[var(--text)] font-semibold border-b border-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all pb-0.5">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

