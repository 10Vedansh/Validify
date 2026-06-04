import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { setAuthTokenGetter } from "@/lib/api";
import { authService } from "@/services/auth.service";

/**
 * Wires the auth store token into the API client.
 * Validates stored session on mount by calling GET /auth/me.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    setAuthTokenGetter(() => useAuthStore.getState().token);
  }, []);

  useEffect(() => {
    if (!token) return;
    authService
      .me()
      .then((user) => setUser(user))
      .catch(() => clear());
  }, []);

  return <>{children}</>;
}
