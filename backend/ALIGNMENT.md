# Schema ↔ Frontend Type Alignment Check

## User

| Frontend `User` | Prisma `User` | Status |
|---|---|---|
| `id: string` | `id String @id @default(cuid())` | ✅ |
| `email: string` | `email String @unique` | ✅ |
| `name: string` | `name String` | ✅ |
| `avatarUrl?: string` | `avatarUrl String?` | ✅ |
| `plan: "free" \| "pro" \| "enterprise"` | `plan Plan @default(FREE)` — enum with FREE/PRO/ENTERPRISE | ✅ |
| `createdAt: string` | `createdAt DateTime @default(now())` | ✅ |
| *(not in FE type)* `passwordHash` | stored as `password_hash` | ✅ (internal) |
| *(not in FE type)* `emailVerified` | stored as `email_verified` | ✅ (internal) |

## Idea

| Frontend `Idea` | Prisma `Idea` | Status |
|---|---|---|
| `id: string` | `id String @id @default(cuid())` | ✅ |
| `name: string` | `name String` | ✅ |
| `industry: Industry` | `industry Industry` — enum with same 7 values | ✅ |
| `problem: string` | `problem String` | ✅ |
| `audience: string` | `audience String` | ✅ |
| `businessModel: BusinessModel` | `businessModel BusinessModel` — enum with same 5 values | ✅ |
| `budget?: string` | `budget String?` | ✅ |
| `country?: string` | `country String?` | ✅ |
| `competitors?: string[]` | `competitors String[]` | ✅ |
| `notes?: string` | `notes String?` | ✅ |
| `createdAt: string` | `createdAt DateTime` | ✅ |
| `updatedAt: string` | `updatedAt DateTime` | ✅ |

## Validation

| Frontend `Validation` | Prisma `Validation` | Status |
|---|---|---|
| `id: string` | `id String @id` | ✅ |
| `ideaId: string` | `ideaId String` | ✅ |
| `score: ValidationScore { overall, market, team, moat, monetization, traction, risk }` | Individual score columns: `overallScore Int?`, `marketScore Int?`, etc. | ✅ (denormalized) |
| `status: "draft" \| "running" \| "complete" \| "failed"` | `status ValidationStatus` — enum with same 4 values | ✅ |
| `createdAt: string` | `createdAt DateTime` | ✅ |

## Report

| Frontend `Report` | Prisma `Report` | Status |
|---|---|---|
| `id: string` | `id String @id` | ✅ |
| `ideaId: string` | `ideaId String` | ✅ |
| `title: string` | `title String` | ✅ |
| `summary: string` | `summary String` | ✅ |
| `industry: string` | `industry String` | ✅ |
| `score: ValidationScore` | Denormalized as `overallScore Int`, `marketScore Int`, etc. | ✅ |
| `swot: SWOT` | `strengths String[]`, `weaknesses String[]`, `opportunities String[]`, `threats String[]` | ✅ |
| `competitors: Competitor[]` | `competitors Json` — stores `[{ name, score, url? }]` | ✅ |
| `roadmap: RoadmapItem[]` | `roadmap Json` — stores `[{ quarter, label }]` | ✅ |
| `createdAt: string` | `createdAt DateTime` | ✅ |

## ChatThread

| Frontend `ChatThread` | Prisma `ChatThread` | Status |
|---|---|---|
| `id: string` | `id String @id` | ✅ |
| `title: string` | `title String` | ✅ |
| `updatedAt: string` | `updatedAt DateTime @updatedAt` | ✅ |
| `messages?: ChatMessage[]` | Relation to `ChatMessage[]` | ✅ |

## ChatMessage

| Frontend `ChatMessage` | Prisma `ChatMessage` | Status |
|---|---|---|
| `id: string` | `id String @id` | ✅ |
| `role: "user" \| "assistant" \| "system"` | `role String` | ✅ |
| `content: string` | `content String` | ✅ |
| `createdAt: string` | `createdAt DateTime` | ✅ |

## Frontend API Types

| Frontend `ApiError` | Backend error contract | Status |
|---|---|---|
| `{ message, status?, code?, details? }` | Handled by error handler middleware | ✅ (planned in BACKEND_PLAN.md) |

| Frontend `Paginated<T>` | Backend pagination | Status |
|---|---|---|
| `{ data: T[], page, pageSize, total }` | `lib/pagination.ts` helper | ✅ (planned) |

---

## Summary

- **All Prisma models align with frontend types.**
- Enums use the same string values as the frontend (e.g., `"AI / ML"`, `"SaaS"`, `"free"` → `FREE`).
- Score dimensions are stored both as individual columns (for queries) and available via the Validation/Report records.
- SWOT arrays use native PostgreSQL `TEXT[]` columns matching the frontend `string[]`.
- Complex nested data (competitors, roadmap) uses `Json` (PostgreSQL JSONB) to match the frontend's exact object shapes.
