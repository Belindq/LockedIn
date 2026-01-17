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

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const match = await Match.findOne({
            $or: [{ userA: userId }, { userB: userId }],
            status: 'active'
        });

        const response: any = {
            userStatus: user.status,
            userId: user._id,
            hasMatch: !!match
        };

        if (match) {
            const partnerId = match.userA.toString() === userId ? match.userB : match.userA;
            const partner = await User.findById(partnerId).select('firstName');
            response.matchId = match._id;
            response.partnerName = partner?.firstName || 'Partner';
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Check Match Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
