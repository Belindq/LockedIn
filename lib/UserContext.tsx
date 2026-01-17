"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    User,
    Quest,
    Progress,
    GalleryItem,
    InsightItem,
    Partner,
    mockUser,
    mockPartner,
    mockQuest,
    mockProgress,
    mockGalleryItems,
    mockInsights,
    UserStatus,
    initialUser,
} from "./mockData";

// ============================================================================
// Context Type
// ============================================================================

type UserContextType = {
    user: User;
    partner: Partner | null;
    quest: Quest | null;
    progress: Progress | null;
    galleryItems: GalleryItem[];
    insights: InsightItem[];
    updateUser: (updates: Partial<User>) => void;
    setUserStatus: (status: UserStatus) => void;
    logout: () => void;
};

// ============================================================================
// Create Context
// ============================================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(initialUser);

    // Load from localStorage on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem('lockedin_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }
    }, []);

    // Save to localStorage whenever user changes
    React.useEffect(() => {
        localStorage.setItem('lockedin_user', JSON.stringify(user));
    }, [user]);

    // For users with "matched" status, provide quest data
    // Otherwise, these remain null
    const partner = user.status === "matched" ? mockPartner : null;
    const quest = user.status === "matched" ? mockQuest : null;
    const progress = user.status === "matched" ? mockProgress : null;
    const galleryItems = user.status === "matched" ? mockGalleryItems : [];
    const insights = user.status === "matched" ? mockInsights : [];

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            const newUser = { ...prev, ...updates };
            return newUser;
        });
    };

    const setUserStatus = (status: UserStatus) => {
        setUser((prev) => {
            const newUser = { ...prev, status };
            return newUser;
        });
    };

    return (
        <UserContext.Provider
            value={{
                user,
                partner,
                quest,
                progress,
                galleryItems,
                insights,
                updateUser,
                setUserStatus,
                logout: () => {
                    setUser(initialUser);
                    localStorage.removeItem('lockedin_user');
                },
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
