"use client";

import * as React from "react";
import { Bell, Sun, Moon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/components/shared/ThemeProvider";
import { CreditPill } from "@/components/shared/CreditPill";
import { FeatureKey } from "@/lib/credits";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  featureKey?: FeatureKey;
}

export function DashboardShell({ children, title = "Overview", featureKey }: DashboardShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-border/40 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Daily Credit Pill */}
            <CreditPill currentFeature={featureKey} />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-background/50">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
