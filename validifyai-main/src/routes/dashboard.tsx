import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { useDashboardStore } from "@/store/dashboard.store";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant rail - only visible when toggled */}
      <AIAssistant />

      {/* Global command palette */}
      <CommandPalette />
    </div>
  );
}
