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
        const { challengeId, userId, approve } = body;

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
