import { NextResponse } from 'next/server';
import { runMatchingAlgorithm } from '@/lib/matching';
import { Resend } from 'resend';
import User from '@/models/User';
import connectDB from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const result = await runMatchingAlgorithm();

        if (result.matches && result.matches.length > 0) {
            for (const match of result.matches) {
                await connectDB();
                const uA = await User.findById(match.userA);
                const uB = await User.findById(match.userB);

                if (uA && uB) {
                    await sendMatchEmail(uA.email, uA.firstName || 'User', uB.firstName || 'your match');
                    await sendMatchEmail(uB.email, uB.firstName || 'User', uA.firstName || 'your match');
                }
            }
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Match Run Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

async function sendMatchEmail(to: string, name: string, matchName: string) {
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('RESEND_API_KEY')) {
        try {
            await resend.emails.send({
                from: 'LockedIn <onboarding@resend.dev>',
                to: [to],
                subject: 'You have a Match!',
                html: `<p>Hi ${name},</p><p>You have been matched with <strong>${matchName}</strong>!</p><p>Go to the app to see next steps.</p>`
            });
        } catch (e) {
            console.error(`[EMAIL FAIL] Failed to send to ${to}`, e);
        }
    } else {
        console.log(`[EMAIL LOG] (Mock) Sending match email to ${to} for match with ${matchName}`);
    }
}
