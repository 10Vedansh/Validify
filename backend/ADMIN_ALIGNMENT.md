# Admin Implementation — Documentation

## Overview

Admin endpoints provide user management, report statistics, usage tracking, API monitoring, and revenue analytics. All admin endpoints require `isAdmin: true` in the JWT access token.

## Authorization Flow

```
Request → requireAdmin (middleware)
  ├── requireAuth (verify JWT, extract userId + isAdmin from payload)
  └── Check: c.get("isAdmin") === true
       ├── Yes → next()
       └── No  → 403 FORBIDDEN "Admin access required"
```

The `isAdmin` flag is stored in:
- **Database**: `users.is_admin` column (`BOOLEAN NOT NULL DEFAULT false`)
- **JWT access token**: `isAdmin` claim in the payload
- **Hono context**: `c.get("isAdmin")` set by `requireAuth` middleware
- **Response**: Included in every `UserResponse` so admins can be identified on the frontend

## Endpoints

### `GET /admin/users` — List all users

Returns an array of all non-deleted users with their resource counts.

**Response** — `AdminUserResponse[]`:
```json
[
  {
    "id": "u_001",
    "email": "ada@validify.dev",
    "name": "Ada Lovelace",
    "avatarUrl": null,
    "isAdmin": false,
    "plan": "pro",
    "emailVerified": true,
    "createdAt": "2026-01-15T00:00:00.000Z",
    "_count": {
      "ideas": 2,
      "reports": 2,
      "validations": 2,
      "chatThreads": 3
    }
  }
]
```

**Features**: Sorted by `createdAt` descending. Excludes soft-deleted users. Counts are eager-loaded via Prisma `_count`.

### `GET /admin/analytics` — Full platform analytics

Returns a comprehensive analytics payload with 6 sections.

**Response** — `AdminAnalyticsResponse`:

| Section | Fields | Data Source |
|---|---|---|
| `users` | `total`, `byPlan`, `newThisMonth`, `activeToday` | `User.count/groupBy` |
| `reports` | `total`, `byIndustry[]`, `averageScores`, `generatedThisMonth` | `Report.count/groupBy/aggregate` |
| `usage` | `total`, `byAction[]`, `dailyTrend[]` | `Usage.count/groupBy` (last 30 days) |
| `api` | `totalCalls`, `averageLatencyMs`, `errorRate`, `topEndpoints[]` | `ApiLog.count/aggregate/groupBy` |
| `revenue` | `total (cents)`, `byPlan[]`, `monthly[]`, `pendingInvoices` | `Payment.count/groupBy/aggregate` |

**Example**:
```json
{
  "users": {
    "total": 4,
    "byPlan": { "free": 1, "pro": 1, "enterprise": 2 },
    "newThisMonth": 1,
    "activeToday": 0
  },
  "reports": {
    "total": 2,
    "byIndustry": [
      { "industry": "Productivity", "count": 1 },
      { "industry": "Climate", "count": 1 }
    ],
    "averageScores": {
      "overall": 79, "market": 82, "team": 69,
      "moat": 74, "monetization": 62, "traction": 52, "risk": 63
    },
    "generatedThisMonth": 0
  },
  "usage": {
    "total": 9,
    "byAction": [
      { "action": "chat_message", "count": 42 },
      { "action": "validation", "count": 5 }
    ],
    "dailyTrend": [
      { "date": "2026-06-01", "count": 3 },
      { "date": "2026-06-02", "count": 4 }
    ]
  },
  "api": {
    "totalCalls": 3,
    "averageLatencyMs": 4273,
    "errorRate": 0,
    "topEndpoints": [
      { "path": "/api/auth/login", "count": 1, "avgDuration": 342 },
      { "path": "/api/ideas", "count": 1, "avgDuration": 28 }
    ]
  },
  "revenue": {
    "total": 128900,
    "byPlan": [
      { "plan": "pro", "amount": 29000 },
      { "plan": "enterprise", "amount": 99900 }
    ],
    "monthly": [
      { "month": "2026-01", "amount": 99900 },
      { "month": "2026-06", "amount": 29000 }
    ],
    "pendingInvoices": 0
  }
}
```

## Files Created/Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `isAdmin Boolean @default(false)` to User model |
| `prisma/migrations/20260604000000_admin/migration.sql` | ALTER TABLE to add `is_admin` column |
| `prisma/seed.ts` | Added admin user `admin@validify.dev` (id: `u_004`, password: `password123`) |
| `src/types/auth.ts` | Added `isAdmin: boolean` to `UserResponse` and `AccessTokenPayload` |
| `src/services/auth.service.ts` | Added `isAdmin` to `toUserResponse` and `createSession` (JWT payload) |
| `src/middleware/auth.middleware.ts` | Added `isAdmin` to `ContextVariableMap` and extracts from JWT |
| `src/middleware/admin.middleware.ts` | **New** — `requireAdmin` chains `requireAuth` + checks `isAdmin` flag |
| `src/services/admin.service.ts` | **New** — `listUsers()` + `getAnalytics()` with 6 analytics sections |
| `src/controllers/admin.controller.ts` | **New** — `listUsers` and `getAnalytics` handlers |
| `src/routes/admin.routes.ts` | **New** — `GET /admin/users`, `GET /admin/analytics` (all under `requireAdmin`) |
| `src/services/user.service.ts` | Added `isAdmin` to `UserResponse` and `serializeUser` |
| `src/index.ts` | Wired `adminRoutes` at `/admin` |

## Seed Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@validify.dev` |
| Password | `password123` |
| Plan | Enterprise |
| isAdmin | `true` |

## Testing

Verify admin access:
```bash
# Login as admin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@validify.dev","password":"password123"}'

# Get users (with token from above)
curl http://localhost:8080/admin/users \
  -H "Authorization: Bearer <token>"

# Get analytics
curl http://localhost:8080/admin/analytics \
  -H "Authorization: Bearer <token>"
```

Verify non-admin gets 403:
```bash
# Login as regular user
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@validify.dev","password":"password123"}'

# Should return 403 Forbidden
curl http://localhost:8080/admin/users \
  -H "Authorization: Bearer <token>"
```
