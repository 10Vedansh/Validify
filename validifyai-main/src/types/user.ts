export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
};

export type AuthSession = {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string };
