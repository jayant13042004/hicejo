"use client";

import * as React from "react";
import Link from "next/link";
import { Sun, Moon, Menu, Search, Command } from "lucide-react";
import { Sidebar, MobileDrawer } from "./Sidebar";
import { useTheme } from "@/components/shared/ThemeProvider";
import { CreditPill } from "@/components/shared/CreditPill";
import { OnboardingModal } from "@/components/shared/OnboardingModal";
import { FeatureKey } from "@/lib/credits";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  featureKey?: FeatureKey;
  maxWidth?: string;
}

export function DashboardShell({ children, title = "Overview", featureKey, maxWidth }: DashboardShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="dashboard-app flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Mobile Off-canvas Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Slim Header */}
        <header className="dashboard-topbar no-print flex h-13 items-center justify-between px-4 sm:px-6 border-b border-border/60 bg-card/60 backdrop-blur-xs shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              type="button"
              aria-expanded={isMobileOpen}
              aria-controls="dashboard-mobile-navigation"
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Hicejo</span>
              <span className="text-muted-foreground/40 hidden sm:inline">/</span>
              <h1 className="font-semibold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-none">
                {title}
              </h1>
            </div>
          </div>

          {/* Quick Search Trigger */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <Link
              href="/dashboard/chat"
              className="w-full h-8 px-2.5 rounded-md border border-border/80 bg-secondary/40 hover:bg-secondary/70 text-xs text-muted-foreground flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span className="text-[11px]">Ask Career AI or search...</span>
              </div>
              <div className="flex items-center gap-0.5 px-1 py-0.2 rounded border border-border/80 bg-card text-[9px] font-mono text-muted-foreground">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            {/* Daily Credit Pill */}
            <CreditPill currentFeature={featureKey} />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* User Profile Avatar */}
            <div className="dashboard-user-profile flex items-center pl-1.5 border-l border-border/60">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary border border-border text-foreground font-semibold text-xs">
                J
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="dashboard-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className={cn("dashboard-page-container mx-auto space-y-6", maxWidth || "max-w-6xl")}>
            {children}
          </div>
        </main>
      </div>

      {/* 30-Second Personalized Onboarding Questionnaire */}
      <OnboardingModal />
    </div>
  );
}
