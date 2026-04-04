# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when work happens in this repository.

## LocalLoop — Youth Relocation & Community Platform

### Commands

**Backend (NestJS, runs on :3001)**
```bash
cd backend
npm install                          # install deps
npx prisma generate                  # generate Prisma client
npx prisma migrate deploy            # run migrations
npm run start:dev                    # dev server with watch
nest start                           # one-shot start
npm run build                        # nest build
npm run test                         # unit tests
npm run test:e2e                     # e2e tests
npm run lint                         # eslint --fix
```

**Frontend (Next.js 16, runs on :3000)**
```bash
cd frontend
npm install
npm run dev                          # Next.js dev
npm run build                        # Next.js build
npm run start                        # Next.js prod
npm run lint                         # eslint
```

Swagger UI at `http://localhost:3001/api`.
Frontend `NEXT_PUBLIC_API_URL` should point to `http://localhost:3001`.

### Architecture

Monorepo with separate `backend/` (NestJS) and `frontend/` (Next.js 16 App Router).

**Backend modules:** `auth`, `users`, `housing`, `communities`, `posts`, `chat` (WebSocket gateway), `events`, `reputation`. Each module follows NestJS pattern: controller, service, DTO, with `prisma/` as shared service. Auth uses Passport + JWT (short-lived tokens, bcrypt hashing). Socket.io powers real-time chat.

**Frontend pages:** `app/` directory with routes: `/dashboard`, `/housing`, `/communities/[id]`, `/chat`, `/events`, `/leaderboard`, `/profile`, `/onboarding`, `/login`, `/register`, `/women-only`, `/notifications`. State managed via Zustand. Auth via `AuthProvider` context. API client in `lib/api.ts`.

**Database:** PostgreSQL via Prisma 7 with 14 models (User, Reputation, MentorProfile, Housing, HousingReview, SavedHousing, Community, CommunityMember, Post, Comment, Message, Event, EventAttendee). Schema at `backend/prisma/schema.prisma`.

### Key Patterns

- Backend uses `class-validator` + `class-transformer` for DTO validation.
- Frontend communicates via REST + WebSocket Socket.io client.
- Women Mode (`isWomenMode` on User) adds privacy layer.
- Reputation system: points-based gamification with 5 levels (Explorer → Local Mentor).
- Cities focused on Pune; schema supports multi-city via `city` field on relevant models.
