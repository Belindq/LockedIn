"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import Link from "next/link";

export default function InsightsPage() {
    const { user, insights, partner, progress, setUserStatus } = useUser();
    const [showUnmatchModal, setShowUnmatchModal] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState<"user" | "partner" | null>(null);
    const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

    const handleUnmatch = () => {
        setUserStatus("idle");
    };

    const toggleInsight = (id: string) => {
        setExpandedInsightId(expandedInsightId === id ? null : id);
    };

    if (user.status !== "matched" || !insights || insights.length === 0) {
        return (
            <div className="h-full bg-background flex items-center justify-center">
                <EmptyState
                    icon="💡"
                    heading="No insights yet"
                    description="Complete challenges to unlock identity reveals and compatibility insights"
                    action={
                        <Link href="/quests">
                            <Button variant="primary">Go to Quests</Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    // Determine how many insights are unlocked based on combined progress.
    // Assuming each challenge completion unlocks an insight (e.g., 5 challenges = 20% each).
    // For the mock, we simulate this progression.
    const totalPossibleInsights = 5;
    const unlockedCount = Math.floor((progress?.combined || 0) / (100 / totalPossibleInsights));

    // Sort revealed insights (newest first)
    const revealedInsights = [...insights].slice(0, unlockedCount).sort((a, b) =>
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    );

    const hasMoreInsights = unlockedCount < totalPossibleInsights;

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="px-4 py-8">
                    <div className="space-y-4">
                        {revealedInsights.map((insight) => {
                            const isExpanded = expandedInsightId === insight.id;
                            return (
                                <Card
                                    key={insight.id}
                                    className={`bg-card text-card-text border-2 border-border transition-all duration-300 ${isExpanded ? 'p-6' : 'p-6 flex items-center justify-center text-center min-h-[100px]'}`}
                                    onClick={() => toggleInsight(insight.id)}
                                >
                                    <div className="w-full">
                                        <h3 className={`text-[20px] font-pixel text-primary uppercase leading-tight ${isExpanded ? 'mb-4 border-b-2 border-primary/10 pb-2 text-left' : ''}`}>
                                            {insight.title}
                                        </h3>

                                        {isExpanded && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                {insight.category === 'compatibility' && (
                                                    <div className="text-[32px] font-pixel text-secondary mb-4">
                                                        92%
                                                    </div>
                                                )}
                                                <p className="text-[16px] font-pixel text-gray-600 leading-relaxed mb-4">
                                                    {insight.description}
                                                </p>
                                                <div className="flex justify-between items-center text-[12px] font-pixel text-gray-400">
                                                    <span className="uppercase tracking-wider">{insight.category.replace('_', ' ')}</span>
                                                    <span>{new Date(insight.unlockedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}

                        {/* Locked Placeholder */}
                        {hasMoreInsights && (
                            <Card className="bg-card/50 text-gray-400 border-2 border-border border-dashed p-6 flex items-center justify-center text-center min-h-[100px] cursor-not-allowed">
                                <div>
                                    <h3 className="text-[16px] font-pixel uppercase tracking-widest mb-1">
                                        Locked Reveal
                                    </h3>
                                    <p className="text-[10px] font-pixel opacity-50">
                                        Complete more quests to unlock
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Persistent Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t-4 border-border p-4 shadow-lg z-40">
                {/* Avatar icons and progress */}
                <div className="flex items-center gap-4 mb-4">
                    {/* Partner avatar */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredAvatar("partner")}
                        onMouseLeave={() => setHoveredAvatar(null)}
                    >
                        <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-secondary transition-colors text-foreground">
                            👤
                        </div>
                        {hoveredAvatar === "partner" && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 z-50">
                                <ProgressBar
                                    value={progress.partner}
                                    label={`${partner?.firstName || 'Partner'}'s Progress`}
                                    variant="partner"
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
                                label={`${partner?.firstName || 'Partner'}'s Progress`}
                                variant="partner"
                            />
                        )}
                    </div>

                    {/* User avatar */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredAvatar("user")}
                        onMouseLeave={() => setHoveredAvatar(null)}
                    >
                        <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-primary transition-colors text-foreground">
                            👤
                        </div>
                        {hoveredAvatar === "user" && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 z-50">
                                <ProgressBar
                                    value={progress.user}
                                    label="Your Progress"
                                    variant="user"
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
                        className="text-[10px] bg-background border-2 border-border !text-black dark:!text-white font-bold hover:bg-red-500 hover:!text-white hover:border-red-500 px-8 py-2 font-pixel"
                    >
                        UNMATCH
                    </Button>
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
