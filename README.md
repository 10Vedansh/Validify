# Validify

AI-powered idea validation platform. Submit an idea and get instant scoring, market analysis, and actionable feedback through an AI validation engine.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  TanStack     │     │  Hono API        │     │  Supabase        │
│  Start SSR    │────▶│  (TypeScript)    │────▶│  PostgreSQL      │
│  (Cloudflare  │     │  Railway / Render│     │  (Managed)       │
│   Workers)    │     │  :8080           │     │  :5432           │
└──────────────┘     └──────────────────┘     └──────────────────┘
```

- **Frontend**: `validifyai-main/` — TanStack Start SSR, React 19, Tailwind v4, Radix UI, Zustand
- **Backend**: `backend/` — Hono, Prisma ORM, JWT auth (jose), AI validation (OpenRouter), Zod validation
- **Database**: Supabase PostgreSQL with Prisma migrations and full-text search

## Quick Start

```bash
# Start full stack (PostgreSQL + API + Frontend)
docker compose up --build

# API: http://localhost:8080
# Frontend: http://localhost:3000
# DB: postgresql://postgres:postgres@localhost:5432/validify
```

### Manual (no Docker)

```bash
# Backend
cd backend
cp .env.example .env    # edit DATABASE_URL
npm install
npx prisma migrate dev
npm run dev             # → :8080

# Frontend
cd validifyai-main
cp .env.example .env    # edit VITE_API_URL
npm install
npm run dev             # → :5173
```

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full instructions.

| Target | Service | Method |
|---|---|---|
| Railway | Backend API | Dockerfile |
| Render | Backend API | Dockerfile / Procfile |
| Cloudflare Workers | Frontend SSR | `wrangler deploy` |
| Vercel | Frontend (static) | `vercel deploy` / git push |
| Supabase | PostgreSQL | Managed |

### TL;DR — Deploy Steps

```bash
# 1. Database — Create Supabase project, copy DATABASE_URL
# 2. Backend migrations
cd backend && DATABASE_URL="..." npx prisma migrate deploy

# 3. Backend — Deploy to Railway (connect repo, set env vars)
# 4. Frontend — Deploy to Cloudflare Workers
cd validifyai-main && wrangler deploy
```

## Project Structure

```
validify/
├── backend/                # Hono API server
│   ├── prisma/             # Schema + migrations
│   ├── src/
│   │   ├── auth/           # JWT, middleware, routes
│   │   ├── ideas/          # Idea CRUD + validation
│   │   ├── reports/        # Report generation
│   │   ├── admin/          # Admin endpoints
│   │   ├── chat/           # AI chat
│   │   ├── ai/             # OpenRouter integration
│   │   └── config/         # Environment validation
│   ├── Dockerfile
│   └── Procfile
├── validifyai-main/        # TanStack Start frontend
│   ├── src/
│   │   ├── routes/         # File-based routing
│   │   ├── components/     # React components (shadcn/ui)
│   │   ├── services/       # API client calls
│   │   ├── store/          # Zustand stores
│   │   └── constants/      # Config
│   ├── Dockerfile
│   └── vercel.json
├── docker-compose.yml       # Local full-stack orchestration
├── DEPLOYMENT.md            # Full deployment guide
└── README.md
```
