"use client";

import * as React from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, ShieldCheck, Flame, Sparkles, Plus, ArrowRight, FileUp, Trophy, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DashboardShell } from "@/components/shared/DashboardShell";

interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  target_role?: string;
}

interface ResumeItem {
  id: string;
  title: string;
  ats_score?: number | null;
  created_at: string;
  updated_at: string;
}

interface LetterItem {
  id: string;
  company: string;
  job_title: string;
  created_at: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [coverLetters, setCoverLetters] = React.useState<LetterItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, resumesRes, lettersRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/resume"),
          fetch("/api/cover-letters")
        ]);

        const profileData = await profileRes.json().catch(() => ({}));
        const resumesData = await resumesRes.json().catch(() => ({}));
        const lettersData = await lettersRes.json().catch(() => ({}));

        if (profileData.success && profileData.data) {
          setProfile(profileData.data);
        }
        if (resumesData.success && Array.isArray(resumesData.data)) {
          setResumes(resumesData.data);
        }
        if (lettersData.success && Array.isArray(lettersData.data)) {
          setCoverLetters(lettersData.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute live user stats
  const totalDrafts = resumes.length;
  const scoredResumes = resumes.filter((r) => typeof r.ats_score === "number" && r.ats_score > 0);
  const avgScore =
    scoredResumes.length > 0
      ? Math.round(scoredResumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / scoredResumes.length)
      : null;
  const totalLetters = coverLetters.length;

  // Determine user display name
  const displayName = profile?.full_name?.trim()
    ? profile.full_name.trim().split(" ")[0]
    : profile?.email
    ? profile.email.split("@")[0]
    : "there";

  // Build chart trajectory from scored resumes or fallback
  const chartData = scoredResumes.length > 0
    ? [...scoredResumes]
        .reverse()
        .map((r, idx) => ({
          name: `Scan ${idx + 1}`,
          score: r.ats_score
        }))
    : [];

  return (
    <DashboardShell title="Dashboard Overview">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Trophy className="h-4 w-4" />
            <span>Ready to get hired?</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isLoading ? "Welcome back!" : `Welcome back, ${displayName}!`}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            {totalDrafts === 0 ? (
              "Get started by creating your first resume draft or importing an existing PDF/Word resume."
            ) : avgScore ? (
              <>
                Your average ATS compatibility score is{" "}
                <span className="text-emerald-500 font-semibold">{avgScore}%</span>. Tailor your resumes for target job descriptions.
              </>
            ) : (
              `You have ${totalDrafts} saved resume ${totalDrafts === 1 ? "draft" : "drafts"}. Run an ATS check to measure compatibility!`
            )}
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
          {
            label: "Total Drafts",
            value: isLoading ? "..." : `${totalDrafts}`,
            desc: "Saved resumes",
            icon: FileText,
            color: "text-blue-500"
          },
          {
            label: "Avg ATS Score",
            value: isLoading ? "..." : avgScore !== null ? `${avgScore}%` : "--",
            desc: avgScore !== null ? "Calculated from audits" : "No scans yet",
            icon: ShieldCheck,
            color: "text-emerald-500"
          },
          {
            label: "Resume Scans",
            value: isLoading ? "..." : `${scoredResumes.length}`,
            desc: "ATS verified drafts",
            icon: Flame,
            color: "text-amber-500"
          },
          {
            label: "Cover Letters",
            value: isLoading ? "..." : `${totalLetters}`,
            desc: "Custom generated",
            icon: FileUp,
            color: "text-pink-500"
          },
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
            <CardDescription>Visual tracker matching your optimization improvements.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pl-2 pr-6 pb-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
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
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-xl">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-foreground">No ATS Scans Recorded Yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                  Run your resume through the ATS Keyword Checker to evaluate keyword match scores and view trajectory charts.
                </p>
                <Link href="/dashboard/checker">
                  <Button variant="outline" size="sm">Run ATS Scan</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Utilities</CardTitle>
            <CardDescription>Access primary AI assistants.</CardDescription>
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
            <CardDescription>Manage and tailor your current profiles.</CardDescription>
          </div>
          {resumes.length > 0 && (
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading your documents...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">No Resumes Created Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                You have not created or imported any resume drafts. Create your first ATS-optimized resume now!
              </p>
              <Link href="/dashboard/builder">
                <Button className="bg-gradient-to-r from-primary to-violet-600 gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Resume</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {resumes.slice(0, 5).map((res) => (
                <div key={res.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{res.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Updated on {new Date(res.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      {res.ats_score ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          res.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          Score: {res.ats_score}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                          Not scanned
                        </span>
                      )}
                    </div>
                    <Link href={`/dashboard/builder?id=${res.id}`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
