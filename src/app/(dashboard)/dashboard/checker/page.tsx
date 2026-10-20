"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Search,
  Upload,
  Layers,
  Target,
  ArrowRight,
  Award,
  AlertCircle,
  HelpCircle,
  Check,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { consumeCredit } from "@/lib/credits";
import { ApplicationStrengthResult, PillarScore, UpliftStep } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";

interface ResumeOption {
  id: string;
  title: string;
}

export default function CheckerPage() {
  const router = useRouter();
  const { setActiveJobContext, activeJobContext } = useResumeStore();

  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [scanMode, setScanMode] = React.useState<"general" | "targeted">("targeted");
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [company, setCompany] = React.useState(activeJobContext?.company || "");
  const [jobTitle, setJobTitle] = React.useState(activeJobContext?.jobTitle || "");
  const [jobDescription, setJobDescription] = React.useState(activeJobContext?.jobDescription || "");
  
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ApplicationStrengthResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedPillarId, setExpandedPillarId] = React.useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = React.useState<"strengths" | "weaknesses" | "missing" | "risks">("strengths");

  const [isFixingAll, setIsFixingAll] = React.useState(false);

  // Connected OS Workflow Bridge Handlers
  const handleFixEverythingAtOnce = async () => {
    if (!scanResult) return;
    setIsFixingAll(true);
    try {
      let effectiveResumeId = selectedResumeId;

      // If user scanned raw text, create a draft first so builder has a dedicated record
      if (sourceType === "text" && !effectiveResumeId && resumeText.trim()) {
        try {
          const createRes = await fetch("/api/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: jobTitle ? `${jobTitle.trim()} Resume` : "Candidate Resume",
              content: {
                personalInfo: { fullName: "Candidate", email: "", phone: "", location: "", website: "", linkedin: "" },
                summary: resumeText.slice(0, 300),
                experience: [
                  {
                    id: "exp-1",
                    company: "Previous Experience",
                    position: jobTitle || "Software Engineer",
                    location: "",
                    startDate: "2021",
                    endDate: "Present",
                    current: true,
                    description: resumeText.slice(300, 1000)
                  }
                ],
                education: [],
                projects: [],
                skills: []
              }
            })
          });
          const created = await createRes.json();
          if (created.success && created.data) {
            effectiveResumeId = created.data.id;
          }
        } catch {}
      }

      const res = await fetch("/api/ai/apply-all-fixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: effectiveResumeId || undefined,
          resumeContent: sourceType === "text" ? resumeText : undefined,
          upliftPath: scanResult.upliftPath,
          missingKeywords: scanResult.missingKeywords,
          targetRole: jobTitle.trim() || "Target Role",
          targetCompany: company.trim() || activeJobContext?.company || "Target Company",
          projectedScore: scanResult.projectedScore
        })
      });

      const json = await res.json();
      if (json.success && json.resumeId) {
        setActiveJobContext({
          jobTitle: jobTitle.trim() || "Target Role",
          company: company.trim() || activeJobContext?.company || "",
          jobDescription: jobDescription.trim(),
          atsScore: json.newScore || scanResult.projectedScore,
          matchTier: "strong",
          sourceTool: "checker",
          pendingImprovement: {
            type: "uplift",
            title: "All Diagnostic Fixes Applied",
            description: `Applied ${json.fixesAppliedCount || scanResult.upliftPath.length} uplift improvements and keyword optimizations to reach ${json.newScore || scanResult.projectedScore} score.`,
            details: `Applied ${json.fixesAppliedCount || scanResult.upliftPath.length} uplift improvements and keyword optimizations to reach ${json.newScore || scanResult.projectedScore} score.`,
            targetSection: "experience"
          }
        });

        // Automatically open the particular resume in the builder
        router.push(`/dashboard/builder?id=${json.resumeId}&fixed=all`);
      } else {
        if (effectiveResumeId) {
          router.push(`/dashboard/builder?id=${effectiveResumeId}`);
        } else {
          router.push("/dashboard/builder");
        }
      }
    } catch (err) {
      console.error("Auto-apply all fixes error:", err);
      if (selectedResumeId) {
        router.push(`/dashboard/builder?id=${selectedResumeId}`);
      } else {
        router.push("/dashboard/builder");
      }
    } finally {
      setIsFixingAll(false);
    }
  };

  const handleApplyUpliftStepToBuilder = async (step: UpliftStep) => {
    let targetResumeId = selectedResumeId;

    // If user evaluated raw text without a draft, create one
    if (!targetResumeId && sourceType === "text" && resumeText.trim()) {
      try {
        const createRes = await fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: jobTitle ? `${jobTitle.trim()} Resume` : "Candidate Resume",
            content: {
              personalInfo: { fullName: "Candidate", email: "", phone: "", location: "", website: "", linkedin: "" },
              summary: resumeText.slice(0, 300),
              experience: [{ id: "exp-1", company: "Experience", position: jobTitle || "Engineer", location: "", startDate: "2021", endDate: "Present", current: true, description: resumeText.slice(300, 800) }],
              education: [],
              projects: [],
              skills: []
            }
          })
        });
        const created = await createRes.json();
        if (created.success && created.data) {
          targetResumeId = created.data.id;
        }
      } catch {}
    }

    setActiveJobContext({
      jobTitle: jobTitle.trim() || "Target Role",
      company: company.trim() || activeJobContext?.company || "",
      jobDescription: jobDescription.trim(),
      atsScore: scanResult?.score,
      matchTier: scanResult?.tierLabel,
      sourceTool: "checker",
      pendingImprovement: {
        type: "uplift",
        title: step.title,
        description: `${step.action} (Goal: ${step.rationale})`,
        details: `${step.action} (Goal: ${step.rationale})`,
        targetSection: "experience"
      }
    });

    const targetUrl = targetResumeId
      ? `/dashboard/builder?id=${targetResumeId}&step=${encodeURIComponent(step.title)}`
      : "/dashboard/builder";
    router.push(targetUrl);
  };

  const handleOpenInBuilder = () => {
    setActiveJobContext({
      jobTitle: jobTitle.trim() || "Target Role",
      company: company.trim() || activeJobContext?.company || "",
      jobDescription: jobDescription.trim(),
      atsScore: scanResult?.score,
      matchTier: scanResult?.tierLabel,
      sourceTool: "checker"
    });
    const targetUrl = selectedResumeId
      ? `/dashboard/builder?id=${selectedResumeId}`
      : "/dashboard/builder";
    router.push(targetUrl);
  };

  const handleGenerateCoverLetter = () => {
    setActiveJobContext({
      jobTitle: jobTitle.trim() || "Target Role",
      company: company.trim() || activeJobContext?.company || "",
      jobDescription: jobDescription.trim(),
      atsScore: scanResult?.score,
      matchTier: scanResult?.tierLabel,
      sourceTool: "checker"
    });
    router.push("/dashboard/cover-letter");
  };

  // Fetch resumes list on mount
  React.useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resume");
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setResumes(result.data);
          setSelectedResumeId(result.data[0].id);
        } else {
          setSourceType("text");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadResumes();
  }, []);

  // Prefill target position, company, and JD from active job context if navigated from Jobs page
  React.useEffect(() => {
    if (activeJobContext) {
      if (activeJobContext.company) setCompany(activeJobContext.company);
      if (activeJobContext.jobTitle) setJobTitle(activeJobContext.jobTitle);
      if (activeJobContext.jobDescription) setJobDescription(activeJobContext.jobDescription);
      if (activeJobContext.jobDescription || activeJobContext.jobTitle || activeJobContext.company) {
        setScanMode("targeted");
      }
    }
  }, [activeJobContext]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setError(null);
    try {
      const fData = new FormData();
      fData.append("file", file);
      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: fData
      });
      const result = await res.json();
      if (result.success && result.text) {
        setResumeText(result.text);
      } else {
        setError(result.error || "Failed to extract text from file.");
      }
    } catch {
      setError("File upload connection failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) {
      setError("Please select a resume draft or paste your resume text.");
      return;
    }
    if (sourceType === "text" && !resumeText.trim()) {
      setError("Please paste or upload your resume text content.");
      return;
    }

    if (scanMode === "targeted" && (!jobDescription || !jobDescription.trim())) {
      setError("Please paste a target job description to evaluate application strength, or switch to 'General ATS Audit' mode.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await fetch("/api/ai/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText.trim() : undefined,
          checkWithoutJd: scanMode === "general",
          company: scanMode === "targeted" ? (company.trim() || undefined) : undefined,
          jobTitle: scanMode === "targeted" ? (jobTitle.trim() || "Target Role") : undefined,
          jobDescription: scanMode === "targeted" ? jobDescription.trim() : undefined
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        setScanResult(result.data);
        consumeCredit("ats_check");
      } else {
        setError(result.error || "Failed to analyze application strength.");
      }
    } catch {
      setError("Server connection failure. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  // SVG Radial progress calculations
  const radius = 54;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = scanResult
    ? circumference - (scanResult.score / 100) * circumference
    : circumference;

  return (
    <DashboardShell title="Application Strength & ATS Diagnostics" featureKey="ats_check">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Intro */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Application Strength Diagnostic
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Beyond standard keyword counts. Hicejo evaluates your full application alignment across 8 core hiring pillars and provides an honest, actionable score uplift path.
          </p>
        </div>

        {/* Form and Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Configurator Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Diagnostic Inputs</CardTitle>
                <CardDescription className="text-xs">
                  Provide your target job requirements and candidate resume.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScan} className="space-y-5">
                  {error && (
                    <div className="rounded-xl bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/25 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Mode Selector Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Evaluation Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setScanMode("targeted")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                          scanMode === "targeted"
                            ? "bg-card shadow-xs text-primary font-bold border border-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Target className="h-3.5 w-3.5" />
                        <span>Targeted JD Match</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanMode("general")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                          scanMode === "general"
                            ? "bg-card shadow-xs text-foreground font-bold border border-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>General ATS Audit</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Source Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Resume Source
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setSourceType("draft")}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "draft"
                            ? "bg-card shadow-xs text-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Saved Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceType("text")}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "text"
                            ? "bg-card shadow-xs text-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Paste / Upload Text
                      </button>
                    </div>
                  </div>

                  {/* Contextual Input Fields */}
                  {sourceType === "draft" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Select Resume Draft
                      </label>
                      {resumes.length > 0 ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                        >
                          {resumes.map((res) => (
                            <option key={res.id} value={res.id}>
                              {res.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-muted-foreground py-2 px-1 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>No drafts found. Switch to Paste Text or create one in Builder.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Resume Text
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-semibold uppercase tracking-wider">
                          <Upload className="h-3 w-3" />
                          <span>Upload File (PDF/DOCX)</span>
                          <input
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <textarea
                        rows={7}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        required
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed font-mono"
                      />
                    </div>
                  )}

                  {/* Target JD Fields */}
                  {scanMode === "targeted" ? (
                    <div className="space-y-4 pt-2 border-t border-border/40">
                      {activeJobContext && (activeJobContext.company || activeJobContext.jobTitle) && (
                        <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 flex items-center justify-between text-xs text-primary font-medium">
                          <div className="flex items-center gap-2 truncate">
                            <Target className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              Prefilled from Target Job: <strong>{jobTitle || activeJobContext.jobTitle || "Role"}</strong> {(company || activeJobContext.company) ? `@ ${company || activeJobContext.company}` : ""}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Target Company
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Stripe, Google, etc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Target Role Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Target Job Description (Required for 8-Pillar Match)
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Paste the target job description, responsibilities, and requirements here..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          required
                          className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground border border-border/40 flex items-start gap-2.5">
                      <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>General Standard Audit:</strong> Evaluates ATS parseability, header standards, quantified metrics, action verbs, and readability without a specific job description.
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold h-10 shadow-xs"
                    isLoading={isScanning}
                    disabled={
                      (sourceType === "draft" && resumes.length === 0) ||
                      (sourceType === "text" && !resumeText.trim()) ||
                      (scanMode === "targeted" && !jobDescription.trim())
                    }
                  >
                    <Search className="h-4 w-4" />
                    <span>
                      {scanMode === "targeted"
                        ? "Evaluate Application Strength (8 Pillars)"
                        : "Run General ATS Audit"}
                    </span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Diagnostics Column (Right) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isScanning && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center justify-center py-24 text-center space-y-4 border border-border/40 rounded-2xl bg-card/40"
                >
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-base text-foreground">
                      {scanMode === "targeted"
                        ? "Analyzing Application Strength across 8 Pillars..."
                        : "Auditing Resume Standards & ATS Compliance..."}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Evaluating skills, experience relevance, seniority, achievements, and structural integrity.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isScanning && !scanResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-border/80 rounded-xl bg-card p-6 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Diagnostic Dimensions Benchmark</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Each application is evaluated against 8 rigorous hiring pillars upon submission.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                      Ready to Analyze
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { num: "01", name: "Role Alignment", desc: "Verifies scope, responsibilities, and target title match against job description." },
                      { num: "02", name: "Hard Skills Depth", desc: "Audits core technical stack, libraries, tooling, and domain knowledge." },
                      { num: "03", name: "Experience Relevance", desc: "Measures project context, domain overlap, and architectural complexity." },
                      { num: "04", name: "Quantified Impact", desc: "Evaluates metrics, percentages, revenue, latency, and scale indicators." },
                      { num: "05", name: "Seniority Calibration", desc: "Checks leadership, ownership, autonomy, and cross-functional signals." },
                      { num: "06", name: "ATS Parsability", desc: "Tests heading hierarchy, plain text extraction, and token consistency." },
                      { num: "07", name: "Recruiter Risk Scan", desc: "Detects ambiguous timelines, buzzword overuse, and unproven claims." },
                      { num: "08", name: "Keyword Integrity", desc: "Compares exact and semantic phrase frequency without keyword stuffing." },
                    ].map((pillar) => (
                      <div key={pillar.num} className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground font-semibold">{pillar.num}</span>
                          <span className="font-semibold text-foreground">{pillar.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Select a resume draft or paste your text on the left to begin your audit.</span>
                    <span className="font-mono text-[11px] font-semibold text-foreground">8 Pillars</span>
                  </div>
                </motion.div>
              )}

              {!isScanning && scanResult && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="space-y-6"
                >
                  {/* Diagnostic Summary Header */}
                  <div className="border border-border/80 rounded-xl bg-card p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-5 border-b border-border/60">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary border border-border/60 min-w-[100px] text-center">
                          <span className="font-mono text-3xl font-black tracking-tight text-foreground">{scanResult.score}</span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">Score / 100</span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                                scanResult.tierLabel === "Top Tier Contender"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : scanResult.tierLabel === "Strong Match"
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : scanResult.tierLabel === "Moderate Match"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-destructive/10 text-destructive border-destructive/30"
                              }`}
                            >
                              {scanResult.tierLabel}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              Readability: <strong className="text-foreground">{scanResult.readabilityScore}%</strong>
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground">
                            {scanResult.isTargeted ? (jobTitle ? `${jobTitle}${company ? ` @ ${company}` : ""} Evaluation` : "Target Application Alignment") : "General Resume ATS Baseline"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Evaluated across 8 hiring dimensions grounded strictly in verifiable resume evidence.
                          </p>
                        </div>
                      </div>

                      {/* Uplift Target Box */}
                      <div className="flex flex-col sm:items-end justify-center p-3.5 rounded-xl bg-secondary/60 border border-border/60 min-w-[160px] text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          Achievable Uplift
                        </span>
                        <div className="flex items-center sm:justify-end gap-2 mt-1">
                          <span className="font-mono text-lg font-bold text-muted-foreground">{scanResult.score}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">{scanResult.projectedScore}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          +{scanResult.potentialUplift} pts achievable
                        </span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-semibold">Executive Assessment: </strong>
                      {scanResult.executiveSummary}
                    </div>

                    {/* Quick OS Bridge CTAs */}
                    <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Ready to update resume draft directly with verified evidence.</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {scanResult.isTargeted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGenerateCoverLetter}
                            className="text-xs h-8 gap-1.5 font-semibold"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Cover Letter</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={handleOpenInBuilder}
                          className="bg-primary text-primary-foreground text-xs h-8 gap-1.5 font-bold shadow-xs"
                        >
                          <span>Open in Builder</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* 1. WHAT IS HURTING YOUR APPLICATION? (Problem → Why → Fix → Execute)     */}
                  {/* ========================================================================= */}
                  <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs space-y-0">
                    <div className="p-4 bg-secondary/50 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>What is hurting your application?</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Problem &rarr; Why It Matters &rarr; How to Fix &rarr; Execute
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleFixEverythingAtOnce}
                        disabled={isFixingAll}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 gap-1.5 shadow-xs cursor-pointer shrink-0"
                      >
                        {isFixingAll ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Applying All Fixes...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Apply All Fixes in Builder (+{scanResult.potentialUplift || 6} pts)</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {scanResult.upliftPath.map((step, idx) => (
                        <div key={idx} className="p-4.5 hover:bg-secondary/20 transition-colors space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono text-[10px] font-bold h-5 w-5 rounded-full bg-secondary border border-border/60 text-foreground flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">
                                  {step.title}
                                </h5>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                +{step.estimatedPoints} pts
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplyUpliftStepToBuilder(step)}
                                className="text-[11px] h-7 px-3 gap-1 font-semibold text-primary hover:text-primary-foreground hover:bg-primary"
                              >
                                <span>Fix in Builder</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="pl-7.5 space-y-1.5 text-xs">
                            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                              <p className="text-foreground leading-relaxed">
                                <strong className="text-muted-foreground uppercase text-[10px] tracking-wider block">Why it matters:</strong>
                                {step.rationale}
                              </p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              <strong className="text-foreground font-semibold">How to fix it: </strong>
                              {step.action}
                            </p>
                            <div className="text-[11px] text-muted-foreground">
                              <span>Context: </span>
                              <span className="text-primary font-medium italic">{step.groundedContext}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* 2. 8-DIMENSION COMPETENCY DIAGNOSTIC (Detailed Diagnostic Underneath)      */}
                  {/* ========================================================================= */}
                  <div className="border border-border/80 rounded-xl bg-card p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          8-Dimension Competency Diagnostic
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Detailed breakdown across hiring dimensions. Click any dimension to inspect findings and guidance.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">All 8 Pillars Evaluated</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {scanResult.pillars.map((pillar) => {
                        const isExpanded = expandedPillarId === pillar.id;
                        return (
                          <div
                            key={pillar.id}
                            onClick={() => setExpandedPillarId(isExpanded ? null : pillar.id)}
                            className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                              isExpanded
                                ? "border-primary/60 bg-secondary shadow-xs"
                                : "border-border/60 hover:border-border hover:bg-secondary/40 bg-card"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-foreground">{pillar.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">Weight: {pillar.weight}%</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-mono font-bold ${
                                    pillar.score >= 80
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : pillar.score >= 65
                                      ? "text-primary"
                                      : "text-amber-600 dark:text-amber-400"
                                  }`}
                                >
                                  {pillar.score}%
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            {/* Crisp progress bar */}
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-2 border border-border/40">
                              <div
                                className={`h-full transition-all ${
                                  pillar.score >= 80
                                    ? "bg-emerald-500"
                                    : pillar.score >= 65
                                    ? "bg-primary"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${pillar.score}%` }}
                              />
                            </div>

                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 pt-2.5 border-t border-border/40 text-xs space-y-1.5"
                              >
                                <p className="text-muted-foreground leading-relaxed">
                                  <strong className="text-foreground">Diagnostic:</strong> {pillar.summary}
                                </p>
                                <p className="text-primary font-medium leading-relaxed">
                                  💡 <strong>Guidance:</strong> {pillar.recommendation}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3-Column Diagnostic Breakdown: Demonstrated vs Missing vs Risks */}
                  <div className="border border-border/80 rounded-xl bg-card shadow-xs overflow-hidden">
                    <div className="border-b border-border/60 bg-secondary/40 px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveAnalysisTab("strengths")}
                          className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors cursor-pointer ${
                            activeAnalysisTab === "strengths"
                              ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Verified Strengths ({scanResult.strengths.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAnalysisTab("weaknesses")}
                          className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors cursor-pointer ${
                            activeAnalysisTab === "weaknesses"
                              ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Partial Matches ({scanResult.weaknesses.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAnalysisTab("missing")}
                          className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors cursor-pointer ${
                            activeAnalysisTab === "missing"
                              ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Missing Requirements ({scanResult.missingRequirements.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAnalysisTab("risks")}
                          className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors cursor-pointer ${
                            activeAnalysisTab === "risks"
                              ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Recruiter Vulnerabilities ({scanResult.recruiterRisks.length})
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {activeAnalysisTab === "strengths" && (
                        <div className="space-y-2">
                          {scanResult.strengths.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-secondary/30 text-xs text-foreground"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeAnalysisTab === "weaknesses" && (
                        <div className="space-y-2">
                          {scanResult.weaknesses.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-secondary/30 text-xs text-foreground"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeAnalysisTab === "missing" && (
                        <div className="space-y-2">
                          {scanResult.missingRequirements.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs text-foreground"
                            >
                              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                          {scanResult.missingRequirements.length === 0 && (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              ✓ No critical job requirements are missing from your resume draft.
                            </div>
                          )}
                        </div>
                      )}

                      {activeAnalysisTab === "risks" && (
                        <div className="space-y-2">
                          {scanResult.recruiterRisks.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-secondary/30 text-xs text-foreground"
                            >
                              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                          {scanResult.recruiterRisks.length === 0 && (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              ✓ No major recruiter vulnerabilities identified.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Keyword Alignment Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Missing Role Keywords */}
                    <div className="border border-border/80 rounded-xl bg-card p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                          Missing Keywords
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {scanResult.missingKeywords.length} terms
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] font-medium px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                        {scanResult.missingKeywords.length === 0 && (
                          <span className="text-xs text-muted-foreground">Complete keyword coverage for target role.</span>
                        )}
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    <div className="border border-border/80 rounded-xl bg-card p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Matched Keywords
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {scanResult.matchedKeywords.length} terms
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Structural & Formatting Warnings */}
                  {scanResult.formattingIssues.length > 0 && (
                    <div className="border border-border/80 rounded-xl bg-card p-4 shadow-xs space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Structural & Formatting Warnings
                      </span>
                      <div className="space-y-2 pt-1">
                        {scanResult.formattingIssues.map((issue, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/60 bg-secondary/30 text-xs text-muted-foreground"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
