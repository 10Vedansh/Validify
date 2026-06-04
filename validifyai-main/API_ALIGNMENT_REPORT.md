# API Alignment Report — Frontend ↔ Backend Route Audit

## Root Cause of 404 Errors

**Missing frontend `.env` file.** The frontend had no `VITE_API_URL` configured, causing all API requests to hit the frontend's own origin (e.g., `http://localhost:3000/auth/login`) instead of the backend (e.g., `http://localhost:8080/api/auth/login`). The Vite dev server has no proxy for `/api`, so every request returned 404.

In addition, two secondary mismatches would have caused failures even after fixing the base URL:

1. **`POST /auth/refresh` sent no request body** — Backend requires `{ refreshToken: string }`.
2. **Chat `send()` bypassed Axios interceptor** — Used raw `fetch()` without JWT `Authorization` header.

---

## Endpoint Comparison

### Legend
| Symbol | Meaning |
|---|---|
| ✅ | Aligned — path, method, and shape match |
| ⚠️ | Fixed — mismatch detected and corrected |
| ❌ | Gap — exists on one side but not the other |

---

### Authentication

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 1 | `POST` | `/auth/login` | `POST /api/auth/login` | ✅ |
| 2 | `POST` | `/auth/register` | `POST /api/auth/register` | ✅ |
| 3 | `POST` | `/auth/logout` | `POST /api/auth/logout` | ✅ |
| 4 | `GET` | `/auth/me` | `GET /api/auth/me` | ✅ |
| 5 | `POST` | `/auth/refresh` | `POST /api/auth/refresh` | ⚠️ Fixed |
| 6 | `POST` | `/auth/forgot-password` | `POST /api/auth/forgot-password` | ✅ |

**Fix #5**: Frontend was sending `POST /auth/refresh` with no body. Backend requires `{ refreshToken: "..." }`. Updated `auth.service.ts` to read `refreshToken` from Zustand store and send it in the request body. Also updated `auth.store.ts` to persist `refreshToken` alongside `user` and `token` so it survives page reloads.

---

### Ideas

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 7 | `GET` | `/ideas` | `GET /api/ideas` | ✅ |
| 8 | `POST` | `/ideas` | `POST /api/ideas` | ✅ |
| 9 | `POST` | `/ideas/:id/validate` | `POST /api/ideas/:id/validate` | ✅ |

---

### Reports

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 10 | `GET` | `/reports` | `GET /api/reports` | ✅ |
| 11 | `GET` | `/reports/:id` | `GET /api/reports/:id` | ✅ |
| 12 | `GET` | `/reports/:id/export.pdf` | `GET /api/reports/:id/export.pdf` | ✅ |
| 13 | `DELETE` | — | `DELETE /api/reports/:id` | ❌ FE does not expose delete |
| 14 | `POST` | — | `POST /api/reports/generate` | ❌ FE uses `/ideas/:id/validate` instead |

---

### Chat

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 15 | `GET` | `/chat/threads` | `GET /api/chat/threads` | ✅ |
| 16 | `POST` | — | `POST /api/chat/threads` | ❌ FE does not expose create thread |
| 17 | `GET` | `/chat/threads/:id/messages` | `GET /api/chat/threads/:id/messages` | ✅ |
| 18 | `POST` | `/chat/threads/:id/messages` | `POST /api/chat/threads/:id/messages` | ⚠️ Fixed |

**Fix #18**: Frontend `chat.service.ts` `send()` used raw `fetch()` which bypassed the Axios JWT interceptor. The backend's `requireAuth` middleware rejects requests without a valid `Authorization: Bearer <token>` header. Updated to read the token from Zustand store and attach it as a header.

---

### User Profile

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 19 | `PATCH` | `/me` | `PATCH /api/me` | ✅ |

---

### Validations

| # | Method | Frontend Call | Backend Route | Status |
|---|---|---|---|---|
| 20 | `GET` | — | `GET /api/validations/:id` | ❌ FE does not call status endpoint |

---

## Response Shape Alignment

| Entity | Frontend Type | Backend Type | Match |
|---|---|---|---|
| `User` | `{ id, email, name, avatarUrl?, plan, createdAt }` | `{ id, email, name, avatarUrl, isAdmin, plan, createdAt }` | ✅ Extra `isAdmin` field ignored at runtime |
| `AuthSession` | `{ user, token, refreshToken?, expiresAt? }` | `{ user, token, refreshToken?, expiresAt? }` | ✅ |
| `Idea` | `{ id, name, industry, problem, audience, businessModel, ... }` | `{ id, name, industry, problem, audience, businessModel, ... }` | ✅ |
| `IdeaDraft` | `Omit<Idea, id, createdAt, updatedAt>` | `CreateIdeaInput` (Zod schema) | ✅ |
| `Validation` | `{ id, ideaId, score, status, createdAt }` | `{ id, ideaId, score, status, createdAt }` | ✅ |
| `Report` | `{ id, ideaId, title, summary, industry, score, swot, ... }` | `ReportResponse` serialized from Prisma | ✅ |
| `ChatThread` | `{ id, title, updatedAt, messages? }` | `{ id, title, updatedAt }` | ✅ |
| `ChatMessage` | `{ id, role, content, createdAt }` | `{ id, role, content, createdAt }` | ✅ |

---

## Files Modified

| File | Change |
|---|---|
| `.env` (new) | Added `VITE_API_URL=http://localhost:8080/api` |
| `src/store/auth.store.ts` | Added `refreshToken` to persisted state; `setSession` stores it; `partialize` includes it |
| `src/services/auth.service.ts` | `refresh()` now sends `{ refreshToken: store.refreshToken }` in request body |
| `src/services/chat.service.ts` | `send()` now reads token from Zustand store and includes `Authorization: Bearer <token>` header in fetch call; added error handling for non-ok responses |
| `src/hooks/useAuth.ts` | `setRefreshTokenFn` now calls `setSession(session)` to also store new refresh token (not just access token) |
| `src/providers/AuthProvider.tsx` | Removed duplicate `setOnUnauthorized` wiring (handled by `useAuth`) |

---

## Flow Verification

| Flow | Frontend Action | Backend Route | Expected Outcome |
|---|---|---|---|
| **Register** | `authService.register({ name, email, password })` | `POST /api/auth/register` | Returns `AuthSession` → stored in Zustand → redirected to `/dashboard` |
| **Login** | `authService.login({ email, password })` | `POST /api/auth/login` | Returns `AuthSession` → stored in Zustand → redirected to `/dashboard` |
| **Logout** | `authService.logout()` | `POST /api/auth/logout` | Increments tokenVersion → auth cleared → redirected to `/login` |
| **Current User** | `authService.me()` | `GET /api/auth/me` | Returns `User` → stored in Zustand |
| **Create Idea** | `ideasService.create(draft)` | `POST /api/ideas` | Returns `Idea` (201) |
| **Validate Idea** | `ideasService.validate(ideaId)` | `POST /api/ideas/:id/validate` | Runs AI → returns `Validation` with score (201) |
| **List Reports** | `reportsService.list()` | `GET /api/reports` | Returns `Report[]` |
| **Chat Threads** | `chatService.threads()` | `GET /api/chat/threads` | Returns `ChatThread[]` |
| **Send Chat** | `chatService.send(threadId, content)` | `POST /api/chat/threads/:id/messages` | Returns `ChatMessage` (201) |
| **Update Profile** | `userService.update(patch)` | `PATCH /api/me` | Returns updated `User` |
| **Token Refresh** | Axios 401 interceptor → `authService.refresh()` | `POST /api/auth/refresh` | Returns new `AuthSession` → retries original request |

---

## Remaining Gaps

| Gap | Impact | Notes |
|---|---|---|
| `DELETE /reports/:id` | Low | Frontend has no delete button; backend supports it |
| `POST /api/chat/threads` | Low | Frontend co-founder page shows "New chat" button but doesn't call the API to create a thread |
| `GET /api/validations/:id` | Low | Frontend calls validate as synchronous; no status polling needed currently |
| Backend returns `isAdmin` field | None | Extra field silently ignored by frontend |
| Frontend `RegisterPayload` vs backend `registerSchema` | Low | Both use `{ name, email, password }` — aligned |
