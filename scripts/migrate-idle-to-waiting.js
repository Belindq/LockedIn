/**
 * Migration Script: Update all users with 'idle' status to 'waiting_for_match'
 * 
 * Run this script once to migrate existing data:
 * node scripts/migrate-idle-to-waiting.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function migrateIdleToWaiting() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get the User model
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find all users with 'idle' status
        const result = await User.updateMany(
            { status: 'idle' },
            { $set: { status: 'waiting_for_match' } }
        );

        console.log(`✅ Migration complete!`);
        console.log(`   - Updated ${result.modifiedCount} user(s) from 'idle' to 'waiting_for_match'`);
        console.log(`   - Matched ${result.matchedCount} user(s) with 'idle' status`);

        // Verify the migration
        const remainingIdle = await User.countDocuments({ status: 'idle' });
        if (remainingIdle === 0) {
            console.log('✅ No users with "idle" status remaining');
        } else {
            console.warn(`⚠️  Warning: ${remainingIdle} user(s) still have "idle" status`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the migration
migrateIdleToWaiting();
