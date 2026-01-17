import React from "react";

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={{ width, height }}
        />
    );
}
