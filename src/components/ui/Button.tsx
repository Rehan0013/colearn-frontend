"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
}

const variants = {
    primary:   "bg-[var(--accent)] text-white hover:opacity-90 shadow-sm",
    secondary: "bg-[var(--bg-elevated)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)]",
    ghost:     "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]",
    danger:    "bg-[var(--red)] text-white hover:opacity-90",
    outline:   "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]",
};

const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-all duration-150 cursor-pointer select-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {children}
        </button>
    )
);

Button.displayName = "Button";
