import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string | null;
    firstName?: string;
    lastName?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    online?: boolean;
}

const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
};

const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-3.5 h-3.5",
};

export const Avatar = ({
    src, firstName = "?", lastName = "", size = "md", className, online,
}: AvatarProps) => (
    <div className={cn("relative flex-shrink-0", className)}>
        {src ? (
            <img
                src={src || undefined}
                alt={`${firstName} ${lastName}`}
                className={cn("rounded-full object-cover bg-[var(--bg-elevated)]", sizes[size])}
            />
        ) : (
            <div
                className={cn(
                    "rounded-full flex items-center justify-center font-semibold",
                    "bg-[var(--accent-soft)] text-[var(--accent)]",
                    sizes[size]
                )}
            >
                {getInitials(firstName, lastName)}
            </div>
        )}
        {online !== undefined && (
            <span
                className={cn(
                    "absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-surface)]",
                    dotSizes[size],
                    online ? "bg-[var(--green)]" : "bg-[var(--text-muted)]"
                )}
            />
        )}
    </div>
);
