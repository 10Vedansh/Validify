import bcrypt from "bcryptjs";
import { authConfig } from "@/config/auth";

/**
 * Password hashing and comparison using bcryptjs.
 *
 * Pure JavaScript — no native compilation needed, works with
 * Cloudflare Workers `nodejs_compat` flag.
 */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, authConfig.bcrypt.saltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
