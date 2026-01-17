"use client";

import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

export default function PartnerQuestsPage() {
    const { user, quest, progress, partner } = useUser();

    if (user.status !== "matched" || !quest || !progress || !partner) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    icon="❌"
                    heading="No active quest"
                    description="You need an active match to view partner progress"
                    action={
                        <Link href="/quests">
                            <Button variant="primary">Go to Quests</Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <Link href="/quests">
                        <Button variant="ghost">← Back to My Quest</Button>
                    </Link>
                </div>

                {/* Quest Header */}
                <Card className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {partner.firstName}'s Quest View
                    </h1>
                    <p className="text-gray-600">{quest.description}</p>
                </Card>

                {/* Progress Bars */}
                <Card className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
                    <div className="space-y-4">
                        <ProgressBar
                            value={progress.combined}
                            label="Combined Progress"
                            variant="combined"
                        />
                        <ProgressBar
                            value={progress.user}
                            label="Your Progress"
                            variant="user"
                        />
                        <ProgressBar
                            value={progress.partner}
                            label={`${partner.firstName}'s Progress`}
                            variant="partner"
                        />
                    </div>
                </Card>

                {/* Challenges - Read-only */}
                <div className="space-y-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Challenges</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        View your partner's submissions and AI insights
                    </p>
                    {quest.challenges.map((challenge) => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            isReadOnly={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
