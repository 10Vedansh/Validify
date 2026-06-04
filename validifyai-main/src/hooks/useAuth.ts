import { useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { setAuthTokenGetter, setOnUnauthorized, setRefreshTokenFn } from "@/lib/api";
import type { LoginPayload, RegisterPayload } from "@/types/user";

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, status, setSession, setToken, clear } = useAuthStore();

  useEffect(() => {
    setAuthTokenGetter(() => useAuthStore.getState().token);
  }, []);

  useEffect(() => {
    setRefreshTokenFn(async () => {
      try {
        const session = await authService.refresh();
        setSession(session);
        return session.token;
      } catch {
        clear();
        return null;
      }
    });
  }, [clear, setSession]);

  useEffect(() => {
    setOnUnauthorized(async () => {
      try {
        const session = await authService.refresh();
        setSession(session);
      } catch {
        clear();
        navigate({ to: "/login" });
      }
    });
  }, [clear, navigate, setSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await authService.login(payload);
      setSession(session);
      navigate({ to: "/dashboard" });
      return session;
    },
    [navigate, setSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const session = await authService.register(payload);
      setSession(session);
      navigate({ to: "/dashboard" });
      return session;
    },
    [navigate, setSession],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clear();
    navigate({ to: "/login" });
  }, [clear, navigate]);

  return {
    user,
    token,
    status,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };
}
