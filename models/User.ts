import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    sexuality: string;
    homeAddress: string;
    locationCoordinates: {
        lat: number;
        lng: number;
    };
    interests: string;
    values: string;
    mustHaves: string;
    niceToHaves: string;
    dealBreakers: string;
    status: 'onboarding' | 'idle' | 'waiting_for_match' | 'matched';
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String,
        required: true
    },
    sexuality: {
        type: String,
        required: true
    },
    homeAddress: {
        type: String,
        required: true
    },
    locationCoordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    interests: {
        type: String,
        default: ''
    },
    values: {
        type: String,
        default: ''
    },
    mustHaves: {
        type: String,
        default: ''
    },
    niceToHaves: {
        type: String,
        default: ''
    },
    dealBreakers: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['onboarding', 'idle', 'waiting_for_match', 'matched'],
        default: 'onboarding',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Index for matching queries
UserSchema.index({ status: 1 });
UserSchema.index({ 'locationCoordinates.lat': 1, 'locationCoordinates.lng': 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
