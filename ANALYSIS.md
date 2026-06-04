# Validify — Frontend Codebase Analysis

## 1. Project Overview

**Validify** is an AI-powered startup validation platform that helps founders stress-test business ideas by generating investor-grade analyses (SWOT, market sizing, competitor benchmarks, investor readiness scores), producing pitch decks, and providing a conversational AI "co-founder" assistant.

| Aspect | Details |
|---|---|
| **Framework** | TanStack Start (React 19 meta-framework with SSR via Cloudflare Workers) |
| **Bundler** | Vite 7 (via `@lovable.dev/vite-tanstack-config`) |
| **Routing** | TanStack Router v1 (file-based, type-safe) |
| **State Mgmt** | Zustand v5 (with `persist` middleware) |
| **Server State** | TanStack React Query v5 |
| **Forms** | React Hook Form v7 + Zod v3 |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **UI Library** | shadcn/ui (Radix UI, New York style) |
| **Charts** | Recharts v2 |
| **HTTP Client** | Axios v1 |
| **Animations** | Framer Motion v12 |
| **Package Mgr** | Bun |
| **Deploy Target** | Cloudflare Workers |

---

## 2. Route Map

```
__root__                     (Root shell: AppProviders, errorComponent, notFoundComponent, dark mode <html>)
│
├── /                         → Landing page (Hero, Features, Testimonials, Pricing, FAQ, CTA, Footer)
├── /login                    → Login (email + password, OAuth scaffolding, forgot password link)
├── /register                 → Registration (name + email + password, OAuth scaffolding)
├── /forgot-password          → Password reset (email only)
│
└── /dashboard                (Layout: sidebar + topbar + <Outlet>)
    ├── /dashboard/           → Dashboard overview (stat cards, area chart, pie chart, recent validations, AI recommendations)
    ├── /dashboard/validate   → Idea validation form (name, industry, problem, audience, business model, budget, country, competitor links, notes, file upload)
    ├── /dashboard/reports    → Investor report viewer (exec summary, radar chart, SWOT, competitor bar chart, roadmap, accordion sections)
    ├── /dashboard/cofounder  → AI co-founder chat (chat sidebar, message list, typing indicator, suggested prompts, file attach)
    ├── /dashboard/pitch      → Pitch deck gallery (grid of generated decks, export/share per deck)
    ├── /dashboard/trends     → Market trends (stat cards, line chart, bar chart, activity heatmap, investor interest area chart)
    └── /dashboard/settings   → Settings (profile, billing/subscription, API keys, theme, notifications, security/2FA tabs)
```

**Important:** There are currently **no authentication guards** on the dashboard routes. All dashboard pages are publicly accessible. The `plan.md` mentions adding an `_authenticated.tsx` layout route with `beforeLoad` redirect, but this is not implemented.

---

## 3. Component Hierarchy

```
<RootShell>                          (html.dark shell with HeadContent + Scripts)
  <AppProviders>                      (QueryClientProvider + AuthProvider + Toaster)
    <Outlet />                        (route content)

    ├── Landing (/)                  <LandingNav /> <Hero /> <Trusted /> <Features />
    │                                <DashboardPreview /> <Testimonials /> <Pricing />
    │                                <FAQ /> <CTA /> <Footer />
    │
    ├── Login (/login)               <AuthLayout> <form> <OAuthRow /> <Field> <PasswordInput />
    │                                    <Input> <SubmitButton />
    │
    ├── Register (/register)          <AuthLayout> <form> <OAuthRow /> <Field> <PasswordInput />
    │                                    <Input> <SubmitButton />
    │
    ├── Forgot Password               <AuthLayout> <form> <Field> <Input> <SubmitButton />
    │
    └── Dashboard Layout             <DashboardSidebar /> <Topbar /> <Outlet />
         │
         ├── Home                    <StatCard /> × 4, <AreaChart />, <PieChart />, validation list, AI recommendations
         ├── Validate                <form> with <Input>, <Textarea>, <Select>, file upload, live score preview
         ├── Reports                 <RadarChart />, <BarChart />, SWOT cards, roadmap timeline, <Accordion>
         ├── Co-founder              Chat message list, typing indicator, suggested prompts, <Input> + send
         ├── Pitch Decks             Deck cards grid with export/share buttons
         ├── Trends                  <LineChart />, <BarChart />, <AreaChart />, heatmap grid
         └── Settings                <Tabs> with profile, billing, API keys, theme, notifications, security
```

### Component Folders

| Folder | Contents |
|---|---|
| `src/components/ui/` | 40+ shadcn/ui components (button, card, dialog, select, input, tabs, accordion, etc.) |
| `src/components/common/` | PageHeader, SectionHeader, EmptyState, ErrorState, LoadingScreen, SearchBar, Skeletons |
| `src/components/auth/` | AuthLayout (two-pane form + quote), AuthPrimitives (OAuthRow, PasswordInput, SubmitButton, Field) |
| `src/components/dashboard/` | Sidebar, Topbar, StatCard |
| `src/components/landing/` | LandingNav, Hero, Features, Trusted, DashboardPreview, Testimonials, Pricing, FAQ, CTA, Footer |
| `src/components/charts/` | AreaChart, BarChart, PieChart, RadarChart (wrapper components with shared theme tokens) |

---

## 4. API Endpoints Expected by Frontend

All endpoints are defined in the service files. Currently, all services use a **mock-first pattern**: if `VITE_API_URL` is not set, they return mock data; when set, they call the real API.

### Auth (`src/services/auth.service.ts`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `AuthSession { user, token, refreshToken?, expiresAt? }` |
| POST | `/auth/register` | `{ name, email, password }` | `AuthSession { user, token, refreshToken?, expiresAt? }` |
| POST | `/auth/logout` | — | void |
| GET | `/auth/me` | — | `User { id, email, name, avatarUrl?, plan, createdAt }` |
| POST | `/auth/forgot-password` | `{ email }` | void |

### Ideas (`src/services/ideas.service.ts`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/ideas` | — | `Idea[]` |
| POST | `/ideas` | `IdeaDraft` | `Idea { id, name, industry, problem, audience, businessModel, ... }` |
| POST | `/ideas/:id/validate` | — | `Validation { id, ideaId, score, status, createdAt }` |

### Reports (`src/services/reports.service.ts`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/reports` | — | `Report[]` |
| GET | `/reports/:id` | — | `Report { id, ideaId, title, summary, industry, score, swot, competitors, roadmap }` |
| GET | `/reports/:id/export.pdf` | — | Blob (PDF) |

### Chat (`src/services/chat.service.ts`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/chat/threads` | — | `ChatThread[]` |
| GET | `/chat/threads/:id/messages` | — | `ChatMessage[]` |
| POST | `/chat/threads/:id/messages` | `{ content }` | **Streaming**: ReadableStream of text chunks |

### User (`src/services/user.service.ts`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| PATCH | `/me` | `{ name?, avatarUrl? }` | `User` |

### API Client Configuration

- Base URL: `VITE_API_URL` env var (falls back to `/api`)
- Auth: Bearer token via `Authorization` header (injected by interceptor)
- 401 responses auto-clear the auth session
- Timeout: 20s
- `withCredentials: true`

---

## 5. Missing Backend Requirements

1. **No authentication implementation exists** — the frontend expects `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password` endpoints. All currently return mock data.

2. **No CRUD for ideas** — the frontend expects `GET /ideas`, `POST /ideas`, and `POST /ideas/:id/validate`. No validation engine exists.

3. **No report generation engine** — the frontend expects `GET /reports`, `GET /reports/:id`, and `GET /reports/:id/export.pdf`. Reports include SWOT analysis, competitor benchmarks, roadmaps, and validation scores that need to be generated by AI/algorithm.

4. **No chat backend** — the frontend expects `GET /chat/threads`, `GET /chat/threads/:id/messages`, and a streaming `POST /chat/threads/:id/messages` endpoint that returns SSE or chunked response.

5. **No user profile update** — the frontend expects `PATCH /me`.

6. **No file upload endpoint** — the validate page has a file upload UI element but no corresponding API endpoint (`POST /upload` or similar) is defined.

7. **No PDF/PowerPoint export service** — the reports page has export buttons that call `/reports/:id/export.pdf` but no actual generation service.

8. **Auth guard not implemented** — `_authenticated.tsx` layout with `beforeLoad` redirect mentioned in the plan is not yet created. Dashboard routes are publicly accessible.

9. **OAuth is scaffolding only** — Google and GitHub OAuth buttons exist but have no real integration.

---

## 6. Potential Issues Found

1. **`dashboard.validate.tsx` uses uncontrolled inputs** — The form uses raw `useState` for a few fields (name, problem) while other fields (industry, business model, audience, budget, etc.) are uncontrolled `<Select>` and `<Input>` components without state management or React Hook Form integration. The form logic (`onSubmit`) is hand-rolled, not using RHF.

2. **Validate page form is not connected to the service layer** — It uses `setTimeout` to simulate validation instead of calling `ideasService.create()` and `ideasService.validate()`.

3. **Settings page has no functionality** — All settings form inputs (profile, security, billing, API keys, notifications, theme) are static UI with no state management or API integration.

4. **`dashboard.cofounder.tsx` chat uses `setTimeout`** — Instead of using the `chatService.send()` AsyncGenerator, the chat page uses a hard-coded timeout with a static response. The streaming-capable service exists but is unused.

5. **`dashboard.reports.tsx` uses hard-coded mock data** — The report page renders static `radar` and `comp` arrays and uses `swot` from mock data instead of fetching real data from `reportsService`.

6. **`dashboard.index.tsx` uses static mock data** — All dashboard stats (total ideas, avg score, etc.), trend data, validations list, and recommendations are hard-coded from `src/lib/mock.ts`.

7. **No `VITE_API_URL` in `bunfig.toml` scope** — If a `.env` file is added with `VITE_API_URL`, the mock layer will be bypassed and the app will make real API calls that will 404 without a backend.

8. **No loading/error states on dashboard routes** — With mock data there's no need, but when connected to a real API, most pages will lack loading skeletons and error boundaries for their data fetches.

9. **`dashboard.pitch.tsx` has no service layer** — There's no `pitch.service.ts` in the services folder, even though pitch decks are a core feature.

10. **`__root.tsx` hardcodes `<html className="dark">`** — The theme store exists but is not used to control the dark mode class on the root element.

---

## 7. Database Entities Required

Based on the TypeScript types and API contracts, the backend needs the following entities:

### Users
```
User {
  id: string (UUID)
  email: string (unique)
  name: string
  avatarUrl?: string
  plan: "free" | "pro" | "enterprise"
  createdAt: timestamp
  updatedAt: timestamp
  passwordHash: string
}
```

### Auth Sessions
```
AuthSession {
  user: User (relation)
  token: string (JWT)
  refreshToken?: string
  expiresAt?: timestamp
}
```

### Ideas
```
Idea {
  id: string (UUID)
  userId: string (FK → User)
  name: string
  industry: "AI / ML" | "Fintech" | "Healthtech" | "Climate" | "DevTools" | "Consumer" | "Productivity"
  problem: string
  audience: string
  businessModel: "SaaS" | "Marketplace" | "Transactional" | "Usage-based" | "Freemium"
  budget?: string
  country?: string
  competitors?: string[] (JSON array)
  notes?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Validations
```
Validation {
  id: string (UUID)
  ideaId: string (FK → Idea)
  userId: string (FK → User)
  score: {
    overall: number (0-100)
    market: number (0-100)
    team: number (0-100)
    moat: number (0-100)
    monetization: number (0-100)
    traction: number (0-100)
    risk: number (0-100)
  } (JSON)
  status: "draft" | "running" | "complete" | "failed"
  createdAt: timestamp
}
```

### Reports
```
Report {
  id: string (UUID)
  ideaId: string (FK → Idea)
  validationId: string (FK → Validation)
  userId: string (FK → User)
  title: string
  summary: string
  industry: string
  score: ValidationScore (JSON)
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  } (JSON)
  competitors: { name: string, score: number, url?: string }[] (JSON)
  roadmap: { quarter: string, label: string }[] (JSON)
  createdAt: timestamp
}
```

### Chat Threads
```
ChatThread {
  id: string (UUID)
  userId: string (FK → User)
  ideaId?: string (FK → Idea, nullable)
  title: string
  updatedAt: timestamp
  createdAt: timestamp
}
```

### Chat Messages
```
ChatMessage {
  id: string (UUID)
  threadId: string (FK → ChatThread)
  role: "user" | "assistant" | "system"
  content: string
  createdAt: timestamp
}
```

### Pitch Decks (not implemented in services but expected by the UI)
```
PitchDeck {
  id: string (UUID)
  ideaId: string (FK → Idea)
  userId: string (FK → User)
  name: string
  slideCount: number
  fileUrl?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### API Keys (for settings page)
```
ApiKey {
  id: string (UUID)
  userId: string (FK → User)
  name: string
  key: string (prefixed, partial display)
  createdAt: timestamp
}
```

---

## 8. Authentication Requirements

### Flow
1. **Login**: User submits email + password → `POST /auth/login` → returns `AuthSession { user, token }` → stored in Zustand (persisted to localStorage under `validify.auth`) → redirect to `/dashboard`
2. **Register**: User submits name + email + password → `POST /auth/register` → returns `AuthSession` → same flow as login
3. **Logout**: `POST /auth/logout` → clear Zustand store → redirect to `/login`
4. **Forgot Password**: User submits email → `POST /auth/forgot-password` → toast "Check your inbox"
5. **Session Recovery**: On page load, Zustand persist middleware rehydrates `user` and `token` from localStorage
6. **401 Handling**: Axios interceptor catches 401 responses → auto-clears auth store → effectively logs the user out

### What the backend must provide
- JWT-based authentication
- A token endpoint that returns `{ user, token }`
- A protected `/auth/me` endpoint that validates the token and returns the current user
- Password hashing (bcrypt or similar)
- (Optional) Refresh token rotation
- (Optional) Password reset via email

### Security Considerations
- Tokens are stored in localStorage (XSS-vulnerable)
- No CSRF protection needed with JWT bearer pattern
- No rate limiting on auth endpoints currently

---

## 9. External Integrations Needed

1. **AI/LLM Service** — Core to the product:
   - Generate SWOT analysis from idea descriptions
   - Calculate validation scores across 7 dimensions
   - Generate competitor analysis and benchmarking
   - Generate pitch deck content and structure
   - Power the AI co-founder chat (streaming responses)
   - Generate market trend analysis and recommendations

2. **Email Service** — Password reset flow needs transactional email sending

3. **PDF Generation Service** — Export reports as PDF (`/reports/:id/export.pdf`)

4. **File Storage Service** — Uploaded files (pitch decks, research, interviews) via the validate page

5. **OAuth Providers** — Google and GitHub OAuth for social login (buttons exist but are not wired)

6. **Payment/Billing Service** — Subscription management (Free / Pro $29/mo / Enterprise custom), usage tracking (validations count, AI tokens, deck exports) on the settings billing tab

7. **Market Data API** — For the trends page: real market data, funding rounds, industry signals (currently uses mock data)

8. **(Optional) Analytics** — Product analytics (not currently wired but typical for SaaS)

---

## Environment Configuration

```env
VITE_API_URL=http://localhost:8080/api   # Backend API base URL
VITE_APP_NAME=Validify                    # App display name
```

The `config.ts` constants:
```typescript
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Validify";
export const API_URL = import.meta.env.VITE_API_URL ?? "/api";  // falls back to same-origin /api
export const AUTH_STORAGE_KEY = "validify.auth";   // localStorage key for auth
export const THEME_STORAGE_KEY = "validify.theme"; // localStorage key for theme
```
