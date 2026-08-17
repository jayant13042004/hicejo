"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FileCheck
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeOption {
  id: string;
  title: string;
}

interface Critique {
  area: string;
  insult: string;
  fix: string;
}

interface RoastResult {
  roastScore: number;
  roastLevel: string;
  brutalIntro: string;
  critiques: Critique[];
  verdict: string;
}

const SAMPLE_RESUME_TEXT = `Alex Johnson | Senior Full Stack Engineer
San Francisco, CA | (555) 019-2834 | alex.johnson@example.com | linkedin.com/in/alexj-tech

PROFESSIONAL SUMMARY
Dynamic, passionate, and results-driven self-starter with 6+ years of experience leveraging agile methodologies to synergize cutting-edge tech stacks and drive digital transformation across enterprise squads.

EXPERIENCE
Lead Full Stack Developer — Apex Cloud Technologies (2022 - Present)
• Responsible for writing code and maintaining frontend and backend systems.
• Collaborated with cross-functional teams in daily standups and sprint planning.
• Optimized database queries and improved overall user interface feel.
• Handled deployments to cloud infrastructure using CI/CD pipelines.

Software Engineer — Nova Global Solutions (2019 - 2022)
• Worked on various client projects using React, Node.js, and MongoDB.
• Built features according to stakeholder specifications and fixed bugs.
• Participated in code reviews and mentored junior software engineering interns.

EDUCATION
B.S. in Computer Science — California State University (2015 - 2019)

SKILLS
Languages & Frameworks: JavaScript, TypeScript, React, Node.js, Express, HTML5, CSS3, JSON
Tools & Others: Git, GitHub, VS Code, Microsoft Office, JIRA, Agile, Problem Solving, Communication`;

export default function RoastPage() {
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
    setTerminalLines([
      "guest@hicejo:~$ roast-resume --mode brutal_critique --target profile",
      "[INFO] Initializing Hicejo Roasting Suite v2.1...",
      "[INFO] Ingesting candidate credentials and experience narrative..."
    ]);

    try {
      // Trigger API in parallel with progress updates
      const roastPromise = fetch("/api/ai/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText.trim() : undefined
        })
      });

      // Streaming diagnostic lines
      setTimeout(() => {
        setTerminalLines((prev) => [
          ...prev,
          "[WARN] Cliché detection: Found generic adjectives & unverified claims.",
          "[INFO] Analyzing impact metrics, grammar patterns, and bullet density...",
          "[INFO] Packaging payload to Tough Recruiter AI agent..."
        ]);
      }, 350);

      const res = await roastPromise;
      const result = await res.json();

      if (result.success && result.data) {
        setTerminalLines((prev) => [
          ...prev,
          "[SUCCESS] Critique package retrieved. Compiling burn report."
        ]);
        setRoastResult(result.data);
      } else {
        setError(result.error || "Failed to roast resume. Please try again.");
      }
    } catch (err: any) {
      setError("Server connection failure. Please check your network and try again.");
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <DashboardShell title="Resume Roast Room">
      <div className="space-y-8">
        {/* Intro Header */}
        <div>
          <p className="text-muted-foreground text-sm">
            Expose structural formatting errors and narrative cliches. Humorous yet highly action-focused critique.
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
                          <button
                            type="button"
                            onClick={() => setResumeText(SAMPLE_RESUME_TEXT)}
                            className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Load Sample
                          </button>
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
                    className="w-full bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md shadow-red-500/10 gap-2 font-bold"
                    isLoading={isRoasting}
                    disabled={isRoasting || isExtractingFile}
                  >
                    <Flame className="h-4 w-4" />
                    <span>{isRoasting ? "Incinerating Resume..." : "Roast My Resume"}</span>
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
                {/* Score Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent p-6 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                        <Flame className="h-3.5 w-3.5" />
                        {roastResult.roastLevel}
                      </span>
                      <h3 className="text-xl font-bold mt-2 text-foreground">
                        Savage Diagnostic Report
                      </h3>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Roast Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-red-500">
                          {roastResult.roastScore}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-foreground/90 leading-relaxed font-serif italic border-l-2 border-red-500/50 pl-3">
                    &ldquo;{roastResult.brutalIntro}&rdquo;
                  </p>
                </div>

                {/* Critiques List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Section Roasts & Prescriptions
                  </h4>

                  {roastResult.critiques.map((c, i) => (
                    <Card key={i} className="border-border/60 overflow-hidden">
                      <div className="border-b border-border/40 px-4 py-2 bg-muted/30 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {c.area}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #CRITIQUE-0{i + 1}
                        </span>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                            <Flame className="h-3.5 w-3.5 shrink-0" />
                            <span>The Roast</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {c.insult}
                          </p>
                        </div>

                        <div className="space-y-1 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>How to Fix It</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {c.fix}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
              <div className="h-[420px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-card/20">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-4">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Ready to Roast
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                  Select a resume draft or paste your text on the left, then click <strong>&quot;Roast My Resume&quot;</strong> to receive an unvarnished audit with actionable fixes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
