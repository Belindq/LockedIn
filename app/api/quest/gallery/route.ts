import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import ChallengeProgress from '@/models/ChallengeProgress';

/**
 * GET /api/quest/gallery
 * Returns all approved photos for a specific quest
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        const quest = await Quest.findOne({
            $or: [{ userAId: new mongoose.Types.ObjectId(userId) }, { userBId: new mongoose.Types.ObjectId(userId) }],
            status: { $ne: 'cancelled' }
        }).sort({ createdAt: -1 });

        if (!quest) {
            return NextResponse.json({ items: [] });
        }

        // Find all approved progress with images
        // Optimization: Exclude heavy image data
        const approvedImages = await ChallengeProgress.find({
            questId: quest._id,
            status: 'approved',
            submissionImageBase64: { $exists: true, $ne: '' }
        }).sort({ submittedAt: 1 }).select('-submissionImageBase64');

        const items = approvedImages.map(p => ({
            id: p._id,
            // imageUrl: p.submissionImageBase64, // Removed for performance
            caption: p.submissionText || "Shared photo",
            author: p.userId.toString() === userId ? "user" : "partner",
            timestamp: p.submittedAt
        }));

        return NextResponse.json({ items });

    } catch (error) {
        console.error('Error fetching gallery:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
