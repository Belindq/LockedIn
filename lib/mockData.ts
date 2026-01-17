// Mock data and types for LockedIn frontend skeleton
// This will be replaced with real API calls in future phases

// ============================================================================
// Type Definitions
// ============================================================================

export type UserStatus = "onboarding" | "idle" | "waiting_for_match" | "matched";

export type Coordinates = {
    lat: number;
    lng: number;
};

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    sexuality: string;
    homeAddress: string;
    locationCoordinates: Coordinates;
    interests: string;
    values: string;
    mustHaves: string;
    niceToHaves: string;
    dealBreakers: string;
    avatarId: string; // e.g., "avatar-1" to "avatar-12"
    status: UserStatus;
    createdAt: string;
    hasCompletedAvatar: boolean;
    hasCompletedQuestionnaire: boolean;
};

export type Partner = {
    id: string;
    firstName: string;
    avatarId: string;
};

export type ChallengeStatus = "locked" | "active" | "completed" | "expired";
export type SubmissionType = "photo" | "text" | "location";

export type Challenge = {
    id: string;
    orderIndex: number;
    title: string;
    description: string;
    type: SubmissionType;
    timeLimitSeconds: number;
    status: ChallengeStatus;
    identityRevealLabel: string;
    deadline: string; // ISO timestamp
    userSubmission?: {
        caption?: string;
        imageUrl?: string;
        location?: Coordinates;
        submittedAt: string;
    };
    partnerSubmission?: {
        caption?: string;
        imageUrl?: string;
        location?: Coordinates;
        submittedAt: string;
    };
    aiInsightCaption?: string;
};

export type Quest = {
    id: string;
    title: string;
    description: string;
    deadline: string; // ISO timestamp
    challenges: Challenge[];
};

export type Progress = {
    combined: number; // 0-100
    user: number; // 0-100
    partner: number; // 0-100
};

export type GalleryItem = {
    id: string;
    imageUrl: string;
    caption: string;
    author: "user" | "partner";
    timestamp: string;
    aiInsightCaption?: string;
};

export type InsightItem = {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    category: "identity" | "compatibility" | "date_spot";
};

// ============================================================================
// Mock Data
// ============================================================================

export const mockUser: User = {
    id: "user-123",
    firstName: "Alex",
    lastName: "Chen",
    age: 28,
    gender: "Non-binary",
    sexuality: "Pansexual",
    homeAddress: "123 Main St, Brooklyn, NY 11201",
    locationCoordinates: {
        lat: 40.6935,
        lng: -73.9910,
    },
    interests: "Photography, hiking, indie music, cooking, board games",
    values: "Authenticity, curiosity, kindness, environmental consciousness",
    mustHaves: "Good communication, shared sense of humor, ambition",
    niceToHaves: "Enjoys outdoor activities, appreciates art, loves trying new restaurants",
    dealBreakers: "Dishonesty, close-mindedness, lack of ambition",
    avatarId: "avatar-3",
    status: "matched", // Change this to test different UI states
    createdAt: new Date().toISOString(),
    hasCompletedAvatar: true,
    hasCompletedQuestionnaire: true,
};

export const initialUser: User = {
    id: "user-init",
    firstName: "",
    lastName: "",
    age: 0,
    gender: "",
    sexuality: "",
    homeAddress: "",
    locationCoordinates: { lat: 0, lng: 0 },
    interests: "",
    values: "",
    mustHaves: "",
    niceToHaves: "",
    dealBreakers: "",
    avatarId: "",
    status: "onboarding",
    createdAt: new Date().toISOString(),
    hasCompletedAvatar: false,
    hasCompletedQuestionnaire: false,
};

export const mockPartner: Partner = {
    id: "partner-456",
    firstName: "Jordan",
    avatarId: "avatar-7",
};

// Calculate deadline timestamps
const now = new Date();
const questDeadline = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
const challenge1Deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
const challenge2Deadline = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
const challenge3Deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
const challenge4Deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
const challenge5Deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days

export const mockQuest: Quest = {
    id: "quest-789",
    title: "Weekend Adventures",
    description: "Discover each other's favorite ways to spend a weekend",
    deadline: questDeadline.toISOString(),
    challenges: [
        {
            id: "challenge-1",
            orderIndex: 0,
            title: "Morning Routine",
            description: "Share a photo of your favorite morning beverage or breakfast spot",
            type: "photo",
            timeLimitSeconds: 7200, // 2 hours
            status: "completed",
            identityRevealLabel: "Reveals: morning vibe",
            deadline: challenge1Deadline.toISOString(),
            userSubmission: {
                caption: "My go-to espresso spot with the best natural light",
                imageUrl: "/mock-images/coffee.jpg",
                submittedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            },
            partnerSubmission: {
                caption: "Homemade smoothie bowl with fresh berries",
                imageUrl: "/mock-images/smoothie.jpg",
                submittedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            },
            aiInsightCaption: "Both of you appreciate starting the day with intention and quality ingredients",
        },
        {
            id: "challenge-2",
            orderIndex: 1,
            title: "Hidden Gem",
            description: "Describe your favorite local spot that most people don't know about",
            type: "text",
            timeLimitSeconds: 86400, // 1 day
            status: "active",
            identityRevealLabel: "Reveals: local knowledge",
            deadline: challenge2Deadline.toISOString(),
            userSubmission: {
                caption: "There's a tiny bookstore in the East Village that also serves tea...",
                submittedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
            },
        },
        {
            id: "challenge-3",
            orderIndex: 2,
            title: "Adventure Spot",
            description: "Pin a location where you'd take someone for an adventurous day",
            type: "location",
            timeLimitSeconds: 172800, // 2 days
            status: "locked",
            identityRevealLabel: "Reveals: adventure style",
            deadline: challenge3Deadline.toISOString(),
        },
        {
            id: "challenge-4",
            orderIndex: 3,
            title: "Creative Expression",
            description: "Share a photo of something you've created or a place that inspires you",
            type: "photo",
            timeLimitSeconds: 259200, // 3 days
            status: "locked",
            identityRevealLabel: "Reveals: creative side",
            deadline: challenge4Deadline.toISOString(),
        },
        {
            id: "challenge-5",
            orderIndex: 4,
            title: "Evening Wind-down",
            description: "What's your ideal way to end a perfect Saturday?",
            type: "text",
            timeLimitSeconds: 345600, // 4 days
            status: "locked",
            identityRevealLabel: "Reveals: evening preferences",
            deadline: challenge5Deadline.toISOString(),
        },
    ],
};

export const mockProgress: Progress = {
    combined: 30, // (1.5 / 5) * 100
    user: 30, // 1.5 challenges completed by user
    partner: 20, // 1 challenge completed by partner
};

export const mockGalleryItems: GalleryItem[] = [
    {
        id: "gallery-1",
        imageUrl: "/mock-images/coffee.jpg",
        caption: "My go-to espresso spot with the best natural light",
        author: "user",
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        aiInsightCaption: "Appreciates quality coffee and aesthetic environments",
    },
    {
        id: "gallery-2",
        imageUrl: "/mock-images/smoothie.jpg",
        caption: "Homemade smoothie bowl with fresh berries",
        author: "partner",
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        aiInsightCaption: "Values health and takes time for self-care",
    },
];

export const mockInsights: InsightItem[] = [
    {
        id: "insight-1",
        title: "Morning Ritual Compatibility",
        description: "You both value intentional mornings and quality over convenience. This suggests you'd enjoy weekend brunches together.",
        unlockedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        category: "compatibility",
    },
    {
        id: "insight-2",
        title: "Jordan's Morning Vibe",
        description: "Starts the day with homemade healthy food — health-conscious and enjoys cooking",
        unlockedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        category: "identity",
    },
    {
        id: "insight-3",
        title: "Potential Date Spot",
        description: "Based on your submissions, a café with outdoor seating could be perfect for your first meeting",
        unlockedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        category: "date_spot",
    },
];

// Avatar options (avatar-1 through avatar-12)
export const avatarOptions = Array.from({ length: 12 }, (_, i) => ({
    id: `avatar-${i + 1}`,
    imageUrl: `/avatars/avatar-${i + 1}.png`,
}));
