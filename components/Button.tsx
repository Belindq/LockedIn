import React, { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    children,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles =
        "px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary:
            "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white dark:bg-primary dark:text-white dark:hover:bg-white dark:hover:text-primary focus:ring-primary rounded-lg",
        secondary:
            "border-2 border-border bg-transparent text-foreground hover:bg-card focus:ring-border",
        ghost:
            "border-2 border-transparent text-foreground hover:bg-card focus:ring-border",
        destructive:
            "bg-[#FF3333] text-white border-2 border-[#FF3333] hover:bg-[#CC0000] focus:ring-[#FF3333]",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
