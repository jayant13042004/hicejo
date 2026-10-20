/**
 * Hicejo Connected Career Preparation State
 * Central intelligence engine connecting:
 * Target Job → Diagnose → Identify Gaps → Close Gaps → Build Real Evidence → Craft Application → Practice Interview → Receive Feedback → Improve
 */

import { RoleCurriculum, getCuratedCurriculumForRole, SkillItem } from "@/data/learningCurricula";

export type SkillStage = "not_started" | "learned" | "practiced" | "evidence" | "demonstrated";

export interface SkillProgressRecord {
  stage: SkillStage;
  updatedAt: string;
  notes?: string;
  evidenceLink?: string;
  resumeBullet?: string;
}

export interface PriorityGap {
  id: string;
  problem: string;
  whyItMatters: string;
  actionLabel: string;
  actionHref: string;
  skillName?: string;
  impact: "high" | "medium";
  category: "evidence" | "skill" | "resume" | "interview";
}

export interface PreparationReadiness {
  overallScore: number;
  skillsScore: number;
  evidenceScore: number;
  applicationScore: number;
  interviewScore: number;
  totalRequirements: number;
  demonstratedCount: number;
  evidenceCount: number;
  practicedCount: number;
  learnedCount: number;
}

export interface DetectedInterviewGap {
  id: string;
  role: string;
  skillName: string;
  detectedProblem: string;
  feedback: string;
  recommendedAction: string;
  timestamp: string;
}

// LocalStorage Keys
export const STORAGE_KEYS = {
  SKILL_PROGRESS: "hicejo_skill_progress",
  COMPLETED_SKILLS: "hicejo_completed_skills",
  SAVED_TARGETS: "hicejo_saved_targets",
  CAREER_PROFILE: "hicejo_career_profile",
  INTERVIEW_GAPS: "hicejo_interview_gaps",
  LAST_INTERVIEW_EVAL: "hicejo_last_interview_eval",
  ACTIVE_JOB_CONTEXT: "hicejo_active_job_context",
  ONBOARDING_COMPLETED: "hicejo_onboarding_completed"
};

/**
 * Get map of skill progress stages (learned, practiced, evidence, demonstrated)
 */
export function getSkillProgressMap(): Record<string, SkillProgressRecord> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SKILL_PROGRESS);
    if (stored) {
      return JSON.parse(stored);
    }
    // Backward compatibility: migrate from hicejo_completed_skills
    const legacy = localStorage.getItem(STORAGE_KEYS.COMPLETED_SKILLS);
    if (legacy) {
      const ids: string[] = JSON.parse(legacy);
      const migrated: Record<string, SkillProgressRecord> = {};
      ids.forEach((id) => {
        migrated[id] = {
          stage: "demonstrated",
          updatedAt: new Date().toISOString()
        };
      });
      return migrated;
    }
  } catch {}
  return {};
}

/**
 * Save progress stage for a skill
 */
export function setSkillProgressStage(
  skillId: string,
  stage: SkillStage,
  additional?: Partial<SkillProgressRecord>
): Record<string, SkillProgressRecord> {
  const current = getSkillProgressMap();
  if (stage === "not_started") {
    delete current[skillId];
  } else {
    current[skillId] = {
      ...(current[skillId] || {}),
      stage,
      updatedAt: new Date().toISOString(),
      ...additional
    };
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.SKILL_PROGRESS, JSON.stringify(current));

      // Keep legacy completed skills in sync (any skill at least "evidence" or "demonstrated")
      const completedList = Object.keys(current).filter(
        (id) => current[id].stage === "evidence" || current[id].stage === "demonstrated"
      );
      localStorage.setItem(STORAGE_KEYS.COMPLETED_SKILLS, JSON.stringify(completedList));
    } catch {}
  }

  return current;
}

/**
 * Get detected interview gaps
 */
export function getDetectedInterviewGaps(): DetectedInterviewGap[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INTERVIEW_GAPS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

/**
 * Record a detected interview gap
 */
export function recordDetectedInterviewGap(gap: DetectedInterviewGap) {
  if (typeof window === "undefined") return;
  try {
    const list = getDetectedInterviewGaps();
    const filtered = list.filter((g) => g.skillName.toLowerCase() !== gap.skillName.toLowerCase());
    filtered.unshift(gap);
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_GAPS, JSON.stringify(filtered.slice(0, 10)));
  } catch {}
}

/**
 * Calculate honest preparation readiness scores
 */
export function calculatePreparationReadiness(
  targetRole: string,
  experienceLevel: string,
  allSkills: SkillItem[],
  resumeCount: number,
  lastAtsScore?: number | null,
  lastInterviewScore?: number | null
): PreparationReadiness {
  const progressMap = getSkillProgressMap();

  let demonstratedCount = 0;
  let evidenceCount = 0;
  let practicedCount = 0;
  let learnedCount = 0;

  allSkills.forEach((skill) => {
    const rec = progressMap[skill.id];
    if (rec) {
      if (rec.stage === "demonstrated") {
        demonstratedCount++;
        evidenceCount++;
        practicedCount++;
        learnedCount++;
      } else if (rec.stage === "evidence") {
        evidenceCount++;
        practicedCount++;
        learnedCount++;
      } else if (rec.stage === "practiced") {
        practicedCount++;
        learnedCount++;
      } else if (rec.stage === "learned") {
        learnedCount++;
      }
    }
  });

  const total = Math.max(1, allSkills.length);

  // 1. Skills Knowledge Score (Learned + Practiced)
  const skillsScore = Math.min(100, Math.round(((learnedCount + practicedCount * 0.5) / (total * 1.5)) * 100));

  // 2. Real Evidence Score (Evidence + Demonstrated)
  const evidenceScore = Math.min(100, Math.round(((evidenceCount * 0.6 + demonstratedCount * 0.4) / total) * 100));

  // 3. Application Score (Resume presence + ATS calibration)
  let applicationScore = 0;
  if (resumeCount > 0) {
    applicationScore = lastAtsScore ? Math.min(95, lastAtsScore) : 75;
  } else {
    applicationScore = 20; // no resume yet
  }

  // 4. Interview Score (Interview performance or readiness)
  let interviewScore = 0;
  if (lastInterviewScore) {
    interviewScore = Math.min(100, lastInterviewScore);
  } else if (demonstratedCount > 0) {
    interviewScore = Math.min(80, 40 + Math.round((demonstratedCount / total) * 40));
  } else {
    interviewScore = 35;
  }

  // Overall honest preparation score:
  // Skills 25%, Evidence 35%, Application 20%, Interview 20%
  const overallScore = Math.min(
    95,
    Math.round(
      skillsScore * 0.25 +
      evidenceScore * 0.35 +
      applicationScore * 0.20 +
      interviewScore * 0.20
    )
  );

  return {
    overallScore: targetRole ? overallScore : 0,
    skillsScore: targetRole ? skillsScore : 0,
    evidenceScore: targetRole ? evidenceScore : 0,
    applicationScore: targetRole ? applicationScore : 0,
    interviewScore: targetRole ? interviewScore : 0,
    totalRequirements: allSkills.length,
    demonstratedCount,
    evidenceCount,
    practicedCount,
    learnedCount
  };
}

/**
 * Determine Priority Gaps (top 3 highest impact gaps)
 */
export function getPriorityGaps(
  targetRole: string,
  savedTargets: any[],
  allSkills: SkillItem[],
  resumeCount: number
): PriorityGap[] {
  const gaps: PriorityGap[] = [];
  const progressMap = getSkillProgressMap();
  const interviewGaps = getDetectedInterviewGaps();

  // 1. Any detected gap from recent interview simulation
  if (interviewGaps.length > 0) {
    const topIg = interviewGaps[0];
    gaps.push({
      id: `interview-${topIg.id}`,
      problem: `Unverified interview articulation in ${topIg.skillName}`,
      whyItMatters: topIg.detectedProblem || "Could not defend technical trade-offs or implementation depth in interview.",
      actionLabel: `Rehearse ${topIg.skillName}`,
      actionHref: `/dashboard/interview?mode=practice&skill=${encodeURIComponent(topIg.skillName)}`,
      skillName: topIg.skillName,
      impact: "high",
      category: "interview"
    });
  }

  // 2. Check saved target job requirement gaps
  if (savedTargets && savedTargets.length > 0) {
    const jobWithGaps = savedTargets.find(
      (j) => j.requirements?.skillGaps?.length > 0 || j.requirements?.missingEvidence?.length > 0
    );
    if (jobWithGaps) {
      if (jobWithGaps.requirements?.missingEvidence?.length > 0) {
        const missing = jobWithGaps.requirements.missingEvidence[0];
        gaps.push({
          id: `target-missing-${jobWithGaps.id}`,
          problem: `Missing proof for ${missing}`,
          whyItMatters: `Required by ${jobWithGaps.company || "target job"} (${jobWithGaps.title}), but your resume lacks direct measurable metrics.`,
          actionLabel: "Build Evidence",
          actionHref: "/dashboard/learning",
          impact: "high",
          category: "evidence"
        });
      } else if (jobWithGaps.requirements?.skillGaps?.length > 0) {
        const gap = jobWithGaps.requirements.skillGaps[0];
        gaps.push({
          id: `target-gap-${jobWithGaps.id}`,
          problem: `Unmatched requirement: ${gap}`,
          whyItMatters: `Explicitly listed in ${jobWithGaps.company || "target"} job description with zero verifiable resume evidence.`,
          actionLabel: "Learn & Build",
          actionHref: "/dashboard/learning",
          impact: "high",
          category: "skill"
        });
      }
    }
  }

  // 3. Fallback to curriculum skill gaps without evidence
  const unprovenSkills = allSkills.filter((s) => {
    const rec = progressMap[s.id];
    return !rec || (rec.stage !== "evidence" && rec.stage !== "demonstrated");
  });

  for (const s of unprovenSkills) {
    if (gaps.length >= 3) break;
    const isAlreadyAdded = gaps.some((g) => g.skillName?.toLowerCase() === s.name.toLowerCase());
    if (!isAlreadyAdded) {
      const rec = progressMap[s.id];
      const stage = rec?.stage || "not_started";
      const isPartiallyLearned = stage === "learned" || stage === "practiced";

      gaps.push({
        id: `skill-${s.id}`,
        problem: isPartiallyLearned ? `Missing project evidence for ${s.name}` : `No demonstrated proof for ${s.name}`,
        whyItMatters: `Primary technical competency for ${targetRole || "your target role"}. ${s.desc}`,
        actionLabel: isPartiallyLearned ? "Build Proof" : "Learn & Practice",
        actionHref: `/dashboard/learning?skill=${encodeURIComponent(s.name)}`,
        skillName: s.name,
        impact: "high",
        category: "evidence"
      });
    }
  }

  // 4. Missing Resume Check
  if (resumeCount === 0 && gaps.length < 3) {
    gaps.unshift({
      id: "no-resume-gap",
      problem: "No baseline 1-page resume draft created",
      whyItMatters: "Your career evidence cannot be evaluated or tailored against target jobs without a structured draft.",
      actionLabel: "Draft Resume",
      actionHref: "/dashboard/builder",
      impact: "high",
      category: "resume"
    });
  }

  return gaps.slice(0, 3);
}

/**
 * Determine the Next Best Action for the user based on live context
 */
export function getNextBestAction(
  targetRole: string,
  savedTargets: any[],
  priorityGaps: PriorityGap[],
  resumeCount: number
): {
  title: string;
  problem: string;
  context: string;
  ctaLabel: string;
  ctaHref?: string;
  actionType?: "setup" | "link";
} {
  if (!targetRole) {
    return {
      title: "Set Your Target Role",
      problem: "No active career target selected.",
      context: "Define your target position and seniority to begin diagnosing real requirements, evidence gaps, and interview standards.",
      ctaLabel: "Set Target Role",
      actionType: "setup"
    };
  }

  if (priorityGaps.length > 0) {
    const topGap = priorityGaps[0];
    const targetJobCount = savedTargets.length;

    let contextDesc = topGap.whyItMatters;
    if (topGap.skillName && targetJobCount > 0) {
      contextDesc = `${targetJobCount} of your target jobs require demonstrated ${topGap.skillName} experience. Your current resume has no direct evidence.`;
    }

    return {
      title: topGap.problem,
      problem: topGap.problem,
      context: contextDesc,
      ctaLabel: topGap.actionLabel + " →",
      ctaHref: topGap.actionHref,
      actionType: "link"
    };
  }

  if (resumeCount === 0) {
    return {
      title: "Draft your baseline 1-page resume",
      problem: "No active resume draft.",
      context: "Create your core experience in single-page vector format without fabricating achievements.",
      ctaLabel: "Open Resume Builder →",
      ctaHref: "/dashboard/builder",
      actionType: "link"
    };
  }

  return {
    title: "Run an interview simulation",
    problem: "Verify articulation under pressure.",
    context: `Test your technical explanation and STAR delivery for ${targetRole} with our simulated hiring manager.`,
    ctaLabel: "Start Mock Interview →",
    ctaHref: "/dashboard/interview",
    actionType: "link"
  };
}
