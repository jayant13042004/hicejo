"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  FolderGit2,
  FileText,
  Mic,
  Target,
  Sparkles,
  Check,
  AlertCircle,
  Briefcase,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import { getCuratedCurriculumForRole } from "@/data/learningCurricula";
import {
  getSkillProgressMap,
  STORAGE_KEYS,
  calculatePreparationReadiness
} from "@/lib/hicejoState";

export default function JourneyPage() {
  const { careerProfile, activeJobContext } = useResumeStore();

  const [savedTargets, setSavedTargets] = React.useState<any[]>([]);
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [lastInterview, setLastInterview] = React.useState<any | null>(null);

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

    fetch("/api/resume")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setResumes(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const activeTargetRole = careerProfile?.targetRole || "Software Engineer";
  const activeExperienceLevel = careerProfile?.experienceLevel || "Mid-Level";

  const roleCurriculum = React.useMemo(() => {
    return getCuratedCurriculumForRole(activeTargetRole, activeExperienceLevel);
  }, [activeTargetRole, activeExperienceLevel]);

  const allSkills = React.useMemo(() => {
    if (!roleCurriculum) return [];
    return roleCurriculum.modules.flatMap((m) => m.skills);
  }, [roleCurriculum]);

  const progressMap = React.useMemo(() => {
    return getSkillProgressMap();
  }, []);

  const totalRequirements = allSkills.length;
  const demonstratedCount = allSkills.filter(
    (s) => progressMap[s.id]?.stage === "demonstrated"
  ).length;
  const evidenceCount = allSkills.filter(
    (s) => progressMap[s.id]?.stage === "evidence" || progressMap[s.id]?.stage === "demonstrated"
  ).length;
  const remainingGapsCount = Math.max(0, totalRequirements - evidenceCount);

  // Resume alignment score. Only a score that was actually produced by a real
  // check counts. No resume → no score; a resume without a check → not scored.
  const highestAtsScore = resumes.reduce((max, r) => Math.max(max, r.ats_score || 0), 0);
  const alignmentScore: number | null =
    highestAtsScore > 0 ? highestAtsScore : activeJobContext?.atsScore && activeJobContext.atsScore > 0
      ? activeJobContext.atsScore
      : null;
  const alignmentLabel = alignmentScore === null ? "Not scored yet" : `${alignmentScore}% aligned`;
  const requirementLabel = totalRequirements === 0 ? "—" : String(totalRequirements);

  // 6 Stages definition matching Hicejo complete workflow
  const stages = [
    {
      step: "01",
      name: "TARGET",
      title: activeTargetRole ? `Target Role Defined` : "Set Target Role",
      desc: activeTargetRole ? `✓ ${activeTargetRole} (${activeExperienceLevel})` : "Define target role and seniority benchmark.",
      status: activeTargetRole ? "completed" : "active",
      actionLabel: "Configure Target",
      actionHref: "/dashboard",
      icon: Target,
      metrics: activeTargetRole ? `${activeTargetRole}` : "Unset",
      tasks: [
        { text: `Target role calibrated to ${activeTargetRole}`, done: Boolean(activeTargetRole) },
        { text: `Seniority set to ${activeExperienceLevel}`, done: Boolean(activeExperienceLevel) },
        { text: "Career profile stored across workspace", done: Boolean(careerProfile?.isConfigured) }
      ]
    },
    {
      step: "02",
      name: "DIAGNOSE",
      title: "Target Jobs & Requirement Diagnostic",
      desc: savedTargets.length > 0 ? `✓ ${totalRequirements} requirements analyzed across ${savedTargets.length} target role(s)` : `${totalRequirements} baseline requirements analyzed`,
      status: savedTargets.length > 0 ? "completed" : activeTargetRole ? "active" : "pending",
      actionLabel: "View Target Jobs",
      actionHref: "/dashboard/jobs",
      icon: Briefcase,
      metrics: `✓ ${totalRequirements} requirements analyzed`,
      tasks: [
        { text: "Extract core technical requirements from job descriptions", done: savedTargets.length > 0 },
        { text: "Audit qualification matches vs gaps", done: savedTargets.length > 0 },
        { text: "Compare resume proof against employer expectations", done: resumes.length > 0 }
      ]
    },
    {
      step: "03",
      name: "CLOSE GAPS",
      title: "Skill Acquisition & Problem Solving",
      desc: remainingGapsCount === 0 ? "All priority requirements addressed" : `${remainingGapsCount} requirement gap${remainingGapsCount === 1 ? "" : "s"} remaining to master`,
      status: remainingGapsCount <= 2 ? "completed" : "active",
      actionLabel: "Open Skills & Learning",
      actionHref: "/dashboard/learning",
      icon: BookOpen,
      metrics: `${remainingGapsCount} remaining`,
      tasks: [
        { text: "Study core architectural concepts and algorithms", done: evidenceCount > 0 },
        { text: "Complete practice problem sets and technical exercises", done: evidenceCount > 1 },
        { text: "Address high-priority requirement gaps", done: remainingGapsCount <= 3 }
      ]
    },
    {
      step: "04",
      name: "BUILD EVIDENCE",
      title: "Verifiable Project Artifacts",
      desc: `${demonstratedCount}/${totalRequirements} requirements proven with verifiable artifacts`,
      status: demonstratedCount >= 2 ? "completed" : "active",
      actionLabel: "Review Portfolio Proof",
      actionHref: "/dashboard/learning",
      icon: FolderGit2,
      metrics: `${demonstratedCount}/${totalRequirements} demonstrated`,
      tasks: [
        { text: "Build production-grade projects demonstrating target stack", done: evidenceCount >= 1 },
        { text: "Document measurable metrics (% latency, throughput, scale)", done: evidenceCount >= 2 },
        { text: "Ensure code artifacts are public, tested, and verifiable", done: demonstratedCount >= 1 }
      ]
    },
    {
      step: "05",
      name: "APPLICATION",
      title: "Truthful, Tailored Resume & Letter",
      desc: resumes.length > 0
        ? (alignmentScore === null
            ? "Resume drafted — run an Application Strength check to score alignment"
            : `Resume ${alignmentScore}% aligned to target requirements`)
        : "Draft your baseline 1-page resume",
      status: resumes.length > 0 ? "completed" : "active",
      actionLabel: "Open Resume Builder",
      actionHref: "/dashboard/builder",
      icon: FileText,
      metrics: resumes.length > 0 ? alignmentLabel : "Draft pending",
      tasks: [
        { text: "Format 1-page vector resume with single-page autofit", done: resumes.length > 0 },
        { text: "Align resume terminology with job description", done: (alignmentScore ?? 0) >= 75 },
        { text: "Run 8-Pillar Application Strength diagnostic", done: alignmentScore !== null }
      ]
    },
    {
      step: "06",
      name: "INTERVIEW",
      title: "Mock Interview Simulation & Articulation",
      desc: lastInterview ? `Scored ${lastInterview.score}/100 in recent simulation` : "Simulate technical & behavioral rounds with AI hiring manager",
      status: lastInterview ? "completed" : "active",
      actionLabel: "Enter Interview Studio",
      actionHref: "/dashboard/interview",
      icon: Mic,
      metrics: lastInterview ? `${lastInterview.score}% scored` : "0 sessions completed",
      tasks: [
        { text: "Defend technical architectural decisions under pressure", done: Boolean(lastInterview) },
        { text: "Articulate achievements using clean STAR methodology", done: Boolean(lastInterview) },
        { text: "Address detected evidence gaps before real interviews", done: false }
      ]
    }
  ];

  return (
    <DashboardShell title="My Career Journey">
      <div className="space-y-6 max-w-4xl mx-auto pb-12 text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
              <Compass className="h-3.5 w-3.5" />
              <span>Connected Preparation Pipeline</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Career Journey
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              The complete Hicejo loop: Target Job &rarr; Diagnose &rarr; Close Gaps &rarr; Build Real Evidence &rarr; Craft Application &rarr; Practice Interview &rarr; Improve.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground bg-secondary border border-border/80 px-2.5 py-1 rounded-md">
              {demonstratedCount}/{totalRequirements} Requirements Proven
            </span>
          </div>
        </div>

        {/* 6 Stages Timeline Cards */}
        <div className="space-y-4">
          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";
            const Icon = stage.icon;

            return (
              <Card
                key={stage.step}
                className={`p-5 sm:p-6 border transition-all ${
                  isActive
                    ? "border-primary/50 bg-card shadow-xs ring-1 ring-primary/20"
                    : isCompleted
                    ? "border-border/70 bg-card"
                    : "border-border/40 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : stage.step}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {stage.step} {stage.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold font-mono px-2 py-0.2 rounded-full border ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : isActive
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-secondary text-muted-foreground border-border/40"
                          }`}
                        >
                          {stage.metrics}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {stage.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={stage.actionHref}>
                      <Button
                        size="sm"
                        variant={isActive ? "primary" : "outline"}
                        className="text-xs font-semibold gap-1.5 h-8.5 px-3.5 cursor-pointer"
                      >
                        <span>{stage.actionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-3.5 leading-relaxed">
                  {stage.desc}
                </p>

                {/* Practical Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                  {stage.tasks.map((task, taskIdx) => (
                    <div
                      key={taskIdx}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border ${
                        task.done
                          ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                          : "bg-secondary/20 border-border/40 text-muted-foreground"
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                      )}
                      <span className="truncate">{task.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
