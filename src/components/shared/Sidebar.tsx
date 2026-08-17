"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Sparkles,
  FileUp,
  Flame,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Resume Builder", href: "/dashboard/builder", icon: FileText },
    { label: "Resume ATS Score Checker", href: "/dashboard/checker", icon: ShieldCheck },
    { label: "Resume Tailor", href: "/dashboard/tailor", icon: Sparkles },
    { label: "Cover Letter Gen", href: "/dashboard/cover-letter", icon: FileUp },
    { label: "Resume Roast", href: "/dashboard/roast", icon: Flame },
    { label: "History & Drafts", href: "/dashboard/history", icon: History },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="no-print relative flex flex-col h-screen border-r border-border/40 bg-card text-foreground select-none"
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground shadow-sm cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20 shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold tracking-tight"
            >
              Hice<span className="text-primary">jo</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation list */}
      <div className="flex-1 space-y-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                isActive && "text-foreground font-semibold bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile/LogOut Actions */}
      <div className="p-3 border-t border-border/40">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center h-10 px-3 rounded-lg text-sm font-medium hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </motion.div>
  );
}
