
import fs from 'fs';
import path from 'path';

// Load .env.local manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim();
        }
    });
} catch (error) {
    console.error('Could not load .env.local', error);
}

// import { generateQuestChallenges } from './lib/gemini-quest-engine';

async function test() {
    console.log('Testing Gemini Generation...');
    // Dynamic import to ensure env vars are loaded first
    const { generateQuestChallenges } = await import('./lib/gemini-quest-engine');

    try {
        const challenges = await generateQuestChallenges(
            {
                interests: "hiking, photography, coffee",
                values: "adventure, honesty",
                mustHaves: "humor",
                niceToHaves: "height"
            },
            {
                interests: "gaming, coding, pizza",
                values: "loyalty, creativity",
                mustHaves: "intelligence",
                niceToHaves: "cooking"
            },
            "User A",
            "User B"
        );
        console.log('SUCCESS!');
        console.log(JSON.stringify(challenges, null, 2));
    } catch (e) {
        console.error('FAILED:', e);
    }
}

test();
