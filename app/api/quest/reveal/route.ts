import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import User from '@/models/User';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
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

            // Update user statuses to idle (they can re-enter matching)
            await User.findByIdAndUpdate(quest.userAId, { status: 'idle' });
            await User.findByIdAndUpdate(quest.userBId, { status: 'idle' });
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
            // Get both users
            const userA = await User.findById(quest.userAId);
            const userB = await User.findById(quest.userBId);

            if (!userA || !userB) {
                return NextResponse.json(
                    { error: 'User data not found' },
                    { status: 404 }
                );
            }

            // Fetch all responses to feed into AI
            const challenges = await Challenge.find({ questId: quest._id }).sort({ orderIndex: 1 });
            const challengeIds = challenges.map(c => c._id);
            const progress = await ChallengeProgress.find({
                questId: quest._id,
                challengeId: { $in: challengeIds }
            });

            const userAResponses = progress
                .filter(p => p.userId.toString() === userA._id.toString() && p.submissionText)
                .map(p => p.submissionText!);

            const userBResponses = progress
                .filter(p => p.userId.toString() === userB._id.toString() && p.submissionText)
                .map(p => p.submissionText!);

            // Generate Date Idea via AI
            // Use User A's location as context (or midpoint if we want to be fancy, but text context is easier)
            // Ideally reverse geocode, but for now just say "near [Lat, Lng]"
            const cityContext = `coordinates ${userA.locationCoordinates.lat.toFixed(2)}, ${userA.locationCoordinates.lng.toFixed(2)}`;

            // Dynamic import to avoid circular dep issues if any
            const { generateDateIdea } = await import('@/lib/gemini-quest-engine');
            const dateIdea = await generateDateIdea(userA, userB, userAResponses, userBResponses, cityContext);

            // Calculate exact midpoint for the "Pin" (even if the text says something else, map needs a point)
            const midLat = (userA.locationCoordinates.lat + userB.locationCoordinates.lat) / 2;
            const midLng = (userA.locationCoordinates.lng + userB.locationCoordinates.lng) / 2;

            // Set date to 3 days from now
            const dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 3);
            dateTime.setHours(19, 0, 0, 0);

            quest.finalDateLocation = {
                placeId: 'generated_ai_loc',
                lat: midLat,
                lng: midLng
            };
            quest.finalDateTime = dateTime;

            // Save AI details
            quest.finalDateTitle = dateIdea.title;
            quest.finalDateDescription = dateIdea.description;
            quest.finalDateActivity = dateIdea.activityType;

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
                },
                dateDetails: {
                    title: quest.finalDateTitle,
                    description: quest.finalDateDescription,
                    activity: quest.finalDateActivity,
                    address: quest.finalDateAddress
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
