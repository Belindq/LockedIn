import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
    userA: mongoose.Types.ObjectId;
    userB: mongoose.Types.ObjectId;
    createdAt: Date;
    status: 'active' | 'expired' | 'completed';
    permanentlyBlocked: boolean;
}

const MatchSchema = new Schema<IMatch>({
    userA: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userB: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'completed'],
        default: 'active',
        required: true
    },
    permanentlyBlocked: {
        type: Boolean,
        default: true,
        required: true
    }
});

// Compound indexes for efficient matching queries
MatchSchema.index({ userA: 1, userB: 1 });
MatchSchema.index({ userA: 1, status: 1 });
MatchSchema.index({ userB: 1, status: 1 });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
