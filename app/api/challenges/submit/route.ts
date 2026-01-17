import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import { isQuestParticipant, checkChallengeExpiration } from '@/lib/quest-utils';
import { detectFaceInImage } from '@/lib/gemini-quest-engine';
import mongoose from 'mongoose';

/**
 * POST /api/challenges/submit
 * Submit a challenge response (text, image, or location)
 * Includes AI face detection for image submissions
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // TODO: Get userId from session/auth
        const body = await request.json();
        const { challengeId, userId, submissionText, submissionImageBase64, submissionLocation } = body;

        if (!challengeId || !userId) {
            return NextResponse.json(
                { error: 'challengeId and userId are required' },
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

        // Find the quest and verify participant
        const quest = await Quest.findById(challenge.questId);

        if (!quest) {
            return NextResponse.json(
                { error: 'Quest not found' },
                { status: 404 }
            );
        }

        if (!isQuestParticipant(quest, userId)) {
            return NextResponse.json(
                { error: 'Unauthorized: You are not part of this quest' },
                { status: 403 }
            );
        }

        // Find or create progress record
        let progress = await ChallengeProgress.findOne({
            challengeId: new mongoose.Types.ObjectId(challengeId),
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!progress) {
            return NextResponse.json(
                { error: 'Progress record not found' },
                { status: 404 }
            );
        }

        // Check expiration
        progress = await checkChallengeExpiration(challenge._id, new mongoose.Types.ObjectId(userId));

        if (progress && progress.status === 'expired') {
            return NextResponse.json(
                { error: 'Challenge has expired' },
                { status: 410 }
            );
        }

        // Verify challenge hasn't been submitted yet
        if (progress.status !== 'pending') {
            return NextResponse.json(
                { error: 'Challenge already submitted' },
                { status: 400 }
            );
        }

        // Validate submission based on challenge type
        let faceDetectionWarning = false;
        let imageId = null;

        if (challenge.type === 'text') {
            if (!submissionText) {
                return NextResponse.json(
                    { error: 'Text submission is required for this challenge' },
                    { status: 400 }
                );
            }
            progress.submissionText = submissionText;

        } else if (challenge.type === 'image') {
            if (!submissionImageBase64) {
                return NextResponse.json(
                    { error: 'Image submission is required for this challenge' },
                    { status: 400 }
                );
            }

            // Run face detection
            const faceDetection = await detectFaceInImage(submissionImageBase64);
            faceDetectionWarning = faceDetection.warning;

            // Store image in MongoDB (simplified - in production use GridFS or cloud storage)
            // For MVP, we'll just store a reference ID
            imageId = new mongoose.Types.ObjectId();
            progress.submissionImageId = imageId;
            progress.faceDetectionWarning = faceDetectionWarning;

            // TODO: Actually store the image data
            // This would typically go to GridFS, S3, or similar

        } else if (challenge.type === 'location') {
            if (!submissionLocation || !submissionLocation.lat || !submissionLocation.lng) {
                return NextResponse.json(
                    { error: 'Location submission is required for this challenge' },
                    { status: 400 }
                );
            }
            progress.submissionText = JSON.stringify(submissionLocation);
        }

        // Update progress
        progress.status = 'submitted';
        progress.submittedAt = new Date();
        await progress.save();

        return NextResponse.json({
            success: true,
            message: 'Challenge submitted successfully',
            faceDetectionWarning: faceDetectionWarning || undefined,
            progressId: progress._id,
            status: progress.status
        });

    } catch (error) {
        console.error('Error submitting challenge:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
