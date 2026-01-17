import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallengeProgress extends Document {
    challengeId: mongoose.Types.ObjectId;
    questId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: 'locked' | 'active' | 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
    submissionText?: string;
    submissionImageId?: mongoose.Types.ObjectId;
    submissionImageBase64?: string;
    submittedAt?: Date;
    faceDetectionWarning?: boolean;
}

const ChallengeProgressSchema = new Schema<IChallengeProgress>({
    challengeId: {
        type: Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true,
        index: true
    },
    questId: {
        type: Schema.Types.ObjectId,
        ref: 'Quest',
        required: false,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['locked', 'active', 'pending', 'submitted', 'approved', 'rejected', 'expired'],
        default: 'locked',
        required: true
    },
    submissionText: {
        type: String
    },
    submissionImageId: {
        type: Schema.Types.ObjectId
    },
    submissionImageBase64: {
        type: String
    },
    submittedAt: {
        type: Date
    },
    faceDetectionWarning: {
        type: Boolean,
        default: false
    }
});

// Compound index for finding user progress on specific challenges
ChallengeProgressSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
ChallengeProgressSchema.index({ userId: 1, status: 1 });

const ChallengeProgress: Model<IChallengeProgress> = mongoose.models.ChallengeProgress || mongoose.model<IChallengeProgress>('ChallengeProgress', ChallengeProgressSchema);

export default ChallengeProgress;
