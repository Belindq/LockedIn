import mongoose, { Schema, Document, Model } from 'mongoose';

export const GENDER_OPTIONS = ['male', 'female', 'non-binary', 'other', 'prefer_not_to_say'] as const;
export const SEXUALITY_OPTIONS = ['heterosexual', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other', 'prefer_not_to_say'] as const;

export type Gender = typeof GENDER_OPTIONS[number];
export type Sexuality = typeof SEXUALITY_OPTIONS[number];

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: Gender;
    sexuality?: Sexuality;
    avatar?: string;
    homeAddress?: string;
    locationCoordinates?: {
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
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false,
        min: 18
    },
    avatar: {
        type: String,
        default: 'avatar1'
    },
    gender: {
        type: String,
        enum: GENDER_OPTIONS,
        required: false
    },
    sexuality: {
        type: String,
        enum: SEXUALITY_OPTIONS,
        required: false
    },
    homeAddress: {
        type: String,
        required: false
    },
    locationCoordinates: {
        lat: {
            type: Number,
            required: false
        },
        lng: {
            type: Number,
            required: false
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
