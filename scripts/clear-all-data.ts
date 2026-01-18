
import dotenv from 'dotenv';
import connectDB from '../lib/db';
import User from '../models/User';
import Match from '../models/Match';
import ChallengeProgress from '../models/ChallengeProgress';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearAllData() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Connected to database.');

        console.log('Clearing Users...');
        const userResult = await User.deleteMany({});
        console.log(`Deleted ${userResult.deletedCount} users.`);

        console.log('Clearing Matches...');
        const matchResult = await Match.deleteMany({});
        console.log(`Deleted ${matchResult.deletedCount} matches.`);

        console.log('Clearing ChallengeProgress...');
        const challengeResult = await ChallengeProgress.deleteMany({});
        console.log(`Deleted ${challengeResult.deletedCount} challenge progress records.`);

        console.log('All user data cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
}

clearAllData();
