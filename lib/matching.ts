import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '@/models/User';
import Match from '@/models/Match';
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
                const match = await Match.create({
                    userA: validA._id,
                    userB: validB._id,
                    status: 'active'
                });

                validA.status = 'matched';
                await validA.save();

                validB.status = 'matched';
                await validB.save();

                createdMatches.push(match);
            }
        }

        return { matches: createdMatches, count: createdMatches.length };

    } catch (error) {
        console.error('Gemini Matching Error:', error);
        throw error;
    }
}
