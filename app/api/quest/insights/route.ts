import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';

/**
 * GET /api/quest/insights
 * Returns all unlocked AI insights for a specific quest
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
            return NextResponse.json({ insights: [] });
        }

        // Find all challenges for this quest that have insights
        const challenges = await Challenge.find({
            questId: quest._id,
            insights: { $exists: true, $ne: null }
        }).sort({ orderIndex: 1 });

        const insights = challenges.map(c => {
            try {
                const insightData = JSON.parse(c.insights!);
                return {
                    id: c._id,
                    title: insightData.title,
                    description: insightData.description,
                    category: 'compatibility', // default
                    unlockedAt: insightData.unlockedAt || c.updatedAt
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json({ insights });

    } catch (error) {
        console.error('Error fetching insights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
