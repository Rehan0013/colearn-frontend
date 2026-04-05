"use client";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface SkeletonProps extends HTMLMotionProps<"div"> {
    variant?: "rectangle" | "circle" | "rounded";
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function Skeleton({
    variant = "rectangle",
    width,
    height,
    className,
    ...props
}: SkeletonProps) {
    const variants = {
        rectangle: "rounded-none",
        circle: "rounded-full",
        rounded: "rounded-2xl",
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className={cn(
                "bg-[var(--border)] relative overflow-hidden",
                variants[variant],
                className
            )}
            style={{
                width: width,
                height: height,
                ...props.style,
            }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </motion.div>
    );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="rounded"
                    height="1rem"
                    className={cn(
                        "w-full",
                        i === lines - 1 && lines > 1 ? "w-[60%]" : ""
                    )}
                />
            ))}
        </div>
    );
}
