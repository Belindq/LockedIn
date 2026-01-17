import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import { isQuestParticipant, getPartnerUserId } from '@/lib/quest-utils';
import mongoose from 'mongoose';

/**
 * GET /api/challenges/progress
 * Get side-by-side progress view for both users
 * Shows what each person has completed and what they're working on
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        const { searchParams } = new URL(request.url);
        const questId = searchParams.get('questId');
        const userId = searchParams.get('userId');

        if (!questId || !userId) {
            return NextResponse.json(
                { error: 'questId and userId are required' },
                { status: 400 }
            );
        }

        // Find the quest
        const quest = await Quest.findById(questId);

        if (!quest) {
            return NextResponse.json(
                { error: 'Quest not found' },
                { status: 404 }
            );
        }

        // Verify user is a participant
        if (!isQuestParticipant(quest, userId)) {
            return NextResponse.json(
                { error: 'Unauthorized: You are not part of this quest' },
                { status: 403 }
            );
        }

        // Get partner ID
        const partnerId = getPartnerUserId(quest, userId);

        // Get all challenges for this quest
        const challenges = await Challenge.find({ questId: new mongoose.Types.ObjectId(questId) })
            .sort({ orderIndex: 1 });

        // Get progress for both users
        const userProgress = await ChallengeProgress.find({
            challengeId: { $in: challenges.map(c => c._id) },
            userId: new mongoose.Types.ObjectId(userId)
        });

        const partnerProgress = await ChallengeProgress.find({
            challengeId: { $in: challenges.map(c => c._id) },
            userId: partnerId
        });

        // Build progress map
        const userProgressMap = new Map(
            userProgress.map(p => [p.challengeId.toString(), p])
        );

        const partnerProgressMap = new Map(
            partnerProgress.map(p => [p.challengeId.toString(), p])
        );

        // Build response with side-by-side view
        const progressView = challenges.map(challenge => {
            const userProg = userProgressMap.get(challenge._id.toString());
            const partnerProg = partnerProgressMap.get(challenge._id.toString());

            return {
                challenge: {
                    id: challenge._id,
                    orderIndex: challenge.orderIndex,
                    type: challenge.type,
                    prompt: challenge.prompt,
                    timeLimitSeconds: challenge.timeLimitSeconds
                },
                yourProgress: {
                    status: userProg?.status || 'pending',
                    submittedAt: userProg?.submittedAt,
                    // Only show submission if approved or if it's your own
                    submissionText: userProg?.submissionText,
                    hasImage: !!userProg?.submissionImageId,
                    faceDetectionWarning: userProg?.faceDetectionWarning
                },
                partnerProgress: {
                    status: partnerProg?.status || 'pending',
                    submittedAt: partnerProg?.submittedAt,
                    // Only show approved submissions to maintain mystery
                    submissionText: partnerProg?.status === 'approved' ? partnerProg.submissionText : undefined,
                    hasImage: partnerProg?.status === 'approved' ? !!partnerProg.submissionImageId : undefined,
                    // Show if partner submitted and needs your approval
                    needsYourApproval: partnerProg?.status === 'submitted'
                }
            };
        });

        // Calculate completion percentages
        const userApproved = userProgress.filter(p => p.status === 'approved').length;
        const partnerApproved = partnerProgress.filter(p => p.status === 'approved').length;

        const totalChallenges = challenges.length;

        return NextResponse.json({
            questId: quest._id,
            totalChallenges,
            yourProgress: {
                approved: userApproved,
                percentage: Math.round((userApproved / totalChallenges) * 100)
            },
            partnerProgress: {
                approved: partnerApproved,
                percentage: Math.round((partnerApproved / totalChallenges) * 100)
            },
            challenges: progressView
        });

    } catch (error) {
        console.error('Error fetching challenge progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
