import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import User from '@/models/User';
import { isQuestParticipant } from '@/lib/quest-utils';

/**
 * POST /api/quest/cancel
 * Cancels an active quest
 * Both users can then re-enter the matching pool
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        const body = await request.json();
        const { questId, userId } = body;

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

        // Update user statuses to waiting_for_match (they can re-enter matching)
        await User.findByIdAndUpdate(quest.userAId, { status: 'waiting_for_match' });
        await User.findByIdAndUpdate(quest.userBId, { status: 'waiting_for_match' });

        return NextResponse.json({
            success: true,
            message: 'Quest cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling quest:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
