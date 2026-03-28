"use client";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "accent" | "green" | "red" | "amber";
}

const badgeVariants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
    accent:  "bg-[var(--accent-soft)] text-[var(--accent)]",
    green:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    red:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export const Badge = ({ variant = "default", className, children, ...props }: BadgeProps) => (
    <span
        className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            badgeVariants[variant],
            className
        )}
        {...props}
    >
        {children}
    </span>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string }

const spinnerSizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export const Spinner = ({ size = "md", className }: SpinnerProps) => (
    <div
        className={cn(
            "border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin",
            spinnerSizes[size],
            className
        )}
    />
);

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg";
}

const modalWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
};

export const Modal = ({ open, onClose, title, children, maxWidth = "md" }: ModalProps) => {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div
                className={cn(
                    "relative w-full bg-[var(--bg-surface)] rounded-[var(--radius-lg)]",
                    "border border-[var(--border)] shadow-[var(--shadow-lg)]",
                    "p-6 z-10 animate-in fade-in zoom-in-95 duration-200",
                    modalWidths[maxWidth]
                )}
            >
                {title && (
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display font-semibold text-lg text-[var(--text)]">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1 rounded-[var(--radius)] hover:bg-[var(--bg-elevated)]"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
