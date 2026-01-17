import mongoose from 'mongoose';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';

/**
 * Check if a quest has expired and update status if needed
 * This is called on every read/write operation (on-read validation)
 */
export async function checkAndUpdateQuestExpiration(questId: mongoose.Types.ObjectId) {
    const quest = await Quest.findById(questId);

    if (!quest) {
        return null;
    }

    const now = new Date();

    // Check if quest has expired
    if (quest.status === 'active' && quest.expiresAt < now) {
        quest.status = 'expired';
        await quest.save();
    }

    return quest;
}

/**
 * Check if a challenge has expired based on its time limit
 */
export async function checkChallengeExpiration(
    challengeId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
) {
    const challenge = await Challenge.findById(challengeId);
    const progress = await ChallengeProgress.findOne({ challengeId, userId });

    if (!challenge || !progress) {
        return null;
    }

    // Only check expiration for pending challenges
    if (progress.status !== 'pending') {
        return progress;
    }

    const quest = await Quest.findById(challenge.questId);
    if (!quest) {
        return progress;
    }

    // Calculate deadline: quest creation time + time limit
    const deadline = new Date(quest.createdAt.getTime() + challenge.timeLimitSeconds * 1000);
    const now = new Date();

    if (now > deadline) {
        progress.status = 'expired';
        await progress.save();
    }

    return progress;
}

/**
 * Validate that a user is a participant in a quest
 */
export function isQuestParticipant(
    quest: any,
    userId: string | mongoose.Types.ObjectId
): boolean {
    const userIdStr = userId.toString();
    return (
        quest.userAId.toString() === userIdStr ||
        quest.userBId.toString() === userIdStr
    );
}

/**
 * Get the other user in a quest (partner)
 */
export function getPartnerUserId(
    quest: any,
    userId: string | mongoose.Types.ObjectId
): mongoose.Types.ObjectId {
    const userIdStr = userId.toString();

    if (quest.userAId.toString() === userIdStr) {
        return quest.userBId;
    } else {
        return quest.userAId;
    }
}

/**
 * Calculate overall quest progress for a user
 * Returns percentage (0-100)
 */
export async function calculateUserProgress(
    questId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
): Promise<number> {
    const challenges = await Challenge.find({ questId }).sort({ orderIndex: 1 });

    if (challenges.length === 0) {
        return 0;
    }

    const challengeIds = challenges.map(c => c._id);
    const progressRecords = await ChallengeProgress.find({
        challengeId: { $in: challengeIds },
        userId
    });

    const approvedCount = progressRecords.filter(p => p.status === 'approved').length;

    return Math.round((approvedCount / challenges.length) * 100);
}

/**
 * Check if quest is complete (both users at 100%)
 */
export async function isQuestComplete(questId: mongoose.Types.ObjectId): Promise<boolean> {
    const quest = await Quest.findById(questId);

    if (!quest) {
        return false;
    }

    const userAProgress = await calculateUserProgress(questId, quest.userAId);
    const userBProgress = await calculateUserProgress(questId, quest.userBId);

    return userAProgress === 100 && userBProgress === 100;
}

/**
 * Get current challenge for a user (first non-approved challenge)
 */
export async function getCurrentChallenge(
    questId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
) {
    const challenges = await Challenge.find({ questId }).sort({ orderIndex: 1 });

    for (const challenge of challenges) {
        const progress = await ChallengeProgress.findOne({
            challengeId: challenge._id,
            userId
        });

        if (!progress || progress.status !== 'approved') {
            return {
                challenge,
                progress: progress || null
            };
        }
    }

    return null; // All challenges completed
}

/**
 * Convert EST time to UTC for storage
 */
export function estToUtc(estDate: Date): Date {
    // EST is UTC-5
    return new Date(estDate.getTime() + 5 * 60 * 60 * 1000);
}

/**
 * Convert UTC to EST for display
 */
export function utcToEst(utcDate: Date): Date {
    // EST is UTC-5
    return new Date(utcDate.getTime() - 5 * 60 * 60 * 1000);
}
