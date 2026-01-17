import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '@/models/User';
import Match from '@/models/Match';
import Quest from '@/models/Quest';
import Challenge from '@/models/Challenge';
import ChallengeProgress from '@/models/ChallengeProgress';
import MatchLog from '@/models/MatchLog';
import { generateQuestChallenges } from '@/lib/gemini-quest-engine';
import connectDB from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runMatchingAlgorithm() {
    await connectDB();

    // Init Log
    const matchLog = new MatchLog({
        candidateCount: 0,
        candidates: [],
        matchesCreated: []
    });

    try {
        const pool = await User.find({ status: 'waiting_for_match' });

        console.log(`[MATCHING] Starting run. Pool size: ${pool.length}`);

        matchLog.candidateCount = pool.length;

        if (pool.length < 2) {
            console.log('[MATCHING] Aborting: Not enough users in pool (Need 2+)');
            matchLog.error = 'Not enough users in pool';
            await matchLog.save();
            return { matches: [], count: 0, message: 'Not enough users in pool', logId: matchLog._id };
        }

        const candidates = pool.map(u => ({
            id: u._id.toString(),
            name: u.firstName,
            age: u.age,
            gender: u.gender,
            sexuality: u.sexuality,
            location: u.homeAddress,
            interests: u.interests,
            values: u.values,
            mustHaves: u.mustHaves,
            dealBreakers: u.dealBreakers,
        }));

        matchLog.candidates = candidates;
        console.log('[MATCHING] Candidates:', JSON.stringify(candidates, null, 2));

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
    You are a professional matchmaker. Match these users based on their data.
    
    Constraints:
    1. Users must be compatible based on gender/sexuality (Strict).
    2. Respect "Deal Breakers" absolutely.
    3. Prioritize matches with similar ages.
    4. Return matches as pairs of IDs.
    5. Each user can only be in ONE pair.
    
    Input Users (JSON):
    ${JSON.stringify(candidates)}
    
    Output JSON Format (Array of pairs):
    [
      { "userA": "id1", "userB": "id2", "reason": "High compatibility..." }
    ]
    
    Return ONLY valid JSON.
  `;

        matchLog.prompt = prompt;
        await matchLog.save(); // Save progress

        console.log('[MATCHING] Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('[MATCHING] Raw AI Response:', text);
        matchLog.aiResponse = text;

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let pairs = [];
        try {
            pairs = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse AI response', e);
            matchLog.error = 'Failed to parse AI response JSON';
            await matchLog.save();
            return { matches: [], count: 0, error: 'AI Parse Error', logId: matchLog._id };
        }

        matchLog.parsedPairs = pairs;
        console.log('[MATCHING] Parsed Pairs:', pairs);

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

        matchLog.matchesCreated = createdMatches;
        await matchLog.save();

        return { matches: createdMatches, count: createdMatches.length, logId: matchLog._id };

    } catch (error: any) {
        console.error('Gemini Matching Error Detailed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        matchLog.error = error.message || String(error);
        await matchLog.save();

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

