import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import User from '../models/User';
import Match from '../models/Match';
import Quest from '../models/Quest';
import MatchLog from '../models/MatchLog';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('ERROR: MONGODB_URI is undefined. Check .env.local');
    process.exit(1);
}

async function resetUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri!);
        console.log('Connected.');

        console.log('Deleting all Users...');
        const userRes = await User.deleteMany({});
        console.log(`Deleted ${userRes.deletedCount} users.`);

        console.log('Deleting all Matches...');
        const matchRes = await Match.deleteMany({});
        console.log(`Deleted ${matchRes.deletedCount} matches.`);

        console.log('Deleting all Quests...');
        const questRes = await Quest.deleteMany({});
        console.log(`Deleted ${questRes.deletedCount} quests.`);

        console.log('Deleting all Match Logs...');
        const logRes = await MatchLog.deleteMany({});
        console.log(`Deleted ${logRes.deletedCount} logs.`);

        console.log('✅ Database reset complete.');
    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

resetUsers();
