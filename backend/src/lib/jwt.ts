import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { authConfig } from "@/config/auth";
import type { AccessTokenPayload, RefreshTokenPayload } from "@/types/auth";

/**
 * Utility functions for JWT access and refresh tokens.
 *
 * Uses the `jose` library which works on Cloudflare Workers,
 * Node.js, and Deno without native bindings.
 */

// ─── Helpers ──────────────────────────────────────────────────────────

function textEncoder() {
  return new TextEncoder();
}

function accessSecret(): Uint8Array {
  return textEncoder().encode(authConfig.accessToken.secret());
}

function refreshSecret(): Uint8Array {
  return textEncoder().encode(authConfig.refreshToken.secret());
}

// ─── Access Token ─────────────────────────────────────────────────────

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const jwt = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: authConfig.accessToken.algorithm })
    .setIssuedAt()
    .setExpirationTime(authConfig.accessToken.expiresIn)
    .sign(accessSecret());

  return jwt;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret(), {
    algorithms: [authConfig.accessToken.algorithm],
  });

  return payload as unknown as AccessTokenPayload;
}

// ─── Refresh Token ────────────────────────────────────────────────────

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  const jwt = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: authConfig.refreshToken.algorithm })
    .setIssuedAt()
    .setExpirationTime(authConfig.refreshToken.expiresIn)
    .sign(refreshSecret());

  return jwt;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, refreshSecret(), {
    algorithms: [authConfig.refreshToken.algorithm],
  });

  return payload as unknown as RefreshTokenPayload;
}
