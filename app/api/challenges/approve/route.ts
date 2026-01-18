import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import User from '@/models/User';
import { getPartnerUserId, isQuestParticipant, isQuestComplete } from '@/lib/quest-utils';
import { generateChallengeInsight } from '@/lib/gemini-quest-engine';
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
                    // Fetch names for AI personalization
                    const userA = await User.findById(quest.userAId).select('firstName');
                    const userB = await User.findById(quest.userBId).select('firstName');

                    const insight = await generateChallengeInsight(
                        challenge.prompt,
                        myProgress.submissionText || (myProgress.submissionImageBase64 ? "Image submitted" : "Completed"),
                        partnerProgress.submissionText || (partnerProgress.submissionImageBase64 ? "Image submitted" : "Completed"),
                        userA?.firstName || "Partner A",
                        userB?.firstName || "Partner B"
                    );

                    // Store insight on the challenge document
                    challenge.insights = JSON.stringify({
                        title: insight.title,
                        description: insight.insight,
                        confidenceScore: insight.confidenceScore,
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

        // If complete, pre-generate the reveal (date idea) so it's ready when they click Reveal
        if (questComplete && !quest.finalDateLocation) {
            console.log('Quest complete! Pre-generating reveal...');

            try {
                // Get users
                const userA = await User.findById(quest.userAId);
                const userB = await User.findById(quest.userBId);

                if (userA && userB) {
                    // Fetch responses
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

                    // Context
                    const cityContext = `${userA.homeAddress || 'Unknown City'} (Coordinates: ${userA.locationCoordinates?.lat?.toFixed(4) || 0}, ${userA.locationCoordinates?.lng?.toFixed(4) || 0})`;

                    // Generate
                    // Generate
                    const { generateDateIdea } = await import('@/lib/gemini-quest-engine');
                    const dateIdea = await generateDateIdea(
                        userA as any,
                        userB as any,
                        userAResponses,
                        userBResponses,
                        cityContext,
                        userA.firstName || "Partner A",
                        userB.firstName || "Partner B"
                    );

                    // Midpoint
                    const latA = userA.locationCoordinates?.lat || 40.7128; // Default NYC
                    const lngA = userA.locationCoordinates?.lng || -74.0060;
                    const latB = userB.locationCoordinates?.lat || 40.7128;
                    const lngB = userB.locationCoordinates?.lng || -74.0060;

                    const midLat = (latA + latB) / 2;
                    const midLng = (lngA + lngB) / 2;

                    // Date
                    const dateTime = new Date();
                    dateTime.setDate(dateTime.getDate() + 3);
                    dateTime.setHours(19, 0, 0, 0);

                    // Save
                    quest.finalDateLocation = {
                        placeId: 'generated_ai_loc',
                        lat: midLat,
                        lng: midLng
                    };
                    quest.finalDateTime = dateTime;
                    quest.finalDateTitle = dateIdea.title;
                    quest.finalDateDescription = dateIdea.description;
                    quest.finalDateActivity = dateIdea.activityType;
                    quest.finalDateAddress = dateIdea.address;

                    await quest.save();
                    console.log('Reveal generated successfully');
                }
            } catch (genError) {
                console.error('Error pre-generating reveal:', genError);
                // Continue, reveal endpoint will retry if missing
            }
        }

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
