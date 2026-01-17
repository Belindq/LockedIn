import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectDB();
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body', details: 'Request body is empty or malformed' }, { status: 400 });
        }

        const { email, password } = body;

        // Basic field validation
        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            passwordHash,
            status: 'onboarding',
        });

        const token = await signSession({ userId: user._id.toString(), email: user.email });

        const response = NextResponse.json({ success: true, user: { email: user.email, id: user._id } });
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
