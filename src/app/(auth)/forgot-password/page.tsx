"use client";
import { useState, forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
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

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.post("/api/auth/forgot-password", { email });
            toast.success(res.data.message || "OTP sent if account exists");
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--accent)] selection:text-white">
            
            {/* Left Panel - Premium Decorative Background */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--bg)] border-r border-[var(--border)]">
                {/* Dynamic animated abstract background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-[var(--accent)]/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "9s" }} />
                    <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/15 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: "14s", animationDelay: "2s" }} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="font-display font-bold text-3xl tracking-tight text-[var(--text)] group">
                        co<span className="text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">learn</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-20">
                    <h2 className="text-4xl lg:text-5xl font-display font-bold text-[var(--text)] mb-6 leading-[1.15]">
                        Security is our <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-500">
                            top priority.
                        </span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8">
                        We protect your study data securely. Get back into your account swiftly with our seamless recovery process.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="flex-1 flex flex-col relative w-full lg:w-1/2 justify-center">
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="font-display font-bold text-2xl tracking-tight text-[var(--text)]">
                        co<span className="text-[var(--accent)]">learn</span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] mx-auto px-6 py-12">
                    
                    {!success ? (
                        <>
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-8 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to login
                            </Link>

                            <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">Forgot password?</h1>
                                <p className="text-[var(--text-muted)] text-base">No worries, we'll send you reset instructions.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                                <Inp 
                                    label="Email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="you@email.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    leftIcon={<Mail size={18} />} 
                                    autoComplete="email" 
                                    required 
                                />
                                
                                <Btn type="submit" fullWidth loading={loading} className="mt-2 text-[15px] h-12">
                                    Send reset OTP
                                </Btn>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full flex items-center justify-center mb-6">
                                <Mail size={32} />
                            </div>
                            <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-3">Check your email</h1>
                            <p className="text-[var(--text-muted)] text-base mb-8">
                                We sent a password reset OTP to <span className="font-semibold text-[var(--text)]">{email}</span>
                            </p>
                            <Btn fullWidth onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)} className="text-[15px] h-12 mb-4">
                                Enter OTP & Reset Password
                            </Btn>
                            <button onClick={() => setSuccess(false)} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                                Didn't receive the email? Click to resend
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
