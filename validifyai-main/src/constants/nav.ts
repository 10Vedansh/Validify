import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Bot,
  Presentation,
  TrendingUp,
  Settings,
  Gauge,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  shortcut?: string;
};

export const dashboardNav: NavItem[] = [
  { to: ROUTES.dashboard, label: "Overview", icon: LayoutDashboard, exact: true, shortcut: "G O" },
  { to: ROUTES.validate, label: "Validate", icon: Sparkles, shortcut: "G V" },
  { to: ROUTES.reports, label: "Reports", icon: FileText, shortcut: "G R" },
  { to: ROUTES.readiness, label: "Investor Readiness", icon: Gauge },
  { to: ROUTES.pitch, label: "Pitch decks", icon: Presentation },
  { to: ROUTES.cofounder, label: "Co-founder", icon: Bot, shortcut: "G C" },
  { to: ROUTES.team, label: "Team", icon: Users },
  { to: ROUTES.trends, label: "Trends", icon: TrendingUp },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];
