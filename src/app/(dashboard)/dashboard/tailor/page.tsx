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
  ExternalLink,
  Check,
  CheckSquare,
  Square,
  Target,
  Zap,
  SlidersHorizontal,
  Layers,
  ArrowUpRight
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

interface TailorProposal {
  id: string;
  section: "summary" | "skills" | "experience" | "projects";
  targetId?: string;
  title: string;
  category: string;
  impact: "Critical ATS Match" | "High Impact" | string;
  reason: string;
  originalText?: string;
  tailoredText?: string;
}

interface AtsAnalysis {
  originalScore: number;
  tailoredScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  topRequirementsFound: string[];
}

interface TailorResult {
  tailoredResumeId: string;
  tailoredResumeTitle: string;
  originalContent: any;
  tailoredContent: any;
  proposals: TailorProposal[];
  atsAnalysis?: AtsAnalysis;
  changesMade?: any[];
}

/**
 * Reconstructs the candidate's resume applying ONLY the proposals they agreed on.
 * Unchecked items remain in their original state.
 */
function buildTailoredResume(
  original: any,
  allTailored: any,
  proposals: TailorProposal[],
  selectedIds: Set<string>
): any {
  // Deep clone original or fallback to allTailored
  const result = original ? JSON.parse(JSON.stringify(original)) : JSON.parse(JSON.stringify(allTailored));

  if (!Array.isArray(result.experience)) result.experience = [];
  if (!Array.isArray(result.projects)) result.projects = [];
  if (!Array.isArray(result.skills)) result.skills = [];

  for (const proposal of proposals) {
    if (!selectedIds.has(proposal.id)) continue;

    if (proposal.section === "summary") {
      result.summary = proposal.tailoredText || allTailored.summary || result.summary;
    } else if (proposal.section === "skills") {
      if (allTailored.skills && allTailored.skills.length > 0) {
        result.skills = allTailored.skills;
      }
    } else if (proposal.section === "experience") {
      if (proposal.targetId) {
        const expIdx = result.experience.findIndex((e: any) => e.id === proposal.targetId);
        if (expIdx !== -1) {
          result.experience[expIdx].description = proposal.tailoredText;
        } else {
          const match = (allTailored.experience || []).find((e: any) => e.id === proposal.targetId);
          if (match) result.experience.push(match);
        }
      } else if (allTailored.experience) {
        result.experience = allTailored.experience;
      }
    } else if (proposal.section === "projects") {
      if (proposal.targetId) {
        const projIdx = result.projects.findIndex((p: any) => p.id === proposal.targetId);
        if (projIdx !== -1) {
          result.projects[projIdx].description = proposal.tailoredText;
        } else {
          const match = (allTailored.projects || []).find((p: any) => p.id === proposal.targetId);
          if (match) result.projects.push(match);
        }
      } else if (allTailored.projects) {
        result.projects = allTailored.projects;
      }
    }
  }

  // Preserve personalInfo, education, achievements, and design
  if (!result.personalInfo?.fullName && allTailored.personalInfo?.fullName) {
    result.personalInfo = allTailored.personalInfo;
  }
  if ((!result.education || result.education.length === 0) && allTailored.education) {
    result.education = allTailored.education;
  }
  if (!result.achievements && allTailored.achievements) {
    result.achievements = allTailored.achievements;
  }
  if (!result.design && allTailored.design) {
    result.design = allTailored.design;
  }

  return result;
}

export default function TailorPage() {
  const router = useRouter();
  const { setActiveJobContext, loadTailoredDraft, activeJobContext } = useResumeStore();

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

  // Proposal selection and filtering states
  const [selectedProposalIds, setSelectedProposalIds] = React.useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = React.useState<"all" | "skills" | "projects" | "experience" | "summary">("all");
  const [isApplying, setIsApplying] = React.useState(false);

  // Prefill target position from active application context if available
  const contextAppliedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (activeJobContext?.jobTitle || activeJobContext?.company || activeJobContext?.jobDescription) {
      const signature = `${activeJobContext.company || ""}|${activeJobContext.jobTitle || ""}|${(activeJobContext.jobDescription || "").slice(0, 50)}|${activeJobContext.lastUpdated || ""}`;
      if (contextAppliedRef.current !== signature) {
        contextAppliedRef.current = signature;
        if (activeJobContext.company) setCompany(activeJobContext.company);
        if (activeJobContext.jobTitle) setJobTitle(activeJobContext.jobTitle);
        if (activeJobContext.jobDescription) setJobDescription(activeJobContext.jobDescription);
      }
    }
  }, [activeJobContext]);

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
        // Pre-select all proposed high-impact modifications by default
        const allIds = new Set<string>((result.data.proposals || []).map((p: TailorProposal) => p.id));
        setSelectedProposalIds(allIds);
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

  const toggleProposal = (id: string) => {
    setSelectedProposalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!tailorResult) return;
    setSelectedProposalIds(new Set(tailorResult.proposals.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedProposalIds(new Set());
  };

  /**
   * Applies ONLY the selected modifications to the resume,
   * updates the database draft, loads it into the store, and opens builder.
   */
  const handleApplyAndOpenInBuilder = async () => {
    if (!tailorResult) return;
    if (selectedProposalIds.size === 0) {
      setError("Please select at least 1 modification you agree with, or click 'Select All'.");
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      // 1. Reconstruct resume with ONLY agreed proposals
      const finalTailoredContent = buildTailoredResume(
        tailorResult.originalContent,
        tailorResult.tailoredContent,
        tailorResult.proposals,
        selectedProposalIds
      );

      const tailoredId = tailorResult.tailoredResumeId;
      const tailoredTitle = tailorResult.tailoredResumeTitle;

      // 2. Persist to cloud database
      try {
        await fetch(`/api/resume/${tailoredId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: tailoredTitle,
            content: finalTailoredContent,
            ats_score: tailorResult.atsAnalysis?.tailoredScore || 94
          })
        });
      } catch (saveErr) {
        console.warn("Notice: could not persist tailored draft directly:", saveErr);
      }

      // 3. Load directly into Resume Builder Store
      loadTailoredDraft(
        tailoredId,
        tailoredTitle,
        finalTailoredContent,
        {
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          sourceTool: "tailor",
          atsScore: tailorResult.atsAnalysis?.tailoredScore || 94
        }
      );

      // 4. Redirect to Resume Builder
      router.push(`/dashboard/builder?id=${tailoredId}`);
    } catch (err: any) {
      setError(err.message || "Failed to apply tailored resume");
      setIsApplying(false);
    }
  };

  const handleGenerateCoverLetter = () => {
    setActiveJobContext({
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      sourceTool: "tailor"
    });
    router.push("/dashboard/cover-letter");
  };

  // Filter proposals
  const proposals = tailorResult?.proposals || [];
  const filteredProposals = proposals.filter((p) => {
    if (activeFilter === "all") return true;
    return p.section === activeFilter;
  });

  const skillsCount = proposals.filter((p) => p.section === "skills").length;
  const projCount = proposals.filter((p) => p.section === "projects").length;
  const expCount = proposals.filter((p) => p.section === "experience").length;
  const sumCount = proposals.filter((p) => p.section === "summary").length;

  return (
    <DashboardShell title="Resume Tailor" featureKey="tailor">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">ATS Target Tailoring</h2>
          <p className="text-muted-foreground text-sm">
            Analyze any Job Description to identify required skills, projects, and keywords. Select exactly what you want modified, and let Hicejo update your full resume ready to print and apply.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Config Forms (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">1. Target Job & Resume Details</CardTitle>
                  <CardDescription className="text-xs">Provide your current resume and target job requirements.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTailor} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20 flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
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
                            ? "bg-card shadow-xs text-foreground font-semibold"
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
                            ? "bg-card shadow-xs text-foreground font-semibold"
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
                            accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.webp"
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
                      placeholder="e.g. Google, Stripe, Microsoft"
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
                      placeholder="e.g. Data Scientist, Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Job Description */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Job Description & Core Requirements
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {jobDescription.length > 0
                          ? `${jobDescription.length.toLocaleString()} chars`
                          : "Paste full JD for max keywords"}
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="Paste the full job description (responsibilities, required qualifications, tools, team deliverables)..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y leading-relaxed min-h-[140px] font-sans"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Our tailoring engine scans the entire JD to identify exact keyword requirements, required tooling, and problem-solving benchmarks.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 font-bold cursor-pointer"
                    isLoading={isProcessing}
                    disabled={isProcessing || isExtractingFile}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isProcessing ? "Analyzing JD & Formulating Upgrades..." : "Tailor Resume for Highest ATS Match"}</span>
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
                {/* 1. Hero ATS Match Surge Banner */}
                <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Targeted for {company}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {jobTitle}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mt-1 text-foreground">
                        {tailorResult.tailoredResumeTitle}
                      </h3>
                    </div>

                    {/* ATS Score Jump */}
                    <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border/70 shadow-xs">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">ATS Match</span>
                        <div className="flex items-baseline gap-1.5 font-bold">
                          <span className="text-muted-foreground line-through text-sm">
                            {tailorResult.atsAnalysis?.originalScore || 65}%
                          </span>
                          <span className="text-emerald-500 text-lg">
                            {tailorResult.atsAnalysis?.tailoredScore || 95}%
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-[1px] bg-border/60" />
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        +{(tailorResult.atsAnalysis?.tailoredScore || 95) - (tailorResult.atsAnalysis?.originalScore || 65)}% Surge
                      </div>
                    </div>
                  </div>

                  {/* Matched Keywords Cloud */}
                  {tailorResult.atsAnalysis?.matchedKeywords && tailorResult.atsAnalysis.matchedKeywords.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border/40">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Target Keywords & Core Technologies Aligned:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.atsAnalysis.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            <Check className="h-3 w-3" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Interactive Selection Controls & Filter Tabs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Review & Select Modifications to Apply
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Check the modifications you agree with. Only selected changes will be written into your resume.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1 rounded-xl text-xs font-medium border border-border/50">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("all")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeFilter === "all"
                          ? "bg-card text-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Modifications ({proposals.length})
                    </button>
                    {skillsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter("skills")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeFilter === "skills"
                            ? "bg-card text-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Skills ({skillsCount})
                      </button>
                    )}
                    {projCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter("projects")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeFilter === "projects"
                            ? "bg-card text-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Projects ({projCount})
                      </button>
                    )}
                    {expCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter("experience")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeFilter === "experience"
                            ? "bg-card text-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Work Experience ({expCount})
                      </button>
                    )}
                    {sumCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter("summary")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeFilter === "summary"
                            ? "bg-card text-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Summary ({sumCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. List of Selectable Proposal Cards */}
                <div className="space-y-4">
                  {filteredProposals.map((prop) => {
                    const isSelected = selectedProposalIds.has(prop.id);

                    return (
                      <Card
                        key={prop.id}
                        onClick={() => toggleProposal(prop.id)}
                        className={`transition-all cursor-pointer overflow-hidden border ${
                          isSelected
                            ? "border-emerald-500/50 bg-card shadow-sm ring-1 ring-emerald-500/20"
                            : "border-border/60 bg-muted/20 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {/* Card Header */}
                        <div
                          className={`px-4 py-2.5 flex items-center justify-between border-b transition-colors ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-muted/40 border-border/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Controlled via card click
                              className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-foreground truncate">
                              {prop.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
                              {prop.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                prop.impact === "Critical ATS Match"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {prop.impact || "High Impact"}
                            </span>
                          </div>
                        </div>

                        {/* Card Content & Diff */}
                        <CardContent className="p-4 space-y-3">
                          {/* Reason / Strategy */}
                          {prop.reason && (
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              <span className="font-semibold text-foreground">Why this helps: </span>
                              {prop.reason}
                            </div>
                          )}

                          {/* Before / After Comparison */}
                          <div className="space-y-2">
                            {prop.originalText && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Original in Resume
                                </span>
                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground line-through opacity-80 leading-relaxed font-sans whitespace-pre-line">
                                  {prop.originalText}
                                </div>
                              </div>
                            )}

                            {prop.tailoredText && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Tailored for {company}
                                  </span>
                                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {isSelected ? "✓ Selected to apply" : "Click card to select"}
                                  </span>
                                </div>
                                <div
                                  className={`p-2.5 rounded-lg text-xs leading-relaxed font-sans whitespace-pre-line transition-colors ${
                                    isSelected
                                      ? "bg-emerald-500/10 border border-emerald-500/30 text-foreground font-medium"
                                      : "bg-muted/30 border border-border/40 text-muted-foreground"
                                  }`}
                                >
                                  {prop.tailoredText}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 4. Action Banner to Apply & Open in Builder */}
                <div className="p-4 rounded-xl border border-primary/30 bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {selectedProposalIds.size} of {proposals.length} modifications selected
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Only your agreed changes will be written into the tailored resume.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCoverLetter}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Draft Cover Letter</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleApplyAndOpenInBuilder}
                      isLoading={isApplying}
                      disabled={isApplying || selectedProposalIds.size === 0}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <span>Apply & Edit in Resume Builder</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty state before running tailor */
              <div className="h-[500px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-card/20">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-xs">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Ready to Target for Highest ATS Selection
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1.5 leading-relaxed">
                  Provide your target company, role, and job description on the left, then click <strong>&quot;Tailor Resume for Highest ATS Match&quot;</strong>.
                </p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left max-w-lg w-full">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-bold text-foreground block">1. JD Requirement Scan</span>
                    <span className="text-[10px] text-muted-foreground">Extracts required frameworks, skills, and deliverables.</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-bold text-foreground block">2. Selectable Upgrades</span>
                    <span className="text-[10px] text-muted-foreground">Review and choose only the modifications you agree with.</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-bold text-foreground block">3. One-Click Apply</span>
                    <span className="text-[10px] text-muted-foreground">Directly opens in builder ready to verify and print.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
