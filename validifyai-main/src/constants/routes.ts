export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  validate: "/dashboard/validate",
  reports: "/dashboard/reports",
  cofounder: "/dashboard/cofounder",
  pitch: "/dashboard/pitch",
  trends: "/dashboard/trends",
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
