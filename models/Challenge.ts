import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
    questId: mongoose.Types.ObjectId;
    orderIndex: number;
    type: 'text' | 'image' | 'location';
    prompt: string;
    timeLimitSeconds: number;

    // AI Learning Fields
    insights?: string; // AI-generated insights from responses
    learnedAboutUserA?: string; // What AI learned about user A
    learnedAboutUserB?: string; // What AI learned about user B
    depthLevel?: number; // 1-5, increasing depth of exploration
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
    },
    insights: {
        type: String,
        required: false
    },
    learnedAboutUserA: {
        type: String,
        required: false
    },
    learnedAboutUserB: {
        type: String,
        required: false
    },
    depthLevel: {
        type: Number,
        required: false,
        min: 1,
        max: 5,
        default: 1
    }
});

// Compound index for efficient quest challenge retrieval
ChallengeSchema.index({ questId: 1, orderIndex: 1 });

const Challenge: Model<IChallenge> = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
