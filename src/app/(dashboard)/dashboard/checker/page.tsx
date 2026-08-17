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
  Upload
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeOption {
  id: string;
  title: string;
}

interface ScanResult {
  score: number;
  readabilityScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  narrativeCheck: string;
}

export default function CheckerPage() {
  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
        console.error(err);
      }
    };
    loadResumes();
  }, []);

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
    if (sourceType === "draft" && !selectedResumeId) return;
    if (sourceType === "text" && !resumeText.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await fetch("/api/ai/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText : undefined,
          jobTitle: jobTitle || "General Audit",
          jobDescription: jobDescription || ""
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        setScanResult(result.data);
      } else {
        setError(result.error || "Failed to scan resume.");
      }
    } catch {
      setError("Server connection failure.");
    } finally {
      setIsScanning(false);
    }
  };

  // SVG Radial progress calculations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = scanResult
    ? circumference - (scanResult.score / 100) * circumference
    : circumference;

  return (
    <DashboardShell title="ATS Resume Checker">
      <div className="space-y-8">
        {/* Intro */}
        <div>
          <p className="text-muted-foreground text-sm">
            Scan your resume against specific target postings to expose structural flaws and missing terminology, or run a general formatting audit.
          </p>
        </div>

        {/* Dynamic Split Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Configuration Inputs (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Configurator</CardTitle>
                <CardDescription>Setup details to compare credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScan} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
                      {error}
                    </div>
                  )}

                  {/* Input Source Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Resume Source
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setSourceType("draft")}
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
                        onClick={() => setSourceType("text")}
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
                    <div className="space-y-1">
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
                        <div className="text-xs text-muted-foreground py-2 px-1 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>No resumes found. Create a draft in Builder first.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Resume Text Content
                        </label>
                        <label className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer font-medium uppercase tracking-wider">
                          <Upload className="h-3 w-3" />
                          <span>Upload File (PDF/Word/Text)</span>
                          <input
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <textarea
                        rows={6}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        required
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                  )}

                  {/* Target Title Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior React Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Description Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Posting Description (Optional)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Paste the raw description, responsibilities, and requirements here... (Leave empty for general audit)"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-violet-600 gap-2"
                    isLoading={isScanning}
                    disabled={
                      (sourceType === "draft" && resumes.length === 0) ||
                      (sourceType === "text" && !resumeText.trim())
                    }
                  >
                    <Search className="h-4 w-4" />
                    <span>{jobDescription.trim() ? "Analyze Match Compatibility" : "Run General ATS Audit"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Diagnostics (Right) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isScanning && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Analyzing Match Metrics...</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Parsing credentials and scoring alignment gaps. Takes about 5 seconds.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isScanning && !scanResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-2xl bg-card/25"
                >
                  <ShieldCheck className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">Results Display</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                    Fill out the forms on the left and trigger analysis to review diagnostics.
                  </p>
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
                  {/* Scores Overlay */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Radial Score Gauge */}
                    <Card className="flex flex-col items-center justify-center p-6 text-center md:col-span-1">
                      <div className="relative flex items-center justify-center h-32 w-32">
                        {/* Radial SVG Track */}
                        <svg className="h-full w-full -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="hsl(var(--muted))"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="hsl(var(--primary))"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </svg>
                        <span className="absolute text-3xl font-extrabold">{scanResult.score}%</span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">
                        ATS Score Match
                      </p>
                    </Card>

                    {/* Meta Audits */}
                    <div className="md:col-span-2 grid grid-cols-1 gap-4">
                      {/* Readability Score */}
                      <Card className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Readability Grade
                          </p>
                          <p className="text-2xl font-extrabold">{scanResult.readabilityScore}%</p>
                        </div>
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </Card>

                      {/* General Review */}
                      <Card className="p-4 space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="h-4 w-4" />
                          <span>Narrative critique</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {scanResult.narrativeCheck}
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Keywords Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Missing Keywords (Gaps) */}
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-destructive uppercase tracking-wider">
                          Missing Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-1.5 pb-4">
                        {scanResult.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-[10px] font-bold px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-md"
                          >
                            {kw}
                          </span>
                        ))}
                        {scanResult.missingKeywords.length === 0 && (
                          <span className="text-xs text-muted-foreground">None identified. Perfect match!</span>
                        )}
                      </CardContent>
                    </Card>

                    {/* Matched Keywords */}
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-emerald-500 uppercase tracking-wider">
                          Matched Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-1.5 pb-4">
                        {scanResult.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md"
                          >
                            {kw}
                          </span>
                        ))}
                        {scanResult.matchedKeywords.length === 0 && (
                          <span className="text-xs text-muted-foreground">No matches found. Check formatting.</span>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Formatting Diagnostics */}
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        Structural & Formatting Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scanResult.formattingIssues.map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 text-xs"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{issue}</span>
                        </div>
                      ))}
                      {scanResult.formattingIssues.length === 0 && (
                        <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>No structural formatting warnings identified.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
