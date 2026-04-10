<p align="center">
  <img src="https://img.shields.io/badge/LocalLoop-Community%20Platform-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgOWwxMi02IDEyIDYiLz48cGF0aCBkPSJNMyA5djEwYTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMlY5Ii8+PHBhdGggZD0iTTkgMjJWMTJoNnYxMCIvPjwvc3ZnPg==&logoColor=white" alt="LocalLoop Badge" />
</p>

<h1 align="center">🏘️ LocalLoop</h1>

<p align="center">
  <strong>Youth Relocation & Community Infrastructure Platform</strong>
</p>

<p align="center">
  <em>Simplifying city relocation for students & young professionals through housing discovery, community networking, mentorship, and safety-first features.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Socket.io-Real_Time-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-api-modules">API</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🚀 About

**LocalLoop** is a full-stack web platform built to solve the fragmented relocation experience faced by thousands of students and young professionals moving to new cities every year. Instead of juggling WhatsApp groups, unverified broker listings, and scattered social media advice, LocalLoop brings everything under one roof — **verified housing, structured communities, trusted mentors, and city-specific events**.

> 🎯 **Currently focused on Pune** — with plans to expand to Bangalore, Mumbai, Hyderabad, and more.

---

## ✨ Features

### 🏠 Housing Discovery
- Curated PG, hostel, flat, and shared room listings
- **AI Price Predictor:** Real-time ML models predict if rent is overvalued/undervalued.
- **Interactive Maps:** LeafletJS integration seamlessly maps local areas.
- **Rich Media Uploads:** User-driven, optimized high-res property images powered by Cloudinary.
- Advanced filters: budget range, area, gender preference, amenities
- Safety ratings and women-friendly tags
- User reviews & ratings system

### 👥 Community Groups
- **University communities** — connect with students from your college
- **Professional groups** — network with people in your work area
- **Hometown groups** — find people from your city
- **Newcomer batches** — bond with others moving in the same month
- **Women-only spaces** — safe, private communities for female users

### 🏆 Reputation System
Earn points by helping others. Climb the ranks:

| Level | Title | How to Earn |
|:---:|:---|:---|
| 🌱 | Explorer | Sign up & complete onboarding |
| 🧭 | Guide | Answer questions, review housing |
| 🏡 | Settler | Consistent community contributions |
| 🗺️ | City Navigator | Help newcomers, host events |
| 🎓 | Local Mentor | Become an approved mentor |

### 🧑‍🏫 Mentor System
- Experienced residents guide newcomers on housing, areas, career, and city life
- Reputation-gated mentor applications
- Mentor profiles with expertise tags, experience, and community feedback
- Capacity management to prevent burnout

### 🛡️ Women Mode
A dedicated safety layer for female users:
- Women-only community spaces
- Women mentor recommendations
- Safety-tagged housing with verified women-friendly listings
- Enhanced privacy controls

### 💬 Real-Time Chat
- One-to-one messaging with mentors and community members
- WebSocket-powered instant delivery via Socket.io
- Read receipts and message status

### 📅 Events & Meetups
- Welcome meetups, study groups, networking sessions, city explorations
- Community-organized or platform-wide events
- RSVP tracking with attendee management

### 📊 Personalized Dashboard
- Tailored recommendations based on onboarding preferences
- Housing suggestions matched to budget, area, and move-in date
- Community and event recommendations
- City insights and statistics

### 🛠️ Admin & Moderation Panel
- **Analytics & Health:** Centralized dashboard analyzing engagement and usage.
- **Reporting System:** Track user reports and flagged content in real-time.
- **Global Broadcasts:** Push system-wide notifications instantly.
- **Audit Logs:** Full administrative accountability trailing.
- **Verification & Approvals:** Review ID proofs and mentor applications.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|:---|:---|
| **Next.js 16** | React framework with SSR & routing |
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
| **PostgreSQL** (Supabase) | Relational database |
| **Cloudinary** | Fast, optimized image hosting & scaling |
| **Passport + JWT** | Authentication & authorization |
| **Socket.io** | Real-time messaging server |
| **Swagger** | Auto-generated API documentation |
| **class-validator** | DTO validation |

### Machine Learning (ML Service)
| Technology | Purpose |
|:---|:---|
| **Python** | Deep analytics & model training |
| **FastAPI** | High-performance inferencing endpoints |
| **Scikit-Learn** | Predictive rent models and training logic |
| **Pandas / NumPy** | Complex data preprocessing |

---

## 🏗️ Architecture

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
│   │   │   ├── login/          # Authentication
│   │   │   └── register/       # User registration
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # Global navigation bar
│   │   │   └── AuthProvider.tsx# Auth context provider
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
│   │   └── prisma/             # Prisma service module
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (14 models)
│   │   └── migrations/         # Database migrations
│
├── ml_service/                 # Machine Learning & AI
│   ├── main.py                 # FastAPI endpoints
│   ├── model.py                # Model training logic
│   └── rent_model.pkl          # Serialized scikit-learn model
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
│  │         JWT Auth + Passport Middleware          │  │
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
│  └────────┘ └─────────┘ └───────────┘ └──────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
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
# Edit .env with your database credentials:
#   DATABASE_URL="postgresql://user:password@host:5432/localloop"
#   DIRECT_URL="postgresql://user:password@host:5432/localloop"
#   JWT_SECRET="your-secret-key"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run start:dev
```

> Backend runs on `http://localhost:3001` — Swagger docs available at `/api`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

> Frontend runs on `http://localhost:3000`

---

## 🗄️ Database Schema

The database consists of **14 interconnected models** built with Prisma ORM:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▸│  Reputation  │     │MentorProfile │
│              │────▸│              │     │              │
│  • email     │     │  • points    │     │  • expertise │
│  • role      │     │  • level     │     │  • approved  │
│  • gender    │     └──────────────┘     │  • mentees   │
│  • womenMode │                          └──────────────┘
│  • onboarded │
└──────┬───────┘
       │
       ├────────────────────┬──────────────────┬─────────────────┐
       ▼                    ▼                  ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│   Housing    │   │  Community   │   │    Event     │  │   Message    │
│              │   │              │   │              │  │              │
│  • title     │   │  • name      │   │  • title     │  │  • content   │
│  • rent      │   │  • type      │   │  • type      │  │  • sender    │
│  • type      │   │  • womenOnly │   │  • date      │  │  • receiver  │
│  • amenities │   │  • members   │   │  • location  │  │  • isRead    │
│  • verified  │   └──────┬───────┘   └──────┬───────┘  └──────────────┘
│  • safetyTag │          │                  │
└──────┬───────┘          ▼                  ▼
       │           ┌──────────────┐   ┌──────────────┐
       ▼           │     Post     │   │EventAttendee │
┌──────────────┐   │              │   └──────────────┘
│HousingReview │   │  • content   │
│              │   │  • images    │
│  • rating    │   │  • likes     │
│  • review    │   └──────┬───────┘
└──────────────┘          │
                          ▼
                   ┌──────────────┐
                   │   Comment    │
                   │              │
                   │  • content   │
                   └──────────────┘
```

### Key Enums
| Enum | Values |
|:---|:---|
| `UserRole` | Student, Professional, Intern, Admin |
| `HousingType` | PG, Hostel, Flat, Shared Room, Single Room |
| `CommunityType` | University, Professional, Hometown, Newcomer Batch, Women Only, General |
| `EventType` | Meetup, Study Group, Networking, City Exploration, Workshop, Welcome |
| `ReputationLevel` | Explorer → Guide → Settler → City Navigator → Local Mentor |

---

## 📡 API Modules

The backend exposes RESTful APIs organized into domain modules:

| Module | Endpoints | Description |
|:---|:---|:---|
| **Auth** | `POST /auth/register`, `POST /auth/login` | JWT-based authentication with bcrypt password hashing |
| **Users** | `GET /users`, `PATCH /users/:id` | User profile management & onboarding |
| **Housing** | `GET /housing`, `POST /housing`, `GET /housing/:id` | Housing CRUD with search filters |
| **Communities** | `GET /communities`, `POST /communities/join` | Community management & membership |
| **Posts** | `GET /posts`, `POST /posts`, `POST /posts/:id/comment` | Community posts & comments |
| **Events** | `GET /events`, `POST /events`, `POST /events/:id/attend` | Event management & RSVP |
| **Chat** | WebSocket via Socket.io | Real-time direct messaging |
| **Reputation** | `GET /reputation`, `POST /reputation/award` | Points & level management |
| **Upload** | `POST /upload/image`, `POST /upload/images` | Form-data stream directly connected to Cloudinary storage |
| **Admin** | `GET /admin/stats`, `POST /admin/resolve-report` | Platform insights, audit logs, and moderation |
| **AI/ML** | `GET /ml/predict-rent` | FastAPI bridged logic estimating fair market prices |

> 📝 Full API documentation available via **Swagger UI** at `http://localhost:3001/api` when running locally.

---

## 🔐 Security

- **JWT Authentication** with short-lived tokens via Passport.js
- **bcrypt** password hashing with salt rounds
- **Invite-based registration** for community trust
- **Role-based access control** (User, Mentor, Admin)
- **Input validation** via class-validator DTOs
- **Women Mode** with enhanced privacy controls
- **CORS** configuration for frontend-backend security

---

## 🗺️ Roadmap

- [x] Core authentication (Register/Login/JWT)
- [x] User onboarding flow with preferences
- [x] Personalized dashboard
- [x] Housing discovery with filters & reviews
- [x] Community groups with posts & comments
- [x] Real-time chat messaging
- [x] Events & meetups management
- [x] Reputation system & leaderboard
- [x] Women Mode safety features
- [x] Mentor profiles & matching
- [x] AI-powered rent & property prediction algorithm
- [ ] Mobile app (React Native)
- [ ] Flatmate compatibility matching
- [ ] Multi-city expansion
- [ ] Internship & job referral system

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **UNLICENSED** license — it is a private project.

---

## 👤 Author

**Punya Surana**  
B.Tech Computer Science Engineering (AI & ML)  
Pimpri Chinchwad University

<p align="center">
  <img src="https://img.shields.io/badge/Made_with-❤️-E0234E?style=for-the-badge" alt="Made with love" />
  <img src="https://img.shields.io/badge/Built_at-PCU-8B5CF6?style=for-the-badge" alt="Built at PCU" />
</p>

---

<p align="center">
  <sub>⭐ Star this repo if you find it useful!</sub>
</p>
