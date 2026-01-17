import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuest extends Document {
    matchId: mongoose.Types.ObjectId;
    userAId: mongoose.Types.ObjectId;
    userBId: mongoose.Types.ObjectId;
    status: 'pending_acceptance' | 'active' | 'completed' | 'expired' | 'cancelled';
    createdAt: Date;
    expiresAt: Date;
    finalDateLocation?: {
        placeId: string;
        lat: number;
        lng: number;
    };
    finalDateTime?: Date;
}

const QuestSchema = new Schema<IQuest>({
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    userAId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userBId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending_acceptance', 'active', 'completed', 'expired', 'cancelled'],
        default: 'pending_acceptance',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    finalDateLocation: {
        placeId: String,
        lat: Number,
        lng: Number
    },
    finalDateTime: Date
});

// Compound index for finding active quests by user
QuestSchema.index({ userAId: 1, status: 1 });
QuestSchema.index({ userBId: 1, status: 1 });

const Quest: Model<IQuest> = mongoose.models.Quest || mongoose.model<IQuest>('Quest', QuestSchema);

export default Quest;
