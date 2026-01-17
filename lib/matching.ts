import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '@/models/User';
import Match from '@/models/Match';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import { generateQuestChallenges } from '@/lib/gemini-quest-engine';
import connectDB from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runMatchingAlgorithm() {
    await connectDB();

    const pool = await User.find({ status: 'waiting_for_match' });

    if (pool.length < 2) {
        return { matchesRaw: [], count: 0, message: 'Not enough users in pool' };
    }

    const candidates = pool.map(u => ({
        id: u._id.toString(),
        name: u.firstName,
        age: u.age,
        gender: u.gender,
        sexuality: u.sexuality,
        location: u.homeAddress,
        interests: u.interests, // string
        values: u.values,       // string
        mustHaves: u.mustHaves, // string
        dealBreakers: u.dealBreakers, // string
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
    You are a professional matchmaker. Match these users based on their data.
    
    Constraints:
    1. Users must be compatible based on gender/sexuality (Strict).
    2. Respect "Deal Breakers" absolutely.
    3. Return matches as pairs of IDs.
    4. Each user can only be in ONE pair.
    
    Input Users (JSON):
    ${JSON.stringify(candidates)}
    
    Output JSON Format (Array of pairs):
    [
      { "userA": "id1", "userB": "id2", "reason": "High compatibility..." }
    ]
    
    Return ONLY valid JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const pairs = JSON.parse(text);
        const createdMatches = [];

        for (const pair of pairs) {
            const { userA, userB } = pair;

            if (!userA || !userB) continue;

            const validA = await User.findOne({ _id: userA, status: 'waiting_for_match' });
            const validB = await User.findOne({ _id: userB, status: 'waiting_for_match' });

            if (validA && validB) {
                // Check if these users have been permanently blocked from matching
                const blockedMatch = await Match.findOne({
                    $or: [
                        { userA: validA._id, userB: validB._id, permanentlyBlocked: true },
                        { userA: validB._id, userB: validA._id, permanentlyBlocked: true }
                    ]
                });

                if (blockedMatch) {
                    console.log(`Skipping permanently blocked pair: ${validA._id} and ${validB._id}`);
                    continue; // Skip this pair
                }

                const match = await Match.create({
                    userA: validA._id,
                    userB: validB._id,
                    status: 'active'
                });

                // --- Generate Quest & Challenges Immediately ---
                try {
                    console.log(`Generating quest for match ${match._id}...`);
                    const generatedChallenges = await generateQuestChallenges(
                        {
                            interests: validA.interests,
                            values: validA.values,
                            mustHaves: validA.mustHaves,
                            niceToHaves: validA.niceToHaves
                        },
                        {
                            interests: validB.interests,
                            values: validB.values,
                            mustHaves: validB.mustHaves,
                            niceToHaves: validB.niceToHaves
                        }
                    );

                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

                    const quest = await Quest.create({
                        matchId: match._id,
                        userAId: validA._id,
                        userBId: validB._id,
                        status: 'active',
                        expiresAt
                    });

                    // Create challenges and progress
                    for (let i = 0; i < generatedChallenges.length; i++) {
                        const challengeData = generatedChallenges[i];
                        const challenge = await Challenge.create({
                            questId: quest._id,
                            orderIndex: i,
                            type: challengeData.type,
                            prompt: challengeData.prompt,
                            timeLimitSeconds: challengeData.timeLimitSeconds,
                            depthLevel: i + 1  // Progressive depth: 1 (surface) to 5 (deep)
                        });

                        // Only first challenge is active, rest are locked
                        const initialStatus = i === 0 ? 'active' : 'locked';

                        await ChallengeProgress.create({
                            challengeId: challenge._id,
                            questId: quest._id,
                            userId: validA._id,
                            status: initialStatus
                        });
                        await ChallengeProgress.create({
                            challengeId: challenge._id,
                            questId: quest._id,
                            userId: validB._id,
                            status: initialStatus
                        });
                    }
                    console.log(`Quest created with ${generatedChallenges.length} challenges.`);

                } catch (questError) {
                    console.error('Failed to auto-create quest:', questError);
                    // Decide if we should rollback match? For mvp, maybe just log it.
                }

                validA.status = 'matched';
                await validA.save();

                validB.status = 'matched';
                await validB.save();

                createdMatches.push(match);
            }
        }

        return { matches: createdMatches, count: createdMatches.length };

    } catch (error: any) {
        console.error('Gemini Matching Error Detailed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        if (error.response) {
            // Try/catch just in case accessing response.text() fails
            try {
                const errorText = await error.response.text();
                console.error('Gemini Response Error:', errorText);
            } catch (e) {
                console.error('Could not read error response text');
            }
        }
        throw error;
    }
}
