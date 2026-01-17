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
"[project]/lib/address.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateAddress",
    ()=>validateAddress
]);
async function validateAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
            headers: {
                'User-Agent': 'LockedInApp/1.0' // Nominatim requires a User-Agent
            }
        });
        if (!response.ok) {
            console.error('Address validation failed:', response.statusText);
            return {
                isValid: false
            };
        }
        const data = await response.json();
        if (data && data.length > 0) {
            const result = data[0];
            return {
                isValid: true,
                coordinates: {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                },
                formattedAddress: result.display_name
            };
        }
        return {
            isValid: false
        };
    } catch (error) {
        console.error('Error validating address:', error);
        // In case of API failure, we might want to fail safe or block. 
        // For now, let's treat network error as invalid address to be safe, 
        // or we could throw to let the caller decide.
        return {
            isValid: false
        };
    }
}
}),
"[project]/app/api/onboarding/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$address$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/address.ts [app-route] (ecmascript)");
;
;
;
;
async function PUT(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await req.json();
        const { firstName, lastName, age, gender, sexuality, homeAddress, interests, values, mustHaves, niceToHaves, dealBreakers, avatar } = body;
        // Validation for Onboarding
        if (!firstName || !lastName || !age || !gender || !sexuality || !homeAddress) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required profile fields'
            }, {
                status: 400
            });
        }
        // Validate address
        const addressValidation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$address$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAddress"])(homeAddress);
        if (!addressValidation.isValid || !addressValidation.coordinates) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid address',
                details: 'Unable to verify the provided home address'
            }, {
                status: 400
            });
        }
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(userId);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__84ebedce._.js.map