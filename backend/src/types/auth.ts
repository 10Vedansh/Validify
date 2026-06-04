/**
 * Auth-specific response types.
 *
 * These mirror the frontend types in validifyai-main/src/types/user.ts
 * so the API contract is identical on both sides.
 */

/**
 * Maps 1:1 to frontend AuthSession (validifyai-main/src/types/user.ts:10)
 */
export interface AuthSessionResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Maps 1:1 to frontend User (validifyai-main/src/types/user.ts:1)
 *
 * Note: `plan` uses lowercase strings to match the frontend union type
 * ("free" | "pro" | "enterprise") rather than the Prisma enum (FREE/PRO/ENTERPRISE).
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

// ─── JWT Payload ──────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;       // user id
  email: string;
  plan: string;
  isAdmin: boolean;
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}
