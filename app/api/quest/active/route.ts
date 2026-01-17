import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

        const userId = request.headers.get('x-user-id');
        // fallback for testing if needed, or remove
        // const { searchParams } = new URL(request.url);
        // const userId = headersId || searchParams.get('userId');

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Valid userId is required (auth)' }, { status: 401 });
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find current quest for this user (active, completed, or expired)
        const quest = await Quest.findOne({
            $or: [{ userAId: userObjectId }, { userBId: userObjectId }]
        }).sort({ createdAt: -1 });

        if (!quest) {
            return NextResponse.json({ error: 'No active quest found' }, { status: 404 });
        }

        // Check and update expiration status
        await checkAndUpdateQuestExpiration(quest._id);
        const updatedQuest = await Quest.findById(quest._id);

        // Use updated quest if available
        const currentQuest = updatedQuest || quest;

        // Get all challenges
        const challenges = await Challenge.find({ questId: currentQuest._id }).sort({ orderIndex: 1 });

        // Get all progress
        const allProgress = await ChallengeProgress.find({
            challengeId: { $in: challenges.map(c => c._id) },
            userId: { $in: [currentQuest.userAId, currentQuest.userBId] }
        });

        const partnerId = currentQuest.userAId.toString() === userId ? currentQuest.userBId : currentQuest.userAId;

        // Map challenges with status
        const challengesWithStatus = challenges.map(challenge => {
            const myProg = allProgress.find(p =>
                p.challengeId.toString() === challenge._id.toString() &&
                p.userId.toString() === userId
            );
            const partnerProg = allProgress.find(p =>
                p.challengeId.toString() === challenge._id.toString() &&
                p.userId.toString() === partnerId.toString()
            );

            return {
                id: challenge._id,
                orderIndex: challenge.orderIndex,
                prompt: challenge.prompt,
                type: challenge.type,
                timeLimitSeconds: challenge.timeLimitSeconds,
                myStatus: {
                    status: (myProg?.status === 'pending') ? 'active' : (myProg?.status || 'locked'), // Frontend expects 'active' for current
                    submittedAt: myProg?.submittedAt,
                    submissionText: myProg?.submissionText,
                    submissionImageBase64: myProg?.submissionImageBase64,
                    faceDetectionWarning: myProg?.faceDetectionWarning,
                    progressId: myProg?._id
                },
                partnerStatus: {
                    status: partnerProg?.status || 'locked',
                    submittedAt: partnerProg?.submittedAt,
                    submissionText: partnerProg?.submissionText,
                    submissionImageBase64: partnerProg?.submissionImageBase64,
                    progressId: partnerProg?._id
                }
            };
        });

        // Determine "Current Challenge" logic (First non-completed/approved)
        const myCurrentIndex = challengesWithStatus.findIndex(c =>
            c.myStatus.status !== 'approved' && c.myStatus.status !== 'completed'
        );
        const partnerCurrentIndex = challengesWithStatus.findIndex(c =>
            c.partnerStatus.status !== 'approved' && c.partnerStatus.status !== 'completed'
        );

        // Adjust 'locked' statuses to 'active' for the current index
        if (myCurrentIndex !== -1 && challengesWithStatus[myCurrentIndex].myStatus.status === 'locked') {
            challengesWithStatus[myCurrentIndex].myStatus.status = 'active';
        }
        // Logic: All subsequent are locked.

        // Global stats
        const userAProgress = await calculateUserProgress(currentQuest._id, currentQuest.userAId);
        const userBProgress = await calculateUserProgress(currentQuest._id, currentQuest.userBId);

        const partner = await mongoose.model('User').findById(partnerId).select('firstName');

        return NextResponse.json({
            quest: {
                id: currentQuest._id,
                status: currentQuest.status,
                createdAt: currentQuest.createdAt,
                expiresAt: currentQuest.expiresAt,
                userAProgress,
                userBProgress,
                partnerId: partnerId,
                partnerName: (partner as any)?.firstName || 'Partner'
            },
            challenges: challengesWithStatus,
            currentChallengeIndex: myCurrentIndex === -1 ? challenges.length : myCurrentIndex,
            partnerCurrentChallengeIndex: partnerCurrentIndex === -1 ? challenges.length : partnerCurrentIndex,
            totalChallenges: challenges.length
        });

    } catch (error) {
        console.error('Error fetching active quest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
