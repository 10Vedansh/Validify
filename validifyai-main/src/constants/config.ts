export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? "Validify";
export const API_URL: string = import.meta.env.VITE_API_URL ?? "";

export const AUTH_STORAGE_KEY = "validify.auth";
export const THEME_STORAGE_KEY = "validify.theme";

// Validate critical env vars in production
if (import.meta.env.PROD) {
  const missing: string[] = [];
  if (!import.meta.env.VITE_API_URL) missing.push("VITE_API_URL");
  if (missing.length > 0) {
    console.error(`[Validify] Missing required env vars: ${missing.join(", ")}`);
  }
}
