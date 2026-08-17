"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  ArrowLeftRight,
  CheckCircle2,
  FileText,
  ChevronRight,
  AlertTriangle,
  Upload
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeOption {
  id: string;
  title: string;
}

interface TailorChange {
  section: string;
  itemId: string;
  original: string;
  tailored: string;
  reason: string;
}

interface TailorResult {
  tailoredResumeId: string;
  tailoredResumeTitle: string;
  tailoredContent: any;
  changesMade: TailorChange[];
}

export default function TailorPage() {
  const router = useRouter();
  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [tailorResult, setTailorResult] = React.useState<TailorResult | null>(null);
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
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) return;
    if (sourceType === "text" && !resumeText.trim()) return;
    if (!company || !jobTitle || !jobDescription) return;

    setIsProcessing(true);
    setError(null);
    setTailorResult(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText : undefined,
          company,
          jobTitle,
          jobDescription
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        setTailorResult(result.data);
      } else {
        setError(result.error || "Failed to tailor resume.");
      }
    } catch {
      setError("Server connection failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardShell title="Resume Tailor">
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground text-sm">
            Adapt and rewrite experience statements dynamically to align with requirements for a specific company and role.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Config Forms (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tailoring Configurator</CardTitle>
                <CardDescription>Setup parameters to target custom positions.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTailor} className="space-y-4">
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
                        Select Base Resume
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
                        rows={5}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        required
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                  )}

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Product Marketing Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Description
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste responsibilities and key requirements here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-violet-600 gap-2"
                    isLoading={isProcessing}
                    disabled={
                      (sourceType === "draft" && resumes.length === 0) ||
                      (sourceType === "text" && !resumeText.trim()) ||
                      !company ||
                      !jobTitle ||
                      !jobDescription
                    }
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Resume Tailoring</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Diffs & Comparatives view (Right) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isProcessing && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Tailoring Resume Layouts...</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Re-aligning bullet achievements and summary tags. Takes about 6 seconds.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isProcessing && !tailorResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-28 text-center border border-dashed border-border rounded-2xl bg-card/25"
                >
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">Tailored Diff Display</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                    Run the tailoring configuration to audit comparative differences side-by-side.
                  </p>
                </motion.div>
              )}

              {!isProcessing && tailorResult && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="space-y-6"
                >
                  {/* Banner Success Card */}
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Resume Tailored Successfully!</p>
                          <p className="text-xs text-muted-foreground">
                            Saved as a new draft: **{tailorResult.tailoredResumeTitle}**
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/builder?id=${tailorResult.tailoredResumeId}`)}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1.5 shrink-0"
                      >
                        <span>Open in Builder</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Side-by-Side Diffs list */}
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Comparative Changes Audit
                  </h3>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {tailorResult.changesMade.map((change, i) => (
                      <Card key={i} className="border-border/60">
                        <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/40">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {change.section} Section
                          </span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                          {/* Reason */}
                          <div className="flex items-start gap-2 text-primary font-semibold text-[11px]">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                            <span>AI Strategy: {change.reason}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Original */}
                            <div className="space-y-1 p-3 rounded-lg bg-muted/10 border border-border/20">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Original
                              </p>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {change.original || "(Empty)"}
                              </p>
                            </div>

                            {/* Tailored */}
                            <div className="space-y-1 p-3 rounded-lg bg-primary/5 border border-primary/10">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                Tailored Revision
                              </p>
                              <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {change.tailored}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {tailorResult.changesMade.length === 0 && (
                      <div className="text-center py-8 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                        No changes made. The base resume already matched all criteria.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
