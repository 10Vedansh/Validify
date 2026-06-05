export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  validate: "/dashboard/validate",
  reports: "/dashboard/reports",
  cofounder: "/dashboard/cofounder",
  pitch: "/dashboard/pitch",
  trends: "/dashboard/trends",
  readiness: "/dashboard/readiness",
  team: "/dashboard/team",
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
