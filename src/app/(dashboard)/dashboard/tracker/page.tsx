"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Plus, Filter, Search, ChevronDown,
  Briefcase, MapPin, Calendar, ExternalLink, Trash2,
  CheckCircle2, XCircle, AlertTriangle, Zap, Clock,
  TrendingUp, FileText, Edit3, RefreshCw, Info, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  company: string;
  job_title: string;
  job_url?: string;
  role_family?: string;
  location?: string;
  date_discovered?: string;
  date_applied?: string;
  fit_score?: number;
  priority?: string;
  verdict?: string;
  source?: string;
  status: string;
  notes?: string;
  follow_up_date?: string;
  compensation?: string;
  tailored_resume_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; order: number }> = {
  saved:               { label: "Saved",               color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/30",   order: 0 },
  analyzed:            { label: "Analyzed",            color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30", order: 1 },
  ready_to_apply:      { label: "Ready to Apply",      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",     order: 2 },
  applied:             { label: "Applied",             color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30",     order: 3 },
  referral_requested:  { label: "Referral Requested",  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", order: 4 },
  referral_received:   { label: "Referral Received",   color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30", order: 5 },
  interview:           { label: "Interview",           color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30",   order: 6 },
  offer:               { label: "Offer",               color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/30",order: 7 },
  rejected:            { label: "Rejected",            color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       order: 8 },
  withdrawn:           { label: "Withdrawn",           color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/30",     order: 9 }
};

const VERDICT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  priority_apply:    Zap,
  apply:            CheckCircle2,
  apply_with_caution: AlertTriangle,
  skip:             XCircle
};

const VERDICT_COLORS: Record<string, string> = {
  priority_apply:    "text-emerald-400",
  apply:            "text-blue-400",
  apply_with_caution: "text-amber-400",
  skip:             "text-red-400"
};

const ROLE_LABELS: Record<string, string> = {
  data_analyst: "Data Analyst",
  data_scientist: "Data Scientist",
  ai_ml: "AI/ML",
  sde: "SDE",
  business_analytics: "Biz Analytics",
  consulting: "Consulting",
  product: "Product",
  other: "Other"
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const router = useRouter();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [migrationRequired, setMigrationRequired] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [view, setView] = React.useState<"list" | "kanban">("list");
  const [updatingId, setUpdatingId] = React.useState<string>("");
  const [expandedId, setExpandedId] = React.useState<string>("");

  // Load applications
  const loadApplications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.migrationRequired) {
        setMigrationRequired(true);
      } else if (data.success) {
        setApplications(data.data || []);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { loadApplications(); }, [loadApplications]);

  // Update status
  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const updateData: any = { status };
      if (status === "applied") updateData.dateApplied = new Date().toISOString();
      await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      setApplications((prev) =>
        prev.map((a) => a.id === id ? { ...a, status, ...(status === "applied" ? { date_applied: new Date().toISOString() } : {}) } : a)
      );
    } catch {
      // non-fatal
    } finally {
      setUpdatingId("");
    }
  };

  // Delete application
  const deleteApplication = async (id: string) => {
    if (!confirm("Remove this application?")) return;
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // non-fatal
    }
  };

  // Filter
  const filtered = applications.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      a.company?.toLowerCase().includes(q) ||
      a.job_title?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    const matchesPriority = filterPriority === "all" || a.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const stats = React.useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => ["applied", "referral_requested", "referral_received", "interview", "offer"].includes(a.status)).length;
    const interviews = applications.filter((a) => a.status === "interview").length;
    const offers = applications.filter((a) => a.status === "offer").length;
    const tierA = applications.filter((a) => a.priority === "tier_a").length;
    return { total, applied, interviews, offers, tierA };
  }, [applications]);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // ─── Kanban Columns ──────────────────────────────────────────────────────

  const kanbanColumns = [
    ["saved", "analyzed", "ready_to_apply"],
    ["applied", "referral_requested", "referral_received"],
    ["interview", "offer"],
    ["rejected", "withdrawn"]
  ];

  const columnLabels = ["Pipeline", "Applied", "Interview", "Closed"];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
              Application Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track every application from discovery to offer
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/apply")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Application
          </button>
        </div>

        {/* Migration Warning */}
        {migrationRequired && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="font-semibold text-amber-300 mb-1">Database migration required</p>
            <p className="text-sm text-muted-foreground mb-3">
              Run the SQL migration to enable application tracking. Open your Supabase project → SQL Editor → paste and run the contents of:
            </p>
            <code className="text-xs font-mono text-indigo-300 bg-muted/50 px-3 py-2 rounded-lg block">
              src/lib/supabase/migrations/001_job_tracker.sql
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              After running, refresh this page. All existing data is preserved — this only adds new tables.
            </p>
          </div>
        )}

        {/* Stats */}
        {!migrationRequired && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "Applied", value: stats.applied, color: "text-blue-400" },
              { label: "Interviews", value: stats.interviews, color: "text-amber-400" },
              { label: "Offers", value: stats.offers, color: "text-emerald-400" },
              { label: "Tier A", value: stats.tierA, color: "text-indigo-400" }
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4 text-center">
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + View Toggle */}
        {!migrationRequired && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search company, role, location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              <option value="all">All Priorities</option>
              <option value="tier_a">Tier A</option>
              <option value="tier_b">Tier B</option>
              <option value="tier_c">Tier C</option>
            </select>
            <div className="flex border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("list")}
                className={cn("px-3 py-2 text-sm transition-colors", view === "list" ? "bg-indigo-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60")}
              >
                List
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn("px-3 py-2 text-sm transition-colors", view === "kanban" ? "bg-indigo-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60")}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={loadApplications}
              className="p-2 rounded-lg bg-muted/40 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !migrationRequired && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground mb-1">
              {applications.length === 0 ? "No applications yet" : "No results match your filters"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {applications.length === 0
                ? "Start by analyzing a job description in the Apply page"
                : "Try adjusting your search or filters"}
            </p>
            {applications.length === 0 && (
              <button
                onClick={() => router.push("/dashboard/apply")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                <Zap className="h-4 w-4" />
                Analyze First Job
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!isLoading && !migrationRequired && view === "list" && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((app) => {
              const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.saved;
              const VerdictIcon = app.verdict ? VERDICT_ICONS[app.verdict] : null;
              const verdictColor = app.verdict ? VERDICT_COLORS[app.verdict] : "text-muted-foreground";
              const isExpanded = expandedId === app.id;

              return (
                <div key={app.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Score */}
                    <div className="shrink-0 w-10 text-center">
                      {app.fit_score != null ? (
                        <div className={cn(
                          "text-sm font-bold",
                          app.fit_score >= 70 ? "text-emerald-400" :
                          app.fit_score >= 55 ? "text-blue-400" :
                          app.fit_score >= 40 ? "text-amber-400" : "text-red-400"
                        )}>
                          {app.fit_score}
                        </div>
                      ) : <div className="text-xs text-muted-foreground">—</div>}
                      <div className="text-[9px] text-muted-foreground">score</div>
                    </div>

                    {/* Company + Role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{app.company}</span>
                        {app.priority && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            app.priority === "tier_a" ? "bg-emerald-500/10 text-emerald-400" :
                            app.priority === "tier_b" ? "bg-blue-500/10 text-blue-400" :
                            "bg-muted/50 text-muted-foreground"
                          )}>
                            {app.priority === "tier_a" ? "A" : app.priority === "tier_b" ? "B" : "C"}
                          </span>
                        )}
                        {VerdictIcon && <VerdictIcon className={cn("h-3.5 w-3.5", verdictColor)} />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="truncate">{app.job_title}</span>
                        {app.location && <><span>·</span><span>{app.location}</span></>}
                        {app.role_family && <><span>·</span><span>{ROLE_LABELS[app.role_family] || app.role_family}</span></>}
                      </div>
                    </div>

                    {/* Status + Date */}
                    <div className="shrink-0 hidden sm:block text-right">
                      <div className="text-xs text-muted-foreground">{formatDate(app.date_discovered || app.created_at)}</div>
                      {app.date_applied && (
                        <div className="text-[10px] text-muted-foreground">Applied {formatDate(app.date_applied)}</div>
                      )}
                    </div>

                    {/* Status badge + dropdown */}
                    <div className="shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={cn(
                          "text-xs px-2 py-1 rounded-lg border font-medium focus:outline-none cursor-pointer transition-colors bg-transparent",
                          statusCfg.bg, statusCfg.color
                        )}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? "" : app.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title="Details"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                      </button>
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          title="Open JD"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {app.tailored_resume_id && (
                        <button
                          onClick={() => router.push(`/dashboard/builder?resumeId=${app.tailored_resume_id}`)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-muted/50 transition-colors"
                          title="Open tailored resume"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-muted/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/40 px-4 py-4 space-y-3 bg-muted/10">
                          {app.compensation && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Estimated CTC: </span>
                              <span className="text-foreground font-medium">{app.compensation}</span>
                            </div>
                          )}
                          {app.notes && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Notes: </span>
                              <span className="text-foreground">{app.notes}</span>
                            </div>
                          )}
                          {app.follow_up_date && (
                            <div className="text-sm flex items-center gap-1.5 text-amber-400">
                              <Calendar className="h-3.5 w-3.5" />
                              Follow up: {formatDate(app.follow_up_date)}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => router.push(`/dashboard/apply`)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              New Application Workflow
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/interview`)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Interview Prep
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* ── KANBAN VIEW ── */}
        {!isLoading && !migrationRequired && view === "kanban" && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto">
            {kanbanColumns.map((statuses, colIdx) => {
              const colApps = filtered.filter((a) => statuses.includes(a.status));
              return (
                <div key={colIdx} className="space-y-2 min-w-48">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 flex items-center justify-between">
                    {columnLabels[colIdx]}
                    <span className="font-normal text-muted-foreground/60">{colApps.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {colApps.map((app) => {
                      const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.saved;
                      return (
                        <div key={app.id} className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <p className="text-xs font-semibold text-foreground leading-tight">{app.company}</p>
                              <p className="text-[10px] text-muted-foreground leading-tight">{app.job_title}</p>
                            </div>
                            {app.fit_score != null && (
                              <span className={cn(
                                "text-xs font-bold shrink-0",
                                app.fit_score >= 70 ? "text-emerald-400" :
                                app.fit_score >= 55 ? "text-blue-400" :
                                "text-amber-400"
                              )}>
                                {app.fit_score}
                              </span>
                            )}
                          </div>
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className={cn(
                              "w-full text-[10px] px-1.5 py-1 rounded border font-medium focus:outline-none cursor-pointer bg-transparent",
                              statusCfg.bg, statusCfg.color
                            )}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
