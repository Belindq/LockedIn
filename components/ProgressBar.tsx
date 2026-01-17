import React from "react";

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    variant?: "combined" | "user" | "partner";
}

export function ProgressBar({ value, label, variant = "combined" }: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    const colorStyles = {
        combined: "bg-[#FF69B4]", // Hot Pink
        user: "bg-[#0066FF]",     // Ultramarine Blue
        partner: "bg-[#9D00FF]",  // Electric Purple
    };

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-pixel text-foreground">{label}</span>
                    <span className="text-[8px] font-pixel text-gray-500">{clampedValue}%</span>
                </div>
            )}
            <div className="w-full bg-input-bg border-2 border-border h-4 overflow-hidden">
                <div
                    className={`h-full ${colorStyles[variant]} transition-all duration-300`}
                    style={{ width: `${clampedValue}%` }}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}
