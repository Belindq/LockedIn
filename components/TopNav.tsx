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
                <div className="flex flex-col md:block min-h-[64px] relative py-2 md:py-0">
                    
                    {/* Mobile: Controls Row (Top Right) */}
                    <div className="md:hidden w-full flex justify-end gap-2 mb-2 pr-2">
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

                    {/* Logo - Hide on mobile */}
                    <div className="absolute left-0 top-[50%] transform -translate-y-1/2 hidden md:block">
                        <Link href="/quests">
                            <img src="/logo.png" alt="LockedIn Logo" className="h-24 object-contain hover:opacity-80 transition-opacity image-pixelated" />
                        </Link>
                    </div>

                    {/* Navigation Tabs - Centered */}
                    <div className="flex items-end justify-center h-full gap-4 md:gap-8 pb-2 md:pb-0">
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

                    {/* Desktop: Controls (Absolute Right) */}
                    <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 items-center gap-2">
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
