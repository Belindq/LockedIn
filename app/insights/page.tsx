"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import Link from "next/link";

export default function InsightsPage() {
    const { user, partner, quest, progress, setUserStatus, sync } = useUser();
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUnmatchModal, setShowUnmatchModal] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState<"user" | "partner" | null>(null);
    const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

    useEffect(() => {
        if (user.status === "matched") {
            fetchInsights();
        } else {
            setLoading(false);
        }
    }, [user.status]);

    const fetchInsights = async () => {
        try {
            const res = await fetch('/api/quest/insights');
            const data = await res.json();
            if (res.ok) {
                setInsights(data.insights);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleUnmatch = () => {
        setUserStatus("idle");
    };

    const toggleInsight = (id: string) => {
        setExpandedInsightId(expandedInsightId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="h-full bg-background flex items-center justify-center font-pixel text-primary">
                LOADING INSIGHTS...
            </div>
        );
    }

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

    // Sort revealed insights (newest first)
    const revealedInsights = [...insights].sort((a, b) =>
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    );

    const hasMoreInsights = insights.length < 5;

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-[12px] font-pixel text-secondary mb-1">YOUR BOND WITH</h2>
                        <h1 className="text-[18px] font-pixel text-primary uppercase">{partner?.firstName || "Partner"}</h1>
                    </div>

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
                                                        {insight.confidenceScore || Math.floor(Math.random() * (98 - 85 + 1) + 85)}%
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
                        {hoveredAvatar === "partner" && progress && (
                            <ProgressBar
                                value={progress?.partner || 0}
                                label={`${partner?.firstName || "Partner"}'s Progress`}
                                variant="partner"
                            />
                        )}
                    </div>

                    {/* Combined progress bar */}
                    <div className="flex-1">
                        {hoveredAvatar === null && progress && (
                            <ProgressBar
                                value={progress?.combined || 0}
                                label={`QUEST ${progress?.combined || 0}%`}
                                variant="combined"
                            />
                        )}
                        {hoveredAvatar === "user" && progress && (
                            <ProgressBar
                                value={progress?.user || 0}
                                label="Your Progress"
                                variant="user"
                            />
                        )}
                        {hoveredAvatar === "partner" && progress && (
                            <ProgressBar
                                value={progress?.partner || 0}
                                label={`${partner?.firstName || "Partner"}'s Progress`}
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
                        {hoveredAvatar === "user" && progress && (
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
