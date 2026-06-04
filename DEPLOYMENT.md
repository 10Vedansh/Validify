# Validify — Deployment Guide

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Cloudflare   │     │    Railway /     │     │    Supabase      │
│  Workers /    │────▶│    Render        │────▶│    PostgreSQL    │
│  Vercel       │     │  (Hono API)      │     │  (Database)      │
│  (Frontend)   │     │  :8080           │     │  :5432           │
└──────────────┘     └──────────────────┘     └──────────────────┘
```

- **Frontend**: TanStack Start SSR → Cloudflare Workers (recommended) or Vercel
- **Backend**: Hono API (TypeScript) → Railway or Render via Docker
- **Database**: Supabase PostgreSQL (managed)

---

## Prerequisites

| Tool     | Version      | Purpose                     |
|----------|-------------|------------------------------|
| Node.js  | >= 22       | Runtime                      |
| Docker   | >= 24       | Containerized deployment     |
| wrangler | >= 3        | Cloudflare Workers deploy    |
| npm      | >= 10       | Package management           |

---

## 1. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | Yes | Runtime mode | `production` |
| `PORT` | No | API port (default 8080) | `8080` |
| `LOG_LEVEL` | No | Logging verbosity | `info` |
| `FRONTEND_URL` | Yes | CORS origin — deployed frontend URL | `https://validify.vercel.app` |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string | `postgresql://postgres:...@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Yes | Direct DB connection (bypasses pooler) | `postgresql://postgres:...@aws-0-us-west-1.pooler.supabase.com:5432/postgres` |
| `JWT_ACCESS_SECRET` | Yes | Strong random 64+ chars | `openssl rand -base64 64 \| tr -d '\n'` |
| `JWT_REFRESH_SECRET` | Yes | Different from access secret | `openssl rand -base64 64 \| tr -d '\n'` |
| `JWT_ACCESS_EXPIRY` | No | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | No | Refresh token TTL | `7d` |
| `OPENROUTER_API_KEY` | Yes | API key from openrouter.ai | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | No | Primary AI model | `openai/gpt-4o` |
| `OPENROUTER_FALLBACK_MODEL` | No | Fallback model | `anthropic/claude-3.5-sonnet` |

### Frontend (`validifyai-main/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL | `https://validify-api.railway.app/api` |
| `VITE_APP_NAME` | No | App display name | `Validify` |

---

## 2. Database — Supabase

### Setup

1. Create a Supabase project at https://supabase.com
2. Go to **Project Settings → Database → Connection string**
3. Copy the **URI** (pooled) and **Direct connection** strings

### Run Migrations

```bash
# Set DATABASE_URL to your Supabase connection string
cd backend
npx prisma migrate deploy
```

### Seed (Optional)

```bash
npx tsx prisma/seed.ts
```

> **Note**: In production, migrations run automatically on container start (see Dockerfile).

---

## 3. Backend — Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Manual Steps

1. **Create a new Railway project** from your GitHub repo
2. **Set the root directory** to `backend/`
3. **Add environment variables** (see section 1 above)
4. **Deploy** — Railway detects the `Dockerfile` automatically

### Railway-Specific Config

| Setting | Value |
|---|---|
| Build Command | (uses Dockerfile) |
| Start Command | (uses Dockerfile CMD) |
| Health Check Path | `/health` |
| Health Check Interval | 30s |

### Required Environment Variables

```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_ACCESS_SECRET=<random-64-chars>
JWT_REFRESH_SECRET=<random-64-chars>
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## 4. Backend — Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Steps

1. **Create a new Web Service** in Render Dashboard
2. **Connect your GitHub repo**
3. **Settings**:

| Setting | Value |
|---|---|
| Name | `validify-api` |
| Region | Choose closest |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | **Docker** |
| Health Check Path | `/health` |

4. **Add environment variables** (see section 1)
5. **Deploy**

---

## 5. Frontend — Vercel

### Prerequisites

- Install Vercel CLI: `npm i -g vercel`
- Or connect via GitHub in the Vercel dashboard

### Steps

```bash
cd validifyai-main

# Install dependencies
npm ci

# Build
npm run build

# Deploy
vercel --prod
```

### Vercel Dashboard Config

| Setting | Value |
|---|---|
| Framework Preset | **Other** (or Vite) |
| Root Directory | `validifyai-main` |
| Build Command | `npm run build` |
| Output Directory | `dist/client` |
| Install Command | `npm ci` |

### Environment Variables (Vercel Dashboard)

```env
VITE_API_URL=https://validify-api.railway.app/api
VITE_APP_NAME=Validify
```

> **Note**: The frontend is designed as a Cloudflare Workers SSR app. For Vercel deployment, it runs as a static SPA (no server-side rendering). For full SSR, deploy to Cloudflare Workers (see section 6).

---

## 6. Frontend — Cloudflare Workers (SSR — Recommended)

### Prerequisites

- Install Wrangler CLI: `npm i -g wrangler`
- Log in: `wrangler login`

### Steps

```bash
cd validifyai-main

# Build for Cloudflare Workers
npm run build

# Deploy
wrangler deploy
```

### Secrets (Cloudflare Dashboard or CLI)

```bash
echo "https://validify-api.railway.app/api" | wrangler secret put VITE_API_URL
echo "Validify" | wrangler secret put VITE_APP_NAME
```

---

## 7. Docker — Local Development

### Full Stack (Recommended)

```bash
# From project root
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- Backend API on `localhost:8080`
- Frontend on `localhost:3000`

### Individual Services

```bash
# Backend only
docker compose up api

# Database only
docker compose up postgres
```

### Health Checks

| Service | Endpoint |
|---|---|
| Backend | `GET /health` → `{"status":"ok",...}` |
| Database | PostgreSQL `pg_isready` |

---

## 8. Docker Image Builds (Manual)

### Backend

```bash
cd backend
docker build -t validify-api:latest .
docker run -p 8080:8080 --env-file .env validify-api:latest
```

### Frontend

```bash
cd validifyai-main
docker build -t validify-frontend:latest .
docker run -p 3000:80 -e VITE_API_URL=http://localhost:8080/api validify-frontend:latest
```

---

## 9. Production Checklist

- [ ] **JWT Secrets**: Generated via `openssl rand -base64 64 | tr -d '\n'`
- [ ] **DATABASE_URL**: Uses Supabase pooling URL (`?pgbouncer=true`)
- [ ] **DIRECT_URL**: Direct connection (no pooler) for migrations
- [ ] **FRONTEND_URL**: Exact URL of deployed frontend
- [ ] **OPENROUTER_API_KEY**: Valid key from openrouter.ai
- [ ] **CORS**: Backend allows only the deployed frontend origin
- [ ] **Rate Limiting**: Auth (20/15min), API (100/min)
- [ ] **Logging**: Pino structured JSON logs
- [ ] **Health Check**: Backend exposes `/health`
- [ ] **Migrations**: Run automatically on startup or manually via `prisma migrate deploy`
- [ ] **Secrets Rotation**: Schedule periodic rotation of JWT secrets

---

## 10. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| API returns 401 | Wrong/no JWT secret | Check `JWT_ACCESS_SECRET` |
| API returns 502 | OpenRouter unreachable | Check `OPENROUTER_API_KEY` |
| Prisma "relation does not exist" | Migrations not run | Run `npx prisma migrate deploy` |
| CORS errors in browser | `FRONTEND_URL` doesn't match | Set exact frontend domain |
| Frontend can't reach API | `VITE_API_URL` incorrect | Verify backend URL |
| Docker build fails | Missing `package-lock.json` | Run `npm install` locally first |
| Images load slowly at edge | CSP blocking external CDN | Check `Content-Security-Policy` headers |

---

## 11. CI/CD (GitHub Actions)

Minimal CI pipeline reference (create `.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: npx railway up --service validify-api

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy
        working-directory: validifyai-main
```
