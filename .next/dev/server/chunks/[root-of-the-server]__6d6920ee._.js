module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/models/User.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GENDER_OPTIONS",
    ()=>GENDER_OPTIONS,
    "SEXUALITY_OPTIONS",
    ()=>SEXUALITY_OPTIONS,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const GENDER_OPTIONS = [
    'male',
    'female',
    'non-binary',
    'other',
    'prefer_not_to_say'
];
const SEXUALITY_OPTIONS = [
    'heterosexual',
    'gay',
    'lesbian',
    'bisexual',
    'pansexual',
    'asexual',
    'other',
    'prefer_not_to_say'
];
const UserSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
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
        enum: [
            'onboarding',
            'waiting_for_match',
            'matched'
        ],
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
UserSchema.index({
    status: 1
});
UserSchema.index({
    'locationCoordinates.lat': 1,
    'locationCoordinates.lng': 1
});
const User = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.User || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('User', UserSchema);
const __TURBOPACK__default__export__ = User;
}),
"[project]/models/Match.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MatchSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    userA: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userB: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
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
        enum: [
            'active',
            'expired',
            'completed'
        ],
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
MatchSchema.index({
    userA: 1,
    userB: 1
});
MatchSchema.index({
    userA: 1,
    status: 1
});
MatchSchema.index({
    userB: 1,
    status: 1
});
const Match = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Match || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Match', MatchSchema);
const __TURBOPACK__default__export__ = Match;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
let cached = global.mongoose || {
    conn: null,
    promise: null
};
if (!global.mongoose) {
    global.mongoose = cached;
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;
}),
"[project]/lib/matching.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runMatchingAlgorithm",
    ()=>runMatchingAlgorithm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Match$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Match.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
async function runMatchingAlgorithm() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    const pool = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
        status: 'waiting_for_match'
    });
    if (pool.length < 2) {
        return {
            matchesRaw: [],
            count: 0,
            message: 'Not enough users in pool'
        };
    }
    const candidates = pool.map((u)=>({
            id: u._id.toString(),
            name: u.firstName,
            age: u.age,
            gender: u.gender,
            sexuality: u.sexuality,
            location: u.homeAddress,
            interests: u.interests,
            values: u.values,
            mustHaves: u.mustHaves,
            dealBreakers: u.dealBreakers
        }));
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash'
    });
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
        for (const pair of pairs){
            const { userA, userB } = pair;
            if (!userA || !userB) continue;
            const validA = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                _id: userA,
                status: 'waiting_for_match'
            });
            const validB = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                _id: userB,
                status: 'waiting_for_match'
            });
            if (validA && validB) {
                const match = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Match$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
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
        return {
            matches: createdMatches,
            count: createdMatches.length
        };
    } catch (error) {
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
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/app/api/match/run/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$matching$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/matching.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/resend/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
;
const resend = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY);
async function POST(req) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$matching$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runMatchingAlgorithm"])();
        if (result.matches && result.matches.length > 0) {
            for (const match of result.matches){
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
                const uA = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(match.userA);
                const uB = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(match.userB);
                if (uA && uB) {
                    await sendMatchEmail(uA.email, uA.firstName || 'User', uB.firstName || 'your match');
                    await sendMatchEmail(uB.email, uB.firstName || 'User', uA.firstName || 'your match');
                }
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Match Run Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
async function sendMatchEmail(to, name, matchName) {
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('RESEND_API_KEY')) {
        try {
            await resend.emails.send({
                from: 'LockedIn <onboarding@resend.dev>',
                to: [
                    to
                ],
                subject: 'You have a Match!',
                html: `<p>Hi ${name},</p><p>You have been matched with <strong>${matchName}</strong>!</p><p>Go to the app to see next steps.</p>`
            });
        } catch (e) {
            console.error(`[EMAIL FAIL] Failed to send to ${to}`, e);
        }
    } else {
        console.log(`[EMAIL LOG] (Mock) Sending match email to ${to} for match with ${matchName}`);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6d6920ee._.js.map