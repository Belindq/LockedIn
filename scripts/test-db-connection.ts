import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('URI found:', uri ? `${uri.substring(0, 20)}...` : 'NO URI FOUND');

if (!uri) {
    console.error('ERROR: MONGODB_URI is undefined');
    process.exit(1);
}

async function testConnection() {
    try {
        await mongoose.connect(uri!);
        console.log('SUCCESS: Connected to MongoDB!');
        await mongoose.disconnect();
    } catch (error: any) {
        console.error('ERROR: Connection failed');
        console.error(error.message);
        if (error.cause) console.error(error.cause);
    }
}

testConnection();
