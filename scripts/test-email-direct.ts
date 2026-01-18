import dotenv from 'dotenv';
import path from 'path';
import { Resend } from 'resend';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmailDirect() {
    console.log('Testing Email System (Direct)...');

    const key = process.env.RESEND_API_KEY;
    console.log('API Key present:', !!key);

    if (!key) {
        console.error('ERROR: RESEND_API_KEY is missing.');
        return;
    }

    const resend = new Resend(key);
    // Use the testing email provided by Resend docs usually, or the one user likely has access to.
    // 'delivered@resend.dev' allows sending without domain verification in test mode.
    const testEmail = 'delivered@resend.dev';

    console.log(`Sending to ${testEmail}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: testEmail,
            subject: 'Direct Test from LockedIn',
            html: '<p>If you see this, the key works!</p>'
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testEmailDirect();
