import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import Match from '@/models/Match';
import User from '@/models/User';
import { generateQuestChallenges } from '@/lib/gemini-quest-engine';
import mongoose from 'mongoose';

/**
 * POST /api/quest/create
 * Creates a new quest with AI-generated challenges
 * Requires: matchId in request body
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        // For now, expect it in the request body
        const body = await request.json();
        const { matchId, userId } = body;

        if (!matchId || !userId) {
            return NextResponse.json(
                { error: 'matchId and userId are required' },
                { status: 400 }
            );
        }

        // Validate match exists
        const match = await Match.findById(matchId);
        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        // Verify user is part of this match
        const userIdStr = userId.toString();
        if (match.userA.toString() !== userIdStr && match.userB.toString() !== userIdStr) {
            return NextResponse.json(
                { error: 'Unauthorized: You are not part of this match' },
                { status: 403 }
            );
        }

        // Check if quest already exists and is active
        const existingQuest = await Quest.findOne({ 
            matchId,
            status: { $in: ['active', 'pending_acceptance'] }
        });
        if (existingQuest) {
            return NextResponse.json(
                { error: 'Active quest already exists for this match' },
                { status: 400 }
            );
        }

        // Get both user profiles for personalized quest generation
        const userA = await User.findById(match.userA);
        const userB = await User.findById(match.userB);

        if (!userA || !userB) {
            return NextResponse.json(
                { error: 'User profiles not found' },
                { status: 404 }
            );
        }

        // Generate challenges using Gemini AI
        const generatedChallenges = await generateQuestChallenges(
            {
                interests: userA.interests,
                values: userA.values,
                mustHaves: userA.mustHaves,
                niceToHaves: userA.niceToHaves
            },
            {
                interests: userB.interests,
                values: userB.values,
                mustHaves: userB.mustHaves,
                niceToHaves: userB.niceToHaves
            }
        );

        // Create quest (expires in 7 days for hackathon)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const quest = await Quest.create({
            matchId: new mongoose.Types.ObjectId(matchId),
            userAId: match.userA,
            userBId: match.userB,
            status: 'active',
            expiresAt
        });

        // Create challenges and progress records
        for (let i = 0; i < generatedChallenges.length; i++) {
            const challengeData = generatedChallenges[i];

            const challenge = await Challenge.create({
                questId: quest._id,
                orderIndex: i,
                type: challengeData.type,
                prompt: challengeData.prompt,
                timeLimitSeconds: challengeData.timeLimitSeconds
            });

            // Create progress records for both users
            await ChallengeProgress.create({
                challengeId: challenge._id,
                userId: match.userA,
                status: 'pending'
            });

            await ChallengeProgress.create({
                challengeId: challenge._id,
                userId: match.userB,
                status: 'pending'
            });
        }

        // Update user statuses
        await User.findByIdAndUpdate(match.userA, { status: 'matched' });
        await User.findByIdAndUpdate(match.userB, { status: 'matched' });

        return NextResponse.json({
            success: true,
            questId: quest._id,
            expiresAt: quest.expiresAt,
            challengeCount: generatedChallenges.length
        });

    } catch (error) {
        console.error('Error creating quest:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
