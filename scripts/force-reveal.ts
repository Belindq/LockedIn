
import fs from 'fs';
import path from 'path';
import { calculateUserProgress } from '@/lib/quest-utils';

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

import mongoose from 'mongoose';
import Quest from '@/models/Quest';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { generateDateIdea } from '@/lib/gemini-quest-engine';

async function forceReveal() {
    await connectDB();
    console.log('DB Connected');

    // Find quests that are 'completed' (or active) but missing reveal
    const quests = await Quest.find({
        // Status can be active or completed, but let's check completed primarily
        // Or active quests that are actually 100% complete
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`Checking ${quests.length} quests...`);

    for (const quest of quests) {
        console.log(`Checking quest ${quest._id} (Status: ${quest.status})...`);

        if (quest.finalDateLocation && quest.finalDateLocation.placeId) {
            console.log(' - Already has reveal data. Skipping.');
            continue;
        }

        const progressA = await calculateUserProgress(quest._id, quest.userAId);
        const progressB = await calculateUserProgress(quest._id, quest.userBId);

        console.log(` - Progress: A=${progressA}%, B=${progressB}%`);

        if (progressA === 100 && progressB === 100) {
            console.log(' - Quest is 100% complete! Generating reveal...');

            // Status should be completed
            if (quest.status !== 'completed') {
                quest.status = 'completed';
            }

            // Generate dummy reveal immediately
            const userA = await User.findById(quest.userAId);
            const userB = await User.findById(quest.userBId);

            const midLat = 40.7128;
            const midLng = -74.0060;

            const dateTime = new Date();
            dateTime.setDate(dateTime.getDate() + 3);
            dateTime.setHours(19, 0, 0, 0);

            quest.finalDateLocation = {
                placeId: 'force_reveal_loc',
                lat: midLat,
                lng: midLng
            };
            quest.finalDateTime = dateTime;
            quest.finalDateTitle = "Celebration Date (Forced)";
            quest.finalDateDescription = "You've successfully locked in! Enjoy your date.";
            quest.finalDateActivity = "drinks";
            quest.finalDateAddress = "Downtown";

            await quest.save();
            console.log(' - SAVED forced reveal.');
        } else {
            console.log(' - Not 100% complete.');
        }
    }

    console.log('Done.');
    process.exit(0);
}

forceReveal().catch(err => console.error(err));
