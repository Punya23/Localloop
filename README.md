<p align="center">
  <img src="https://img.shields.io/badge/LocalLoop-Community%20Platform-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgOWwxMi02IDEyIDYiLz48cGF0aCBkPSJNMyA5djEwYTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMlY5Ii8+PHBhdGggZD0iTTkgMjJWMTJoNnYxMCIvPjwvc3ZnPg==&logoColor=white" alt="LocalLoop Badge" />
</p>

<h1 align="center">🏘️ LocalLoop — Youth Relocation & Community Platform</h1>

<p align="center">
  <strong>A full-stack SaaS platform that consolidates housing discovery, community networking, mentorship, and safety-first features for students & young professionals relocating to new cities.</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-problem-statement">Problem</a> •
  <a href="#-solution">Solution</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#-api-modules">API</a> •
  <a href="#-scalability-thinking">Scalability</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma_ORM-23_Models-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/FastAPI-ML_Service-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Socket.io-Real_Time-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🎬 Live Demo

| Resource | Link |
|:---|:---|
| 📹 **Demo Video** | [Watch on Loom](https://www.loom.com/share/82748d105655402ba23c0f032b89dc8a) |
| 🌐 **Live App** | [localloop-red.vercel.app](https://localloop-red.vercel.app/) |
| 📚 **API Docs (Swagger)** | Available at `/api/docs` when running locally |
| 🐙 **GitHub** | [github.com/Punya23/Localloop](https://github.com/Punya23/Localloop) |

---

## 🎯 Problem Statement

Every year, thousands of students and young professionals relocate to new cities. The current experience is fragmented and risky:

- **Unverified broker listings** with inflated rents and no accountability
- **Scattered WhatsApp groups** with no structure, searchability, or moderation
- **Zero trusted guidance** from experienced city residents
- **Safety concerns** especially for women relocating alone
- **No centralized platform** connecting housing, community, and mentorship

---

## 💡 Solution

**LocalLoop** consolidates the entire relocation experience into one verified, community-driven platform with three core pillars:

| Pillar | What It Solves |
|:---|:---|
| 🏠 **Housing Discovery** | Verified listings with AI-powered rent prediction (fair vs overpriced) |
| 👥 **Community Infrastructure** | University, professional, hometown, and newcomer groups with real-time chat |
| 🧑‍🏫 **Mentor Network** | Reputation-gated mentorship from experienced city residents |

---

## ✨ Key Features

### 🏠 Housing Discovery
- Curated PG, hostel, flat, and shared room listings
- **AI Rent Predictor** — ML model flags overpriced listings in real-time
- **Interactive Maps** — LeafletJS integration for geospatial exploration
- **Rich Media** — Cloudinary-powered high-res property images
- Advanced filters: budget, area, gender preference, amenities
- Safety ratings and women-friendly tags
- User reviews & ratings system

### 👥 Community Groups
- **University communities** — connect with students from your college
- **Professional groups** — network by work area
- **Hometown groups** — find people from your city
- **Newcomer batches** — bond with others moving in the same month
- **Women-only spaces** — safe, private communities for female users
- **Community polls** — democratic decision-making

### 🏆 Reputation & Gamification System

| Level | Title | How to Earn |
|:---:|:---|:---|
| 🌱 | Explorer | Sign up & complete onboarding |
| 🧭 | Guide | Answer questions, review housing |
| 🏡 | Settler | Consistent community contributions |
| 🗺️ | City Navigator | Help newcomers, host events |
| 🎓 | Local Mentor | Become an approved mentor |

### 💬 Real-Time Communication
- One-to-one messaging via **WebSocket (Socket.io)**
- Community group chat
- AI Chatbot assistant (Cerebras LLM integration)
- Read receipts and message status

### 🛡️ Women Mode
- Women-only community spaces
- Women mentor recommendations
- Safety-tagged housing with verified women-friendly listings
- Enhanced privacy controls

### 📅 Events & Meetups
- Welcome meetups, study groups, networking sessions, city explorations
- Community-organized and platform-wide events
- RSVP tracking with attendee management

### 🛠️ Admin & Moderation Panel
- Centralized analytics dashboard
- Content reporting system with resolution workflow
- Global broadcast notifications
- Full audit logging for administrative accountability
- ID verification & mentor approval workflows

---

## 🛠️ Tech Stack

### Three-Service Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   Frontend (Next.js 16) │────▸│   Backend (NestJS 11)   │
│   React 19 + Tailwind 4 │     │   11 API Modules        │
│   Zustand + Socket.io   │     │   JWT + Passport Auth   │
│   LeafletJS + Recharts  │     │   Socket.io WebSocket   │
└─────────────────────────┘     └────────────┬────────────┘
                                             │
                                   ┌─────────┴──────────┐
                                   │                     │
                              ┌────▼────┐         ┌──────▼──────┐
                              │Supabase │         │  ML Service │
                              │PostgreSQL│         │  (FastAPI)  │
                              │23 Models │         │  Rent AI    │
                              └─────────┘         └─────────────┘
```

### Frontend
| Technology | Purpose |
|:---|:---|
| **Next.js 16** | React framework with SSR & file-based routing |
| **React 19** | UI component library |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **LeafletJS** | Interactive geospatial mapping |
| **Recharts** | Data visualization & charts |
| **Lucide React** | Modern icon library |
| **Socket.io Client** | Real-time WebSocket communication |

### Backend
| Technology | Purpose |
|:---|:---|
| **NestJS 11** | Modular Node.js framework |
| **Prisma 7** | Type-safe ORM for PostgreSQL |
| **PostgreSQL** (Supabase) | Relational database (23 models) |
| **Cloudinary** | Optimized image hosting & CDN delivery |
| **Passport + JWT** | Authentication & authorization |
| **Socket.io** | Real-time messaging server |
| **Swagger (OpenAPI)** | Auto-generated API documentation |
| **class-validator** | DTO input validation |
| **sanitize-html** | XSS protection |

### ML Service
| Technology | Purpose |
|:---|:---|
| **FastAPI** | High-performance Python API framework |
| **Scikit-Learn** | RandomForest rent prediction model |
| **Pandas / NumPy** | Data preprocessing pipeline |
| **Pydantic** | Request/response validation |

---

## 🏗️ Architecture

### Project Structure

```
LocalLoop/
├── frontend/                   # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # Personalized dashboard
│   │   │   ├── housing/        # Housing discovery & listings
│   │   │   ├── communities/    # Community groups
│   │   │   ├── events/         # Events & meetups
│   │   │   ├── chat/           # Real-time messaging
│   │   │   ├── leaderboard/    # Reputation rankings
│   │   │   ├── profile/        # User profile management
│   │   │   ├── onboarding/     # New user onboarding flow
│   │   │   ├── admin/          # Admin moderation panel
│   │   │   ├── women-only/     # Women mode pages
│   │   │   ├── people/         # User directory
│   │   │   ├── notifications/  # Notification center
│   │   │   ├── login/          # Authentication
│   │   │   └── register/       # User registration
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # Global navigation bar
│   │   │   ├── AuthProvider.tsx# Auth context provider
│   │   │   ├── AIChatbot.tsx   # AI assistant chatbot
│   │   │   ├── HousingMap.tsx  # Interactive map component
│   │   │   └── LayoutShell.tsx # Layout wrapper
│   │   └── lib/                # Utility functions & API client
│   └── public/                 # Static assets
│
├── backend/                    # NestJS 11 Application
│   ├── src/
│   │   ├── auth/               # JWT authentication module
│   │   ├── users/              # User management & profiles
│   │   ├── housing/            # Housing CRUD & search
│   │   ├── communities/        # Community management
│   │   ├── posts/              # Posts & comments
│   │   ├── chat/               # Real-time messaging (WebSocket)
│   │   ├── events/             # Event management
│   │   ├── reputation/         # Reputation & gamification
│   │   ├── admin/              # Admin panel & moderation
│   │   ├── upload/             # Cloudinary image uploads
│   │   ├── ai/                 # AI/LLM integration
│   │   ├── common/             # Guards, filters, pipes
│   │   └── prisma/             # Prisma service module
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (23 models)
│   │   ├── migrations/         # Database migrations
│   │   └── seed.ts             # Database seeding
│
├── ml_service/                 # Machine Learning Service
│   ├── main.py                 # FastAPI endpoints
│   ├── model.py                # Model training logic
│   ├── rent_model.pkl          # Serialized scikit-learn model
│   └── requirements.txt        # Python dependencies
│
└── README.md
```

### System Design

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Housing  │ │Community │ │  Events  │ │  Chat  │ │
│  │ Discovery │ │  Groups  │ │ Meetups  │ │Messager│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────┴─────────────┴────────────┴────────────┴───┐  │
│  │              API Client + Zustand              │  │
│  └────────────────────┬───────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │ REST + WebSocket
┌───────────────────────┼──────────────────────────────┐
│                  Backend (NestJS)                     │
│  ┌────────────────────┴───────────────────────────┐  │
│  │    JWT Auth + XSS Sanitization + RBAC          │  │
│  └────────────────────┬───────────────────────────┘  │
│  ┌──────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐   │
│  │ Auth │ │ Housing │ │Community │ │ Reputation │   │
│  │Module│ │ Module  │ │ Module   │ │  Module    │   │
│  └──┬───┘ └────┬────┘ └────┬─────┘ └──────┬─────┘   │
│     │          │           │               │         │
│  ┌──┴──────────┴───────────┴───────────────┴──────┐  │
│  │           Prisma ORM (Type-Safe Queries)       │  │
│  └────────────────────┬───────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│              PostgreSQL (Supabase)                    │
│  ┌────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐  │
│  │ Users  │ │Housings │ │Communities│ │ Messages │  │
│  │Profiles│ │ Reviews │ │   Posts   │ │  Events  │  │
│  │  Auth  │ │Bookings │ │   Polls   │ │  Reports │  │
│  └────────┘ └─────────┘ └───────────┘ └──────────┘  │
└──────────────────────────────────────────────────────┘
        │ HTTP bridge
┌───────┴──────────────────────────────────────────────┐
│            ML Service (FastAPI)                       │
│  ┌────────────────┐  ┌─────────────────────────────┐ │
│  │ Rent Predictor │  │ RandomForest + scikit-learn │ │
│  │  /predict/rent │  │ Trained on Pune rental data │ │
│  └────────────────┘  └─────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

The database consists of **23 interconnected models** built with Prisma ORM:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▸│  Reputation  │     │MentorProfile │
│              │────▸│              │     │              │
│  • email     │     │  • points    │     │  • expertise │
│  • role      │     │  • level     │     │  • approved  │
│  • gender    │     └──────────────┘     │  • mentees   │
│  • womenMode │                          └──────────────┘
│  • verified  │
│  • ML fields │
└──────┬───────┘
       │
       ├──────────────────┬──────────────────┬─────────────────┐
       ▼                  ▼                  ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│   Housing    │   │  Community   │   │    Event     │  │   Message    │
│              │   │              │   │              │  │              │
│  • title     │   │  • name      │   │  • title     │  │  • content   │
│  • rent      │   │  • type      │   │  • type      │  │  • sender    │
│  • type      │   │  • womenOnly │   │  • date      │  │  • receiver  │
│  • amenities │   │  • members   │   │  • location  │  │  • isRead    │
│  • verified  │   └──────┬───────┘   └──────┬───────┘  └──────────────┘
│  • safetyTag │          │                  │
│  • lat/lng   │          ▼                  ▼
└──────┬───────┘   ┌──────────────┐   ┌──────────────┐
       │           │     Post     │   │EventAttendee │
       ├──▸ Review │  • content   │   └──────────────┘
       ├──▸ Saved  │  • images    │
       ├──▸ Booking│  • likes     │
       └──▸ Views  └──────┬───────┘
                          │
                    ┌─────┴────────┐
                    │   Comment    │
                    └──────────────┘
```

**All 23 Models:** User, Reputation, MentorProfile, Housing, HousingReview, SavedHousing, Community, CommunityMember, CommunityPoll, PollVote, Post, Comment, Message, Notification, Event, EventAttendee, CommunityMessage, HousingBooking, Mentorship, ChatMessage, HousingView, Report, AuditLog

### Key Enums
| Enum | Values |
|:---|:---|
| `UserRole` | Student, Professional, Intern, Admin |
| `HousingType` | PG, Hostel, Flat, Shared Room, Single Room |
| `CommunityType` | University, Professional, Hometown, Newcomer Batch, Women Only, General |
| `EventType` | Meetup, Study Group, Networking, City Exploration, Workshop, Welcome |
| `ReputationLevel` | Explorer → Guide → Settler → City Navigator → Local Mentor |
| `VerificationStatus` | Unverified, Pending, Verified, Rejected |
| `BookingStatus` | Pending, Approved, Rejected, Cancelled |
| `MentorshipStatus` | Pending, Active, Completed, Declined |

---

## 📡 API Modules

The backend exposes RESTful APIs organized into **11 domain modules**:

| Module | Key Endpoints | Description |
|:---|:---|:---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` | JWT-based auth with bcrypt password hashing |
| **Users** | `GET /api/users`, `PATCH /api/users/:id` | Profile management, onboarding, verification |
| **Housing** | `GET /api/housing`, `POST /api/housing` | Housing CRUD with search, filters, bookings |
| **Communities** | `GET /api/communities`, `POST /api/communities/join` | Community management, polls, group chat |
| **Posts** | `GET /api/posts`, `POST /api/posts/:id/comment` | Community posts & threaded comments |
| **Events** | `GET /api/events`, `POST /api/events/:id/attend` | Event management & RSVP tracking |
| **Chat** | WebSocket via Socket.io | Real-time 1-to-1 direct messaging |
| **Reputation** | `GET /api/reputation`, `POST /api/reputation/award` | Points, levels & gamification |
| **Upload** | `POST /api/upload/image` | Cloudinary media pipeline |
| **Admin** | `GET /api/admin/stats`, audit logs | Analytics, moderation, broadcasts |
| **AI** | `GET /api/ml/predict-rent` | ML rent prediction bridge |

> 📝 Full interactive API documentation available via **Swagger UI** at `http://localhost:3001/api/docs` when running locally.

---

## 🔐 Security Implementation

| Layer | Implementation |
|:---|:---|
| **Authentication** | JWT with short-lived tokens via Passport.js |
| **Password Security** | bcrypt hashing with salt rounds |
| **Authorization** | Role-based access control (User / Mentor / Admin) |
| **Input Validation** | class-validator DTOs on every endpoint |
| **XSS Protection** | Global sanitize-html pipe on all inputs |
| **CORS** | Configured frontend-backend origin restrictions |
| **Database Safety** | Prisma-level exception filters, cascade rules |
| **Privacy** | Women Mode with enhanced privacy controls |
| **Audit Trail** | Full administrative action logging |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Python** ≥ 3.9 (for ML service)
- **PostgreSQL** database (or [Supabase](https://supabase.com) account)

### 1. Clone the Repository

```bash
git clone https://github.com/Punya23/Localloop.git
cd Localloop
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your actual credentials (see .env.example for all required variables)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional — adds sample data)
npm run seed

# Start development server
npm run start:dev
```

> 🚀 Backend runs on `http://localhost:3001`
> 📚 Swagger API docs at `http://localhost:3001/api/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

> 🖥️ Frontend runs on `http://localhost:3000`

### 4. ML Service Setup

> ⚠️ **Important:** It is highly recommended to use **Python 3.11** for this microservice. Newer versions (like Python 3.13) do not have pre-built wheels for specific releases of `pandas` and `scikit-learn`, which forces slow, error-prone compilation from source.

```bash
cd ml_service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the ML API
uvicorn main:app --reload --port 8000
```

> 🤖 ML API runs on `http://localhost:8000`
> 📚 ML API docs at `http://localhost:8000/docs`

---

## 📈 Scalability Thinking

### Current State
- Single-city deployment (Pune) with full feature set
- Stateless NestJS services ready for horizontal scaling
- Prisma connection pooling via Supabase
- CDN-delivered media via Cloudinary

### Phase 2 — Multi-City Expansion
- Bangalore, Mumbai, Hyderabad with city-specific data isolation
- City-scoped community and housing modules
- Regional ML models trained on local rental data

### Phase 3 — Platform Growth
- **Mobile app** via React Native (shared component logic)
- **Flatmate compatibility matching** using ML profile vectors
- **Job & internship referral system** within communities
- **Horizontal scaling** — containerized microservices with Kubernetes
- **Caching layer** — Redis for session management and hot data

### Infrastructure Scaling Path
```
Current:  Vercel (Frontend) + Railway (Backend & ML Services) + Supabase (Database)
Phase 2:  + Redis Caching + CDN Edge Caching
Phase 3:  + Kubernetes + Message Queues (RabbitMQ/BullMQ) + Multi-Region DB Replicas
```

---

## ⚡ Production Performance Optimizations

To combat cross-continental network latency between California (Railway host) and Mumbai (Supabase PG host), the following enterprise-grade web performance optimizations were implemented in this production build:

- **Parallelized Query Engine:** Refactored the dashboard API to execute all 11 independent database queries in parallel using `Promise.all()`. This reduced sequential round-trip DB latency from **4.5 seconds to under 800ms** (an **85% speedup**).
- **CORS Preflight OPTIONS Caching:** Configured a CORS `maxAge` of 24 hours (`86400s`) on the NestJS API gateway. This caches cross-origin permissions in the user's browser, eliminating a redundant **400ms preflight OPTIONS round-trip** on every user action.
- **Pure WebSockets (Direct Transports):** Forced Socket.io-client to connect using `transports: ['websocket']` exclusively. This completely bypasses HTTP long-polling handshake overhead, establishing instant, persistent, real-time WebSocket connections.

---

## 🗺️ Roadmap

- [x] Core authentication (Register/Login/JWT)
- [x] User onboarding flow with preferences
- [x] Personalized dashboard
- [x] Housing discovery with filters & reviews
- [x] Housing bookings & saved listings
- [x] Community groups with posts & comments
- [x] Community polls & group chat
- [x] Real-time 1-to-1 messaging (WebSocket)
- [x] Events & meetups management
- [x] Reputation system & leaderboard
- [x] Women Mode safety features
- [x] Mentor profiles & mentorship matching
- [x] AI-powered rent prediction (RandomForest)
- [x] AI Chatbot assistant (LLM integration)
- [x] Admin moderation panel with audit logs
- [x] User verification system
- [x] Notification system
- [x] XSS protection & input sanitization
- [ ] Mobile app (React Native)
- [ ] Flatmate compatibility matching
- [ ] Multi-city expansion
- [ ] Internship & job referral system

---

## 👤 Developer

**Punya Surana**
B.Tech Computer Science Engineering (AI & ML)
Pimpri Chinchwad University
VP, IEEE Student Branch PCU

---

<p align="center">
  <img src="https://img.shields.io/badge/Made_with-❤️-E0234E?style=for-the-badge" alt="Made with love" />
  <img src="https://img.shields.io/badge/Built_at-PCU-8B5CF6?style=for-the-badge" alt="Built at PCU" />
</p>
