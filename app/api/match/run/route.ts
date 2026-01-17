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
                subject: '🔒 You\'ve Been Matched on LockedIn! 💘',
                html: `
                    <p>Hey there!</p>
                    <p>Well, well, well... look who just got matched! 👀</p>
                    <p>The universe (and our very sophisticated AI algorithms) have spoken, and guess what? You're now officially matched with <strong>${matchName}</strong>! 💖</p>
                    <p>And here's the thing... you can't swipe left now. 😏</p>
                    <p>The door is locked. The key has been thrown into the digital abyss. Your fate is sealed. (In the most romantic way possible, of course.)</p>
                    <p>This is your moment! Time to work hard, play harder, and see if sparks fly. 🎆</p>
                    <p>So what happens next? Head to the app to start your journey. No ghosting allowed. No backing out. Just pure, committed, slightly chaotic romance waiting to unfold.</p>
                    <p>👉 <a href="https://cant-swipe-left-now.tech">Click here to unlock your match</a></p>
                    <p>P.S. — Your match is just as stuck with you as you are with them. Isn't commitment beautiful? 💐</p>
                    <br/>
                    <p><strong>LockedIn — Where commitment meets comedy</strong></p>
                `
            });
        } catch (e) {
            console.error(`[EMAIL FAIL] Failed to send to ${to}`, e);
        }
    } else {
        console.log(`[EMAIL LOG] (Mock) Sending match email to ${to} for match with ${matchName}`);
    }
}
