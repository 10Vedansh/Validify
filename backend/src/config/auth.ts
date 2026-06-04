import { env } from "@/config/env";

export const authConfig = {
  accessToken: {
    secret: () => env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRY,
    algorithm: "HS256" as const,
  },

  refreshToken: {
    secret: () => env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRY,
    algorithm: "HS256" as const,
  },

  passwordReset: {
    tokenLength: 48,
    expiresInMs: 1000 * 60 * 60,
  },

  bcrypt: {
    saltRounds: 12,
  },
} as const;
