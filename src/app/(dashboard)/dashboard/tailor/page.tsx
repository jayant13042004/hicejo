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
  Upload,
  FileCheck,
  ExternalLink
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { consumeCredit } from "@/lib/credits";

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

const SAMPLE_RESUME_TEXT = `Alex Johnson | Senior Full Stack Engineer
San Francisco, CA | (555) 019-2834 | alex.johnson@example.com | linkedin.com/in/alexj-tech

PROFESSIONAL SUMMARY
Full Stack Engineer with 6+ years of experience specializing in React, Next.js, TypeScript, Node.js, and cloud architecture. Proven track record of scaling high-throughput distributed applications and building responsive, accessible web interfaces.

EXPERIENCE
Lead Full Stack Developer — Apex Cloud Technologies (2022 - Present)
• Architected core customer-facing dashboards in Next.js/React, improving page load speeds by 42%.
• Engineered event-driven microservices in Node.js/TypeScript handling 15M+ daily requests.
• Led agile squad of 6 engineers, standardizing design tokens and component test coverage to 90%.

Software Engineer — Nova Global Solutions (2019 - 2022)
• Developed responsive user interfaces with TypeScript, React, and Tailwind CSS.
• Built RESTful and GraphQL APIs integrated with PostgreSQL and Redis caching.

EDUCATION
B.S. in Computer Science — California State University (2015 - 2019)

SKILLS
React, Next.js, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker, AWS, Tailwind CSS`;

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
  const [isExtractingFile, setIsExtractingFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
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
        console.error("Failed to load resumes:", err);
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
        setSourceType("text");
      } else {
        setError(result.error || "Failed to extract text from file.");
      }
    } catch {
      setError("File upload connection failed. Please paste text directly.");
    } finally {
      setIsExtractingFile(false);
      e.target.value = "";
    }
  };

  const handleLoadSample = () => {
    setSourceType("text");
    setResumeText(SAMPLE_RESUME_TEXT);
    setCompany("Stripe");
    setJobTitle("Staff Frontend Engineer");
    setJobDescription("We are looking for a Staff Frontend Engineer to scale global checkout interfaces using TypeScript, React, and Next.js. Responsibilities include optimizing latency, designing reusable UI components, and collaborating across product squads.");
  };

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === "draft" && !selectedResumeId) {
      setError("Please select a saved resume draft or switch to 'Paste / Upload Text'.");
      return;
    }
    if (sourceType === "text" && !resumeText.trim()) {
      setError("Please enter your resume text or upload a resume file.");
      return;
    }
    if (!company.trim() || !jobTitle.trim() || !jobDescription.trim()) {
      setError("Please fill out the target company, job title, and description.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTailorResult(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText.trim() : undefined,
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim()
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        setTailorResult(result.data);
        consumeCredit("tailor");
      } else {
        setError(result.error || "Failed to tailor resume. Please try again.");
      }
    } catch {
      setError("Server connection failure. Please check your network and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardShell title="Resume Tailor" featureKey="tailor">
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
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Tailoring Configurator</CardTitle>
                  <CardDescription className="text-xs">Setup parameters to target custom positions.</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Load Sample
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTailor} className="space-y-4">
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
                          <p>No saved resumes found. Switch to Paste / Upload Text to add your resume.</p>
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
                        <label className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-semibold uppercase tracking-wide">
                          {isExtractingFile ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-primary" />
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

                      {uploadedFileName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Extracted from: {uploadedFileName}</span>
                        </div>
                      )}

                      <textarea
                        rows={5}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono leading-relaxed"
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
                      placeholder="e.g. Stripe, Airbnb, Google"
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
                      placeholder="e.g. Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Job Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Description / Keywords
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste the job description or specific technical requirements..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-md gap-2 font-bold"
                    isLoading={isProcessing}
                    disabled={isProcessing || isExtractingFile}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isProcessing ? "Tailoring Experience Narrative..." : "Tailor Resume"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel (Right) */}
          <div className="lg:col-span-7 space-y-6">
            {tailorResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Success Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Optimized for {company}
                    </span>
                    <h3 className="text-lg font-bold mt-1 text-foreground">
                      {tailorResult.tailoredResumeTitle}
                    </h3>
                  </div>

                  <Button
                    onClick={() => router.push(`/dashboard/builder?id=${tailorResult.tailoredResumeId}`)}
                    className="bg-primary text-primary-foreground gap-1.5 text-xs font-semibold shrink-0"
                  >
                    <span>Open in Builder</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Diff Review List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Keyword Adaptations & Diff View ({tailorResult.changesMade.length} Updates)
                  </h4>

                  {tailorResult.changesMade.map((change, idx) => (
                    <Card key={idx} className="border-border/60 overflow-hidden">
                      <div className="border-b border-border/40 px-4 py-2 bg-muted/30 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Section: {change.section}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #ADAPTATION-0{idx + 1}
                        </span>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        {change.original && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                              Original Statement
                            </span>
                            <div className="p-2.5 rounded-lg bg-muted/50 border border-border/40 text-xs text-muted-foreground line-through opacity-80 leading-relaxed">
                              {change.original}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            Tailored & Quantified Statement
                          </span>
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground font-medium leading-relaxed">
                            {change.tailored}
                          </div>
                        </div>

                        {change.reason && (
                          <p className="text-[11px] text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                            Strategy: {change.reason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-[460px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-card/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Ready to Tailor Resume
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                  Provide your target company, role, and job description on the left, then click <strong>&quot;Tailor Resume&quot;</strong> to rewrite your experience bullets for maximum match relevance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
