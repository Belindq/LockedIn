"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";

export default function QuestsPage() {
    const router = useRouter();

    const [activeQuest, setActiveQuest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submissionText, setSubmissionText] = useState('');
    const [submissionImage, setSubmissionImage] = useState('');
    const [submissionLocation, setSubmissionLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [revealData, setRevealData] = useState<any>(null);
    const [hoveredAvatar, setHoveredAvatar] = useState<"user" | "partner" | null>(null);

    useEffect(() => {
        fetchActiveQuest();
    }, []);

    // Poll for quest status changes (detect if partner unmatched)
    useEffect(() => {
        if (!activeQuest) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/quest/active`, { cache: 'no-store' });

                // If quest no longer exists (404), partner has unmatched
                if (res.status === 404) {
                    clearInterval(pollInterval);
                    alert('Your partner has unmatched. You have been returned to the matching pool.');
                    router.push('/matches');
                }
            } catch (err) {
                console.error('Error polling quest status:', err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval); // Cleanup on unmount
    }, [activeQuest, router]);

    const fetchActiveQuest = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/quest/active`, { cache: 'no-store' });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();

            if (res.ok && data) {
                setActiveQuest(data);
            }
        } catch (err) {
            console.error('Error fetching quest:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitChallenge = async (challengeId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challengeId,
                    submissionText: submissionText || "Completed!",
                    submissionImageBase64: submissionImage,
                    submissionLocation: submissionLocation
                })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(`Submission Failed: ${data.error || 'Unknown error'}`);
            } else {
                setSubmissionLocation(null);
                setSubmissionImage('');
                setSubmissionText('');
                fetchActiveQuest();
            }
        } catch (err) {
            alert('Error submitting challenge');
        } finally {
            setLoading(false);
        }
    };

    const approveChallenge = async (challengeId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challengeId,
                    approve: true
                })
            });

            const data = await res.json();

            if (res.ok) {
                fetchActiveQuest();
            } else {
                alert(`Approval Failed: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const revealLocation = async () => {
        if (!activeQuest?.quest?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quest/reveal?questId=${activeQuest.quest.id}`);
            const data = await res.json();
            if (res.ok) {
                setRevealData(data.reveal);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading && !activeQuest) {
        return (
            <div className="h-full bg-background flex flex-col items-center justify-center p-4">
                <EmptyState
                    icon="⏳"
                    heading="Loading Quest..."
                    description="Please wait"
                />
            </div>
        );
    }

    // No quest found
    if (!activeQuest) {
        return (
            <div className="h-full bg-background flex items-center justify-center">
                <EmptyState
                    icon="💫"
                    heading="No active quest"
                    description="Ready to start your next quest?"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => router.push('/matches')}
                        >
                            Find a Match
                        </Button>
                    }
                />
            </div>
        );
    }

    // Calculate progress
    const userProgress = activeQuest.quest.userAProgress || 0;
    const partnerProgress = activeQuest.quest.userBProgress || 0;
    const combinedProgress = Math.round((userProgress + partnerProgress) / 2);

    // Get partner name from match data
    const partnerName = activeQuest.quest?.partnerName || "Partner";

    // Active Quest View
    return (
        <div className="h-full bg-background flex flex-col">
            {/* Main scrollable quest area */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="w-full px-4 py-8">
                    {/* Partner Name Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-[12px] font-pixel text-secondary mb-1">QUESTING WITH</h2>
                        <h1 className="text-[18px] font-pixel text-primary uppercase">{partnerName}</h1>
                    </div>

                    {/* Quest messages in chat style */}
                    <div className="space-y-6">
                        {activeQuest.challenges.map((challenge: any, idx: number) => {
                            const isLocked = challenge.myStatus.status === 'locked';

                            // Show current active/submitted challenges, 
                            // and only the FIRST locked challenge (next milestone).
                            // Hide subsequent future challenges.
                            if (isLocked) {
                                const firstLockedIndex = activeQuest.challenges.findIndex((c: any) => c.myStatus.status === 'locked');
                                if (idx > firstLockedIndex) return null;
                            }

                            const isActive = challenge.myStatus.status === 'active';
                            const isSubmitted = challenge.myStatus.status === 'submitted';
                            const isCompleted = challenge.myStatus.status === 'completed' || challenge.myStatus.status === 'approved';
                            const partnerNeedsApproval = challenge.partnerStatus.status === 'submitted';

                            return (
                                <div key={challenge.id} className="flex gap-4 items-start">
                                    {/* Pixel heart icon placeholder */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-secondary border-2 border-white flex items-center justify-center text-white text-lg">
                                        ♥
                                    </div>

                                    {/* Challenge card */}
                                    <div className={`flex-1 bg-card text-card-text border-2 p-4 transition-all ${isActive ? 'border-primary shadow-lg' : 'border-border'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[10px] mb-1 font-pixel uppercase tracking-wider text-primary">
                                                    {isLocked ? "LOCKED" : "QUEST"}
                                                </h3>
                                                <p className="text-[10px] text-card-text font-medium">
                                                    {isLocked ? "???" : challenge.prompt}
                                                </p>
                                                <p className="text-[8px] text-gray-500 mt-1">
                                                    {isLocked ? "Complete previous quest to unlock" : `Type: ${challenge.type}`}
                                                </p>
                                            </div>
                                            <span className={`text-[8px] px-2 py-1 border font-pixel ${isCompleted ? "bg-green-100 border-green-500 text-green-700" :
                                                isActive ? "bg-blue-100 border-blue-500 text-blue-700" :
                                                    isLocked ? "bg-gray-100 border-gray-500 text-gray-700" :
                                                        "bg-yellow-100 border-yellow-500 text-yellow-700"
                                                }`}>
                                                {challenge.myStatus.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Submission area for active challenges */}
                                        {isActive && !isLocked && (
                                            <div className="mt-3 pt-3 border-t-2 border-border">
                                                {(challenge.type === 'image' || challenge.type === 'location') && (
                                                    <div>
                                                        <div className="text-[7px] text-gray-500 mb-2">
                                                            📷 Photo upload (No faces!)
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="text-[8px] w-full mb-2"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setSubmissionImage(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {challenge.type === 'location' && (
                                                    <button
                                                        onClick={() => setSubmissionLocation({ lat: 40.7128, lng: -74.0060 })}
                                                        className="mb-2 text-[7px] bg-blue-100 text-blue-700 px-2 py-1 border border-blue-300 hover:bg-blue-200"
                                                    >
                                                        📍 Use Mock Location
                                                    </button>
                                                )}
                                                <textarea
                                                    placeholder="Type your response..."
                                                    rows={2}
                                                    value={submissionText}
                                                    onChange={e => setSubmissionText(e.target.value)}
                                                    className="w-full mb-2 p-2 text-[8px] bg-input-bg text-input-text border-2 border-border placeholder:text-gray-400"
                                                />
                                                <Button
                                                    variant="primary"
                                                    className="w-full text-[8px]"
                                                    onClick={() => submitChallenge(challenge.id)}
                                                >
                                                    SUBMIT
                                                </Button>
                                            </div>
                                        )}

                                        {/* Waiting for approval */}
                                        {isSubmitted && (
                                            <div className="mt-3 pt-3 border-t-2 border-border">
                                                <div className="text-[8px] text-yellow-700 bg-yellow-50 p-2 border border-yellow-300">
                                                    ⏳ Waiting for partner approval...
                                                </div>
                                            </div>
                                        )}

                                        {/* Partner needs approval */}
                                        {partnerNeedsApproval && (
                                            <div className="mt-3 pt-3 border-t-2 border-border">
                                                <div className="bg-orange-50 border border-orange-300 p-3">
                                                    <div className="font-bold text-[8px] text-orange-900 mb-2">Partner needs approval!</div>
                                                    {challenge.partnerStatus.submissionImageBase64 && (
                                                        <img src={challenge.partnerStatus.submissionImageBase64} alt="Partner Submission" className="h-24 mb-2 border-2 border-border" />
                                                    )}
                                                    {challenge.partnerStatus.submissionText && (
                                                        <div className="text-[8px] italic mb-2 bg-white p-2 border border-orange-200">
                                                            "{challenge.partnerStatus.submissionText}"
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            className="flex-1 text-[8px]"
                                                            onClick={() => approveChallenge(challenge.id)}
                                                        >
                                                            APPROVE
                                                        </Button>
                                                        <button className="flex-1 text-[8px] px-2 py-1 bg-red-100 border-2 border-red-500 text-red-700 font-pixel opacity-50 cursor-not-allowed">
                                                            REJECT
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show submissions if completed */}
                                        {isCompleted && (
                                            <div className="mt-3 pt-3 border-t-2 border-border space-y-2">
                                                <div className="text-[7px] text-green-700 bg-green-50 p-2 border border-green-300">
                                                    ✅ Challenge Completed!
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Reveal Button */}
                        {(activeQuest.quest.status === 'completed' ||
                            (activeQuest.currentChallengeIndex >= activeQuest.totalChallenges &&
                                activeQuest.partnerCurrentChallengeIndex >= activeQuest.totalChallenges)) && !revealData && (
                                <div className="mt-8">
                                    <Button
                                        variant="primary"
                                        onClick={revealLocation}
                                        className="w-full text-[12px] py-4 animate-pulse"
                                    >
                                        📍 REVEAL LOCATION
                                    </Button>
                                </div>
                            )}

                        {/* Reveal Card */}
                        {revealData && (
                            <div className="mt-8 bg-card border-4 border-secondary p-6 text-center">
                                <div className="text-4xl mb-4">🎉</div>
                                <h2 className="font-pixel text-[14px] mb-4 text-secondary uppercase tracking-wider">LOCKED IN!</h2>

                                {revealData.dateDetails && (
                                    <div className="space-y-2 text-[10px]">
                                        <div className="font-bold text-primary">{revealData.dateDetails.title}</div>
                                        <div className="text-card-text">{revealData.dateDetails.locationName}</div>
                                        <div className="text-[8px] text-gray-500">{revealData.dateDetails.address}</div>
                                        <div className="bg-secondary bg-opacity-20 border border-secondary px-2 py-1 text-[8px] font-pixel inline-block">
                                            {revealData.dateDetails.activity}
                                        </div>
                                        <p className="italic text-[9px] text-gray-600 border-t border-b border-border py-2 my-2">
                                            "{revealData.dateDetails.description}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Absolute bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t-4 border-border p-4 shadow-lg z-40">
                <div className="w-full mx-auto">
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
                                <div className="absolute bottom-full left-0 mb-2 w-48">
                                    <ProgressBar
                                        value={partnerProgress}
                                        label={`${activeQuest.quest.partnerName}'s Progress`}
                                        variant="partner"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Combined progress bar */}
                        <div className="flex-1">
                            {hoveredAvatar === null && (
                                <ProgressBar
                                    value={combinedProgress}
                                    label={`QUEST ${combinedProgress}%`}
                                    variant="combined"
                                />
                            )}
                            {hoveredAvatar === "user" && (
                                <ProgressBar
                                    value={userProgress}
                                    label="Your Progress"
                                    variant="user"
                                />
                            )}
                            {hoveredAvatar === "partner" && (
                                <ProgressBar
                                    value={partnerProgress}
                                    label={`${activeQuest.quest.partnerName}'s Progress`}
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
                                <div className="absolute bottom-full right-0 mb-2 w-48">
                                    <ProgressBar
                                        value={userProgress}
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
                            onClick={async () => {
                                if (confirm('Are you sure you want to unmatch? This will end your quest and you will not be matched with this person again.')) {
                                    setLoading(true);
                                    try {
                                        const res = await fetch('/api/quest/cancel', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                questId: activeQuest.quest.id
                                            })
                                        });

                                        const data = await res.json();

                                        if (res.ok) {
                                            // Redirect to matches page
                                            router.push('/matches');
                                        } else {
                                            alert(`Unmatch failed: ${data.error || 'Unknown error'}`);
                                            setLoading(false);
                                        }
                                    } catch (err) {
                                        console.error('Unmatch error:', err);
                                        alert('Failed to unmatch. Please try again.');
                                        setLoading(false);
                                    }
                                }
                            }}
                            disabled={loading}
                            className="text-[10px] bg-background border-2 border-border !text-black dark:!text-white font-bold hover:bg-red-500 hover:!text-white hover:border-red-500 text-xs px-8 py-2 font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'UNMATCHING...' : 'UNMATCH'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
