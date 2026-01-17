# Production Cleanup Checklist

Items to remove or modify before deploying LockedIn to production.

## Mock Data & Context

### Remove Mock Data
- [ ] Delete `lib/mockData.ts` entirely
- [ ] Update `lib/UserContext.tsx` to fetch real user data from API

### Connect Real Backend
- [ ] Wire up authentication (sign up/login)
- [ ] Fetch user profile from `/api/users/me`
- [ ] Load active quest from `/api/quest/active`
- [ ] Implement real challenge submission via `/api/challenges/submit`
- [ ] Connect unmatch to `/api/quest/cancel`
- [ ] Load insights from backend
- [ ] Load gallery items from backend

## UI Placeholders

### Avatar Page
- [ ] Update avatar grid to use actual PNG images (currently shows numbers)
- [ ] Consider allowing custom avatar upload

### Gallery Page
- [ ] Replace image URL placeholders with real `<img>` tags
- [ ] Implement S3/cloud storage for images
- [ ] Add proper image optimization (Next.js Image component)

### Challenge Submissions
- [ ] Remove `console.log` from submission handlers
- [ ] Add real API calls with loading states
- [ ] Add success/error toast notifications
- [ ] Handle file uploads to cloud storage

### Mapbox Integration
- [ ] Add real Mapbox API key to `.env.local`
- [ ] Replace grey placeholder with actual Mapbox map component
- [ ] Implement location picker functionality

## Environment Variables

Add to production environment:
```
MONGODB_URI=
JWT_SECRET=
GOOGLE_AI_API_KEY=
MAPBOX_API_KEY=
RESEND_API_KEY=
```

## Security

- [ ] Never expose API keys in frontend code
- [ ] Ensure all image uploads go through face detection API
- [ ] Validate all form inputs on backend
- [ ] Add rate limiting to submission endpoints

## Testing

- [ ] Test full user flow end-to-end
- [ ] Test all edge cases (expired quests, network errors, etc.)
- [ ] Test on mobile devices
- [ ] Run accessibility audit
- [ ] Test with real users

## Performance

- [ ] Optimize images (use Next.js Image component)
- [ ] Add proper caching headers
- [ ] Minimize bundle size
- [ ] Test load times

## Monitoring

- [ ] Add error tracking (e.g., Sentry)
- [ ] Add analytics
- [ ] Monitor API performance
- [ ] Set up logging

---

**Current Status**: Frontend skeleton complete with mock data. Backend API routes exist but not yet connected to frontend.
