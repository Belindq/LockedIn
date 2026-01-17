🔒 LockedIn — Master Backend Prompt (Matching + Quest System)
Your task is to create the back-end part of this project.
This is a hackathon MVP. Prioritize clarity, speed, and simplicity over robustness.
Maintain reasonable security.
If anything is unclear: STOP and ask questions. Never assume.
────────────────────────
PROJECT OVERVIEW
────────────────────────
LockedIn is a web-only, chatless, photoless dating app.
Users:
- Never chat
- Never swipe
- Never browse profiles
- Never see photos of the other person

Instead:
- AI matches two users
- They complete a shared quest
- Completing the quest unlocks a real-world date
- Location + time are revealed only at the final reveal
────────────────────────
CORE PRINCIPLES
────────────────────────
- No chat
- No photos of the other person
- No profile browsing
- AI-only matching
- One active quest per user
- Quests are disposable; accounts are not
- Users may re-enter matching after quest ends
- Web-only MVP
- Hackathon-friendly implementation
────────────────────────
TECH STACK (FIXED)
────────────────────────
Frontend: React
Framework: Next.js App Router
API: REST-only (Next.js API routes)
Server Actions: Allowed
Auth: Email + password
Sessions: Cookie-based or NextAuth Credentials
Database: MongoDB Atlas
ODM: Mongoose
AI: Google Gemini
Maps: Mapbox
Email: Real sending, hardcoded template
Deployment: Vercel

────────────────────────
AUTHENTICATION FLOW
────────────────────────
- Email + password signup
- No email verification
- Session-based auth
- After signup → onboarding

Onboarding data:
- Editable only before matching
- Locked once matched

After quest completes/expires:
- Quest is disposable
- Account remains valid
- User may re-enter matching pool via button

────────────────────────
USER ONBOARDING DATA
────────────────────────
firstName
lastName
age
gender
sexuality
homeAddress
locationCoordinates { lat, lng }
interests (free-text)
values (free-text)
mustHaves
niceToHaves
dealBreakers
status: onboarding | idle | waiting_for_match | matched
createdAt

────────────────────────
MATCHING SYSTEM (GEMINI)
────────────────────────
- Fully AI-assigned
- No user control or preview
Filters:
- dealBreakers → absolute
- mustHaves → strict
- niceToHaves → weighted
- location radius via coordinates

Behavior:
- Gemini scores and ranks candidates
- Exactly ONE top match selected
- No explanation shown

Timing:
- Production: up to 1 week
- Hackathon: match immediately
- Assume at least one valid match exists

Trigger:
- Manual API route (mocked background job)

Rules:
- One active quest at a time
- Users cannot match again until quest ends
- Users can NEVER be matched again with the same person via the pool

────────────────────────
MATCH HISTORY & RE-QUESTING
────────────────────────
- Every match is logged permanently
- Users may request a new quest with a previously matched user
- Re-questing must reference existing match history
- Re-questing bypasses the matching pool and AI
- Matching pool must exclude all prior matches

────────────────────────
MATCH NOTIFICATION
────────────────────────
- On match creation: send real email to both users
- Hardcoded email template
- Sent immediately for MVP

────────────────────────
POST-MATCH UI
────────────────────────
Show minimal card:
“You matched with [First Name]! Unlock challenges to become LockedIn.”

No other profile data visible.

────────────────────────
QUEST SYSTEM
────────────────────────
Quest creation:
- Created only after both users accept match
- Starts immediately

Quest states:
- pending_acceptance
- active
- completed
- expired
- cancelled

Cancelled/expired quests are disposable.
Users may re-enter matching afterward.

# Quest System Implementation Plan

## Phase 1: Models (Completed)
- [x] Create Match, Quest, Challenge, and ChallengeProgress schemas.

## Phase 2: AI Integration (Completed)
- [x] Implement Gemini-based quest generation and face detection logic.

## Phase 3: API Endpoints (In Progress)
- [x] POST /api/quest/create (Initialization)
- [x] POST /api/challenges/submit (Submission + AI Face Check)
- [x] POST /api/challenges/approve (Partner verification)
- [ ] GET /api/quest/active (State retrieval + Expiration check)
- [ ] GET /api/challenges/progress (Side-by-side progress view)
- [ ] POST /api/quest/nudge (Interaction without chat)
- [ ] POST /api/quest/cancel (Disposal)
- [ ] GET /api/quest/reveal (Final date reveal)

## Phase 4: Validation & Logic
- [x] On-read expiration logic.
- [x] Security: Participant-only access.

────────────────────────
TIME & EXPIRATION
────────────────────────
- 5 challenges per quest
- Individual challenge timers
- One overall quest deadline
- Timezone: EST
- On-read validation ONLY
- Checked on every read/write
- No cron jobs or background workers

────────────────────────
CHALLENGES
────────────────────────
Rules:
- Exactly 5 challenges
- Same for both users
- Types: text | image | location

Progress:
- Tracked per user
- Visible to both users
- Users can see which challenge the other is on
- No edits
- No resubmissions

Completion:
- All submissions shared
- Other user must approve
- Only approved submissions count

────────────────────────
NUDGES / STATUS SIGNALS
────────────────────────
- No chat
- Only predefined status messages
- Unlimited nudges per challenge
- Nudges do not affect progress

────────────────────────
IMAGE HANDLING
────────────────────────
- Stored in MongoDB
- ~10 images per user
- Retained for history
- Not embedded directly in API responses
- Access restricted to quest participants

Face detection:
- Gemini checks for face presence
- Threshold: 80%
- If uncertain: warn user, allow submit anyway

────────────────────────
AI QUEST GENERATION
────────────────────────
- Gemini remixes predefined templates
- Must be family-friendly and moderated
- AI prompts/responses not logged in prod
- Raw AI output never returned to client

────────────────────────
QUEST COMPLETION & REVEAL
────────────────────────
Trigger:
- Both users reach 100% approved progress

Reveal includes ONLY:
- Date location
- Date time

No profile reveal.

Mapping:
- Backend returns placeId + coordinates
- Frontend renders Mapbox directions
- One shared destination
- Personalized routes per user

────────────────────────
DATA MODELS (MONGOOSE)
────────────────────────
User:
email
passwordHash
firstName
lastName
age
gender
sexuality
homeAddress
locationCoordinates { lat, lng }
interests
values
mustHaves
niceToHaves
dealBreakers
status
createdAt

Match:
userA
userB
createdAt
status: active | expired | completed
permanentlyBlocked: true

Quest:
matchId
userAId
userBId
status
createdAt
expiresAt
finalDateLocation { placeId, lat, lng }
finalDateTime

Challenge:
questId
orderIndex
type
prompt
timeLimitSeconds

ChallengeProgress:
challengeId
userId
status: pending | submitted | approved | rejected | expired
submissionText
submissionImageId
submittedAt

────────────────────────
REQUIRED API ENDPOINTS
────────────────────────
Auth:
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout

Users:
GET /api/users/me
POST /api/users/enter-matching-pool

Matching:
POST /api/match/run
GET /api/match/active

Quest:
POST /api/quest/create
GET /api/quest/active
POST /api/quest/cancel
GET /api/quest/reveal
POST /api/quest/nudge

Challenges:
POST /api/challenges/submit
POST /api/challenges/approve
GET /api/challenges/progress

────────────────────────
SECURITY RULES
────────────────────────
- All routes require authentication
- Quest access validation:
  quest.userAId === session.userId OR quest.userBId === session.userId
- Never trust client IDs
- No secrets in frontend
- Gemini & Mapbox keys server-side only
────────────────────────
DEV INSTRUCTIONS
────────────────────────
1. Read codebase
2. Write plan to todo.md
3. Wait for approval
4. Implement incrementally
5. Mark tasks complete
6. Explain changes at high level
7. Keep changes minimal
8. Review security & syntax
9. Update dev.md with cleanup notes
10. Add review section to todo.md

────────────────────────
ENGINEERING PHILOSOPHY
────────────────────────
- Favor clarity over cleverness
- Avoid abstractions
- Design for ~10k DAUs
- Code like explaining to a 16-year-old

