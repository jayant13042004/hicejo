"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Flame,
  FileText,
  Terminal,
  AlertTriangle,
  HelpCircle,
  RotateCw,
  Info,
  CheckCircle2,
  Upload,
  Sparkles,
  FileCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Share2,
  X,
  AlertCircle,
  Zap
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { consumeCredit } from "@/lib/credits";
import { useResumeStore } from "@/store/useResumeStore";

interface ResumeOption {
  id: string;
  title: string;
}

interface BeforeAfter {
  before: string;
  after: string;
}

interface Critique {
  area: string;
  categoryTag?: string;
  severity?: "critical" | "major" | "minor";
  insult: string;
  quotedText?: string;
  fix: string;
  beforeAfter?: BeforeAfter;
}

interface OverallDiagnostic {
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  topPriority: string;
}

interface RoastResult {
  roastScore: number;
  roastLevel: string;
  brutalIntro: string;
  overallDiagnostic?: OverallDiagnostic;
  critiques: Critique[];
  verdict: string;
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, major: 1, minor: 2 };
const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: "Critical", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/25", dot: "bg-red-500" },
  major: { label: "Major", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/25", dot: "bg-amber-500" },
  minor: { label: "Minor", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", dot: "bg-blue-400" },
};


export default function RoastPage() {
  const router = useRouter();
  const { setPendingImprovement } = useResumeStore();

  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");

  const [isRoasting, setIsRoasting] = React.useState(false);
  const [isExtractingFile, setIsExtractingFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [terminalLines, setTerminalLines] = React.useState<string[]>([]);
  const [roastResult, setRoastResult] = React.useState<RoastResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Before/After expand state per critique index
  const [expandedBeforeAfter, setExpandedBeforeAfter] = React.useState<Set<number>>(new Set());

  // Share card state
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState<string | null>(null);
  const shareCardRef = React.useRef<HTMLDivElement>(null);

  const handleFixInBuilder = (c: Critique) => {
    const areaLower = c.area.toLowerCase();
    let targetSection: "personal" | "summary" | "experience" | "education" | "projects" | "skills" = "experience";
    if (areaLower.includes("skill") || areaLower.includes("stack") || areaLower.includes("tool")) {
      targetSection = "skills";
    } else if (areaLower.includes("summary") || areaLower.includes("intro") || areaLower.includes("objective")) {
      targetSection = "summary";
    } else if (areaLower.includes("edu") || areaLower.includes("degree")) {
      targetSection = "education";
    } else if (areaLower.includes("proj")) {
      targetSection = "projects";
    } else if (areaLower.includes("contact") || areaLower.includes("personal")) {
      targetSection = "personal";
    }

    setPendingImprovement({
      title: `Roast Remedy: ${c.area}`,
      description: c.fix,
      targetSection,
      actionableSnippet: c.fix
    });

    router.push("/dashboard/builder");
  };

  const toggleBeforeAfter = (idx: number) => {
    setExpandedBeforeAfter((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Sort critiques by severity
  const sortedCritiques = React.useMemo(() => {
    if (!roastResult) return [];
    return [...roastResult.critiques].sort((a, b) => {
      const sa = SEVERITY_ORDER[a.severity || "minor"] ?? 2;
      const sb = SEVERITY_ORDER[b.severity || "minor"] ?? 2;
      return sa - sb;
    });
  }, [roastResult]);

  // Share card capture
  const handleCaptureCard = async (mode: "download" | "clipboard") => {
    if (!shareCardRef.current) return;
    setIsCapturing(true);
    setShareSuccess(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#09090b",
        logging: false,
      });

      if (mode === "download") {
        const link = document.createElement("a");
        link.download = `hicejo-roast-score-${roastResult?.roastScore || 0}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setShareSuccess("Card downloaded!");
      } else {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setShareSuccess("Copied to clipboard!");
          } catch {
            // Fallback: download instead
            const link = document.createElement("a");
            link.download = `hicejo-roast-score-${roastResult?.roastScore || 0}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            setShareSuccess("Downloaded (clipboard not supported)");
          }
        }, "image/png");
      }
    } catch (err) {
      console.error("Card capture failed:", err);
      setShareSuccess("Failed to capture card");
    } finally {
      setIsCapturing(false);
      setTimeout(() => setShareSuccess(null), 3000);
    }
  };

  // Fetch resumes list on mount
  React.useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resume");
        const result = await res.json();
        if (result.success && result.data) {
          setResumes(result.data);
          if (result.data.length > 0) {
            setSelectedResumeId(result.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load drafts:", err);
      }
    };
    loadResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingFile(true);
    setError(null);
    setUploadedFileName(file.name);
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
      setError("File upload connection failed. Please paste text directly.");
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === "draft" && !selectedResumeId) {
      setError("Please select a saved resume draft or switch to 'Paste / Upload Text'.");
      return;
    }
    if (sourceType === "text" && !resumeText.trim()) {
      setError("Please enter or paste your resume text, or upload a document to roast.");
      return;
    }

    setIsRoasting(true);
    setError(null);
    setRoastResult(null);
    setExpandedBeforeAfter(new Set());
    setTerminalLines([
      "guest@hicejo:~$ roast-resume --mode brutal_critique --target profile",
      "[INFO] Initializing Hicejo Roasting Suite v3.0...",
      "[INFO] Ingesting candidate credentials and experience narrative..."
    ]);

    try {
      const roastPromise = fetch("/api/ai/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText.trim() : undefined
        })
      });

      setTimeout(() => {
        setTerminalLines((prev) => [
          ...prev,
          "[WARN] Cliché detection: Found generic adjectives & unverified claims.",
          "[INFO] Analyzing impact metrics, severity, and bullet density...",
          "[INFO] Cross-referencing against 50,000+ resume patterns...",
          "[INFO] Packaging payload to Tough Recruiter AI agent..."
        ]);
      }, 350);

      const res = await roastPromise;
      const result = await res.json();

      if (result.success && result.data) {
        setTerminalLines((prev) => [
          ...prev,
          "[SUCCESS] Critique package retrieved. Compiling severity-graded burn report."
        ]);
        setRoastResult(result.data);
        consumeCredit("roast");
      } else {
        setError(result.error || "Failed to roast resume. Please try again.");
      }
    } catch (err: any) {
      setError("Server connection failure. Please check your network and try again.");
    } finally {
      setIsRoasting(false);
    }
  };

  // SVG Radial progress for score
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = roastResult
    ? circumference - (roastResult.roastScore / 100) * circumference
    : circumference;
  const scoreColor = roastResult
    ? roastResult.roastScore >= 70 ? "#22c55e"
      : roastResult.roastScore >= 50 ? "#f59e0b"
      : roastResult.roastScore >= 30 ? "#f97316"
      : "#ef4444"
    : "#ef4444";

  const diag = roastResult?.overallDiagnostic;

  return (
    <DashboardShell title="Resume Roast Room" featureKey="roast">
      <div className="space-y-6">
        <div className="pb-4 border-b border-border/60">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Critical Resume Audit & Roast
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Severity-graded critique exposing weak phrasing, passive verbs, and missing metrics with direct rewrite remedies.
          </p>
        </div>

        {/* Dynamic Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Config Forms (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>Roast Configurator</span>
                </CardTitle>
                <CardDescription>Select target resume to incinerate.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRoast} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Input Source Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Resume Source
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setSourceType("draft");
                          setError(null);
                        }}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "draft"
                            ? "bg-card shadow-sm text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Saved Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSourceType("text");
                          setError(null);
                        }}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "text"
                            ? "bg-card shadow-sm text-foreground font-semibold"
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
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Resume Draft
                      </label>
                      {resumes.length > 0 ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {resumes.map((res) => (
                            <option key={res.id} value={res.id}>
                              {res.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-muted-foreground py-3 px-3 rounded-lg border border-dashed border-border flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-amber-500 font-semibold">
                            <Info className="h-4 w-4" />
                            <span>No saved drafts found</span>
                          </div>
                          <p className="text-muted-foreground">
                            Switch to <strong>Paste / Upload Text</strong> tab above to paste your resume or upload a file.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSourceType("text")}
                            className="text-xs h-7 self-start"
                          >
                            Switch to Paste / Upload Text
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Resume Text Content
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-semibold uppercase tracking-wide">
                            {isExtractingFile ? (
                              <RotateCw className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            <span>{isExtractingFile ? "Extracting..." : "Upload File"}</span>
                            <input
                              type="file"
                              accept=".txt,.pdf,.docx"
                              onChange={handleFileUpload}
                              disabled={isExtractingFile}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {uploadedFileName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Extracted text from: {uploadedFileName}</span>
                        </div>
                      )}

                      <textarea
                        rows={7}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 font-semibold h-10"
                    isLoading={isRoasting}
                    disabled={isRoasting || isExtractingFile}
                  >
                    <Flame className="h-4 w-4" />
                    <span>{isRoasting ? "Analyzing Anti-Patterns..." : "Audit & Roast Resume"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Terminal Feed View during roasting */}
            {isRoasting && (
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-xs shadow-2xl">
                <CardHeader className="py-2.5 px-4 border-b border-zinc-800/80 bg-zinc-900/50 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-[11px] font-semibold text-zinc-300">roast_engine.log</span>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                </CardHeader>
                <CardContent className="p-4 space-y-1.5 min-h-[140px] max-h-[220px] overflow-y-auto">
                  {terminalLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed ${
                        line.startsWith("[WARN]")
                          ? "text-amber-400 font-medium"
                          : line.startsWith("[SUCCESS]")
                          ? "text-emerald-400 font-bold"
                          : line.startsWith("guest")
                          ? "text-zinc-400 font-bold"
                          : "text-zinc-300"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Panel (Right) */}
          <div className="lg:col-span-7">
            {roastResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Score Banner with Radial Ring */}
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent p-6 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                      {/* SVG Radial Score Ring */}
                      <div className="relative h-[120px] w-[120px] shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border/30" />
                          <circle
                            cx="60" cy="60" r={radius} fill="none"
                            stroke={scoreColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={scoreOffset}
                            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black tracking-tight" style={{ color: scoreColor }}>
                            {roastResult.roastScore}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">/ 100</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                          <Flame className="h-3.5 w-3.5" />
                          {roastResult.roastLevel}
                        </span>
                        <h3 className="text-lg font-bold text-foreground">
                          Savage Diagnostic Report
                        </h3>

                        {/* Severity Summary */}
                        {diag && (
                          <div className="flex items-center gap-3 text-[11px] font-semibold">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              <span className="text-red-500">{diag.criticalCount} Critical</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              <span className="text-amber-500">{diag.majorCount} Major</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-blue-400" />
                              <span className="text-blue-400">{diag.minorCount} Minor</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Share Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsShareModalOpen(true)}
                      className="gap-1.5 text-xs font-semibold border-border/60 self-start sm:self-center shrink-0"
                    >
                      <Share2 className="h-3.5 w-3.5 text-primary" />
                      <span>Share My Roast</span>
                    </Button>
                  </div>

                  {/* Brutal Intro */}
                  <p className="mt-4 text-sm text-foreground/90 leading-relaxed font-serif italic border-l-2 border-red-500/50 pl-3">
                    &ldquo;{roastResult.brutalIntro}&rdquo;
                  </p>

                  {/* Top Priority Callout */}
                  {diag?.topPriority && (
                    <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                          Fix This First
                        </span>
                        <p className="text-foreground/90 mt-0.5 leading-relaxed">
                          {diag.topPriority}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Critiques List — sorted by severity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Section Roasts & Prescriptions
                  </h4>

                  {sortedCritiques.map((c, i) => {
                    const sev = SEVERITY_CONFIG[c.severity || "minor"] || SEVERITY_CONFIG.minor;
                    const isExpanded = expandedBeforeAfter.has(i);

                    return (
                      <Card key={i} className="border-border/60 overflow-hidden">
                        <div className="border-b border-border/40 px-4 py-2 bg-muted/30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${sev.bg} ${sev.color} ${sev.border}`}>
                              {sev.label}
                            </span>
                            <span className="text-xs font-bold text-primary uppercase tracking-wider truncate">
                              {c.area}
                            </span>
                            {c.categoryTag && (
                              <span className="hidden sm:inline text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted border border-border/40">
                                {c.categoryTag}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            #CRITIQUE-0{i + 1}
                          </span>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          {/* Quoted Text */}
                          {c.quotedText && (
                            <div className="px-3 py-2 rounded-md bg-muted/50 border border-border/40 text-[11px] font-mono text-muted-foreground leading-relaxed">
                              &ldquo;{c.quotedText}&rdquo;
                            </div>
                          )}

                          {/* The Roast */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                              <Flame className="h-3.5 w-3.5 shrink-0" />
                              <span>The Roast</span>
                            </div>
                            <p className="text-xs text-foreground/90 leading-relaxed">
                              {c.insult}
                            </p>
                          </div>

                          {/* How to Fix It */}
                          <div className="space-y-2 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>How to Fix It</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleFixInBuilder(c)}
                                className="h-6 px-2 text-[11px] font-semibold border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3 text-emerald-500" />
                                <span>Fix in Builder</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {c.fix}
                            </p>
                          </div>

                          {/* Before → After (collapsible) */}
                          {c.beforeAfter && (
                            <div>
                              <button
                                type="button"
                                onClick={() => toggleBeforeAfter(i)}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                <span>{isExpanded ? "Hide" : "Show"} Before → After Rewrite</span>
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-[11px]">
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Before</span>
                                        <p className="mt-1 text-muted-foreground leading-relaxed line-through decoration-red-500/30">
                                          {c.beforeAfter.before}
                                        </p>
                                      </div>
                                      <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[11px]">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">After</span>
                                        <p className="mt-1 text-foreground/90 leading-relaxed">
                                          {c.beforeAfter.after}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Final Verdict */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Final Executive Verdict
                    </h5>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                      {roastResult.verdict}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="border border-border/80 rounded-xl bg-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Severity-Graded Audit Framework</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submissions undergo line-by-line inspection to pinpoint hiring anti-patterns.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                    Awaiting Draft
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>Critical Flaws</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Instant recruiter discards: typos, buzzword stuffing, missing metrics, and passive job duty lists.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>Major Weaknesses</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Vague achievements, buried impact, inconsistent timelines, and weak technical verbs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-blue-500/30 bg-blue-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>Minor Polish</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Formatting cadence, bullet point length optimization, and vocabulary precision.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Each critique provides an automated 1-click remedy to patch directly in the Builder.</span>
                  <span className="font-mono text-[11px] font-semibold text-foreground">Actionable</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Share Modal ===== */}
      <AnimatePresence>
        {isShareModalOpen && roastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Share Your Roast</h3>
                </div>
                <button onClick={() => setIsShareModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="mx-5 mt-4 flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span><strong>Privacy safe:</strong> This card only shows your score and a witty tagline. No personal information, company names, or resume content is included.</span>
              </div>

              {/* Card Preview */}
              <div className="p-5">
                <div
                  ref={shareCardRef}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
                    padding: "32px",
                    width: "100%",
                  }}
                >
                  {/* Card Inner */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Top Row: Logo + Badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>🔥</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#a1a1aa", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                          Resume Roast
                        </span>
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: 800, color: "#ef4444",
                        padding: "3px 10px", borderRadius: "999px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        backgroundColor: "rgba(239,68,68,0.1)"
                      }}>
                        {roastResult.roastLevel}
                      </span>
                    </div>

                    {/* Score Display */}
                    <div style={{ textAlign: "center" as const }}>
                      <div style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1, color: scoreColor }}>
                        {roastResult.roastScore}
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#71717a", marginTop: "4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                        out of 100
                      </div>
                    </div>

                    {/* Severity Bar */}
                    {diag && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontSize: "12px", fontWeight: 700 }}>
                        <span style={{ color: "#ef4444" }}>● {diag.criticalCount} Critical</span>
                        <span style={{ color: "#f59e0b" }}>● {diag.majorCount} Major</span>
                        <span style={{ color: "#60a5fa" }}>● {diag.minorCount} Minor</span>
                      </div>
                    )}

                    {/* Tagline */}
                    <div style={{
                      fontSize: "13px", fontStyle: "italic", color: "#d4d4d8",
                      lineHeight: 1.6, textAlign: "center" as const,
                      borderTop: "1px solid rgba(63,63,70,0.5)",
                      paddingTop: "16px"
                    }}>
                      &ldquo;{roastResult.brutalIntro}&rdquo;
                    </div>

                    {/* Watermark */}
                    <div style={{
                      fontSize: "11px", fontWeight: 700, color: "#52525b",
                      textAlign: "center" as const, letterSpacing: "0.05em"
                    }}>
                      🔥 Roasted by Hicejo — hicejo.com
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between px-5 pb-5 gap-3">
                {shareSuccess && (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {shareSuccess}
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCaptureCard("clipboard")}
                    disabled={isCapturing}
                    className="text-xs gap-1.5 font-semibold"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy to Clipboard</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleCaptureCard("download")}
                    disabled={isCapturing}
                    className="text-xs gap-1.5 font-bold bg-gradient-to-r from-orange-500 to-red-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Card</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
