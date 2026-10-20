"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserRound,
  FileText,
  Briefcase,
  Cpu,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { ResumeData, FitAnalysis } from "@/types/resume";

export interface ResumePerfectionBarProps {
  data: ResumeData;
  fitAnalysis: FitAnalysis;
  onNavigateTab: (tab: "personal" | "summary" | "experience" | "education" | "projects" | "skills" | "design") => void;
  onAutoFit: () => void;
  targetRole?: string | null;
}

export function ResumePerfectionBar({
  data,
  fitAnalysis,
  onNavigateTab,
  onAutoFit,
  targetRole
}: ResumePerfectionBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // 1. Contact Info evaluation (Max: 20 pts)
  const contactScore = React.useMemo(() => {
    let score = 0;
    const hasName = Boolean(data.personalInfo.fullName?.trim());
    const hasEmail = Boolean(data.personalInfo.email?.trim());
    const hasPhone = Boolean(data.personalInfo.phone?.trim());
    const hasLink = Boolean(data.personalInfo.linkedin?.trim() || data.personalInfo.website?.trim());

    if (hasName) score += 5;
    if (hasEmail) score += 5;
    if (hasPhone) score += 5;
    if (hasLink) score += 5;

    let message = "Complete";
    let isComplete = false;
    if (!hasName || !hasEmail) {
      message = "Missing Name or Email";
    } else if (!hasPhone && !hasLink) {
      message = "Add Phone & LinkedIn";
    } else if (!hasLink) {
      message = "Add LinkedIn profile";
    } else if (!hasPhone) {
      message = "Add phone number";
    } else {
      isComplete = true;
    }

    return { score, isComplete, message };
  }, [data.personalInfo]);

  // 2. Summary evaluation (Max: 15 pts)
  const summaryScore = React.useMemo(() => {
    const text = data.summary?.trim() || "";
    if (!text) {
      return { score: 0, isComplete: false, message: "Add 2-3 line summary" };
    }
    if (text.length < 50) {
      return { score: 5, isComplete: false, message: "Summary is too short" };
    }
    if (text.length > 450) {
      return { score: 10, isComplete: true, message: "Keep under 4 lines" };
    }
    return { score: 15, isComplete: true, message: "Crisp & targeted" };
  }, [data.summary]);

  // 3. Experience & Quantified Bullets evaluation (Max: 30 pts)
  const experienceScore = React.useMemo(() => {
    let score = 0;
    const count = data.experience.length;
    if (count === 0) {
      return { score: 0, isComplete: false, message: "Add work history" };
    }
    score += 10;
    if (count >= 2) score += 5;

    // Check for metrics in bullets
    const allBullets = data.experience.map((e) => e.description || "").join(" ");
    const hasNumbers = /\b\d+(\.\d+)?%?|\b\d+[kKxX]\b|\$\d+|\d+\+|\b\d+\s*(users|clients|ms|seconds|minutes|hours|days|engineers|teams|projects)/i.test(
      allBullets
    );

    if (hasNumbers) {
      score += 15;
      return { score, isComplete: true, message: "Metric-driven bullets" };
    } else {
      score += 5;
      return { score, isComplete: false, message: "Add metrics (%, $, scale)" };
    }
  }, [data.experience]);

  // 4. Core Skills evaluation (Max: 20 pts)
  const skillsScore = React.useMemo(() => {
    const total = data.skills.length;
    if (total === 0) {
      return { score: 0, isComplete: false, message: "Add technical skills" };
    }
    if (total < 5) {
      return { score: 10, isComplete: false, message: `Add ${5 - total} more skills` };
    }
    return { score: 20, isComplete: true, message: `${total} skills listed` };
  }, [data.skills]);

  // 5. 1-Page ATS Fit evaluation (Max: 15 pts)
  const fitScore = React.useMemo(() => {
    const isOverflowing = fitAnalysis.status === "overflowing";
    if (isOverflowing) {
      return {
        score: 0,
        isComplete: false,
        message: `${fitAnalysis.overflowLines} line${fitAnalysis.overflowLines === 1 ? "" : "s"} over — Auto-Fit`
      };
    }
    return { score: 15, isComplete: true, message: "Perfect 1-page fit" };
  }, [fitAnalysis]);

  // Overall Total
  const totalScore = Math.min(
    100,
    contactScore.score + summaryScore.score + experienceScore.score + skillsScore.score + fitScore.score
  );

  const isPerfect = totalScore >= 95;
  const isGood = totalScore >= 75 && totalScore < 95;

  // Top action recommendation
  const primaryTip = React.useMemo(() => {
    if (!contactScore.isComplete) return contactScore.message;
    if (!summaryScore.isComplete) return summaryScore.message;
    if (!experienceScore.isComplete) return experienceScore.message;
    if (!skillsScore.isComplete) return skillsScore.message;
    if (!fitScore.isComplete) return fitScore.message;
    return "All hiring bar criteria met. Ready to apply!";
  }, [contactScore, summaryScore, experienceScore, skillsScore, fitScore]);

  return (
    <div className="border-b border-border/60 bg-card/60 backdrop-blur-xs px-6 py-2 no-print transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Score Badge & Health Summary */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex items-center justify-center px-2 py-0.5 rounded-lg font-black text-xs border shadow-2xs shrink-0 ${
              isPerfect
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : isGood
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {totalScore}% ATS
          </div>

          <div className="flex items-center gap-2 min-w-0 text-xs">
            <span className="font-bold text-foreground shrink-0 hidden md:inline">
              Resume Readiness
            </span>
            <span className="text-muted-foreground/40 hidden md:inline">•</span>
            {targetRole && (
              <>
                <span className="font-semibold text-primary truncate max-w-[180px]">
                  🎯 {targetRole}
                </span>
                <span className="text-muted-foreground/40 hidden lg:inline">•</span>
              </>
            )}
            <span className="text-muted-foreground truncate text-[11px]">
              {isPerfect ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Perfect 1-page layout ready to send
                </span>
              ) : (
                <span>Next: <strong>{primaryTip}</strong></span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Expand / Collapse Checklist Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {!fitScore.isComplete && (
            <button
              type="button"
              onClick={onAutoFit}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Fix 1-Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold py-1 px-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer border border-border/50"
          >
            <span>{isExpanded ? "Hide Checklist" : "Checklist"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable 5-Pillar Perfection Checklist */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3">
              {/* 1. Contact Item */}
              <button
                type="button"
                onClick={() => onNavigateTab("personal")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  contactScore.isComplete
                    ? "bg-card border-border/60 hover:border-primary/40"
                    : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Contact</span>
                  </div>
                  {contactScore.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    contactScore.isComplete ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
                >
                  {contactScore.message}
                </span>
              </button>

              {/* 2. Summary Item */}
              <button
                type="button"
                onClick={() => onNavigateTab("summary")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  summaryScore.isComplete
                    ? "bg-card border-border/60 hover:border-primary/40"
                    : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Summary</span>
                  </div>
                  {summaryScore.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    summaryScore.isComplete ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
                >
                  {summaryScore.message}
                </span>
              </button>

              {/* 3. Experience Item */}
              <button
                type="button"
                onClick={() => onNavigateTab("experience")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  experienceScore.isComplete
                    ? "bg-card border-border/60 hover:border-primary/40"
                    : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Experience</span>
                  </div>
                  {experienceScore.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    experienceScore.isComplete
                      ? "text-muted-foreground"
                      : "text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
                >
                  {experienceScore.message}
                </span>
              </button>

              {/* 4. Skills Item */}
              <button
                type="button"
                onClick={() => onNavigateTab("skills")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  skillsScore.isComplete
                    ? "bg-card border-border/60 hover:border-primary/40"
                    : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Skills</span>
                  </div>
                  {skillsScore.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    skillsScore.isComplete ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
                >
                  {skillsScore.message}
                </span>
              </button>

              {/* 5. 1-Page Fit Item */}
              <button
                type="button"
                onClick={fitScore.isComplete ? () => onNavigateTab("design") : onAutoFit}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  fitScore.isComplete
                    ? "bg-card border-border/60 hover:border-primary/40"
                    : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>1-Page Fit</span>
                  </div>
                  {fitScore.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    fitScore.isComplete ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
                >
                  {fitScore.message}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
