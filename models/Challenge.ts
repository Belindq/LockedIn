import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
    questId: mongoose.Types.ObjectId;
    orderIndex: number;
    type: 'text' | 'image' | 'location';
    prompt: string;
    timeLimitSeconds: number;
}

const ChallengeSchema = new Schema<IChallenge>({
    questId: {
        type: Schema.Types.ObjectId,
        ref: 'Quest',
        required: true,
        index: true
    },
    orderIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 4 // 5 challenges total (0-4)
    },
    type: {
        type: String,
        enum: ['text', 'image', 'location'],
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    timeLimitSeconds: {
        type: Number,
        required: true,
        min: 0
    }
});

// Compound index for efficient quest challenge retrieval
ChallengeSchema.index({ questId: 1, orderIndex: 1 });

const Challenge: Model<IChallenge> = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
