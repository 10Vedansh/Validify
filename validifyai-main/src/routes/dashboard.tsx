import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { ProductTour } from "@/components/dashboard/ProductTour";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { useDashboardStore } from "@/store/dashboard.store";
import { usePreferencesStore } from "@/store/preferences.store";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { sidebarOpen } = useDashboardStore();
  const { onboardingComplete } = usePreferencesStore();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* AI Assistant rail - only visible when toggled */}
      <AIAssistant />

      {/* Global command palette */}
      <CommandPalette />

      {/* Product Tour - Dashboard Overview (once, after onboarding) */}
      {onboardingComplete && (
        <ProductTour
          tourId="dashboard-overview"
          steps={[
            { target: "[data-tour='stats']", title: "Dashboard Overview", content: "Track your ideas, scores, and validation activity at a glance.", position: "bottom" },
            { target: "[data-tour='trends']", title: "Validation Trends", content: "See how your validation activity grows over time with the area chart.", position: "top" },
            { target: "[data-tour='feed']", title: "Founder Intelligence", content: "Stay updated on market trends, funding news, and competitor movement.", position: "top" },
          ]}
        />
      )}
    </div>
  );
}
