import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import { isQuestParticipant, getPartnerUserId } from '@/lib/quest-utils';

// Predefined nudge messages (no chat allowed!)
const NUDGE_MESSAGES = [
    '👋 Hey! Just checking in...',
    '⏰ Time is ticking!',
    '🚀 Let\'s keep the momentum going!',
    '💪 You got this!',
    '🎯 Almost there!',
    '✨ Waiting for you!',
    '🔥 Keep it up!',
    '👀 Your turn!',
];

/**
 * POST /api/quest/nudge
 * Send a predefined status message to your partner
 * No actual chat - just friendly nudges
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        const body = await request.json();
        const { questId, userId, challengeId } = body;

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

        // Verify quest is active
        if (quest.status !== 'active') {
            return NextResponse.json(
                { error: 'Quest is not active' },
                { status: 400 }
            );
        }

        // Verify challenge exists if provided
        if (challengeId) {
            const challenge = await Challenge.findById(challengeId);
            if (!challenge || challenge.questId.toString() !== questId) {
                return NextResponse.json(
                    { error: 'Invalid challenge' },
                    { status: 400 }
                );
            }
        }

        // Get partner ID
        const partnerId = getPartnerUserId(quest, userId);

        // Select a random nudge message
        const nudgeMessage = NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];

        // In a real implementation, you would:
        // 1. Store this nudge in a Nudge collection
        // 2. Send a push notification to the partner
        // 3. Show it in the partner's UI

        // For MVP, we'll just return success
        // The frontend can poll for nudges or use websockets

        return NextResponse.json({
            success: true,
            message: 'Nudge sent!',
            nudge: {
                from: userId,
                to: partnerId,
                message: nudgeMessage,
                challengeId: challengeId || null,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error sending nudge:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
