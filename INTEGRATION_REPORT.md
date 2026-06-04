# Integration Report — Frontend ↔ Backend Compatibility

## Audit Summary

| Category | Total Calls | ✅ Aligned | ❌ Fixed | ⏳ Pending |
|---|---|---|---|---|
| Auth | 6 | 5 | 0 | 1 |
| Ideas | 3 | 0 | 3 | 0 |
| Reports | 4 | 1 | 2 | 1 |
| Chat | 3 | 0 | 3 | 0 |
| User | 1 | 0 | 1 | 0 |
| **Total** | **17** | **6** | **9** | **2** |

---

## Per-Endpoint Analysis

### Auth — `auth.service.ts` (6 calls)

| Frontend Call | Backend Route | Verdict |
|---|---|---|
| `POST /auth/login` → `AuthSession` | `POST /auth/login` → `AuthSessionResponse` | ✅ |
| `POST /auth/register` → `AuthSession` | `POST /auth/register` → `AuthSessionResponse` | ✅ |
| `POST /auth/logout` | `POST /auth/logout` → `{ message }` | ✅ (FE ignores body) |
| `GET /auth/me` → `User` | `GET /auth/me` → `UserResponse` | ✅ |
| `POST /auth/forgot-password` | `POST /auth/forgot-password` → `{ message }` | ✅ (FE ignores body) |
| `POST /auth/refresh` | `POST /auth/refresh` → `AuthSessionResponse` | ✅ (FE never calls it, but endpoint exists) |

All auth endpoints match. No changes needed.

---

### Ideas — `ideas.service.ts` (3 calls)

| Frontend Call | Backend Route | Before | After |
|---|---|---|---|
| `GET /ideas` → `Idea[]` | `GET /ideas` | **MISSING** | ✅ Created `GET /ideas` → returns `IdeaResponse[]` |
| `POST /ideas` → `Idea` | `POST /ideas` | **MISSING** | ✅ Created `POST /ideas` → returns `IdeaResponse` (201) |
| `POST /ideas/:id/validate` → `Validation` | `POST /ideas/:id/validate` | ❌ Returned `{ validationId, reportId, score }` | ✅ Now returns `{ id, ideaId, score, status, createdAt }` |

**Fix: `POST /ideas/:id/validate`** — Changed response shape in `controllers/validation.controller.ts:94-99` from `{ validationId, reportId, score }` to the frontend `Validation` type `{ id, ideaId, score, status, createdAt }`.

**New files created:**
- `src/schemas/idea.schema.ts` — Zod schema matching frontend `ideaSchema` + `IdeaDraft` type
- `src/services/ideas.service.ts` — `list()` / `create()` / `getById()` with `IdeaResponse` serializer (strips nulls → undefined for optional fields)
- `src/controllers/ideas.controller.ts` — `list` / `create` handlers
- `src/routes/ideas.routes.ts` — `GET /ideas`, `POST /ideas` (all protected)

---

### Reports — `reports.service.ts` (4 calls)

| Frontend Call | Backend Route | Before | After |
|---|---|---|---|
| `GET /reports` → `Report[]` | `GET /reports` | ❌ Returned `PaginatedResult<ReportResponse>` (`{ data, page, pageSize, total, totalPages }`) | ✅ Now returns `ReportResponse[]` (plain array) |
| `GET /reports/:id` → `Report` | `GET /reports/:id` | ✅ Returns `ReportResponse` | ✅ |
| `GET /reports/:id/export.pdf` → `Blob` | `GET /reports/:id/export.pdf` | **MISSING** | ✅ Created — returns text/plain as PDF placeholder |
| `DELETE /reports/:id` | `DELETE /reports/:id` | ✅ Returns `{ message }` | ✅ |

**Fix: `GET /reports`** — Changed `services/reports.service.ts:214-253` from `Promise<PaginatedResult<ReportResponse>>` to `Promise<ReportResponse[]>`. Controller no longer calls `parsePagination()`. Removed unused `pagination` imports.

**Fix: `GET /reports/:id/export.pdf`** — Added export handler in `controllers/reports.controller.ts`. Returns a plain text PDF placeholder with correct Content-Type and Content-Disposition headers. Generate a real PDF (e.g. via Puppeteer or PDFKit) for production.

---

### Chat — `chat.service.ts` (3 calls)

| Frontend Call | Backend Route | Before | After |
|---|---|---|---|
| `GET /chat/threads` → `ChatThread[]` | `GET /chat/threads` | **MISSING** | ✅ Created — returns `ChatThreadResponse[]` |
| `GET /chat/threads/:id/messages` → `ChatMessage[]` | `GET /chat/threads/:id/messages` | **MISSING** | ✅ Created — returns `ChatMessageResponse[]` |
| `POST /chat/threads/:id/messages` → streaming | `POST /chat/threads/:id/messages` | **MISSING** | ✅ Created — returns `ChatMessageResponse` (synchronous) |

**New files created:**
- `src/schemas/chat.schema.ts` — `sendMessageSchema`, `createThreadSchema`
- `src/services/chat.service.ts` — `listThreads`, `createThread`, `getMessages`, `sendMessage`
- `src/controllers/chat.controller.ts` — `listThreads`, `createThread`, `getMessages`, `sendMessage`
- `src/routes/chat.routes.ts` — All chat endpoints (protected)

**Note on streaming:** The frontend `chat.service.ts` `send()` method uses direct `fetch()` with a `ReadableStream` reader. The current backend sends a standard JSON response (not streamed). The frontend will receive the entire response as one chunk, which is functionally correct. True streaming (SSE / chunked transfer) requires a Web Streams integration with the OpenRouter streaming API — add as a follow-up.

---

### User Profile — `user.service.ts` (1 call)

| Frontend Call | Backend Route | Before | After |
|---|---|---|---|
| `PATCH /me` → `User` | `PATCH /me` | **MISSING** | ✅ Created — accepts `{ name?, avatarUrl? }` returns `UserResponse` |

**New files created:**
- `src/schemas/user.schema.ts` — `updateUserSchema`
- `src/services/user.service.ts` — `update()` / `me()` + `UserResponse` serializer
- `src/controllers/user.controller.ts` — `update` handler
- `src/routes/user.routes.ts` — `PATCH /me` (protected)

---

## Error Handling Alignment

| Aspect | Frontend Expects | Backend Delivers | Verdict |
|---|---|---|---|
| Error shape | `{ message, status?, code?, details? }` | `{ message, status, code, details }` | ✅ |
| 401 handling | `onUnauthorized()` clears auth store | `error-handler.middleware.ts` → `UNAUTHORIZED` → 401 | ✅ |
| 401 trigger | `error.response.status === 401` | Via `requireAuth` or `UnauthorizedError` | ✅ |
| Network error | `error.message ?? "Something went wrong..."` | Not explicitly handled (falls through to generic) | ⏳ Add network error normalization |

## Auth Flow Alignment

| Step | Frontend | Backend | Verdict |
|---|---|---|---|
| Send token | `Authorization: Bearer <token>` via Axios interceptor | Reads `Authorization` header, splits `Bearer ` prefix | ✅ |
| Store token | `localStorage` via Zustand `persist` | Issues JWT (HS256, 15min access, 7d refresh) | ✅ |
| Refresh token | Stored but **never used** in frontend | Refresh endpoint exists at `POST /auth/refresh` | ⏳ FE should call refresh on 401 |
| Logout | Calls `POST /auth/logout`, clears store | Increments `tokenVersion` (invalidates all refresh tokens) | ✅ |
| Forgot password | Calls `POST /auth/forgot-password` | Always returns 200 (email-enum prevention) | ✅ |

---

## Complete API Surface

| Method | Path | Auth | Status |
|---|---|---|---|
| `GET` | `/health` | No | ✅ |
| `POST` | `/auth/register` | No | ✅ |
| `POST` | `/auth/login` | No | ✅ |
| `POST` | `/auth/refresh` | No | ✅ |
| `POST` | `/auth/forgot-password` | No | ✅ |
| `POST` | `/auth/reset-password` | No | ✅ |
| `POST` | `/auth/logout` | Yes | ✅ |
| `GET` | `/auth/me` | Yes | ✅ |
| `GET` | `/ideas` | Yes | ✅ Fixed |
| `POST` | `/ideas` | Yes | ✅ Fixed |
| `POST` | `/ideas/:id/validate` | Yes | ✅ Fixed |
| `GET` | `/validations/:id` | Yes | ✅ |
| `POST` | `/reports/generate` | Yes | ✅ |
| `GET` | `/reports` | Yes | ✅ Fixed |
| `GET` | `/reports/:id` | Yes | ✅ |
| `GET` | `/reports/:id/export.pdf` | Yes | ✅ Fixed |
| `DELETE` | `/reports/:id` | Yes | ✅ |
| `GET` | `/chat/threads` | Yes | ✅ Fixed |
| `POST` | `/chat/threads` | Yes | ✅ Fixed |
| `GET` | `/chat/threads/:id/messages` | Yes | ✅ Fixed |
| `POST` | `/chat/threads/:id/messages` | Yes | ✅ Fixed |
| `PATCH` | `/me` | Yes | ✅ Fixed |

---

## Files Modified

| File | Change |
|---|---|
| `backend/src/index.ts` | Added imports + route registrations for ideas, chat, user |
| `backend/src/controllers/validation.controller.ts` | Changed validate response to `Validation` shape |
| `backend/src/controllers/reports.controller.ts` | Removed pagination from list; added `exportPdf` handler |
| `backend/src/services/reports.service.ts` | Changed `list()` to return `ReportResponse[]` (removed pagination) |

## Files Created

| File | Purpose |
|---|---|
| `backend/src/schemas/idea.schema.ts` | Zod validation for `POST /ideas` |
| `backend/src/services/ideas.service.ts` | Idea CRUD with `IdeaResponse` serialization |
| `backend/src/controllers/ideas.controller.ts` | Idea handlers |
| `backend/src/routes/ideas.routes.ts` | `GET /ideas`, `POST /ideas` |
| `backend/src/schemas/chat.schema.ts` | Zod validation for chat |
| `backend/src/services/chat.service.ts` | Chat thread + message CRUD |
| `backend/src/controllers/chat.controller.ts` | Chat handlers |
| `backend/src/routes/chat.routes.ts` | All chat endpoints |
| `backend/src/schemas/user.schema.ts` | Zod validation for `PATCH /me` |
| `backend/src/services/user.service.ts` | User profile update |
| `backend/src/controllers/user.controller.ts` | User handlers |
| `backend/src/routes/user.routes.ts` | `PATCH /me` |

---

## Remaining Work (Future)

1. **Chat streaming** — Replace synchronous `sendMessage` with Web Streams + OpenRouter streaming API
2. **PDF generation** — Replace text placeholder in `/reports/:id/export.pdf` with real PDF (PDFKit / Puppeteer)
3. **Token refresh** — Frontend should call `POST /auth/refresh` when receiving 401, before clearing auth
4. **Network error normalization** — Add explicit `TypeError("Failed to fetch")` handling in global error handler
5. **`POST /ideas/:id/validate` → `/reports/generate` dedup** — Both do the same thing; consider merging or deprecating the old route
6. **Rate limiting** — Add middleware for production
7. **Integration tests** — Add E2E tests verifying every endpoint
