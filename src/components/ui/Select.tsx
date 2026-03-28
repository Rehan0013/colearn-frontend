"use client";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = ({ label, error, options, className, ...props }: Props) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && (
            <label className="text-xs font-semibold text-[var(--text-muted)] px-1 uppercase tracking-wider">
                {label}
            </label>
        )}
        <div className="relative group">
            <select
                className={cn(
                    "w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--text)] outline-none appearance-none",
                    "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all",
                    "group-hover:border-[var(--accent-muted)]",
                    error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/20",
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none"
            />
        </div>
        {error && <p className="text-[10px] text-[var(--red)] px-1">{error}</p>}
    </div>
);
