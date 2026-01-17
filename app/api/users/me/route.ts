import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await connectDB();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            interests, values, mustHaves, niceToHaves, dealBreakers
        } = body;

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.status === 'matched') {
            return NextResponse.json({ error: 'Cannot edit profile while matched' }, { status: 403 });
        }

        // Update fields (User model defines these as Strings)
        if (interests !== undefined) user.interests = interests;
        if (values !== undefined) user.values = values;
        if (mustHaves !== undefined) user.mustHaves = mustHaves;
        if (niceToHaves !== undefined) user.niceToHaves = niceToHaves;
        if (dealBreakers !== undefined) user.dealBreakers = dealBreakers;

        await user.save();

        return NextResponse.json(user);

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
