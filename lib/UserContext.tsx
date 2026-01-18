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
    sync: () => Promise<void>;
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
    const [partner, setPartner] = useState<Partner | null>(null);
    const [quest, setQuest] = useState<Quest | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [loadingQuest, setLoadingQuest] = useState(false);

    // Load from localStorage and fetch data
    React.useEffect(() => {
        const savedUser = localStorage.getItem('lockedin_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                // If they were matched, initialize empty progress so bars don't "vanish"
                if (parsed.status === "matched") {
                    setProgress({ combined: 0, user: 0, partner: 0 });
                }
            } catch (e) { }
        }

        // Fetch user and quest in parallel if possible
        const init = async () => {
            try {
                const userRes = await fetch('/api/users/me');
                if (userRes.status === 401) {
                    setUser(initialUser);
                    localStorage.removeItem('lockedin_user');
                    return;
                }
                const userData = await userRes.json();
                setUser(prev => ({ ...prev, ...userData }));
                localStorage.setItem('lockedin_user', JSON.stringify(userData));

                if (userData.status === "matched") {
                    fetchQuestData();
                }
            } catch (err) {
                console.error('Initial fetch failed:', err);
            }
        };

        init();
    }, []);

    // Fetch quest data when user is matched
    const fetchQuestData = React.useCallback(async () => {
        if (user.status !== "matched") return;
        setLoadingQuest(true);
        try {
            const res = await fetch('/api/quest/active', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.quest) {
                    setQuest({
                        ...data.quest,
                        challenges: data.challenges
                    });
                    setPartner({
                        id: data.partnerId,
                        firstName: data.partnerName,
                        avatarId: 'avatar-1' // Default or fetch real if available in API
                    });
                    setProgress({
                        user: data.quest.userAProgress || 0,
                        partner: data.quest.userBProgress || 0,
                        combined: Math.round(((data.quest.userAProgress || 0) + (data.quest.userBProgress || 0)) / 2)
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching quest data in context:', err);
        } finally {
            setLoadingQuest(false);
        }
    }, [user.status]);

    React.useEffect(() => {
        if (user.status === "matched") {
            fetchQuestData();
        } else {
            setPartner(null);
            setQuest(null);
            setProgress(null);
        }
    }, [user.status, fetchQuestData]);

    // Save to localStorage whenever user changes
    React.useEffect(() => {
        localStorage.setItem('lockedin_user', JSON.stringify(user));
    }, [user]);

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => ({ ...prev, ...updates }));
    };

    const setUserStatus = (status: UserStatus) => {
        setUser((prev) => ({ ...prev, status }));
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
                sync: fetchQuestData, // Expose sync capability
                logout: () => {
                    setUser(initialUser);
                    localStorage.removeItem('lockedin_user');
                    setPartner(null);
                    setQuest(null);
                    setProgress(null);
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
