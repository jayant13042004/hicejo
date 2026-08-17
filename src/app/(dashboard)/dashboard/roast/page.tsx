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
  Upload
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

export default function RoastPage() {
  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");

  const [isRoasting, setIsRoasting] = React.useState(false);
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
        console.error(err);
      }
    };
    loadResumes();
  }, []);

  const terminalSequence = [
    "guest@hicejo:~$ roast-resume --target current_draft",
    "[INFO] Initializing Hicejo Roasting Suite v2.1...",
    "[INFO] Extracting candidate details and experience strings...",
    "[WARN] Cliché alert: Found 'passionate self-starter' cliches.",
    "[WARN] Math failure: 3 experiences have 0 quantified metrics.",
    "[INFO] Formatting diagnostics... dates patterns look chaotic.",
    "[INFO] Packaging payload to Tough Recruiter AI agent...",
    "[SUCCESS] Critique package retrieved. Compiling burn report."
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRoasting(true);
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
      setIsRoasting(false);
    }
  };

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) return;
    if (sourceType === "text" && !resumeText.trim()) return;

    setIsRoasting(true);
    setError(null);
    setRoastResult(null);
    setTerminalLines([]);

    // 1. Run terminal typing animation
    for (let i = 0; i < terminalSequence.length; i++) {
      setTerminalLines((prev) => [...prev, terminalSequence[i]]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // 2. Fetch roast data from API
    try {
      const res = await fetch("/api/ai/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText : undefined
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        setRoastResult(result.data);
      } else {
        setError(result.error || "Failed to roast resume.");
      }
    } catch {
      setError("Server connection failure.");
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <DashboardShell title="Resume Roast Room">
      <div className="space-y-8">
        {/* Intro */}
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
                <CardTitle>Roast Configurator</CardTitle>
                <CardDescription>Select target resume to incinerate.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRoast} className="space-y-4">
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
                        Select Resume
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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md shadow-red-500/10 gap-2"
                    isLoading={isRoasting}
                    disabled={
                      (sourceType === "draft" && resumes.length === 0) ||
                      (sourceType === "text" && !resumeText.trim())
                    }
                  >
                    <Flame className="h-4 w-4 animate-pulse" />
                    <span>Roast My Resume</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostics Display (Right) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* Terminal Loader */}
              {isRoasting && (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full rounded-xl bg-black border border-zinc-800 text-zinc-300 font-mono text-xs shadow-xl p-5 space-y-2 h-64 overflow-y-auto"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2 shrink-0">
                    <Terminal className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Diagnostics Console
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {terminalLines.map((line, i) => {
                      let colorClass = "text-zinc-300";
                      if (line.startsWith("[WARN]")) colorClass = "text-amber-500";
                      if (line.startsWith("[SUCCESS]")) colorClass = "text-emerald-500";
                      if (line.startsWith("guest")) colorClass = "text-primary";
                      return (
                        <p key={i} className={colorClass}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Empty display */}
              {!isRoasting && !roastResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-28 text-center border border-dashed border-border rounded-2xl bg-card/25"
                >
                  <Flame className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">Audit Board</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                    Trigger the roasting sequence on the left to activate diagnostics.
                  </p>
                </motion.div>
              )}

              {/* Roast Results */}
              {!isRoasting && roastResult && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="space-y-6"
                >
                  {/* Rating Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dial */}
                    <Card className="flex flex-col items-center justify-center p-6 text-center border-red-500/20 bg-red-500/5">
                      <p className="text-3xl font-extrabold text-red-500">{roastResult.roastScore}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mt-2">
                        Resume Score
                      </p>
                    </Card>

                    {/* Meta Status */}
                    <Card className="md:col-span-2 p-6 flex flex-col justify-center space-y-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                        <span className="text-sm font-extrabold uppercase tracking-wider text-red-500">
                          {roastResult.roastLevel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        {roastResult.brutalIntro}
                      </p>
                    </Card>
                  </div>

                  {/* Critiques Grid */}
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Section-Specific Audits
                  </h3>
                  
                  <div className="space-y-4">
                    {roastResult.critiques.map((crit, i) => (
                      <Card key={i} className="border-border/60">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 px-2 py-0.5 rounded">
                              {crit.area} Area
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            {/* Insult */}
                            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                              <div>
                                <p className="font-bold text-red-500 uppercase text-[9px] tracking-wider mb-0.5">Roast</p>
                                <p className="text-muted-foreground leading-relaxed">{crit.insult}</p>
                              </div>
                            </div>

                            {/* Remedy */}
                            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div>
                                <p className="font-bold text-emerald-500 uppercase text-[9px] tracking-wider mb-0.5">How to Fix</p>
                                <p className="text-muted-foreground leading-relaxed">{crit.fix}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Verdict */}
                  <Card className="border-zinc-800 bg-zinc-950/20">
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                        <Info className="h-4 w-4 text-zinc-500" />
                        <span>Savage Verdict</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {roastResult.verdict}
                      </p>
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
