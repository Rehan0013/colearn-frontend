"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, DoorOpen, UserCircle, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rooms",     label: "Rooms",     icon: DoorOpen },
    { href: "/profile",   label: "Profile",   icon: UserCircle },
];

export const Navbar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-[var(--shadow)]">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link href="/dashboard" className="font-display text-xl font-bold text-[var(--text)]">
                    co<span className="text-[var(--accent)]">learn</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-sm font-medium transition-all duration-150",
                                pathname === href
                                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                            )}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {user && (
                        <div className="hidden md:flex items-center gap-2">
                            <Avatar
                                src={user.avatar}
                                firstName={user.fullName.firstName}
                                lastName={user.fullName.lastName}
                                size="sm"
                            />
                            <button
                                onClick={logout}
                                className="p-2 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        onClick={() => setMobileOpen((p) => !p)}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 flex flex-col gap-1">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium",
                                pathname === href
                                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                            )}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium text-[var(--red)] hover:bg-[var(--bg-elevated)] mt-1"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};
