import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchLog extends Document {
    createdAt: Date;
    candidateCount: number;
    candidates: any[];
    prompt: string;
    aiResponse: string;
    parsedPairs: any[];
    matchesCreated: any[];
    error?: string;
}

const MatchLogSchema = new Schema<IMatchLog>({
    createdAt: {
        type: Date,
        default: Date.now
    },
    candidateCount: {
        type: Number,
        required: true
    },
    candidates: {
        type: Schema.Types.Mixed,
        default: []
    },
    prompt: {
        type: String,
        default: ''
    },
    aiResponse: {
        type: String,
        default: ''
    },
    parsedPairs: {
        type: Schema.Types.Mixed,
        default: []
    },
    matchesCreated: {
        type: Schema.Types.Mixed,
        default: []
    },
    error: {
        type: String
    }
});

const MatchLog: Model<IMatchLog> = mongoose.models.MatchLog || mongoose.model<IMatchLog>('MatchLog', MatchLogSchema);

export default MatchLog;
