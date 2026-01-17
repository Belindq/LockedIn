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

        await User.findByIdAndUpdate(userId, { status: 'waiting_for_match' });

        return NextResponse.json({ success: true, status: 'waiting_for_match' });
    } catch (error) {
        console.error('Join Pool Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
