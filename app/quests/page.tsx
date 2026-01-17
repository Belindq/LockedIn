"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function QuestsPage() {
    const { user, quest, progress, partner, setUserStatus } = useUser();
    const [showUnmatchModal, setShowUnmatchModal] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState<"user" | "partner" | null>(null);

    const handleUnmatch = () => {
        setUserStatus("idle");
    };

    const handleSubmitChallenge = (challengeId: string, data: any) => {
        console.log("Challenge submission:", challengeId, data);
        // In real implementation, this would call API
    };

    // Empty State: Waiting for match
    if (user.status === "waiting_for_match") {
        return (
            <div className="h-full bg-background flex flex-col items-center justify-center p-4">
                <EmptyState
                    icon="⏳"
                    heading="Finding Match..."
                    description="Check your email for updates."
                />
                {/* Debug Trigger for Demo */}
                <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity">
                    <Button
                        variant="secondary"
                        className="text-[10px]"
                        onClick={() => setUserStatus("matched")}
                    >
                        [Debug: Simulate Match Found]
                    </Button>
                </div>
            </div>
        );
    }

    // Empty State: Idle (no active match)
    if (user.status === "idle") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <EmptyState
                    icon="💫"
                    heading="No active match"
                    description="Ready to start your next quest?"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => setUserStatus("waiting_for_match")}
                        >
                            Enter Matching Pool
                        </Button>
                    }
                />
            </div>
        );
    }

    // Active Quest View
    if (user.status === "matched" && quest && progress && partner) {
        return (
            <div className="h-full bg-background flex flex-col">
                {/* Main scrollable quest area */}
                <div className="flex-1 overflow-y-auto pb-32">
                    <div className="w-full px-4 py-8">
                        {/* Quest messages in chat style */}
                        <div className="space-y-6">
                            {quest.challenges.map((challenge, idx) => (
                                <div key={challenge.id} className="flex gap-4 items-start">
                                    {/* Pixel heart icon placeholder */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-secondary border-2 border-white flex items-center justify-center text-white text-lg">
                                        ♥
                                    </div>

                                    {/* Challenge card */}
                                    <div className="flex-1 bg-card text-card-text border-2 border-border p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[10px] mb-1 font-pixel uppercase tracking-wider text-primary">AI-GENERATED QUEST</h3>
                                                <p className="text-[10px] text-card-text font-medium">
                                                    {challenge.status === "locked" ? "???" : challenge.title}
                                                </p>
                                                <p className="text-[8px] text-gray-500 mt-1">
                                                    {challenge.status === "locked" ? "Complete previous quest to unlock" : challenge.description}
                                                </p>
                                            </div>
                                            <span className={`text-[8px] px-2 py-1 border font-pixel ${challenge.status === "completed" ? "bg-green-100 border-green-500 text-green-700" :
                                                challenge.status === "active" ? "bg-blue-100 border-blue-500 text-blue-700" :
                                                    challenge.status === "locked" ? "bg-gray-100 border-gray-500 text-gray-700" :
                                                        "bg-red-100 border-red-500 text-red-700"
                                                }`}>
                                                {challenge.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Identity reveal label */}
                                        <div className="text-[7px] text-primary mb-3">
                                            {challenge.identityRevealLabel}
                                        </div>

                                        {/* Submission area for active challenges */}
                                        {challenge.status === "active" && (
                                            <div className="mt-3 pt-3 border-t-2 border-border">
                                                {challenge.type === "photo" && (
                                                    <div>
                                                        <div className="text-[7px] text-gray-500 mb-2">
                                                            📷 Photo upload (if needed)
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            className="w-full text-[8px]"
                                                            onClick={() => handleSubmitChallenge(challenge.id, {})}
                                                        >
                                                            UPLOAD
                                                        </Button>
                                                    </div>
                                                )}
                                                {challenge.type === "text" && (
                                                    <div>
                                                        <textarea
                                                            placeholder="Type your response..."
                                                            rows={2}
                                                            className="w-full mb-2 p-2 text-[8px] bg-input-bg text-input-text border-2 border-border placeholder:text-gray-400"
                                                        />
                                                        <Button
                                                            variant="primary"
                                                            className="w-full text-[8px]"
                                                            onClick={() => handleSubmitChallenge(challenge.id, {})}
                                                        >
                                                            SUBMIT
                                                        </Button>
                                                    </div>
                                                )}
                                                {challenge.type === "location" && (
                                                    <div>
                                                        <div className="bg-gray-100 p-4 text-center text-[7px] text-gray-500 mb-2 border-2 border-border">
                                                            📍 Map placeholder
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            className="w-full text-[8px]"
                                                            onClick={() => handleSubmitChallenge(challenge.id, {})}
                                                        >
                                                            SUBMIT LOCATION
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Show submissions if completed */}
                                        {challenge.status === "completed" && (
                                            <div className="mt-3 pt-3 border-t-2 border-border space-y-2">
                                                {challenge.userSubmission && (
                                                    <div className="text-[8px]">
                                                        <span className="font-bold text-primary">You:</span> {challenge.userSubmission.caption}
                                                    </div>
                                                )}
                                                {challenge.partnerSubmission && (
                                                    <div className="text-[8px]">
                                                        <span className="font-bold text-secondary">{partner.firstName}:</span> {challenge.partnerSubmission.caption}
                                                    </div>
                                                )}
                                                {challenge.aiInsightCaption && (
                                                    <div className="bg-secondary bg-opacity-10 border border-secondary p-2 text-[7px] text-card-text">
                                                        💡 {challenge.aiInsightCaption}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Absolute bottom bar - contained in module */}
                <div className="absolute bottom-0 left-0 right-0 bg-background border-t-4 border-border p-4 shadow-lg z-40">
                    <div className="w-full mx-auto">
                        {/* Avatar icons and progress */}
                        <div className="flex items-center gap-4 mb-4">
                            {/* User avatar */}
                            <div
                                className="relative"
                                onMouseEnter={() => setHoveredAvatar("user")}
                                onMouseLeave={() => setHoveredAvatar(null)}
                            >
                                <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-primary transition-colors">
                                    👤
                                </div>
                                {hoveredAvatar === "user" && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48">
                                        <ProgressBar
                                            value={progress.user}
                                            label="Your Progress"
                                            variant="user"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Combined progress bar */}
                            <div className="flex-1">
                                {hoveredAvatar === null && (
                                    <ProgressBar
                                        value={progress.combined}
                                        label={`QUEST ${progress.combined}%`}
                                        variant="combined"
                                    />
                                )}
                                {hoveredAvatar === "user" && (
                                    <ProgressBar
                                        value={progress.user}
                                        label="Your Progress"
                                        variant="user"
                                    />
                                )}
                                {hoveredAvatar === "partner" && (
                                    <ProgressBar
                                        value={progress.partner}
                                        label={`${partner.firstName}'s Progress`}
                                        variant="partner"
                                    />
                                )}
                            </div>

                            {/* Partner avatar */}
                            <div
                                className="relative"
                                onMouseEnter={() => setHoveredAvatar("partner")}
                                onMouseLeave={() => setHoveredAvatar(null)}
                            >
                                <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-secondary transition-colors">
                                    👤
                                </div>
                                {hoveredAvatar === "partner" && (
                                    <div className="absolute bottom-full right-0 mb-2 w-48">
                                        <ProgressBar
                                            value={progress.partner}
                                            label={`${partner.firstName}'s Progress`}
                                            variant="partner"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Unmatch button */}
                        <div className="flex justify-center">
                            <Button
                                variant="destructive"
                                onClick={() => setShowUnmatchModal(true)}
                                className="text-[10px] bg-background border-2 border-border !text-black dark:!text-white font-bold hover:bg-red-500 hover:!text-white hover:border-red-500 text-xs px-8 py-2 font-pixel"
                            >
                                UNMATCH
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Unmatch Confirmation Modal */}
                <ConfirmModal
                    isOpen={showUnmatchModal}
                    onClose={() => setShowUnmatchModal(false)}
                    onConfirm={handleUnmatch}
                    title="Unmatch?"
                    message="Are you sure you want to unmatch? This quest will end and cannot be recovered."
                    confirmText="Unmatch"
                    cancelText="Cancel"
                />
            </div>
        );
    }

    // Fallback
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <EmptyState
                icon="❓"
                heading="Something went wrong"
                description="Unable to load quest data"
            />
        </div>
    );
}
