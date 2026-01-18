import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import User from '@/models/User';
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
        console.log('[DEBUG] GET /api/quest/active - DB Connected');

        const userId = request.headers.get('x-user-id');
        // fallback for testing if needed, or remove
        // const { searchParams } = new URL(request.url);
        // const userId = headersId || searchParams.get('userId');

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Valid userId is required (auth)' }, { status: 401 });
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find current quest for this user (active, completed, or expired - but NOT cancelled)
        const quest = await Quest.findOne({
            $or: [{ userAId: userObjectId }, { userBId: userObjectId }],
            status: { $ne: 'cancelled' } // Exclude cancelled quests
        }).sort({ createdAt: -1 });

        if (!quest) {
            console.log('[DEBUG] GET /api/quest/active - No quest found for user:', userId);
            return NextResponse.json({ error: 'No active quest found' }, { status: 404 });
        }
        console.log('[DEBUG] GET /api/quest/active - Quest found:', quest._id);

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
        })
            .select('-submissionImageBase64'); // Exclude heavy images for list view efficiency

        const partnerIdStr = (currentQuest.userAId.toString() === userId)
            ? currentQuest.userBId.toString()
            : currentQuest.userAId.toString();

        // Map challenges with status
        const challengesWithStatus = challenges.map(challenge => {
            const challengeIdStr = challenge._id.toString();
            const myProg = allProgress.find(p =>
                p.challengeId.toString() === challengeIdStr &&
                p.userId.toString() === userId
            );
            const partnerProg = allProgress.find(p =>
                p.challengeId.toString() === challengeIdStr &&
                p.userId.toString() === partnerIdStr
            );

            return {
                id: challenge._id,
                orderIndex: challenge.orderIndex,
                prompt: challenge.prompt,
                type: challenge.type,
                timeLimitSeconds: challenge.timeLimitSeconds,
                insights: challenge.insights ? JSON.parse(challenge.insights) : null,
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

        // Determine "Current Challenge" logic (First non-approved)
        const myCurrentIndex = challengesWithStatus.findIndex(c =>
            c.myStatus.status !== 'approved'
        );
        const partnerCurrentIndex = challengesWithStatus.findIndex(c =>
            c.partnerStatus.status !== 'approved'
        );

        // Adjust 'locked' statuses to 'active' for the current index
        if (myCurrentIndex !== -1 && challengesWithStatus[myCurrentIndex].myStatus.status === 'locked') {
            challengesWithStatus[myCurrentIndex].myStatus.status = 'active';
        }
        // Logic: All subsequent are locked.

        // Global stats (calculated in-memory to save DB calls)
        const challengesCount = challenges.length;

        let userAApproved = 0;
        let userBApproved = 0;

        if (challengesCount > 0) {
            // Count approved for User A
            userAApproved = allProgress.filter(p =>
                p.userId.toString() === currentQuest.userAId.toString() &&
                p.status === 'approved'
            ).length;

            // Count approved for User B
            userBApproved = allProgress.filter(p =>
                p.userId.toString() === currentQuest.userBId.toString() &&
                p.status === 'approved'
            ).length;
        }

        const userAProgress = challengesCount > 0 ? Math.round((userAApproved / challengesCount) * 100) : 0;
        const userBProgress = challengesCount > 0 ? Math.round((userBApproved / challengesCount) * 100) : 0;

        // Fetch partner user details
        const partnerUser = await User.findById(partnerIdStr).select('firstName');

        return NextResponse.json({
            quest: {
                id: currentQuest._id,
                status: currentQuest.status,
                createdAt: currentQuest.createdAt,
                expiresAt: currentQuest.expiresAt,
                userAProgress,
                userBProgress,
                partnerId: partnerIdStr,
                partnerName: partnerUser?.firstName || 'Partner',
                // Include reveal data if completed
                finalDateTitle: currentQuest.finalDateTitle,
                finalDateDescription: currentQuest.finalDateDescription,
                finalDateActivity: currentQuest.finalDateActivity,
                finalDateAddress: currentQuest.finalDateAddress,
                finalDateTime: currentQuest.finalDateTime,
                finalDateLocation: currentQuest.finalDateLocation
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
