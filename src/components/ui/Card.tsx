import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    elevated?: boolean;
    hoverable?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
};

export const Card = ({
    elevated, hoverable, padding = "md", className, children, ...props
}: CardProps) => (
    <div
        className={cn(
            "rounded-[var(--radius-lg)] border border-[var(--border)]",
            elevated ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-surface)]",
            hoverable && "transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer",
            "shadow-[var(--shadow)]",
            paddings[padding],
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
        className={cn("font-display text-base font-semibold text-[var(--text)]", className)}
        {...props}
    >
        {children}
    </h3>
);
