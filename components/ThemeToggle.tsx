"use client";

import { useTheme } from "@/lib/ThemeContext";
import { Button } from "@/components/Button";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            onClick={toggleTheme}
            className="text-[20px] p-2 hover:bg-transparent"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </Button>
    );
}
