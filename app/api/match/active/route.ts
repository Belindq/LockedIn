import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await connectDB();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const match = await Match.findOne({
            $or: [{ userA: userId }, { userB: userId }],
            status: 'active'
        });

        if (!match) {
            return NextResponse.json({ hasMatch: false });
        }

        const partnerId = match.userA.toString() === userId ? match.userB : match.userA;
        const partner = await User.findById(partnerId).select('firstName');

        return NextResponse.json({
            hasMatch: true,
            matchId: match._id,
            partnerName: partner?.firstName || 'Partner'
        });

    } catch (error) {
        console.error('Check Match Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
