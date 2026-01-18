import dotenv from 'dotenv';
import path from 'path';
import { sendMatchEmail } from '../lib/email';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
    console.log('Testing Email System...');
    console.log('API Key present:', !!process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
        console.error('ERROR: RESEND_API_KEY is missing.');
        return;
    }

    // You can replace this with your own email for verification
    const testEmail = 'delivered@resend.dev';
    console.log(`Sending test email to ${testEmail}...`);

    const result = await sendMatchEmail(
        testEmail,
        'Test User',
        'Your Future Match'
    );

    if (result) {
        console.log('✅ Email sent successfully!');
    } else {
        console.log('❌ Email failed to send.');
    }
}

testEmail();
