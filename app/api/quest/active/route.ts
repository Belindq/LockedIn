import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import { checkAndUpdateQuestExpiration, calculateUserProgress, getCurrentChallenge } from '@/lib/quest-utils';

/**
 * GET /api/quest/active
 * Retrieves the active quest for the current user
 * Includes expiration checking and current progress
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        // For now, expect it in query params
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Find active quest for this user
        const quest = await Quest.findOne({
            $or: [
                { userAId: userId },
                { userBId: userId }
            ],
            status: { $in: ['pending_acceptance', 'active'] }
        });

        if (!quest) {
            return NextResponse.json(
                { error: 'No active quest found' },
                { status: 404 }
            );
        }

        // Check and update expiration status
        const updatedQuest = await checkAndUpdateQuestExpiration(quest._id);

        if (!updatedQuest || updatedQuest.status === 'expired') {
            return NextResponse.json(
                { error: 'Quest has expired' },
                { status: 410 }
            );
        }

        // Get all challenges for this quest
        const challenges = await Challenge.find({ questId: quest._id }).sort({ orderIndex: 1 });

        // Get progress for both users
        const userAProgress = await calculateUserProgress(quest._id, quest.userAId);
        const userBProgress = await calculateUserProgress(quest._id, quest.userBId);

        // Get current challenge for requesting user
        const currentChallengeData = await getCurrentChallenge(quest._id, userId);

        // Get partner's current challenge
        const partnerId = quest.userAId.toString() === userId ? quest.userBId : quest.userAId;
        const partnerCurrentChallenge = await getCurrentChallenge(quest._id, partnerId);

        return NextResponse.json({
            quest: {
                id: quest._id,
                status: quest.status,
                createdAt: quest.createdAt,
                expiresAt: quest.expiresAt,
                userAProgress,
                userBProgress
            },
            currentChallenge: currentChallengeData ? {
                challenge: {
                    id: currentChallengeData.challenge._id,
                    orderIndex: currentChallengeData.challenge.orderIndex,
                    type: currentChallengeData.challenge.type,
                    prompt: currentChallengeData.challenge.prompt,
                    timeLimitSeconds: currentChallengeData.challenge.timeLimitSeconds
                },
                progress: currentChallengeData.progress ? {
                    status: currentChallengeData.progress.status,
                    submittedAt: currentChallengeData.progress.submittedAt,
                    faceDetectionWarning: currentChallengeData.progress.faceDetectionWarning
                } : null
            } : null,
            partnerStatus: {
                currentChallengeIndex: partnerCurrentChallenge?.challenge.orderIndex ?? 5,
                isAhead: (partnerCurrentChallenge?.challenge.orderIndex ?? 5) > (currentChallengeData?.challenge.orderIndex ?? 5)
            },
            totalChallenges: challenges.length
        });

    } catch (error) {
        console.error('Error fetching active quest:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
