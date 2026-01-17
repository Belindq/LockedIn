import React, { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
    return (
        <div
            className={`bg-card text-card-text border-2 border-border p-6 rounded-xl ${onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
