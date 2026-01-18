import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import ChallengeProgress from '@/models/ChallengeProgress';
import Quest from '@/models/Quest';
import { isQuestParticipant } from '@/lib/quest-utils';

/**
 * GET /api/challenges/image/[id]
 * Serves the submission image for a specific challenge progress ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Find the progress record
        // We DO select the image here because that's the whole point
        const progress = await ChallengeProgress.findById(id);

        if (!progress || !progress.submissionImageBase64) {
            return new NextResponse('Image not found', { status: 404 });
        }

        // Security check: Ensure the requester is part of the quest
        // We need to find the quest associated with this challenge
        // But ChallengeProgress only has questId if we added it (User's schema might vary)
        // Let's rely on looking up the quest by the challenge's questId if stored, 
        // or easier: fetch the Quest that this progress belongs to.
        // ChallengeProgress schema has `questId`.

        const quest = await Quest.findById(progress.questId);

        if (!quest) {
            return new NextResponse('Quest not found', { status: 404 });
        }

        if (!isQuestParticipant(quest, userId)) {
            return new NextResponse('Unauthorized access to this image', { status: 403 });
        }

        // Decode Base64 and return as image
        // Base64 format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        const matches = progress.submissionImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return new NextResponse('Invalid image data', { status: 500 });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': type,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache aggressively since specific submission IDs don't change
            },
        });

    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
