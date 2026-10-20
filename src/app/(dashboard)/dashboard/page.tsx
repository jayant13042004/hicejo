"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  BookOpen,
  Mic,
  ShieldCheck,
  X,
  ExternalLink,
  Layers,
  Compass,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { useResumeStore } from "@/store/useResumeStore";
import { POPULAR_ROLES, getCuratedCurriculumForRole } from "@/data/learningCurricula";
import {
  calculatePreparationReadiness,
  getPriorityGaps,
  getNextBestAction,
  getSkillProgressMap,
  getDetectedInterviewGaps,
  STORAGE_KEYS,
  PriorityGap,
  PreparationReadiness
} from "@/lib/hicejoState";

interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  target_role?: string;
  experience_level?: string;
  primary_domain?: string;
  resume_text?: string;
}

interface ResumeItem {
  id: string;
  title: string;
  ats_score?: number | null;
  created_at: string;
  updated_at: string;
}

const EXPERIENCE_LEVELS = [
  "Entry / Junior (0-2 yrs)",
  "Mid-Level (2-5 yrs)",
  "Senior (5-8 yrs)",
  "Staff / Lead (8-12 yrs)",
  "Executive / Principal (12+ yrs)"
];

export default function DashboardPage() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [savedTargets, setSavedTargets] = React.useState<any[]>([]);
  const [lastInterview, setLastInterview] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const { careerProfile, setCareerProfile, activeJobContext, setActiveJobContext } = useResumeStore();

  // Setup / Personalization Modal State
  const [isSetupModalOpen, setIsSetupModalOpen] = React.useState(false);
  const [roleInput, setRoleInput] = React.useState(() => careerProfile?.targetRole || "");
  const [levelInput, setLevelInput] = React.useState(() => careerProfile?.experienceLevel || "Mid-Level (2-5 yrs)");
  const [domainInput, setDomainInput] = React.useState(() => careerProfile?.primaryDomain || "");
  const [resumeTextInput, setResumeTextInput] = React.useState(() => careerProfile?.resumeText || "");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const openSetupModal = () => {
    setRoleInput(careerProfile?.targetRole || profile?.target_role || "");
    setLevelInput(careerProfile?.experienceLevel || profile?.experience_level || "Mid-Level (2-5 yrs)");
    setDomainInput(careerProfile?.primaryDomain || profile?.primary_domain || "");
    setResumeTextInput(careerProfile?.resumeText || profile?.resume_text || "");
    setIsSetupModalOpen(true);
  };

  // Load targets & last interview from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTargets = localStorage.getItem(STORAGE_KEYS.SAVED_TARGETS);
        if (storedTargets) {
          const parsed = JSON.parse(storedTargets);
          if (Array.isArray(parsed)) {
            setSavedTargets(parsed.filter((j: any) => !j.isSample && j.id !== "sample-target-role"));
          }
        }
        const storedEval = localStorage.getItem(STORAGE_KEYS.LAST_INTERVIEW_EVAL);
        if (storedEval) {
          setLastInterview(JSON.parse(storedEval));
        }
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, resumesRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/resume")
        ]);

        const profileData = await profileRes.json().catch(() => ({}));
        const resumesData = await resumesRes.json().catch(() => ({}));

        if (profileData.success && profileData.data) {
          const p = profileData.data;
          setProfile(p);
          if (p.target_role) {
            setRoleInput(p.target_role);
            if (p.experience_level) setLevelInput(p.experience_level);
            if (p.primary_domain) setDomainInput(p.primary_domain);
            if (p.resume_text) setResumeTextInput(p.resume_text);

            setCareerProfile({
              targetRole: p.target_role,
              experienceLevel: p.experience_level || "Mid-Level (2-5 yrs)",
              primaryDomain: p.primary_domain || "",
              resumeText: p.resume_text || "",
              isConfigured: true
            });
            if (!activeJobContext?.jobTitle) {
              setActiveJobContext({
                jobTitle: p.target_role,
                company: "",
                jobDescription: ""
              });
            }
          } else if (careerProfile?.targetRole) {
            setRoleInput(careerProfile.targetRole);
            if (careerProfile.experienceLevel) setLevelInput(careerProfile.experienceLevel);
            if (careerProfile.primaryDomain) setDomainInput(careerProfile.primaryDomain);
          }
        }
        if (resumesData.success && Array.isArray(resumesData.data)) {
          setResumes(resumesData.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [setCareerProfile, setActiveJobContext, activeJobContext?.jobTitle, careerProfile?.targetRole, careerProfile?.experienceLevel, careerProfile?.primaryDomain]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;

    setIsSavingProfile(true);

    const targetRole = roleInput.trim();
    const experienceLevel = levelInput;
    const primaryDomain = domainInput.trim();
    const resumeText = resumeTextInput.trim();

    // 1. Immediately update Zustand store and localStorage so the UI updates and persists
    setCareerProfile({
      targetRole,
      experienceLevel,
      primaryDomain,
      resumeText,
      isConfigured: true
    });

    setActiveJobContext({
      jobTitle: targetRole,
      company: activeJobContext?.company || "",
      jobDescription: activeJobContext?.jobDescription || ""
    });

    setProfile((prev) => ({
      ...(prev || { id: "user", email: "", full_name: "Jayant" }),
      target_role: targetRole,
      experience_level: experienceLevel,
      primary_domain: primaryDomain,
      resume_text: resumeText
    }));

    // Close the setup modal immediately
    setIsSetupModalOpen(false);

    // 2. Synchronize to backend profile API in the background
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          primaryDomain,
          resumeText
        })
      });
      const result = await res.json().catch(() => ({}));
      if (result.success && result.data) {
        setProfile((prev) => ({
          ...(prev || {}),
          ...result.data,
          target_role: targetRole,
          experience_level: experienceLevel,
          primary_domain: primaryDomain
        }));
      }
    } catch (err) {
      console.warn("Background profile sync notice:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayName = profile?.full_name?.trim()
    ? profile.full_name.trim().split(" ")[0]
    : "Jayant";

  const activeTargetRole = careerProfile?.targetRole || profile?.target_role || "";
  const activeExperienceLevel = careerProfile?.experienceLevel || profile?.experience_level || "Mid-Level (2-5 yrs)";

  // Resolve curriculum skills for target role
  const roleCurriculum = React.useMemo(() => {
    if (!activeTargetRole) return null;
    return getCuratedCurriculumForRole(activeTargetRole, activeExperienceLevel);
  }, [activeTargetRole, activeExperienceLevel]);

  const allSkills = React.useMemo(() => {
    if (!roleCurriculum) return [];
    return roleCurriculum.modules.flatMap((m) => m.skills);
  }, [roleCurriculum]);

  const highestAtsScore = React.useMemo(() => {
    return resumes.reduce((max, r) => Math.max(max, r.ats_score || 0), 0);
  }, [resumes]);

  // Measured Readiness breakdown (honest calculation)
  const readiness: PreparationReadiness = React.useMemo(() => {
    return calculatePreparationReadiness(
      activeTargetRole,
      activeExperienceLevel,
      allSkills,
      resumes.length,
      highestAtsScore > 0 ? highestAtsScore : null,
      lastInterview?.score || null
    );
  }, [activeTargetRole, activeExperienceLevel, allSkills, resumes.length, highestAtsScore, lastInterview]);

  // Priority Gaps (Top 3 highest impact)
  const priorityGaps: PriorityGap[] = React.useMemo(() => {
    return getPriorityGaps(activeTargetRole, savedTargets, allSkills, resumes.length);
  }, [activeTargetRole, savedTargets, allSkills, resumes.length]);

  // Next Best Action
  const nextBestAction = React.useMemo(() => {
    return getNextBestAction(activeTargetRole, savedTargets, priorityGaps, resumes.length);
  }, [activeTargetRole, savedTargets, priorityGaps, resumes.length]);

  // Determine Current Career Pipeline Step (1 to 5)
  const journeyStage = React.useMemo(() => {
    if (!activeTargetRole) return 1;
    if (resumes.length === 0) return 2;
    if (savedTargets.length === 0) return 3;
    if (highestAtsScore < 85) return 4;
    return 5;
  }, [activeTargetRole, resumes.length, savedTargets.length, highestAtsScore]);

  // Greeting time of day
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <DashboardShell title="Career Command Center">
      <div className="dashboard-overview space-y-8 max-w-5xl mx-auto pb-12 text-foreground">
        {/* ========================================================================= */}
        {/* A. TARGET ROLE                                                            */}
        {/* ========================================================================= */}
        <div className="dashboard-target-header flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Active Target Position
              </span>
            </div>
            {activeTargetRole ? (
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {activeTargetRole}
                </h1>
                <span className="text-xs text-muted-foreground">
                  • {activeExperienceLevel}
                </span>
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-muted-foreground mt-1">
                No Target Position Selected
              </h1>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {greeting}, {displayName}. Your preparation arc is calibrated to this role.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTargetRole ? (
              <Button
                variant="outline"
                size="sm"
                onClick={openSetupModal}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-border/80 hover:bg-secondary"
              >
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Change Target</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={openSetupModal}
                className="h-8 text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Set Target Role</span>
              </Button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B. APPLICATION COMMAND HUB                                                */}
        {/* ========================================================================= */}
        <div className="dashboard-panel p-5 sm:p-6 rounded-xl border border-border/80 bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Application Command Hub
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Active Workspace
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your hiring assets and practice status for <span className="font-semibold text-foreground">{activeTargetRole || "your target role"}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/tailor">
                <Button size="sm" className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer bg-primary text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Tailor for a Job</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Core Pillars of Candidate Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* 1. Resume Drafts */}
            <Link
              href="/dashboard/builder"
              className="p-3.5 rounded-lg border border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Resumes</span>
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {resumes.length > 0 ? `${resumes.length} Draft${resumes.length > 1 ? "s" : ""}` : "Create Draft"}
                </p>
                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                  {resumes.length > 0 ? `Latest: ${resumes[0].title || "Master Resume"}` : "1-page ATS ready"}
                </span>
              </div>
            </Link>

            {/* 2. ATS Audit Health */}
            <Link
              href="/dashboard/checker"
              className="p-3.5 rounded-lg border border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>ATS Health</span>
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {highestAtsScore > 0 ? `${highestAtsScore}% Score` : "Audit Ready"}
                </p>
                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                  {highestAtsScore >= 85 ? "Recruiter pass benchmark" : "Run 4-pillar keyword scan"}
                </span>
              </div>
            </Link>

            {/* 3. Target Roles & JDs */}
            <Link
              href="/dashboard/jobs"
              className="p-3.5 rounded-lg border border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span>Target Jobs</span>
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {savedTargets.length > 0 ? `${savedTargets.length} Tracked` : "Import Role"}
                </p>
                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                  {savedTargets.length > 0 ? `${savedTargets[0].company || savedTargets[0].title || "Active"}` : "Extract requirements from JD"}
                </span>
              </div>
            </Link>

            {/* 4. Interview Studio */}
            <Link
              href="/dashboard/interview"
              className="p-3.5 rounded-lg border border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-amber-500" />
                  <span>Mock Interview</span>
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {lastInterview ? `${lastInterview.score}/100 Scored` : "Ready to Start"}
                </p>
                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                  {lastInterview ? `${lastInterview.hiringRecommendation || "Session Complete"}` : "Simulate authentic hiring loop"}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* C. NEXT BEST ACTION (MOST IMPORTANT COMPONENT ON THE PAGE)               */}
        {/* ========================================================================= */}
        <div className="dashboard-panel dashboard-next-action p-5 sm:p-6 rounded-xl border-2 border-primary/20 bg-card space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Next Best Action
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Highest-Leverage Step
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {nextBestAction.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {nextBestAction.context}
              </p>
            </div>

            <div>
              {nextBestAction.actionType === "setup" ? (
                <Button
                  size="sm"
                  onClick={openSetupModal}
                  className="h-9 px-4 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <span>{nextBestAction.ctaLabel.replace(/\s*→\s*$/, "")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Link href={nextBestAction.ctaHref || "/dashboard/learning"}>
                  <Button
                    size="sm"
                    className="h-9 px-4 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <span>{nextBestAction.ctaLabel.replace(/\s*→\s*$/, "")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* D. CAREER JOURNEY                                                         */}
        {/* ========================================================================= */}
        <div className="dashboard-overview-section dashboard-journey space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Application Pipeline
            </span>
            <Link href="/dashboard/jobs" className="text-xs text-primary hover:underline font-medium">
              View Target Pipeline &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              {
                step: 1,
                name: "Target Position",
                desc: activeTargetRole ? "Defined" : "Set Target",
                href: "/dashboard/jobs",
                isDone: Boolean(activeTargetRole),
                isCurrent: journeyStage === 1
              },
              {
                step: 2,
                name: "Base Resume",
                desc: resumes.length > 0 ? `${resumes.length} Ready` : "Create Draft",
                href: "/dashboard/builder",
                isDone: resumes.length > 0,
                isCurrent: journeyStage === 2
              },
              {
                step: 3,
                name: "Tailor for JD",
                desc: savedTargets.length > 0 ? "Role Aligned" : "Tailor Experience",
                href: "/dashboard/tailor",
                isDone: savedTargets.length > 0,
                isCurrent: journeyStage === 3
              },
              {
                step: 4,
                name: "ATS Audit",
                desc: highestAtsScore > 0 ? `${highestAtsScore}% Score` : "Run Check",
                href: "/dashboard/checker",
                isDone: highestAtsScore >= 85,
                isCurrent: journeyStage === 4
              },
              {
                step: 5,
                name: "Interview Loop",
                desc: lastInterview ? `${lastInterview.score}% Scored` : "Practice Voice",
                href: "/dashboard/interview",
                isDone: Boolean(lastInterview),
                isCurrent: journeyStage === 5
              },
            ].map((stage) => (
              <Link
                key={stage.step}
                href={stage.href}
                className={`dashboard-journey-step p-3 rounded-lg border transition-colors flex flex-col justify-between space-y-2 ${
                  stage.isCurrent
                    ? "bg-secondary/80 border-primary/50 text-foreground ring-1 ring-primary/20"
                    : stage.isDone
                    ? "bg-card border-border/80 text-foreground"
                    : "bg-secondary/30 border-border/50 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">0{stage.step}</span>
                  {stage.isDone ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ) : stage.isCurrent ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground truncate">{stage.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{stage.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* E. PRIORITY GAPS (SHOW ONLY TOP 3 HIGHEST-IMPACT GAPS)                    */}
        {/* ========================================================================= */}
        <div className="dashboard-overview-section dashboard-priority-gaps space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Priority Gaps (Top 3)
            </span>
            <Link href="/dashboard/learning" className="text-xs text-primary hover:underline font-medium">
              Review all requirements &rarr;
            </Link>
          </div>

          {priorityGaps.length > 0 ? (
            <div className="dashboard-panel dashboard-gap-list border border-border/70 rounded-xl bg-card divide-y divide-border/60 overflow-hidden text-xs">
              {priorityGaps.map((gap) => (
                <div key={gap.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{gap.problem}</span>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        {gap.impact} priority
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {gap.whyItMatters}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Link href={gap.actionHref}>
                      <Button size="sm" variant="outline" className="h-7.5 px-3 text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary cursor-pointer">
                        <span>{gap.actionLabel}</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-md border border-border/80 bg-secondary/30 text-center space-y-1 text-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
              <p className="font-semibold text-foreground">No critical evidence gaps detected</p>
              <p className="text-muted-foreground text-[11px]">
                {activeTargetRole ? "Your demonstrated evidence aligns with role benchmarks. Proceed to mock interviews or application tailoring." : "Define your target position above to benchmark required evidence."}
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* F. RECENT WORK                                                            */}
        {/* ========================================================================= */}
        <div className="dashboard-overview-section dashboard-recent-work space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Recent Work & Sessions
            </span>
            <Link href="/dashboard/builder">
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold gap-1 cursor-pointer">
                <Plus className="h-3 w-3" />
                <span>New Resume Draft</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Resumes Drafts */}
            <div className="dashboard-panel p-4 sm:p-5 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Resume Drafts ({resumes.length})</span>
                </span>
                <Link href="/dashboard/builder" className="text-[11px] text-primary hover:underline">
                  Open Builder &rarr;
                </Link>
              </div>

              {resumes.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {resumes.slice(0, 3).map((r) => (
                    <div key={r.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/dashboard/builder?id=${r.id}`} className="font-medium text-foreground hover:text-primary truncate block">
                          {r.title || "Untitled Resume"}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Updated {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/dashboard/builder?id=${r.id}`}>
                        <Button size="sm" variant="ghost" className="h-6.5 text-[11px] px-2 text-primary font-semibold">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground py-2">
                  No resume drafts saved yet. Create a baseline 1-page draft in the builder.
                </p>
              )}
            </div>

            {/* 2. Target Jobs & Interview Sessions */}
            <div className="dashboard-panel p-4 sm:p-5 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-primary" />
                  <span>Interview & Target Role Checks</span>
                </span>
                <Link href="/dashboard/interview" className="text-[11px] text-primary hover:underline">
                  Launch Studio &rarr;
                </Link>
              </div>

              {lastInterview ? (
                <div className="p-2.5 rounded-md bg-secondary/40 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Latest Mock Interview</span>
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {lastInterview.score}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {lastInterview.feedback || lastInterview.hiringRecommendation}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-md bg-secondary/30 border border-border/60 space-y-1">
                  <span className="font-medium text-foreground block">Ready for Simulation</span>
                  <p className="text-[11px] text-muted-foreground">
                    Practice realistic technical and behavioral rounds in the Interview Studio.
                  </p>
                </div>
              )}

              {savedTargets.length > 0 && (
                <div className="pt-1 border-t border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Active Target Job
                  </span>
                  <Link href="/dashboard/jobs" className="text-foreground hover:text-primary font-medium flex items-center justify-between">
                    <span className="truncate">{savedTargets[0].company} — {savedTargets[0].title}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{savedTargets[0].matchScore}% fit</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SETUP MODAL: CANDIDATE TARGET ROLE CONFIGURATION                          */}
        {/* ========================================================================= */}
        {isSetupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-xl p-6 text-foreground space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground">Target Role Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Align your dashboard readiness metrics with your target position.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSetupModalOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Target Role Title *</label>
                  <Input
                    required
                    placeholder="e.g. GenAI / LLM Engineer, Data Scientist, Senior Backend Engineer"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                  {/* Popular role suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_ROLES.slice(0, 10).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoleInput(r.title)}
                        className="px-2 py-0.5 rounded text-[11px] bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer border border-border/60"
                      >
                        {r.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Experience Level</label>
                  <select
                    value={levelInput}
                    onChange={(e) => setLevelInput(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Primary Domain / Focus Area (Optional)</label>
                  <Input
                    placeholder="e.g. Performance Marketing, B2B SaaS, Distributed Systems, Corporate Finance"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSetupModalOpen(false)}
                    className="h-8.5 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingProfile || !roleInput.trim()}
                    className="h-8.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer"
                  >
                    {isSavingProfile ? "Saving Profile..." : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
