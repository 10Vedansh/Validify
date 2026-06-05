import { useState } from "react";
import { Bell, Menu, Command, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./Sidebar";
import { Link } from "@tanstack/react-router";
import { SearchBar } from "@/components/common/SearchBar";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/format";

export function Topbar() {
  const [open, setOpen] = useState(false);
  const { search, setSearch, setCommandPaletteOpen, toggleAiPanel } = useDashboardStore();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <DashboardSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Command palette trigger - clickable */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground/50 hover:text-muted-foreground hover:border-border/80 transition-all max-w-sm flex-1"
        aria-label="Open command palette"
      >
        <Command className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Search ideas, pages, actions…</span>
        <kbd className="shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/40">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* AI Assistant toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex relative"
          onClick={toggleAiPanel}
          aria-label="Toggle AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex h-8 items-center gap-2 rounded-lg px-1.5 transition-all duration-150 hover:bg-accent/50" aria-label="User menu">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-[10px] font-semibold text-primary-foreground shadow-sm">
                {user ? initials(user.name) : "?"}
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.name?.split(" ")[0] ?? "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {user?.email ?? ""}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
