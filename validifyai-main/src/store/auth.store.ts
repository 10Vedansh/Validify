import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/constants/config";
import type { AuthSession, User } from "@/types/user";

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  status: "idle" | "authenticated" | "unauthenticated";
  setSession: (session: AuthSession | null) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      status: "idle",
      setSession: (session) =>
        set(
          session
            ? {
                user: session.user,
                token: session.token,
                refreshToken: session.refreshToken ?? null,
                status: "authenticated",
              }
            : { user: null, token: null, refreshToken: null, status: "unauthenticated" },
        ),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clear: () => set({ user: null, token: null, refreshToken: null, status: "unauthenticated" }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken }),
    },
  ),
);
