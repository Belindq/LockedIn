import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await connectDB();
        // Fetch all users, selecting only key fields to protect privacy
        const users = await User.find({}).select('email firstName lastName status avatar createdAt');

        return NextResponse.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
