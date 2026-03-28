"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[var(--text)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius)]",
                            "px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]",
                            "transition-all duration-150 outline-none",
                            "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-red-100",
                            leftIcon && "pl-9",
                            rightIcon && "pr-9",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="text-xs text-[var(--red)]">{error}</p>}
                {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
