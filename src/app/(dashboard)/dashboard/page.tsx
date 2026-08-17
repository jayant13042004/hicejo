"use client";

import * as React from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, ShieldCheck, Flame, Sparkles, Plus, ArrowRight, FileUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DashboardShell } from "@/components/shared/DashboardShell";

// Mock weekly progress statistics
const performanceData = [
  { week: "Week 1", score: 62 },
  { week: "Week 2", score: 68 },
  { week: "Week 3", score: 71 },
  { week: "Week 4", score: 79 },
  { week: "Week 5", score: 85 },
];

// Mock saved resumes
const mockResumes = [
  { id: "1", title: "Full-Stack Dev Resume", score: 85, date: "2026-08-05" },
  { id: "2", title: "Generic PM Resume", score: 71, date: "2026-08-01" },
];

export default function DashboardPage() {
  return (
    <DashboardShell title="Dashboard Overview">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Trophy className="h-4 w-4" />
            <span>Ready to get hired?</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Sarah!</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Your primary resume score increased by <span className="text-emerald-500 font-semibold">+14%</span> this week. Tailor it for your next target application.
          </p>
        </div>
        <Link href="/dashboard/builder">
          <Button className="bg-gradient-to-r from-primary to-violet-600 shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            <span>New Resume Draft</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Drafts", value: "3", desc: "Saved resumes", icon: FileText, color: "text-blue-500" },
          { label: "Avg ATS Score", value: "78%", desc: "Target 80%+", icon: ShieldCheck, color: "text-emerald-500" },
          { label: "Resume Roasts", value: "4", desc: "Narrative audits", icon: Flame, color: "text-amber-500" },
          { label: "Cover Letters", value: "2", desc: "Custom generated", icon: FileUp, color: "text-pink-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ATS Score Trajectory</CardTitle>
            <CardDescription>Visual tracker matching your weekly optimization improvements.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pl-2 pr-6 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Utilities</CardTitle>
            <CardDescription>Access primary agent assistants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "ATS Keyword Scan", href: "/dashboard/checker", icon: ShieldCheck, desc: "Verify job compliance" },
              { label: "Tailor to Job Descr.", href: "/dashboard/tailor", icon: Sparkles, desc: "Adapt experience bullet points" },
              { label: "Resume Roast Audit", href: "/dashboard/roast", icon: Flame, desc: "Get brutally honest critique" },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <Link key={i} href={act.href} className="group block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 group-hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{act.label}</p>
                        <p className="text-xs text-muted-foreground">{act.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Saved Resumes Lists */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription>Manage and tailors your current profiles.</CardDescription>
          </div>
          <Link href="/dashboard/builder">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/40">
            {mockResumes.map((res) => (
              <div key={res.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{res.title}</h4>
                    <p className="text-xs text-muted-foreground">Edited on {res.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      res.score >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      Score: {res.score}%
                    </span>
                  </div>
                  <Link href={`/dashboard/builder?id=${res.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
