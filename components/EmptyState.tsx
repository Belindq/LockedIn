import React from "react";

interface EmptyStateProps {
    icon?: string;
    heading: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = "📭", heading, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-[12px] font-pixel text-foreground mb-2">{heading}</h3>
            {description && <p className="text-[8px] font-pixel text-gray-500 mb-6 max-w-md">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
