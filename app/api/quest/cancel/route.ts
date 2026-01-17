import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import User from '@/models/User';
import Match from '@/models/Match';
import { isQuestParticipant } from '@/lib/quest-utils';

/**
 * POST /api/quest/cancel
 * Cancels an active quest and marks the match as permanently blocked
 * Users can re-enter the matching pool but won't be matched together again
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Get userId from auth headers
        const userId = request.headers.get('x-user-id');
        const body = await request.json();
        const { questId } = body;

        if (!questId) {
            return NextResponse.json(
                { error: 'questId is required' },
                { status: 400 }
            );
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: 'Valid userId is required (auth)' },
                { status: 401 }
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

        // Check if quest can be cancelled
        if (quest.status === 'completed') {
            return NextResponse.json(
                { error: 'Cannot cancel a completed quest' },
                { status: 400 }
            );
        }

        if (quest.status === 'cancelled' || quest.status === 'expired') {
            return NextResponse.json(
                { error: 'Quest is already cancelled or expired' },
                { status: 400 }
            );
        }

        // Update quest status
        quest.status = 'cancelled';
        await quest.save();

        // Mark the match as permanently blocked to prevent re-matching
        if (quest.matchId) {
            await Match.findByIdAndUpdate(quest.matchId, {
                status: 'expired',
                permanentlyBlocked: true
            });
        }

        // Update user statuses to waiting_for_match (they can re-enter matching)
        await User.findByIdAndUpdate(quest.userAId, { status: 'waiting_for_match' });
        await User.findByIdAndUpdate(quest.userBId, { status: 'waiting_for_match' });

        return NextResponse.json({
            success: true,
            message: 'Quest cancelled successfully',
            questId: quest._id
        });

    } catch (error) {
        console.error('Error cancelling quest:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
