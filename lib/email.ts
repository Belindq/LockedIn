import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMatchEmail(toEmail: string, userName: string, partnerName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'LockedIn <onboarding@resend.dev>', // Default testing domain
            to: [toEmail],
            subject: `🔒 You've Been Matched on LockedIn! �`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #000; text-align: center;">Hey there!</h1>
          <p>Well, well, well... look who just got matched! 👀</p>
          <p>The universe (and our very sophisticated AI algorithms) have spoken, and guess what? You're now officially matched with <strong>${partnerName}</strong>! 💖</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #000;">
            <p style="margin: 0; font-weight: bold;">And here's the thing... you can't swipe left now. 😏</p>
          </div>

          <p>The door is locked. The key has been thrown into the digital abyss. Your fate is sealed. (In the most romantic way possible, of course.)</p>
          
          <p>This is your moment! Time to work hard, play harder, and see if sparks fly. 🎆</p>
          
          <p>So what happens next? Head to the app to start your journey. No ghosting allowed. No backing out. Just pure, committed, slightly chaotic romance waiting to unfold.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://cant-swipe-left-now.tech" 
               style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              👉 Click here to unlock your match
            </a>
          </div>
        </div>
      `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return false;
        }

        console.log(`Email sent to ${toEmail}`);
        return true;
    } catch (e) {
        console.error('Failed to send email:', e);
        return false;
    }
}
