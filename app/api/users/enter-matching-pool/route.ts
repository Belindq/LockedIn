import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await connectDB();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.status === 'matched') {
            return NextResponse.json({ error: 'Already matched' }, { status: 400 });
        }

        // Basic validation
        if (!user.interests || !user.homeAddress) {
            return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 });
        }

        user.status = 'waiting_for_match';
        await user.save();

        return NextResponse.json({ success: true, status: user.status });

    } catch (error) {
        console.error('Enter pool error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
