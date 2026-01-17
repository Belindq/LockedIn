import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('Please define the GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Predefined quest templates for inspiration
const QUEST_TEMPLATES = [
    "Post the last thing you googled that you'd rather not explain.",
    "Take a photo of something that would make a bad first impression but a great third one.",
    "Post something you'd secretly love if your partner noticed.",
    "Share the most unserious reason you've ever liked someone. Examples: voice note cadence, keyboard sounds, the way they say 'yeah'.",
    "Take a photo of something you interact with on pure muscle memory.",
    "Share something you're weirdly proud of that absolutely doesn't belong on a résumé.",
    "Post the most impressive thing you've done recently that no one asked about.",
];

interface UserProfile {
    interests: string;
    values: string;
    mustHaves: string;
    niceToHaves: string;
}

interface GeneratedChallenge {
    type: 'text' | 'image' | 'location';
    prompt: string;
    timeLimitSeconds: number;
}

/**
 * Generate 5 personalized challenges using Gemini AI
 * Remixes templates based on shared user interests
 */
export async function generateQuestChallenges(
    userAProfile: UserProfile,
    userBProfile: UserProfile
): Promise<GeneratedChallenge[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a creative dating app quest designer. Generate exactly 5 unique, fun, and family-friendly challenges for two people to complete together.

CRITICAL: Create challenges with PROGRESSIVE DEPTH - start light and get progressively more personal:

**Depth Guidelines:**
- Challenge 1 (Surface): Fun, lighthearted ice-breaker (favorite things, hobbies, daily habits)
- Challenge 2 (Interests): Explore their stated interests and activities more specifically
- Challenge 3 (Values in Action): How do their values show up in real life? What matters to them?
- Challenge 4 (Personal Stories): Formative experiences, vulnerabilities, meaningful moments
- Challenge 5 (Deep Connection): Life philosophy, authentic self, what drives them, emotional truth

User A Profile:
- Interests: ${userAProfile.interests}
- Values: ${userAProfile.values}
- Must-haves: ${userAProfile.mustHaves}
- Nice-to-haves: ${userAProfile.niceToHaves}

User B Profile:
- Interests: ${userBProfile.interests}
- Values: ${userBProfile.values}
- Must-haves: ${userBProfile.mustHaves}
- Nice-to-haves: ${userBProfile.niceToHaves}

**Requirements:**
1. Make each challenge build on the previous ones naturally
2. Use their actual interests/values to personalize each level
3. Keep it conversational and engaging, not like an interview
4. NO FACES in photos! Creativity over selfies
5. Each should feel progressively more intimate

Types: "text", "image", or "location"

Return ONLY a JSON array of 5 objects with this structure:
[
  {
    "type": "text" | "image" | "location",
    "prompt": "The challenge question/task",
    "timeLimitSeconds": 172800
  }
]

Make it natural, progressive, and get them connecting on deeper levels!

Types must be: "text", "image", or "location"
Time limits should be between 1800 (30 min) and 86400 (24 hours) seconds.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('--- Gemini Raw Response ---');
        console.log(text);
        console.log('---------------------------');

        // Extract JSON from response (handle markdown code blocks and surrounding text)
        let jsonText = text.trim();

        // Match JSON code block: ```json ... ``` or just ``` ... ```
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1].trim();
        } else {
            // Attempt to find array brackets if no code block
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                jsonText = text.substring(start, end + 1);
            }
        }

        console.log('--- Parsed JSON Text ---');
        console.log(jsonText);
        console.log('------------------------');

        const challenges = JSON.parse(jsonText);

        // Validate we got exactly 5 challenges
        if (!Array.isArray(challenges) || challenges.length !== 5) {
            throw new Error(`AI generated ${Array.isArray(challenges) ? challenges.length : 'invalid type'} challenges (expected 5)`);
        }

        // Validate each challenge has required fields
        challenges.forEach((challenge, idx) => {
            if (!challenge.type || !challenge.prompt || !challenge.timeLimitSeconds) {
                throw new Error(`Challenge ${idx} missing required fields`);
            }
            if (!['text', 'image', 'location'].includes(challenge.type)) {
                throw new Error(`Challenge ${idx} has invalid type: ${challenge.type}`);
            }
        });

        return challenges;
    } catch (error) {
        console.error('Error generating quest challenges:', error);
        console.error('Falling back to default templates.');

        // Fallback to default challenges if AI fails
        return [
            {
                type: 'text',
                prompt: "Share the most unserious reason you've ever liked someone.",
                timeLimitSeconds: 3600
            },
            {
                type: 'image',
                prompt: "Take a photo of something you interact with on pure muscle memory.",
                timeLimitSeconds: 7200
            },
            {
                type: 'text',
                prompt: "Post something you'd secretly love if your partner noticed.",
                timeLimitSeconds: 3600
            },
            {
                type: 'image',
                prompt: "Take a photo of something that would make a bad first impression but a great second one.",
                timeLimitSeconds: 7200
            },
            {
                type: 'location',
                prompt: "Visit a place that makes you feel most like yourself and check in.",
                timeLimitSeconds: 86400
            }
        ];
    }
}

/**
 * Check if an image contains a face using Gemini Vision
 * Returns confidence percentage (0-100)
 */
export async function detectFaceInImage(imageBase64: string): Promise<{
    hasFace: boolean;
    confidence: number;
    blocked: boolean;
    error?: string;
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this image and determine if it contains a clearly visible human face.
  
Return ONLY a valid JSON object in this exact format:
{
  "hasFace": true or false,
  "confidence": number between 0 and 100
}

Confidence should be:
- 90-100: Definitely contains a face
- 70-89: Probably contains a face
- 50-69: Uncertain
- 0-49: Probably no face or face not clearly visible`;

    try {
        // Strip data:image/...;base64, prefix if present
        const data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Optimization: Skip face detection for very small images (likely debug/placeholders)
        // A 1x1 pixel PNG is very short.
        if (data.length < 100) {
            console.log('Skipping face detection for small/debug image');
            return {
                hasFace: false,
                confidence: 0,
                blocked: false
            };
        }

        const imagePart = {
            inlineData: {
                data: data,
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const result_data = JSON.parse(jsonText);

        // Block if face confidence is high (> 80)
        const blocked = result_data.confidence > 80;

        return {
            hasFace: result_data.hasFace,
            confidence: result_data.confidence,
            blocked: blocked
        };
    } catch (error: any) {
        console.error('Error detecting face in image:', error);

        // On error, we default to NOT blocking, but log it
        return {
            hasFace: false,
            confidence: 0,
            blocked: false,
            error: error.message || String(error)
        };
    }
}

/**
 * Generate a personalized date location/idea based on users and their quest responses
 */
export async function generateDateIdea(
    userAProfile: UserProfile,
    userBProfile: UserProfile,
    userAResponses: string[],
    userBResponses: string[],
    cityContext: string // e.g. "NYC" or "Coords: 40.71, -74.00"
): Promise<{
    title: string;
    description: string;
    activityType: string;
    locationName: string;
    address: string;
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a romantic dating expert. Design the PERFECT first date for two people who just matched and completed a connection quest.

User A:
Interests: ${userAProfile.interests}
Values: ${userAProfile.values}
Key phrases from their quest answers: "${userAResponses.join('", "')}"

User B:
Interests: ${userBProfile.interests}
Values: ${userBProfile.values}
Key phrases from their quest answers: "${userBResponses.join('", "')}"

Location Context: They are located near ${cityContext}.

Task:
Generate a specific, real-world style date idea that blends their interests.
It MUST be a real, specific place if possible (e.g., "The Coffee Loft" rather than "a coffee shop").
You MUST provide a plausible street address (or at least a neighborhood/cross-street) for the location.

Return ONLY a valid JSON object:
{
  "title": "Catchy Date Title",
  "description": "A 2-3 sentence pitch of why this date is perfect for them, mentioning specific shared interests or inside jokes from their answers.",
  "activityType": "coffee" | "drinks" | "active" | "food" | "culture" | "other",
  "locationName": "Name of a specific type of place or a real landmark",
  "address": "A specific street address or neighborhood location string"
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('--- Date Idea Raw Response ---');
        console.log(text);

        // Parse JSON (reuse logic)
        let jsonText = text.trim();
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1].trim();
        } else {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                jsonText = text.substring(start, end + 1);
            }
        }

        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating date idea:', error);
        return {
            title: "Coffee & Conversation",
            description: "A classic first date to get to know each other better. Based on your shared interests, a cozy cafe would be perfect.",
            activityType: "coffee",
            locationName: "Local Cafe",
            address: "Main Street, Your City"
        };
    }
}

 
 