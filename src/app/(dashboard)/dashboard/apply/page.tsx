"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Link2, FileText, Users, ChevronRight, ChevronDown,
  Copy, Check, AlertTriangle, TrendingUp, Clock, Target,
  Plus, Trash2, ExternalLink, Download, BookOpen, ArrowRight,
  CheckCircle2, XCircle, Info, Zap, BarChart3, MessageSquare,
  RefreshCw, Save, Edit3, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FactBankModal } from "@/components/shared/FactBankModal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface JDAnalysis {
  company: string;
  jobTitle: string;
  location: string;
  roleFamily: string;
  experienceRequired: string;
  eligibility: string;
  mandatoryRequirements: string[];
  preferredQualifications: string[];
  keySkills: string[];
  actualHiringPriorities: string[];
  matches: string[];
  partialMatches: string[];
  gaps: string[];
  disqualifiers: string[];
  fitScore: number;
  verdict: "priority_apply" | "apply" | "apply_with_caution" | "skip";
  verdictReason: string;
  estimatedCTC: string | null;
  timeInvestment: "low" | "medium" | "high";
  timeInvestmentReason: string;
  applicationStrategy: string;
  bestResumeFamily: string;
  atsKeywords: string[];
}

interface Resume {
  id: string;
  title: string;
  roleFamily?: string;
  isMaster?: boolean;
  skills?: string;
}

interface Contact {
  id: string;
  name: string;
  linkedinUrl: string;
  jobTitle: string;
  company: string;
  department: string;
  relationship: string;
  notes: string;
}

interface OutreachMessage {
  contactName: string;
  connectionRequest: string;
  referralMessage: string;
  forwardableBlurb: string;
}

type Step = "jd" | "analysis" | "resume" | "tailor" | "referrals" | "package";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  priority_apply: {
    label: "PRIORITY APPLY",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: Zap,
    dot: "bg-emerald-400"
  },
  apply: {
    label: "APPLY",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: CheckCircle2,
    dot: "bg-blue-400"
  },
  apply_with_caution: {
    label: "APPLY WITH CAUTION",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: AlertTriangle,
    dot: "bg-amber-400"
  },
  skip: {
    label: "SKIP",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: XCircle,
    dot: "bg-red-400"
  }
};

const ROLE_FAMILY_LABELS: Record<string, string> = {
  data_analyst: "Data Analyst / BA",
  data_scientist: "Data Scientist / ML",
  ai_ml: "AI / ML Engineer",
  sde: "Software Engineer",
  business_analytics: "Business Analytics",
  consulting: "Consulting",
  product: "Product / Product Analytics",
  other: "Other"
};

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50",
        className
      )}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FitScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#34d399" :
    score >= 55 ? "#60a5fa" :
    score >= 40 ? "#fbbf24" : "#f87171";
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" className="rotate-[-90deg]">
        <circle cx="56" cy="56" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApplyPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = React.useState<Step>("jd");

  // JD input
  const [jdText, setJdText] = React.useState("");
  const [jdUrl, setJdUrl] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitleInput, setJobTitleInput] = React.useState("");
  const [isImportingUrl, setIsImportingUrl] = React.useState(false);

  // Analysis
  const [analysis, setAnalysis] = React.useState<JDAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState("");

  // Resume selection
  const [allResumes, setAllResumes] = React.useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");
  const [selectionReason, setSelectionReason] = React.useState("");
  const [isSelectingResume, setIsSelectingResume] = React.useState(false);

  // Tailoring
  const [tailoredResumeId, setTailoredResumeId] = React.useState<string>("");
  const [tailoredChanges, setTailoredChanges] = React.useState<string[]>([]);
  const [isTailoring, setIsTailoring] = React.useState(false);
  const [tailorError, setTailorError] = React.useState("");

  // Referrals
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [outreachMessages, setOutreachMessages] = React.useState<OutreachMessage[]>([]);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = React.useState(false);
  const [outreachError, setOutreachError] = React.useState("");

  // Application saving
  const [applicationId, setApplicationId] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // Migration warning
  const [migrationRequired, setMigrationRequired] = React.useState(false);

  // Fact Bank modal & count
  const [isFactBankModalOpen, setIsFactBankModalOpen] = React.useState(false);
  const [factBankStats, setFactBankStats] = React.useState<{ projectCount: number; skillCount: number }>({ projectCount: 4, skillCount: 25 });

  const refreshFactBankStats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/fact-bank");
      const data = await res.json();
      if (data.success && data.data) {
        const pCount = data.data.projects?.length || 4;
        let sCount = 0;
        for (const list of Object.values(data.data.skillGroups || {})) {
          sCount += (list as string[]).length;
        }
        setFactBankStats({ projectCount: pCount, skillCount: sCount || 25 });
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    refreshFactBankStats();
  }, [refreshFactBankStats]);

  // ── Import from URL ──
  const handleImportUrl = async () => {
    if (!jdUrl.trim()) return;
    setIsImportingUrl(true);
    try {
      const res = await fetch("/api/jobs/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl.trim() })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        if (d.description) setJdText(d.description);
        if (d.company) setCompany(d.company);
        if (d.title) setJobTitleInput(d.title);
      }
    } catch {
      // non-fatal
    } finally {
      setIsImportingUrl(false);
    }
  };

  // ── Analyze JD ──
  const analyzeJD = async () => {
    if (jdText.trim().length < 50) {
      setAnalyzeError("Please paste a job description (at least 50 characters).");
      return;
    }
    setIsAnalyzing(true);
    setAnalyzeError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jdText,
          jobUrl: jdUrl || undefined,
          company: company || undefined,
          jobTitle: jobTitleInput || undefined
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed.");
      setAnalysis(data.data);
      setStep("analysis");
      // Auto-select best resume
      await selectBestResume(data.data);
    } catch (err: any) {
      setAnalyzeError(err.message || "Failed to analyze job description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Select Best Resume ──
  const selectBestResume = async (jdAnalysis: JDAnalysis) => {
    setIsSelectingResume(true);
    try {
      const res = await fetch("/api/ai/select-master-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdAnalysis })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedResumeId(data.data.selectedResumeId || "");
        setSelectionReason(data.data.reason || "");
        setAllResumes(data.data.allResumes || []);
      }
    } catch {
      // non-fatal
    } finally {
      setIsSelectingResume(false);
    }
  };

  // ── Tailor Resume ──
  const tailorResume = async () => {
    if (!selectedResumeId || !analysis) {
      setTailorError("Please select a resume first.");
      return;
    }
    setIsTailoring(true);
    setTailorError("");
    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          company: analysis.company || company,
          jobTitle: analysis.jobTitle || jobTitleInput,
          jobDescription: jdText
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Tailoring failed.");
      setTailoredResumeId(data.tailoredResumeId || "");
      setTailoredChanges(data.changesMade || []);
      setStep("tailor");
    } catch (err: any) {
      setTailorError(err.message || "Failed to tailor resume.");
    } finally {
      setIsTailoring(false);
    }
  };

  // ── Add Contact ──
  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        linkedinUrl: "",
        jobTitle: "",
        company: analysis?.company || company,
        department: "",
        relationship: "unknown",
        notes: ""
      }
    ]);
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Generate Outreach ──
  const generateOutreach = async () => {
    const validContacts = contacts.filter((c) => c.name.trim());
    if (validContacts.length === 0) {
      setOutreachError("Please add at least one contact with a name.");
      return;
    }
    setIsGeneratingOutreach(true);
    setOutreachError("");
    try {
      const res = await fetch("/api/ai/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: validContacts,
          jobTitle: analysis?.jobTitle || jobTitleInput,
          company: analysis?.company || company,
          jobUrl: jdUrl || undefined,
          jdSummary: analysis?.verdictReason || "",
          resumeHighlights: analysis?.matches?.slice(0, 3).join("; ") || ""
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to generate messages.");
      setOutreachMessages(data.data || []);
    } catch (err: any) {
      setOutreachError(err.message || "Failed to generate outreach messages.");
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  // ── Save Application ──
  const saveApplication = async () => {
    if (!analysis) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: analysis.company || company,
          jobTitle: analysis.jobTitle || jobTitleInput,
          jobUrl: jdUrl || null,
          roleFamily: analysis.roleFamily,
          location: analysis.location,
          fitScore: analysis.fitScore,
          priority:
            analysis.fitScore >= 70 ? "tier_a" :
            analysis.fitScore >= 55 ? "tier_b" :
            analysis.fitScore >= 40 ? "tier_c" : "skip",
          verdict: analysis.verdict,
          masterResumeId: selectedResumeId || null,
          tailoredResumeId: tailoredResumeId || null,
          status: "analyzed",
          jobDescription: jdText,
          jdAnalysis: analysis,
          compensation: analysis.estimatedCTC || null
        })
      });
      const data = await res.json();
      if (data.migrationRequired) {
        setMigrationRequired(true);
      } else if (data.success) {
        setApplicationId(data.data?.id || "");
        setIsSaved(true);
      }
    } catch {
      // non-fatal
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const verdictConfig = analysis ? VERDICT_CONFIG[analysis.verdict] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-indigo-400" />
              Apply
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Paste a JD → AI analyzes → selects best resume → tailors → generates outreach
            </p>
          </div>
          {isSaved && (
            <button
              onClick={() => router.push("/dashboard/tracker")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Saved to Tracker
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Migration Warning */}
        {migrationRequired && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <p className="font-medium mb-1">⚠️ Database migration required</p>
            <p className="text-muted-foreground">
              Run <code className="font-mono bg-muted px-1 rounded text-xs">src/lib/supabase/migrations/001_job_tracker.sql</code> in
              your Supabase SQL editor to enable the Applications Tracker.
            </p>
          </div>
        )}

        {/* Verified Candidate Profile / Fact Bank Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-foreground">Verified Fact Bank Grounding</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active Source of Truth ({factBankStats.projectCount} Projects · {factBankStats.skillCount} Skills)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFactBankModalOpen(true)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="h-3 w-3" />
                Upload / Add Projects & Skills
              </button>
              <button
                onClick={() => router.push("/dashboard/builder")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 px-2 py-1"
              >
                <Edit3 className="h-3 w-3" />
                Resumes
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <div>
              <span className="text-foreground/80 font-medium block">🎓 Education</span>
              IIT Hyderabad · B.Tech (ChemE + Entrepreneurship)
            </div>
            <div>
              <span className="text-foreground/80 font-medium block">💼 Experience</span>
              AVEVA · Software Development Intern (C++, .NET)
            </div>
            <div>
              <span className="text-foreground/80 font-medium block">🚀 Verified Projects</span>
              {factBankStats.projectCount} Projects loaded (Churn, Vendor, Demand Forecasting, IKEA RFM…)
            </div>
          </div>
        </div>

        {/* ─── STEP 1: JD Input ─── */}
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <button
            onClick={() => setStep(step === "jd" ? (analysis ? "analysis" : "jd") : "jd")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                analysis ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
              )}>
                {analysis ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-semibold text-foreground">Job Description</span>
              {analysis && (
                <span className="text-xs text-muted-foreground">
                  {analysis.company} · {analysis.jobTitle}
                </span>
              )}
            </div>
            {step === "jd" ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {step === "jd" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-4 border-t border-border/50 pt-4">
                  {/* URL import */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Paste job posting URL (optional) …"
                        value={jdUrl}
                        onChange={(e) => setJdUrl(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>
                    <button
                      onClick={handleImportUrl}
                      disabled={!jdUrl.trim() || isImportingUrl}
                      className="px-4 py-2.5 text-sm font-medium bg-muted/60 hover:bg-muted border border-border/50 rounded-lg text-foreground disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isImportingUrl ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Import
                    </button>
                  </div>

                  {/* Optional hints */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Company name (optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Job title (optional)"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-muted/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>

                  {/* JD textarea */}
                  <textarea
                    rows={12}
                    placeholder="Paste the full job description here …&#10;&#10;Include everything: requirements, responsibilities, qualifications, compensation."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-muted/40 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-mono leading-relaxed"
                  />

                  {analyzeError && (
                    <p className="text-sm text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {analyzeError}
                    </p>
                  )}

                  <button
                    onClick={analyzeJD}
                    disabled={isAnalyzing || jdText.trim().length < 50}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyzing job description …
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze & Get Verdict
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── STEP 2: Analysis Results ─── */}
        {analysis && (
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <button
              onClick={() => setStep(step === "analysis" ? "jd" : "analysis")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-500/20 text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground">JD Analysis</span>
                {verdictConfig && (
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", verdictConfig.bg, verdictConfig.color)}>
                    {verdictConfig.label}
                  </span>
                )}
              </div>
              {step === "analysis" ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {step === "analysis" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/50 px-6 py-6 space-y-6">
                    {/* Verdict + Score row */}
                    <div className="flex flex-wrap gap-6 items-center">
                      <FitScoreRing score={analysis.fitScore} />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {verdictConfig && (
                            <span className={cn("inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border", verdictConfig.bg, verdictConfig.color)}>
                              <verdictConfig.icon className="h-4 w-4" />
                              {verdictConfig.label}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {ROLE_FAMILY_LABELS[analysis.roleFamily] || analysis.roleFamily}
                          </span>
                          {analysis.location && (
                            <span className="text-xs text-muted-foreground">· {analysis.location}</span>
                          )}
                          {analysis.experienceRequired && (
                            <span className="text-xs text-muted-foreground">· {analysis.experienceRequired}</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{analysis.verdictReason}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Effort: <span className="capitalize font-medium text-foreground">{analysis.timeInvestment}</span>
                          </span>
                          {analysis.estimatedCTC && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Est. CTC: <span className="font-medium text-foreground">{analysis.estimatedCTC}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.matches.length > 0 && (
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">✓ Genuine Matches</h4>
                          <ul className="space-y-1">
                            {analysis.matches.map((m, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                                <span className="text-emerald-400 mt-0.5 shrink-0">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.gaps.length > 0 && (
                        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">△ Genuine Gaps</h4>
                          <ul className="space-y-1">
                            {analysis.gaps.map((g, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                                <span className="text-amber-400 mt-0.5 shrink-0">•</span> {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.disqualifiers.length > 0 && (
                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">✗ Potential Disqualifiers</h4>
                          <ul className="space-y-1">
                            {analysis.disqualifiers.map((d, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                                <span className="text-red-400 mt-0.5 shrink-0">•</span> {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.atsKeywords.length > 0 && (
                        <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-4">
                          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">◆ ATS Keywords</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.atsKeywords.map((kw, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Application strategy */}
                    {analysis.applicationStrategy && (
                      <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" /> Application Strategy
                        </h4>
                        <p className="text-sm text-foreground/90">{analysis.applicationStrategy}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStep("resume")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Select & Tailor Resume
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={saveApplication}
                        disabled={isSaving || isSaved}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border/50 text-foreground text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaved ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
                        {isSaved ? "Saved" : isSaving ? "Saving…" : "Save to Tracker"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── STEP 3: Resume Selection ─── */}
        {analysis && step !== "jd" && (
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <button
              onClick={() => setStep(step === "resume" ? "analysis" : "resume")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  tailoredResumeId ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                )}>
                  {tailoredResumeId ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <span className="font-semibold text-foreground">Select & Tailor Resume</span>
                {selectedResumeId && allResumes.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {allResumes.find((r) => r.id === selectedResumeId)?.title || "Selected"}
                  </span>
                )}
              </div>
              {step === "resume" ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {step === "resume" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/50 px-6 py-6 space-y-4">
                    {isSelectingResume ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        AI is selecting the best resume for this role…
                      </div>
                    ) : allResumes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/50 p-6 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">No saved resumes found.</p>
                        <button
                          onClick={() => router.push("/dashboard/builder")}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Create a Resume in Builder →
                        </button>
                      </div>
                    ) : (
                      <>
                        {selectionReason && (
                          <div className="text-sm text-muted-foreground bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 flex gap-2">
                            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                            {selectionReason}
                          </div>
                        )}
                        <div className="grid gap-2">
                          {allResumes.map((resume) => (
                            <button
                              key={resume.id}
                              onClick={() => setSelectedResumeId(resume.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                                selectedResumeId === resume.id
                                  ? "bg-indigo-500/10 border-indigo-500/40"
                                  : "bg-muted/20 border-border/40 hover:bg-muted/40"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                selectedResumeId === resume.id
                                  ? "border-indigo-400 bg-indigo-400"
                                  : "border-border"
                              )}>
                                {selectedResumeId === resume.id && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-foreground">{resume.title}</span>
                                  {resume.isMaster && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Master</span>
                                  )}
                                  {resume.roleFamily && (
                                    <span className="text-[10px] text-muted-foreground">{ROLE_FAMILY_LABELS[resume.roleFamily] || resume.roleFamily}</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {tailorError && (
                      <p className="text-sm text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {tailorError}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={tailorResume}
                        disabled={!selectedResumeId || isTailoring}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                      >
                        {isTailoring ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" />Tailoring resume…</>
                        ) : (
                          <><Sparkles className="h-4 w-4" />Generate Tailored Resume</>
                        )}
                      </button>
                      {selectedResumeId && (
                        <button
                          onClick={() => router.push(`/dashboard/builder?resumeId=${selectedResumeId}`)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border/50 text-foreground text-sm font-medium transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit in Builder
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── STEP 4: Tailored Resume Result ─── */}
        {tailoredResumeId && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Tailored Resume Ready</p>
                  {tailoredChanges.length > 0 && (
                    <p className="text-xs text-muted-foreground">{tailoredChanges.length} improvements made</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/dashboard/builder?resumeId=${tailoredResumeId}`)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit & Export PDF
                </button>
                <button
                  onClick={() => setStep("tailor")}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-foreground hover:bg-muted/80 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Details
                </button>
              </div>
            </div>
            <AnimatePresence>
              {step === "tailor" && tailoredChanges.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-emerald-500/20 px-6 py-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Changes Made</h4>
                    <ul className="space-y-1">
                      {tailoredChanges.map((change, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                          <span className="text-emerald-400 shrink-0">✓</span> {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── STEP 5: Referral Outreach ─── */}
        {analysis && (
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <button
              onClick={() => setStep(step === "referrals" ? "analysis" : "referrals")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  outreachMessages.length > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                )}>
                  {outreachMessages.length > 0 ? <Check className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </div>
                <span className="font-semibold text-foreground">Referral Outreach</span>
                {contacts.length > 0 && (
                  <span className="text-xs text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</span>
                )}
              </div>
              {step === "referrals" ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {step === "referrals" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/50 px-6 py-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Add LinkedIn contacts for personalized connection requests, referral messages, and forwardable blurbs.
                    </p>

                    {/* Contact inputs */}
                    <div className="space-y-3">
                      {contacts.map((contact, idx) => (
                        <div key={contact.id} className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Contact {idx + 1}</span>
                            <button
                              onClick={() => removeContact(contact.id)}
                              className="text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Full name *"
                              value={contact.name}
                              onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                              className="col-span-2 px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <input
                              type="text"
                              placeholder="Job title"
                              value={contact.jobTitle}
                              onChange={(e) => updateContact(contact.id, "jobTitle", e.target.value)}
                              className="px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <input
                              type="text"
                              placeholder="Department / Team"
                              value={contact.department}
                              onChange={(e) => updateContact(contact.id, "department", e.target.value)}
                              className="px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <input
                              type="url"
                              placeholder="LinkedIn profile URL"
                              value={contact.linkedinUrl}
                              onChange={(e) => updateContact(contact.id, "linkedinUrl", e.target.value)}
                              className="col-span-2 px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <select
                              value={contact.relationship}
                              onChange={(e) => updateContact(contact.id, "relationship", e.target.value)}
                              className="px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            >
                              <option value="unknown">No prior relation</option>
                              <option value="iit_alumni">IIT Hyderabad Alumni</option>
                              <option value="mutual_connection">Mutual connection</option>
                              <option value="met_briefly">Met briefly</option>
                              <option value="know_well">Know well</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Any personal context (optional)"
                              value={contact.notes}
                              onChange={(e) => updateContact(contact.id, "notes", e.target.value)}
                              className="px-3 py-2 text-sm bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addContact}
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </button>

                    {outreachError && (
                      <p className="text-sm text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {outreachError}
                      </p>
                    )}

                    {contacts.filter((c) => c.name.trim()).length > 0 && (
                      <button
                        onClick={generateOutreach}
                        disabled={isGeneratingOutreach}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                      >
                        {isGeneratingOutreach ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" />Generating personalized messages…</>
                        ) : (
                          <><MessageSquare className="h-4 w-4" />Generate Outreach Messages</>
                        )}
                      </button>
                    )}

                    {/* Generated messages */}
                    {outreachMessages.length > 0 && (
                      <div className="space-y-4 pt-2">
                        {outreachMessages.map((msg, i) => (
                          <div key={i} className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Users className="h-4 w-4 text-indigo-400" />
                              {msg.contactName}
                            </h4>

                            <div className="space-y-2">
                              <div className="bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    LinkedIn Connection Request
                                    <span className={cn(
                                      "ml-2 font-mono",
                                      msg.connectionRequest.length > 280 ? "text-red-400" : "text-muted-foreground"
                                    )}>
                                      ({msg.connectionRequest.length}/280)
                                    </span>
                                  </span>
                                  <CopyButton text={msg.connectionRequest} />
                                </div>
                                <p className="text-xs text-foreground/90 leading-relaxed">{msg.connectionRequest}</p>
                              </div>

                              <div className="bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Referral Message (after connecting)</span>
                                  <CopyButton text={msg.referralMessage} />
                                </div>
                                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{msg.referralMessage}</p>
                              </div>

                              <div className="bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Forwardable Blurb (for recruiter)</span>
                                  <CopyButton text={msg.forwardableBlurb} />
                                </div>
                                <p className="text-xs text-foreground/90 leading-relaxed italic">{msg.forwardableBlurb}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Bottom Actions ─── */}
        {analysis && (
          <div className="flex flex-wrap gap-3 pb-8">
            {!isSaved && (
              <button
                onClick={saveApplication}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving…" : "Save Application to Tracker"}
              </button>
            )}
            {tailoredResumeId && (
              <button
                onClick={() => router.push(`/dashboard/builder?resumeId=${tailoredResumeId}`)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 border border-border/50 text-foreground font-medium text-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                Open in Builder / Export PDF
              </button>
            )}
            {analysis && (
              <button
                onClick={() => router.push(`/dashboard/interview`)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 border border-border/50 text-foreground font-medium text-sm transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Interview Prep
              </button>
            )}
            {isSaved && (
              <button
                onClick={() => router.push("/dashboard/tracker")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-sm transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                View in Tracker
              </button>
            )}
          </div>
        )}

        {/* Fact Bank Upload / Management Modal */}
        <FactBankModal
          isOpen={isFactBankModalOpen}
          onClose={() => setIsFactBankModalOpen(false)}
          onUpdated={refreshFactBankStats}
        />
      </div>
    </div>
  );
}
