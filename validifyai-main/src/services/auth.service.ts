import { api } from "@/lib/api";
import type { AuthSession, LoginPayload, RegisterPayload, User } from "@/types/user";
import { useAuthStore } from "@/store/auth.store";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/auth/register", payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async refresh(): Promise<AuthSession> {
    const state = useAuthStore.getState();
    const { data } = await api.post<AuthSession>("/auth/refresh", {
      refreshToken: state.refreshToken,
    });
    return data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },
};
