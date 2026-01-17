import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import User from '@/models/User';
import { isQuestParticipant, isQuestComplete } from '@/lib/quest-utils';

/**
 * GET /api/quest/reveal
 * Returns final date location and time when quest is 100% complete
 * This is the big reveal moment!
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

        // Check if quest is complete
        const complete = await isQuestComplete(quest._id);

        if (!complete) {
            return NextResponse.json(
                { error: 'Quest is not yet complete. Both users must finish all challenges.' },
                { status: 400 }
            );
        }

        // Update quest status to completed if not already
        if (quest.status !== 'completed') {
            quest.status = 'completed';
            await quest.save();

            // Update user statuses to waiting_for_match (they can re-enter matching)
            await User.findByIdAndUpdate(quest.userAId, { status: 'waiting_for_match' });
            await User.findByIdAndUpdate(quest.userBId, { status: 'waiting_for_match' });
        }

        // Get user's home location for personalized directions
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return reveal data
        // Note: finalDateLocation and finalDateTime should be set during quest creation
        // For MVP, we'll generate a simple midpoint location
        if (!quest.finalDateLocation || !quest.finalDateTime) {
            // Get both users for midpoint calculation
            const userA = await User.findById(quest.userAId);
            const userB = await User.findById(quest.userBId);

            if (!userA || !userB) {
                return NextResponse.json(
                    { error: 'User data not found' },
                    { status: 404 }
                );
            }

            // Calculate midpoint between users
            const midLat = (userA.locationCoordinates.lat + userB.locationCoordinates.lat) / 2;
            const midLng = (userA.locationCoordinates.lng + userB.locationCoordinates.lng) / 2;

            // Set date to 3 days from now at 7 PM
            const dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 3);
            dateTime.setHours(19, 0, 0, 0);

            quest.finalDateLocation = {
                placeId: 'generated_midpoint',
                lat: midLat,
                lng: midLng
            };
            quest.finalDateTime = dateTime;
            await quest.save();
        }

        return NextResponse.json({
            success: true,
            reveal: {
                location: {
                    placeId: quest.finalDateLocation.placeId,
                    coordinates: {
                        lat: quest.finalDateLocation.lat,
                        lng: quest.finalDateLocation.lng
                    }
                },
                dateTime: quest.finalDateTime,
                userLocation: {
                    lat: user.locationCoordinates.lat,
                    lng: user.locationCoordinates.lng
                }
            },
            message: 'Congratulations! You\'re LockedIn! 🔒'
        });

    } catch (error) {
        console.error('Error revealing quest:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
