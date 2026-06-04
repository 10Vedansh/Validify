# Auth Implementation — Frontend Compatibility Verification

## Endpoint Alignment

| Frontend Call | Backend Route | Status |
|---|---|---|
| `api.post<AuthSession>("/auth/login", payload)` | `POST /auth/login` → returns `AuthSessionResponse` | ✅ |
| `api.post<AuthSession>("/auth/register", payload)` | `POST /auth/register` → returns `AuthSessionResponse` (201) | ✅ |
| `api.post("/auth/logout")` | `POST /auth/logout` → requires auth → returns `{ message }` | ✅ |
| `api.get<User>("/auth/me")` | `GET /auth/me` → requires auth → returns `UserResponse` | ✅ |
| `api.post("/auth/forgot-password", { email })` | `POST /auth/forgot-password` → returns `{ message }` | ✅ |

**Additional endpoints** the frontend doesn't call yet but are implemented:
| `POST /auth/refresh` | Exchange refresh token for new access token |
| `POST /auth/reset-password` | Complete password reset with token |

## Response Shape Alignment

### AuthSession (login/register/refresh)

| Frontend `AuthSession` | Backend `AuthSessionResponse` | Status |
|---|---|---|
| `user: User` | `user: UserResponse` | ✅ |
| `token: string` | `token: string` (JWT) | ✅ |
| `refreshToken?: string` | `refreshToken: string` (always included) | ✅ |
| `expiresAt?: number` | `expiresAt: number` (ms timestamp) | ✅ |

### User

| Frontend `User` | Backend `UserResponse` | Status |
|---|---|---|
| `id: string` | `id: string` | ✅ |
| `email: string` | `email: string` | ✅ |
| `name: string` | `name: string` | ✅ |
| `avatarUrl?: string` | `avatarUrl: string \| null` (null serializes to JSON `null`, which becomes `undefined` on frontend via optional chaining) | ✅ |
| `plan: "free" \| "pro" \| "enterprise"` | `plan: "free" \| "pro" \| "enterprise"` (lowercase, matches frontend union) | ✅ |
| `createdAt: string` | `createdAt: string` (ISO 8601) | ✅ |

### ApiError (all error responses)

| Frontend `ApiError` | Backend error response | Status |
|---|---|---|
| `message: string` | `message: string` | ✅ |
| `status?: number` | `status: number` | ✅ |
| `code?: string` | `code: string` | ✅ |
| `details?: Record<string, unknown>` | `details?: Record<string, unknown>` | ✅ |

## Auth Header Format

| Frontend behavior | Backend expectation | Status |
|---|---|---|
| `Authorization: Bearer <token>` (set by Axios interceptor) | Parsed in `requireAuth` middleware | ✅ |
| On 401, frontend clears auth store | Backend returns `{ status: 401, code: "UNAUTHORIZED" }` | ✅ |

## Zod Schema Alignment

| Frontend schema | Backend schema | Status |
|---|---|---|
| `loginSchema`: email (trim, max 255) + password (min 8, max 128) | Same constraints | ✅ |
| `registerSchema`: name (min 2, max 80) + email + password | Same constraints | ✅ |
| `forgotPasswordSchema`: email (trim, max 255) | Same constraints | ✅ |

## Security Features Implemented

- **Password hashing**: bcryptjs with 12 salt rounds
- **JWT signing**: `jose` (HS256) with separate secrets for access and refresh tokens
- **Token expiry**: 15 min access, 7 day refresh
- **Token invalidation**: `tokenVersion` field incremented on logout and password reset
- **Refresh token rotation**: old refresh tokens become invalid after use
- **Password reset**: SHA-256 hashed tokens stored, 1-hour expiry, constant-time comparison
- **Email enumeration prevention**: forgot-password always returns success
- **Soft delete support**: deleted accounts rejected at login
