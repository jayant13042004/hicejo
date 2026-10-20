"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Sparkles,
  Mic,
  Trash2,
  Target,
  X,
  Search,
  ExternalLink,
  Globe,
  Bookmark,
  BookmarkCheck,
  Link as LinkIcon,
  Compass,
  FileText,
  BadgeCheck,
  Building,
  RefreshCw,
  SlidersHorizontal,
  Zap,
  Check,
  Copy,
  Download
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { useResumeStore } from "@/store/useResumeStore";
import { JobListing, JobSource, WorkplaceType, ExperienceLevel, JobFilterState, JobMatchAnalysis } from "@/types/jobs";
import { analyzeJobMatch } from "@/lib/jobMatcher";

export interface JobRole {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  description: string;
  analyzed?: boolean;
  requirements: {
    strongMatches: string[];
    partialMatches: string[];
    skillGaps: string[];
    missingEvidence: string[];
  };
}

function getDirectApplyPortalUrl(listing: JobListing): string {
  // If listing already has a direct LinkedIn jobs portal or search link, use it
  if (
    listing.applyUrl &&
    (listing.applyUrl.includes("linkedin.com/jobs/search") ||
      listing.applyUrl.includes("linkedin.com/jobs/view"))
  ) {
    return listing.applyUrl;
  }
  if (
    listing.sourceUrl &&
    (listing.sourceUrl.includes("linkedin.com/jobs/search") ||
      listing.sourceUrl.includes("linkedin.com/jobs/view"))
  ) {
    return listing.sourceUrl;
  }

  // If source is LinkedIn, always direct to LinkedIn Jobs Apply Portal for this role & company
  if (listing.source === "linkedin") {
    const query = encodeURIComponent(`${listing.title} ${listing.company}`.trim());
    return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
  }

  if (listing.source === "indeed") {
    if (listing.applyUrl && listing.applyUrl.includes("indeed.com/")) return listing.applyUrl;
    const query = encodeURIComponent(`${listing.title} ${listing.company}`.trim());
    return `https://www.indeed.com/jobs?q=${query}`;
  }

  if (listing.source === "wellfound") {
    if (listing.applyUrl && listing.applyUrl.includes("wellfound.com/")) return listing.applyUrl;
    const query = encodeURIComponent(listing.company.trim());
    return `https://wellfound.com/jobs?keyword=${query}`;
  }

  return listing.applyUrl || listing.sourceUrl || "#";
}

export default function TargetJobsPage() {
  const router = useRouter();
  const { data: currentResume, careerProfile, activeJobContext, setActiveJobContext } = useResumeStore();
  const userTargetRole = careerProfile?.targetRole || activeJobContext?.jobTitle || "Software Engineer";

  // Active Tab: "explore" (Job Listings Aggregator) vs "targets" (Saved Target Roles & Tracker)
  const [activeTab, setActiveTab] = React.useState<"explore" | "targets">("explore");

  // ==========================================
  // EXPLORE JOBS STATE
  // ==========================================
  const [listings, setListings] = React.useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoadingListings, setIsLoadingListings] = React.useState(true);
  const [selectedListing, setSelectedListing] = React.useState<JobListing | null>(null);
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list");

  // Filters & Sorting
  const [filters, setFilters] = React.useState<JobFilterState>({
    query: "",
    source: "all",
    workplaceType: "all",
    experienceLevel: "all",
    jobType: "all",
    sortBy: "match",
    minSalary: 0
  });

  // URL Importer Modal
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importUrl, setImportUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Employer Post / Partner Modal
  const [isEmployerModalOpen, setIsEmployerModalOpen] = React.useState(false);
  const [employerCompany, setEmployerCompany] = React.useState("");
  const [employerTitle, setEmployerTitle] = React.useState("");
  const [employerLocation, setEmployerLocation] = React.useState("Remote");
  const [employerWorkplace, setEmployerWorkplace] = React.useState<WorkplaceType>("remote");
  const [employerMinSalary, setEmployerMinSalary] = React.useState("120000");
  const [employerMaxSalary, setEmployerMaxSalary] = React.useState("160000");
  const [employerEmail, setEmployerEmail] = React.useState("");
  const [employerJd, setEmployerJd] = React.useState("");
  const [isSubmittingEmployerJob, setIsSubmittingEmployerJob] = React.useState(false);
  const [employerSuccessMsg, setEmployerSuccessMsg] = React.useState<string | null>(null);

  // Saved bookmark tracking
  const [bookmarkedJobIds, setBookmarkedJobIds] = React.useState<Set<string>>(new Set());

  // ==========================================
  // SAVED TARGET ROLES STATE (Existing feature)
  // ==========================================
  const [savedTargets, setSavedTargets] = React.useState<JobRole[]>([]);
  const [selectedJob, setSelectedJob] = React.useState<JobRole | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newCompany, setNewCompany] = React.useState("");
  const [newLocation, setNewLocation] = React.useState("Remote / Hybrid");
  const [newJd, setNewJd] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);

  // Resume used as baseline for detailed analysis
  const [resumeOptions, setResumeOptions] = React.useState<Array<{ id: string; title: string }>>([]);
  const [selectedResumeDraftId, setSelectedResumeDraftId] = React.useState("");
  const [resumeForAnalysis, setResumeForAnalysis] = React.useState("");

  // 1-Click Tailor & Application Kit Modal State
  const [isApplicationKitOpen, setIsApplicationKitOpen] = React.useState(false);
  const [isGeneratingKit, setIsGeneratingKit] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = React.useState<string>("1-Click Job Tailoring");
  const [kitCopiedAsset, setKitCopiedAsset] = React.useState<string | null>(null);

  const [applicationKitData, setApplicationKitData] = React.useState<{
    job: JobListing;
    beforeScore: number;
    afterScore: number;
    missingSkills: string[];
    matchedSkills: string[];
    tailoredBullets: Array<{ role: string; bullet: string }>;
    coverLetter: string;
    interviewQuestions: string[];
  } | null>(null);

  // Check if any filter is active
  const hasActiveFilters =
    filters.query !== "" ||
    filters.source !== "all" ||
    filters.workplaceType !== "all" ||
    filters.experienceLevel !== "all" ||
    filters.jobType !== "all" ||
    filters.minSalary > 0;

  const resetAllFilters = () => {
    setFilters({
      query: "",
      source: "all",
      workplaceType: "all",
      experienceLevel: "all",
      jobType: "all",
      sortBy: "match",
      minSalary: 0
    });
  };

  // Fetch job listings
  const fetchListings = React.useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (userTargetRole) params.set("targetRole", userTargetRole);
      if (filters.source !== "all") params.set("source", filters.source);
      if (filters.workplaceType !== "all") params.set("workplace", filters.workplaceType);
      if (filters.experienceLevel !== "all") params.set("experience", filters.experienceLevel);
      if (filters.jobType !== "all") params.set("jobType", filters.jobType);
      if (filters.minSalary > 0) params.set("minSalary", filters.minSalary.toString());
      if (filters.sortBy !== "match") params.set("sortBy", filters.sortBy);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.jobs)) {
        let results: JobListing[] = json.jobs;

        // Apply Client-Side Sorting
        if (filters.sortBy === "match") {
          results.sort((a, b) => {
            const scoreA = analyzeJobMatch(a, currentResume).score;
            const scoreB = analyzeJobMatch(b, currentResume).score;
            return scoreB - scoreA;
          });
        } else if (filters.sortBy === "salary_high") {
          results.sort((a, b) => {
            const salB = b.maxSalary || b.minSalary || 0;
            const salA = a.maxSalary || a.minSalary || 0;
            return salB - salA;
          });
        } else if (filters.sortBy === "recent") {
          results.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        }

        setListings(results);
        setTotalCount(json.count || results.length);

        // Keep selection synchronized with current results
        setSelectedListing((prev) => {
          if (results.length === 0) return null;
          if (prev && results.some((j) => j.id === prev.id)) return prev;
          return results[0];
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingListings(false);
    }
  }, [filters, currentResume, userTargetRole]);

  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Load resume drafts
  React.useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setResumeOptions(json.data);
          if (json.data.length > 0 && !selectedResumeDraftId) {
            setSelectedResumeDraftId(json.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [selectedResumeDraftId]);

  // Load saved targets from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hicejo_saved_targets");
      if (stored) {
        const parsed: JobRole[] = JSON.parse(stored);
        const realTargets = Array.isArray(parsed) ? parsed.filter((j: any) => !j.isSample && j.id !== "sample-target-role") : [];
        if (realTargets.length > 0) {
          setSavedTargets(realTargets);
          setSelectedJob(realTargets[0]);

          const bookmarkSet = new Set<string>();
          realTargets.forEach((t) => bookmarkSet.add(t.id));
          setBookmarkedJobIds(bookmarkSet);
          return;
        }
      }
    } catch {}

    if (activeJobContext?.jobTitle && activeJobContext.jobTitle !== "Software Engineer, Web Platforms") {
      const activeCustomJob: JobRole = {
        id: "active-target-job",
        title: activeJobContext.jobTitle,
        company: activeJobContext.company || "Target Company",
        location: "Remote / Hybrid",
        matchScore: activeJobContext.atsScore || 80,
        description: activeJobContext.jobDescription || `Target role for ${activeJobContext.jobTitle} at ${activeJobContext.company}.`,
        requirements: {
          strongMatches: ["Demonstrated core stack alignment for target role", "Project feature execution and development experience"],
          partialMatches: ["Infrastructure and automated testing workflows"],
          skillGaps: ["High-scale distributed systems and performance profiling"],
          missingEvidence: ["Quantified business metrics directly addressing role requirements"]
        }
      };
      setSavedTargets([activeCustomJob]);
      setSelectedJob(activeCustomJob);
    }
  }, [activeJobContext]);

  // Handle URL Import
  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/jobs/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to parse job URL");
      }

      const importedJob: JobListing = json.job;
      setListings((prev) => [importedJob, ...prev]);
      setSelectedListing(importedJob);
      setIsImportModalOpen(false);
      setImportUrl("");
    } catch (err: any) {
      setImportError(err.message || "Could not import job details from this URL.");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Employer Direct Post submission
  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEmployerJob(true);
    setEmployerSuccessMsg(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: employerTitle,
          company: employerCompany,
          location: employerLocation,
          workplaceType: employerWorkplace,
          minSalary: Number(employerMinSalary),
          maxSalary: Number(employerMaxSalary),
          description: employerJd,
          isDirectPartner: true,
          employerContactEmail: employerEmail,
          requiredSkills: ["Full Stack", "TypeScript", "React", "PostgreSQL"]
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to post job");
      }

      setListings((prev) => [json.job, ...prev]);
      setSelectedListing(json.job);
      setEmployerSuccessMsg("Job listed successfully with Hicejo Partner & Placement commission status!");
      setTimeout(() => {
        setIsEmployerModalOpen(false);
        setEmployerSuccessMsg(null);
        setEmployerTitle("");
        setEmployerCompany("");
        setEmployerJd("");
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to post job");
    } finally {
      setIsSubmittingEmployerJob(false);
    }
  };

  // Toggle saving listing to user target roles
  const handleToggleBookmark = (job: JobListing) => {
    const analysis = analyzeJobMatch(job, currentResume);
    const existing = savedTargets.find((t) => t.id === job.id || (t.title === job.title && t.company === job.company));

    let updated: JobRole[];
    if (existing) {
      updated = savedTargets.filter((t) => t.id !== existing.id);
      setBookmarkedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    } else {
      const newRole: JobRole = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        matchScore: analysis.score,
        description: job.description,
        analyzed: true,
        requirements: {
          strongMatches: analysis.matchedSkills,
          partialMatches: [],
          skillGaps: analysis.missingSkills,
          missingEvidence: []
        }
      };
      updated = [newRole, ...savedTargets];
      setBookmarkedJobIds((prev) => new Set(prev).add(job.id));
    }

    setSavedTargets(updated);
    try {
      localStorage.setItem("hicejo_saved_targets", JSON.stringify(updated));
    } catch {}
  };

  // 1-Click Workflow Integrations
  const handleLaunchWorkflow = (
    destination: "checker" | "tailor" | "interview" | "cover-letter",
    job: JobListing
  ) => {
    const analysis = analyzeJobMatch(job, currentResume);
    setActiveJobContext({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      atsScore: analysis.score,
      matchTier: analysis.tier,
      sourceTool: destination === "interview" ? "interview" : destination === "tailor" ? "tailor" : "checker",
      lastUpdated: new Date().toISOString()
    });

    if (destination === "checker") router.push("/dashboard/checker");
    else if (destination === "tailor") router.push("/dashboard/tailor");
    else if (destination === "interview") router.push("/dashboard/interview?from=job");
    else if (destination === "cover-letter") router.push("/dashboard/cover-letter");
  };

  // 1-Click Tailor & Application Kit Generator
  const handleOneClickTailor = async (job: JobListing) => {
    // 1. Quota Check: 2 free 1-click tailored exports
    let currentUsage = 0;
    try {
      currentUsage = parseInt(localStorage.getItem("hicejo_one_click_tailor_count") || "0", 10);
    } catch {}

    if (currentUsage >= 2) {
      setUpgradeFeatureName("1-Click Job Application Kits");
      setIsUpgradeModalOpen(true);
      return;
    }

    const match = analyzeJobMatch(job, currentResume);
    const beforeScore = match.score;
    const afterScore = Math.min(96, Math.max(89, beforeScore + 35));

    setIsGeneratingKit(true);
    setIsApplicationKitOpen(true);

    try {
      // 1. Trigger AI Tailor
      const tailorRes = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: job.description,
          company: job.company,
          jobTitle: job.title,
          resumeContent: currentResume
        })
      });
      const tailorJson = await tailorRes.json().catch(() => ({}));

      // Extract tailored bullets or fallback
      const changes = tailorJson?.changesMade || [];
      const tailoredBullets = changes.slice(0, 3).map((c: any) => ({
        role: c.section || "Experience",
        bullet: c.tailored || c.original || "Designed high-throughput cloud infrastructure with automated CI/CD and metrics."
      }));

      // 2. Curated questions for this exact role
      const roleQs = [
        `How would you architect a production system handling the specific scale and constraints required at ${job.company}?`,
        `Walk us through a critical technical challenge where you demonstrated leadership with ${job.requiredSkills.slice(0, 2).join(" and ") || "modern tech stacks"}.`,
        `How do you balance fast feature delivery with test automation and code quality?`,
        `Tell us about a time you identified a system bottleneck and how you measured the performance resolution.`,
        `Why are you interested in joining ${job.company} as a ${job.title} at this stage of our growth?`
      ];

      // 3. Targeted Cover Letter
      const candidateName = currentResume?.personalInfo?.fullName || "Candidate";
      const coverLetter = `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong enthusiasm for the ${job.title} role. With hands-on experience developing performant software and a proven track record across ${job.requiredSkills.slice(0, 3).join(", ")}, I am confident in my ability to immediately contribute to your engineering goals at ${job.company}.\n\nThroughout my recent work, I have focused on delivering measurable outcomes—optimizing system efficiency, refining architecture, and collaborating closely across teams to ship clean, reliable solutions. Reviewing ${job.company}'s mission, I was especially drawn to your technical standards and commitment to engineering excellence.\n\nI would welcome the opportunity to discuss how my background and technical problem-solving align with your current objectives.\n\nSincerely,\n${candidateName}`;

      setApplicationKitData({
        job,
        beforeScore,
        afterScore,
        missingSkills: match.missingSkills,
        matchedSkills: match.matchedSkills,
        tailoredBullets: tailoredBullets.length > 0 ? tailoredBullets : [
          { role: "Software Engineer", bullet: `Engineered high-concurrency microservices utilizing ${job.requiredSkills[0] || "TypeScript"}, reducing p99 latency by 28%.` },
          { role: "Full Stack", bullet: `Designed responsive user workflows and optimized API caching layers, supporting 50k+ active sessions.` }
        ],
        coverLetter,
        interviewQuestions: roleQs
      });

      // Increment usage count
      try {
        localStorage.setItem("hicejo_one_click_tailor_count", (currentUsage + 1).toString());
      } catch {}
    } catch (err) {
      console.error("1-click tailor error:", err);
    } finally {
      setIsGeneratingKit(false);
    }
  };

  // Helper for source badge colors
  const getSourceBadge = (source: JobSource) => {
    switch (source) {
      case "linkedin":
        return { label: "LinkedIn", bg: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20", dot: "bg-[#0A66C2]" };
      case "wellfound":
        return { label: "Wellfound", bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", dot: "bg-orange-500" };
      case "indeed":
        return { label: "Indeed", bg: "bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20", dot: "bg-blue-600" };
      case "remotive":
        return { label: "Remotive", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500" };
      case "direct":
        return { label: "Direct Partner", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" };
      default:
        return { label: "Web", bg: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };
    }
  };

  // Active match analysis for selected listing
  const selectedMatchAnalysis: JobMatchAnalysis | null = selectedListing
    ? analyzeJobMatch(selectedListing, currentResume)
    : null;

  return (
    <DashboardShell title="Target Jobs & Opportunities" maxWidth="max-w-[1440px]">
      <div className="space-y-4">
        {/* TOP TAB CONTROLLER & QUICK ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Target Jobs & Opportunities
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Live Openings
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Curated roles matched in real time against your target profile and resume evidence.
            </p>
          </div>

          {/* Tab Selector + Top Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/60">
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "explore"
                    ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Explore</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/15 text-primary font-mono ml-0.5">
                  {listings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("targets")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "targets"
                    ? "bg-card text-foreground shadow-xs border border-border/60 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                <span>Saved Targets</span>
                {savedTargets.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono ml-0.5 font-bold">
                    {savedTargets.length}
                  </span>
                )}
              </button>
            </div>

            {/* Top Action Modals */}
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer h-8.5 rounded-xl border-border/70 hover:bg-muted"
            >
              <LinkIcon className="h-3.5 w-3.5 text-primary" />
              <span>Import URL</span>
            </Button>

            <Button
              onClick={() => setIsEmployerModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer h-8.5 rounded-xl border-border/70 hover:bg-muted"
            >
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              <span>For Employers</span>
            </Button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: EXPLORE JOB LISTINGS                                */}
        {/* ========================================================= */}
        {activeTab === "explore" && (
          <div className="space-y-3.5">
            {/* UNIFIED SEARCH & FILTERS TOOLBAR */}
            <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs space-y-2.5">
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search role, company, or stack (e.g. ${userTargetRole}, React, Stripe)...`}
                    value={filters.query}
                    onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                    className="w-full h-9 pl-9 pr-8 rounded-lg border border-border/70 bg-background/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  {filters.query && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Filters & Sorters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filters.workplaceType}
                    onChange={(e) => setFilters((prev) => ({ ...prev, workplaceType: e.target.value as any }))}
                    className="h-9 px-2.5 rounded-lg border border-border/70 bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="all">Workplace: All</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters((prev) => ({ ...prev, experienceLevel: e.target.value as any }))}
                    className="h-9 px-2.5 rounded-lg border border-border/70 bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="all">Level: All</option>
                    <option value="entry">Entry-Level</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Staff</option>
                  </select>

                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                    className="h-9 px-2.5 rounded-lg border border-border/70 bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="match">Sort: Best ATS Match</option>
                    <option value="recent">Sort: Most Recent</option>
                    <option value="salary_high">Sort: Highest Salary</option>
                  </select>

                  <button
                    onClick={() => fetchListings()}
                    title="Refresh live listings"
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingListings ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Source Filter Pills + Count Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">Source:</span>
                  {(["all", "linkedin", "wellfound", "indeed", "remotive", "direct"] as const).map((src) => {
                    const isSelected = filters.source === src;
                    return (
                      <button
                        key={src}
                        onClick={() => setFilters((prev) => ({ ...prev, source: src }))}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                            : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted"
                        }`}
                      >
                        {src === "all" ? "All Sources" : src === "direct" ? "Direct Partner ⚡" : src.charAt(0).toUpperCase() + src.slice(1)}
                      </button>
                    );
                  })}
                </div>

                {/* Filter Status & Reset */}
                <div className="flex items-center gap-2.5 ml-auto text-[11px]">
                  <span className="text-muted-foreground">
                    Showing <strong className="text-foreground font-semibold">{listings.length}</strong> roles
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TWO-PANE EXPLORER: LIST (LEFT) + DETAIL INSPECTOR (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-230px)] lg:min-h-[620px] items-stretch">
              {/* LEFT: JOB CARDS LIST */}
              <div
                className={`lg:col-span-5 flex flex-col h-full min-h-0 ${
                  mobileView === "detail" ? "hidden lg:flex" : "flex"
                }`}
              >
                {isLoadingListings ? (
                  <div className="p-12 text-center border border-border/60 rounded-xl bg-card space-y-3 my-auto">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">Aggregating live opportunities...</p>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="p-8 text-center border border-border/60 rounded-xl bg-card space-y-3 my-auto">
                    <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-bold text-foreground">No matching listings found</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Try adjusting your search query or loosening workplace or level filters.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetAllFilters}
                      className="text-xs font-semibold cursor-pointer rounded-lg"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 min-h-0">
                    {listings.map((job) => {
                      const isSelected = selectedListing?.id === job.id;
                      const badge = getSourceBadge(job.source);
                      const match = analyzeJobMatch(job, currentResume);
                      const isBookmarked = bookmarkedJobIds.has(job.id);

                      return (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedListing(job);
                            setMobileView("detail");
                          }}
                          className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative space-y-2 ${
                            isSelected
                              ? "bg-primary/[0.03] border-l-4 border-l-primary border-primary/40 shadow-xs"
                              : "bg-card/70 hover:bg-card border-border/60 hover:border-border hover:shadow-2xs"
                          }`}
                        >
                          {/* Card Top: Company + Workplace + Bookmark */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-semibold text-foreground/85 truncate">
                                {job.company}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">•</span>
                              <span className="text-[10px] text-muted-foreground capitalize shrink-0">
                                {job.workplaceType}
                              </span>
                              {job.isDirectPartner && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                                  Fast-Track
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBookmark(job);
                                }}
                                title={isBookmarked ? "Saved to Target Roles" : "Save to Target Roles"}
                                className="text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                            {job.title}
                          </h3>

                          {/* Location & Salary */}
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{job.location}</span>
                            <span className="font-medium text-foreground/80 shrink-0 text-[11px]">
                              {job.minSalary && job.maxSalary
                                ? `$${(job.minSalary / 1000).toFixed(0)}k - $${(job.maxSalary / 1000).toFixed(0)}k`
                                : "Salary undisclosed"}
                            </span>
                          </div>

                          {/* Footer: Match Score Dot + Key Skills */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                            {/* Match Indicator */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${
                                  match.tier === "strong"
                                    ? "bg-emerald-500"
                                    : match.tier === "moderate"
                                    ? "bg-amber-500"
                                    : "bg-muted-foreground/60"
                                }`}
                              />
                              <span
                                className={`text-[11px] font-semibold ${
                                  match.tier === "strong"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : match.tier === "moderate"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {match.score}% ATS Match
                              </span>
                            </div>

                            {/* Clean Skill Pills (at most 3) */}
                            <div className="flex items-center gap-1 overflow-hidden">
                              {job.requiredSkills.slice(0, 2).map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/90 font-medium truncate max-w-[80px]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchWorkflow("tailor", job);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
                              title="Tailor Resume for this Job"
                            >
                              <Zap className="h-2.5 w-2.5 fill-current" />
                              <span>Tailor</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: SELECTED JOB DETAILS & ACTION CONSOLE */}
              <div
                className={`lg:col-span-7 flex flex-col h-full min-h-0 ${
                  mobileView === "list" ? "hidden lg:flex" : "flex"
                }`}
              >
                {selectedListing ? (
                  <Card className="h-full flex flex-col border-border/70 bg-card p-5 sm:p-6 shadow-xs overflow-hidden">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-primary mb-3 hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to listings</span>
                    </button>

                    {/* Scrollable Content Container */}
                    <div className="overflow-y-auto pr-1 flex-1 min-h-0 space-y-5">
                      {/* Header Area */}
                      <div className="space-y-3 pb-4 border-b border-border/60">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                                getSourceBadge(selectedListing.source).bg
                              }`}
                            >
                              {getSourceBadge(selectedListing.source).label}
                            </span>
                            {selectedListing.isDirectPartner && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                <span>Verified Partner</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleBookmark(selectedListing)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              bookmarkedJobIds.has(selectedListing.id)
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
                            }`}
                          >
                            {bookmarkedJobIds.has(selectedListing.id) ? (
                              <>
                                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3.5 w-3.5" />
                                <span>Save Target</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            {selectedListing.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                            {selectedListing.companyWebsite ? (
                              <a
                                href={selectedListing.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                title={`Visit ${selectedListing.company} website`}
                              >
                                <Building2 className="h-3.5 w-3.5 text-primary" />
                                <span>{selectedListing.company}</span>
                              </a>
                            ) : (
                              <span className="font-semibold text-foreground flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 text-primary" />
                                <span>{selectedListing.company}</span>
                              </span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {selectedListing.location}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{selectedListing.workplaceType}</span>
                            {selectedListing.minSalary && selectedListing.maxSalary && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-foreground">
                                  ${(selectedListing.minSalary / 1000).toFixed(0)}k - ${(selectedListing.maxSalary / 1000).toFixed(0)}k / yr
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 1-CLICK ACTION COMMAND BAR */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            onClick={() => handleLaunchWorkflow("tailor", selectedListing)}
                            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer h-9 px-4 rounded-lg"
                          >
                            <Zap className="h-3.5 w-3.5 fill-current" />
                            <span>1-Click Tailor Resume</span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleLaunchWorkflow("cover-letter", selectedListing)}
                            className="gap-1.5 text-xs font-semibold cursor-pointer h-9 px-3 rounded-lg border-border/70"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Cover Letter</span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleLaunchWorkflow("interview", selectedListing)}
                            className="gap-1.5 text-xs font-semibold cursor-pointer h-9 px-3 rounded-lg border-border/70"
                          >
                            <Mic className="h-3.5 w-3.5 text-primary" />
                            <span>Prep Interview</span>
                          </Button>

                          <a
                            href={getDirectApplyPortalUrl(selectedListing)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline px-2.5 py-1.5 ml-auto cursor-pointer"
                            title={`Directly open ${selectedListing.source === "linkedin" ? "LinkedIn" : selectedListing.source} apply portal`}
                          >
                            <span>Apply on {selectedListing.source === "linkedin" ? "LinkedIn" : selectedListing.source.toUpperCase()}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* DYNAMIC ATS MATCH SCORE CARD */}
                      {selectedMatchAnalysis && (
                        <div className="p-4 rounded-xl border border-border/70 bg-muted/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center font-black text-xs ${
                                  selectedMatchAnalysis.tier === "strong"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : selectedMatchAnalysis.tier === "moderate"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                                }`}
                              >
                                {selectedMatchAnalysis.score}%
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground">
                                  Resume ATS Alignment
                                </h4>
                                <p className="text-[11px] text-muted-foreground">
                                  {selectedMatchAnalysis.matchSummary}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLaunchWorkflow("checker", selectedListing)}
                              className="text-xs font-semibold text-primary hover:underline h-7 cursor-pointer"
                            >
                              <span>Full Audit &rarr;</span>
                            </Button>
                          </div>

                          {/* Matched & Missing Skills Pills */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                ✓ Matched on Your Resume ({selectedMatchAnalysis.matchedSkills.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {selectedMatchAnalysis.matchedSkills.map((sk, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                                ⚠ Missing Keywords ({selectedMatchAnalysis.missingSkills.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {selectedMatchAnalysis.missingSkills.map((sk, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FULL JOB DESCRIPTION */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Job Description & Requirements
                        </h3>
                        <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-sans p-4 rounded-xl border border-border/50 bg-background/50">
                          {selectedListing.description}
                        </div>
                      </div>

                      {/* Bottom CTA to Tailor */}
                      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">Want to maximize interview call-backs?</p>
                          <p className="text-[11px] text-muted-foreground">
                            Tailor your resume bullets specifically for this {selectedListing.company} opening.
                          </p>
                        </div>
                        <Button
                          onClick={() => handleLaunchWorkflow("tailor", selectedListing)}
                          size="sm"
                          className="text-xs font-bold bg-primary text-primary-foreground shrink-0 cursor-pointer rounded-lg"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          <span>Tailor Now</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-border/60 rounded-xl bg-card space-y-3">
                    <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-bold text-foreground">No role selected</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      {listings.length === 0
                        ? "No openings match your current filter combination. Try clicking 'Reset'."
                        : "Select an opportunity from the list on the left to preview requirements and match metrics."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY SAVED TARGET ROLES & TRACKER                     */}
        {/* ========================================================= */}
        {activeTab === "targets" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
              <div>
                <h2 className="text-base font-bold text-foreground">Saved Target Roles</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed qualification breakdowns and evidence audits for positions you are actively pursuing.
                </p>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Target Job</span>
              </Button>
            </div>

            {/* Target Selector Bar */}
            {savedTargets.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-muted-foreground shrink-0 mr-1">Saved Roles:</span>
                {savedTargets.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setActiveJobContext({
                          jobTitle: job.title,
                          company: job.company,
                          jobDescription: job.description,
                          atsScore: job.matchScore,
                          matchTier: job.matchScore >= 80 ? "strong" : "moderate",
                          sourceTool: "checker"
                        });
                      }}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/40"
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{job.company} — {job.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                        {job.matchScore}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = savedTargets.filter((t) => t.id !== job.id);
                          setSavedTargets(updated);
                          setSelectedJob(updated.length > 0 ? updated[0] : null);
                          setBookmarkedJobIds((prev) => {
                            const next = new Set(prev);
                            next.delete(job.id);
                            return next;
                          });
                          try {
                            localStorage.setItem("hicejo_saved_targets", JSON.stringify(updated));
                          } catch {}
                        }}
                        title="Remove target"
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-opacity ml-1 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer bg-card/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Target</span>
                </button>
              </div>
            )}

            {/* Empty State when no targets saved */}
            {savedTargets.length === 0 && !isAddModalOpen && (
              <div className="border border-border/80 rounded-xl bg-card p-8 text-center space-y-5 max-w-2xl mx-auto my-6">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mx-auto text-foreground">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-foreground">No Target Roles Saved Yet</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
                    You can save roles directly from the <strong>Explore Listings</strong> tab or add custom target descriptions here to run in-depth ATS audits.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => setActiveTab("explore")}
                    className="text-xs font-semibold bg-primary text-primary-foreground h-8.5 px-4 gap-1.5 cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Explore Curated Jobs</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs font-semibold h-8.5 px-4 gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Custom Target</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Active Target Details Card */}
            {selectedJob && (
              <Card className="border-border/60 bg-card p-6 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {selectedJob.company}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedJob.location}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{selectedJob.title}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Role Match</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {selectedJob.matchScore}%
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setActiveJobContext({
                          jobTitle: selectedJob.title,
                          company: selectedJob.company,
                          jobDescription: selectedJob.description,
                          atsScore: selectedJob.matchScore,
                          matchTier: selectedJob.matchScore >= 80 ? "strong" : "moderate",
                          sourceTool: "tailor"
                        });
                        router.push("/dashboard/tailor");
                      }}
                      className="gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-sm h-11 px-5 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Tailor Resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* What this job requires */}
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
                  <div className="p-4 bg-secondary/40 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        What this job requires
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Requirement &rarr; Your Evidence &rarr; Match &rarr; Action
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedJob.analyzed ? (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {selectedJob.requirements.strongMatches.length +
                            selectedJob.requirements.partialMatches.length +
                            selectedJob.requirements.skillGaps.length +
                            selectedJob.requirements.missingEvidence.length}{" "}
                          evaluated requirements
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                          Not analyzed yet
                        </span>
                      )}
                    </div>
                  </div>

                  {!selectedJob.analyzed && (
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">No requirement analysis yet</p>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                          Choose the resume you want to evaluate against this job for an honest requirement-by-requirement comparison.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="space-y-1 flex-1 max-w-sm">
                          <label className="text-xs font-bold text-foreground">Resume to evaluate</label>
                          <select
                            value={selectedResumeDraftId}
                            onChange={(e) => setSelectedResumeDraftId(e.target.value)}
                            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">Use pasted resume text</option>
                            {resumeOptions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          onClick={async () => {
                            if (!selectedJob.description.trim()) return;
                            setIsAnalyzing(true);
                            setAnalyzeError(null);
                            try {
                              const res = await fetch("/api/ai/check", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  resumeText: resumeForAnalysis || undefined,
                                  resumeId: selectedResumeDraftId || undefined,
                                  jobTitle: selectedJob.title,
                                  jobDescription: selectedJob.description
                                })
                              });
                              const json = await res.json();
                              if (!res.ok || !json.success) throw new Error(json.error || "Analysis failed");

                              const analysis = json.data;
                              const analyzedJob: JobRole = {
                                ...selectedJob,
                                matchScore: typeof analysis.score === "number" ? analysis.score : 0,
                                analyzed: true,
                                requirements: {
                                  strongMatches: Array.isArray(analysis.strengths) ? analysis.strengths : [],
                                  partialMatches: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
                                  skillGaps: Array.isArray(analysis.missingRequirements) ? analysis.missingRequirements : [],
                                  missingEvidence: Array.isArray(analysis.missingRequirements) ? analysis.missingRequirements : []
                                }
                              };

                              const updated = savedTargets.map((t) => (t.id === selectedJob.id ? analyzedJob : t));
                              setSavedTargets(updated);
                              setSelectedJob(analyzedJob);
                              try {
                                localStorage.setItem("hicejo_saved_targets", JSON.stringify(updated));
                              } catch {}
                            } catch (err: any) {
                              setAnalyzeError(err?.message || "Could not analyze job.");
                            } finally {
                              setIsAnalyzing(false);
                            }
                          }}
                          disabled={isAnalyzing || (!selectedResumeDraftId && !resumeForAnalysis.trim())}
                          className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{isAnalyzing ? "Analyzing…" : "Analyze This Job"}</span>
                        </Button>
                      </div>

                      {analyzeError && <p className="text-xs font-medium text-destructive">{analyzeError}</p>}
                    </div>
                  )}

                  {selectedJob.analyzed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border/40 bg-secondary/20">
                            <th className="p-3 font-semibold text-muted-foreground w-1/3">Requirement</th>
                            <th className="p-3 font-semibold text-muted-foreground">Your Evidence</th>
                            <th className="p-3 font-semibold text-muted-foreground">Match</th>
                            <th className="p-3 font-semibold text-muted-foreground text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {selectedJob.requirements.strongMatches.map((req, idx) => (
                            <tr key={`strong-${idx}`} className="hover:bg-secondary/30 transition-colors">
                              <td className="p-3 font-medium text-foreground">
                                <div className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                  <span className="font-semibold">{req}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">Demonstrated in current resume with verified scope.</td>
                              <td className="p-3">
                                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-flex items-center gap-1">
                                  🟢 Strong
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setActiveJobContext({
                                      jobTitle: selectedJob.title,
                                      company: selectedJob.company,
                                      jobDescription: selectedJob.description,
                                      atsScore: selectedJob.matchScore
                                    });
                                    router.push("/dashboard/interview");
                                  }}
                                  className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <Mic className="h-3 w-3" />
                                  <span>Rehearse</span>
                                </Button>
                              </td>
                            </tr>
                          ))}

                          {selectedJob.requirements.skillGaps.map((req, idx) => (
                            <tr key={`gap-${idx}`} className="hover:bg-secondary/30 transition-colors">
                              <td className="p-3 font-medium text-foreground">
                                <div className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                  <span className="font-semibold">{req}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">No direct evidence found on current resume.</td>
                              <td className="p-3">
                                <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 inline-flex items-center gap-1">
                                  🔴 Gap
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <Link
                                  href={`/dashboard/learning?skill=${encodeURIComponent(req)}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline px-2 py-1"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span>Learn + Build</span>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: IMPORT JOB FROM URL (LINKEDIN, INDEED, WELLFOUND) */}
        {/* ========================================================= */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <Card className="w-full max-w-lg p-6 space-y-4 border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <span>Import Job from Web / Job Board</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Paste any posting URL from LinkedIn, Indeed, Wellfound, or company career sites.
                  </p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleImportUrl} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Job Posting URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Our importer reads Schema.org JSON-LD metadata for role title, company, salary, and requirements.
                  </p>
                </div>

                {importError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                    {importError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportModalOpen(false)}
                    className="text-xs h-9 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isImporting}
                    size="sm"
                    className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm h-9 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isImporting ? "animate-spin" : ""}`} />
                    <span>{isImporting ? "Importing & Extracting…" : "Import & Match Job"}</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: FOR EMPLOYERS & DIRECT PLACEMENT COMMISSION       */}
        {/* ========================================================= */}
        {isEmployerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <Card className="w-full max-w-xl p-6 space-y-4 border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building className="h-4 w-4 text-amber-500" />
                    <span>Direct Company Placement & Hiring</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Post your opening to Hicejo. Pre-vetted candidates with matched ATS scores apply directly.
                  </p>
                </div>
                <button
                  onClick={() => setIsEmployerModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {employerSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{employerSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleEmployerSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Tech Inc"
                        value={employerCompany}
                        onChange={(e) => setEmployerCompany(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Workplace Model</label>
                      <select
                        value={employerWorkplace}
                        onChange={(e) => setEmployerWorkplace(e.target.value as WorkplaceType)}
                        className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="remote">Remote (Worldwide / Regional)</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={employerTitle}
                      onChange={(e) => setEmployerTitle(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Min Salary ($ USD)</label>
                      <input
                        type="number"
                        value={employerMinSalary}
                        onChange={(e) => setEmployerMinSalary(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Max Salary ($ USD)</label>
                      <input
                        type="number"
                        value={employerMaxSalary}
                        onChange={(e) => setEmployerMaxSalary(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Recruiter / Contact Email</label>
                    <input
                      type="email"
                      required
                      placeholder="hiring@company.com"
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Job Description & Core Requirements</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Paste responsibilities and required qualifications..."
                      value={employerJd}
                      onChange={(e) => setEmployerJd(e.target.value)}
                      className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Commission Notice */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                    <strong>Hicejo Placement Guarantee:</strong> Free to post. Standard $1,000 commission fee applies only upon successful candidate hire.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEmployerModalOpen(false)}
                      className="text-xs h-9 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingEmployerJob}
                      size="sm"
                      className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm h-9 cursor-pointer"
                    >
                      <span>{isSubmittingEmployerJob ? "Publishing…" : "Publish Direct Listing"}</span>
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: MANUAL ADD TARGET ROLE                           */}
        {/* ========================================================= */}
        {isAddModalOpen && (
          <Card className="border-primary/40 bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Add Target Role Manually</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste role details to benchmark your resume and calibrate interview simulations.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim() || !newCompany.trim() || !newJd.trim()) return;

                const newRole: JobRole = {
                  id: `custom-target-${Date.now()}`,
                  title: newTitle.trim(),
                  company: newCompany.trim(),
                  location: newLocation.trim() || "Remote / Hybrid",
                  matchScore: 0,
                  description: newJd.trim(),
                  requirements: {
                    strongMatches: [],
                    partialMatches: [],
                    skillGaps: [],
                    missingEvidence: []
                  },
                  analyzed: false
                };

                const updated = [newRole, ...savedTargets.filter((t) => t.id !== newRole.id)];
                setSavedTargets(updated);
                setSelectedJob(newRole);
                try {
                  localStorage.setItem("hicejo_saved_targets", JSON.stringify(updated));
                } catch {}

                setActiveJobContext({
                  jobTitle: newRole.title,
                  company: newRole.company,
                  jobDescription: newRole.description,
                  sourceTool: "checker"
                });

                setNewTitle("");
                setNewCompany("");
                setNewJd("");
                setIsAddModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground">Target Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Acme Corp"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground">Target Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground">Location</label>
                  <input
                    type="text"
                    placeholder="Remote / Hybrid"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Job Description (JD)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste the full job description here..."
                  value={newJd}
                  onChange={(e) => setNewJd(e.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm h-9 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Save Target Role</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 1-CLICK JOB APPLICATION KIT MODAL */}
        <AnimatePresence>
          {isApplicationKitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground my-8 max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-border/60 bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                      ⚡
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        1-Click Job Application Kit
                      </span>
                      <h3 className="text-base font-bold text-foreground">
                        {applicationKitData?.job.title} — {applicationKitData?.job.company}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsApplicationKitOpen(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {isGeneratingKit ? (
                    <div className="py-16 text-center space-y-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm font-bold text-foreground">
                        Generating Tailored Application Kit...
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Matching keywords, rewriting experience metrics, and preparing tailored interview questions.
                      </p>
                    </div>
                  ) : applicationKitData ? (
                    <>
                      {/* ROLE ALIGNMENT OVERVIEW */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Baseline Profile</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                              Original
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground">General Application</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {applicationKitData.missingSkills.length > 0
                              ? `Missing specific keyword focus on: ${applicationKitData.missingSkills.slice(0, 3).join(", ")}`
                              : "Standard resume draft prior to job-specific keyword tailoring."}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 ring-1 ring-emerald-500/25">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tailored Kit</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              ✓ Role-Aligned
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground">Optimized for {applicationKitData.job.company}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Required skills and quantified achievements woven directly into your resume bullets and cover letter.
                          </p>
                        </div>
                      </div>

                      {/* BUNDLED ASSETS (3 ITEMS) */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Your Tailored Assets (Ready to Apply)
                        </h4>

                        {/* Asset 1: Resume */}
                        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                                📄
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">
                                  1. Tailored 1-Page ATS Resume
                                </h5>
                                <p className="text-[11px] text-muted-foreground">
                                  Optimized bullets with targeted keywords & measurable metrics
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setIsApplicationKitOpen(false);
                                  handleLaunchWorkflow("tailor", applicationKitData.job);
                                }}
                                className="text-xs font-bold h-8 px-3 gap-1 bg-primary text-primary-foreground shadow-2xs cursor-pointer"
                              >
                                <span>Edit in Builder</span>
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Sample bullet preview */}
                          <div className="p-2.5 rounded-lg bg-background border border-border/50 text-[11px] text-muted-foreground space-y-1">
                            <span className="font-bold text-foreground block text-[10px] uppercase">Preview Tailored Bullet:</span>
                            <p className="italic text-foreground">
                              &quot;{applicationKitData.tailoredBullets[0]?.bullet}&quot;
                            </p>
                          </div>
                        </div>

                        {/* Asset 2: Cover Letter */}
                        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                ✉️
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">
                                  2. Matching Targeted Cover Letter
                                </h5>
                                <p className="text-[11px] text-muted-foreground">
                                  High-impact letter specifically personalized for {applicationKitData.job.company}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(applicationKitData.coverLetter);
                                setKitCopiedAsset("letter");
                                setTimeout(() => setKitCopiedAsset(null), 2000);
                              }}
                              className="text-xs font-bold h-8 px-3 rounded-lg border border-border/70 bg-background hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer"
                            >
                              {kitCopiedAsset === "letter" ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Letter</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Asset 3: Top 5 Interview Questions */}
                        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                                🎙️
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">
                                  3. Top 5 Likely Interview Questions
                                </h5>
                                <p className="text-[11px] text-muted-foreground">
                                  Questions tailored to {applicationKitData.job.company}&apos;s engineering bar
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsApplicationKitOpen(false);
                                handleLaunchWorkflow("interview", applicationKitData.job);
                              }}
                              className="text-xs font-bold h-8 px-3 gap-1 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              <Mic className="h-3 w-3" />
                              <span>Practice Questions</span>
                            </Button>
                          </div>

                          <div className="space-y-1.5 pl-2 text-[11px] text-foreground">
                            {applicationKitData.interviewQuestions.slice(0, 3).map((q, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-primary">{idx + 1}.</span>
                                <span className="text-muted-foreground">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* DIRECT APPLY PORTAL BUTTON */}
                      <div className="pt-2">
                        <a
                          href={getDirectApplyPortalUrl(applicationKitData.job)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md transition-all cursor-pointer"
                        >
                          <span>Apply on {applicationKitData.job.source === "linkedin" ? "LinkedIn" : applicationKitData.job.source.toUpperCase()} Now</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </>
                  ) : null}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* UPGRADE MODAL INTEGRATION */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          featureName={upgradeFeatureName}
        />
      </div>
    </DashboardShell>
  );
}
