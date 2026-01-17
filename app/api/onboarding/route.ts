import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { validateAddress } from '@/lib/address';
import { runMatchingAlgorithm } from '@/lib/matching';

export async function PUT(req: Request) {
    try {
        await connectDB();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            firstName, lastName, age, gender, sexuality, homeAddress,
            interests, values, mustHaves, niceToHaves, dealBreakers, avatar
        } = body;

        // Validation for Onboarding
        if (!firstName || !lastName || !age || !gender || !sexuality || !homeAddress) {
            return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
        }

        // Validate address
        const addressValidation = await validateAddress(homeAddress);
        if (!addressValidation.isValid || !addressValidation.coordinates) {
            return NextResponse.json({ error: 'Invalid address', details: 'Unable to verify the provided home address' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.age = age;
        user.gender = gender;
        user.sexuality = sexuality;
        user.avatar = avatar || 'avatar1';
        user.homeAddress = addressValidation.formattedAddress || homeAddress;
        user.locationCoordinates = addressValidation.coordinates;

        user.interests = interests || '';
        user.values = values || '';
        user.mustHaves = mustHaves || '';
        user.niceToHaves = niceToHaves || '';
        user.dealBreakers = dealBreakers || '';

        // Update Status
        // After onboarding the user is ready to be matched
        user.status = 'waiting_for_match';

        await user.save();

        // Trigger matching algorithm immediately for instant feedback
        // We do this asynchronously so we don't block the UI response too much, 
        // but for this MVP/Hackathon scale, awaiting is fine and ensures consistency.
        try {
            await runMatchingAlgorithm();
        } catch (matchError) {
            console.error('Auto-match trigger failed:', matchError);
            // Don't fail the onboarding request if matching fails
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
