"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
    const pathname = usePathname();
    const { logout } = useUser();

    const navItems = [
        { label: "Quests", href: "/quests" },
        { label: "Insights", href: "/insights" },
        { label: "Gallery", href: "/gallery" },
    ];

    return (
        <nav className="bg-background border-b-2 border-border sticky top-0 z-50 transition-colors duration-300 w-full">
            <div className="w-full px-4">
                <div className="flex items-center justify-center h-16 relative">
                    {/* Logo - Top Left */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                        <Link href="/quests">
                            <img src="/logo.png" alt="LockedIn Logo" className="h-20 object-contain hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    {/* Navigation Tabs - Centered */}
                    <div className="flex items-end h-full gap-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-center pb-2 text-[20px] font-pixel transition-colors relative min-w-[80px] ${isActive
                                        ? "text-primary border-b-4 border-primary"
                                        : "text-gray-400 hover:text-primary"
                                        }`}
                                >
                                    {item.label.toUpperCase()}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Theme Toggle & Logout - Top Right */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = "/";
                            }}
                            className="text-[20px] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            aria-label="Logout"
                            title="Reset / Logout"
                        >
                            ⬅️
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
