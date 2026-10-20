"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BookOpen,
  Mic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  FileUp,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/shared/BrandMark";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: "Core",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Target Jobs", href: "/dashboard/jobs", icon: Briefcase },
    ],
  },
  {
    group: "Apply",
    items: [
      { label: "Resume Builder", href: "/dashboard/builder", icon: FileText },
      { label: "Tailor Resume", href: "/dashboard/tailor", icon: Sparkles },
      { label: "ATS Resume Checker", href: "/dashboard/checker", icon: ShieldCheck },
      { label: "Cover Letter", href: "/dashboard/cover-letter", icon: FileUp },
    ],
  },
  {
    group: "Prepare",
    items: [
      { label: "Interview Studio", href: "/dashboard/interview", icon: Mic },
      { label: "Skills Roadmap", href: "/dashboard/learning", icon: BookOpen },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

// Flat export for backwards compatibility
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    document.cookie = "sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    await supabase.auth.signOut().catch(() => {});
    router.refresh();
    router.push("/");
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 248 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="dashboard-sidebar no-print relative hidden md:flex flex-col h-screen border-r border-border/70 bg-card text-foreground select-none shrink-0"
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        className="absolute -right-3 top-5 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-xs cursor-pointer transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Brand Header */}
      <div className="dashboard-sidebar-brand flex h-16 items-center px-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="dashboard-sidebar-mark flex h-9 w-9 items-center justify-center rounded-xl shrink-0">
            <BrandMark className="h-7 w-7" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Hicejo
              </span>
              <span className="text-[9px] text-muted-foreground tracking-wide">
                CAREER WORKSPACE
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation list */}
      <div className="dashboard-sidebar-nav flex-1 py-5 px-3 space-y-6 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="dashboard-nav-label px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "dashboard-nav-item group relative flex items-center h-10 px-2.5 rounded-lg text-[12px] font-medium transition-colors",
                    isActive
                      ? "dashboard-nav-item-active bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div className="dashboard-nav-indicator absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-2.5 truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Area */}
      <div className="dashboard-sidebar-account p-3 border-t border-border/50">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/60 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="dashboard-avatar flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-[11px] shrink-0 border border-border">
              J
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Jayant</p>
                <span className="text-[10px] text-muted-foreground">Personal workspace</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Off-canvas Drawer
export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    document.cookie = "sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    await supabase.auth.signOut().catch(() => {});
    router.refresh();
    router.push("/");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="dashboard-mobile-navigation" className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="dashboard-mobile-drawer relative flex flex-col w-68 max-w-[80vw] h-full bg-card border-r border-border text-foreground shadow-xl z-10"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
                <div className="dashboard-sidebar-mark flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                  <BrandMark className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold tracking-tight">Hicejo</span>
              </Link>
              <button
                onClick={onClose}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
              {NAV_GROUPS.map((group) => (
                <div key={group.group} className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.group}
                  </div>
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "dashboard-nav-item flex items-center h-10 px-2.5 rounded-lg text-xs font-medium transition-colors",
                          isActive
                            ? "dashboard-nav-item-active bg-secondary text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className={cn("h-4 w-4 mr-2.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border/50">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center h-8 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-2 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
