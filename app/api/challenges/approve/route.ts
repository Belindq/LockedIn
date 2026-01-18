import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import { isQuestParticipant, getPartnerUserId, isQuestComplete } from '@/lib/quest-utils';
import mongoose from 'mongoose';

/**
 * POST /api/challenges/approve
 * Approve your partner's challenge submission
 * Only the partner can approve, not the submitter
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        const body = await request.json();
        let { challengeId, userId, approve } = body;

        const headerUserId = request.headers.get('x-user-id');
        if (headerUserId) {
            userId = headerUserId;
        }

        if (!challengeId || !userId || approve === undefined) {
            return NextResponse.json(
                { error: 'challengeId, userId, and approve (boolean) are required' },
                { status: 400 }
            );
        }

        // Find the challenge
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        // Find the quest
        const quest = await Quest.findById(challenge.questId);

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

        // Get partner ID (the one who submitted)
        const partnerId = getPartnerUserId(quest, userId);

        // Find partner's progress for this challenge
        const partnerProgress = await ChallengeProgress.findOne({
            challengeId: new mongoose.Types.ObjectId(challengeId),
            userId: partnerId
        });

        if (!partnerProgress) {
            return NextResponse.json(
                { error: 'Partner has not submitted this challenge yet' },
                { status: 400 }
            );
        }

        // Verify submission is in submitted state
        if (partnerProgress.status !== 'submitted') {
            return NextResponse.json(
                { error: `Cannot approve challenge with status: ${partnerProgress.status}` },
                { status: 400 }
            );
        }

        // Update status based on approval
        partnerProgress.status = approve ? 'approved' : 'rejected';
        await partnerProgress.save();

        // If approved, check if THIS user has also completed
        if (approve) {
            const myProgress = await ChallengeProgress.findOne({
                challengeId: new mongoose.Types.ObjectId(challengeId),
                userId: new mongoose.Types.ObjectId(userId)
            });

            // If BOTH users have approved this challenge, unlock the next one AND generate an AI insight
            if (myProgress && myProgress.status === 'approved') {
                try {
                    // Generate AI Insight
                    const { generateChallengeInsight } = await import('@/lib/gemini-quest-engine');
                    const insight = await generateChallengeInsight(
                        challenge.prompt,
                        myProgress.submissionText || (myProgress.submissionImageBase64 ? "Image submitted" : "Completed"),
                        partnerProgress.submissionText || (partnerProgress.submissionImageBase64 ? "Image submitted" : "Completed")
                    );

                    // Store insight on the challenge document
                    challenge.insights = JSON.stringify({
                        title: insight.title,
                        description: insight.insight,
                        unlockedAt: new Date()
                    });
                    await challenge.save();

                    console.log(`Generated AI insight for challenge ${challenge.orderIndex + 1}`);
                } catch (aiErr) {
                    console.error('Failed to generate AI insight:', aiErr);
                }

                // Find the next challenge
                const nextChallenge = await Challenge.findOne({
                    questId: quest._id,
                    orderIndex: challenge.orderIndex + 1
                });

                if (nextChallenge) {
                    // Unlock next challenge for both users
                    await ChallengeProgress.updateMany(
                        {
                            challengeId: nextChallenge._id,
                            questId: quest._id
                        },
                        { $set: { status: 'active' } }
                    );
                    console.log(`Unlocked challenge ${nextChallenge.orderIndex + 1} for quest ${quest._id}`);
                }
            }
        }

        // Check if quest is now complete
        const questComplete = await isQuestComplete(quest._id);

        return NextResponse.json({
            success: true,
            message: approve ? 'Challenge approved!' : 'Challenge rejected',
            newStatus: partnerProgress.status,
            questComplete
        });

    } catch (error) {
        console.error('Error approving challenge:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
