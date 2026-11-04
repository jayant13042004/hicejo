export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Bullet points separated by newlines
}

export type GradeType = "cgpa" | "percentage" | "gpa" | "none" | string;

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
  gradeType?: GradeType;
  grade?: string; // e.g. "8.8 / 10", "85%", "3.8 / 4.0"
}

export function formatEducationGrade(edu?: Partial<Education> | null): string | null {
  if (!edu) return null;
  const gradeType = (edu.gradeType || "").toLowerCase();
  if (gradeType === "none") return null;

  let rawGrade = (edu.grade || "").trim();
  if (!rawGrade && edu.description) {
    const match = edu.description.match(/(?:cgpa|gpa|percentage|score|grade)\s*[:=-]?\s*([^\n,]+)/i);
    if (match) {
      rawGrade = match[1].trim();
    } else if (/\b\d+(?:\.\d+)?\s*%/i.test(edu.description)) {
      rawGrade = edu.description.trim();
    }
  }

  if (!rawGrade) return null;

  // Normalize slash spacing: "7.99 / 10" -> "7.99/10", "8.5 out of 10" -> "8.5/10"
  rawGrade = rawGrade.replace(/\s*\/\s*/g, "/").replace(/\s*out\s+of\s*/gi, "/");

  // Determine effective type
  const effectiveType = gradeType || (
    rawGrade.includes("%") || /percent/i.test(rawGrade) ? "percentage" :
    /gpa/i.test(rawGrade) && !/cgpa/i.test(rawGrade) ? "gpa" : "cgpa"
  );

  // Strip redundant prefix
  const stripped = rawGrade.replace(/^(?:cgpa|gpa|percentage|score|grade)\s*[:=-]?\s*/i, "").trim();
  if (!stripped) return null;

  if (effectiveType === "percentage") {
    const hasPercent = stripped.endsWith("%");
    return `Percentage: ${stripped}${hasPercent ? "" : "%"}`;
  }

  if (effectiveType === "gpa") {
    return `GPA: ${stripped}`;
  }

  // Default is standardized CGPA: 7.99/10
  return `CGPA: ${stripped}`;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  link: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string; // e.g. "Languages", "Frameworks"
  level?: string; // e.g. Beginner, Intermediate, Expert
}

export type ResumeDensity = "relaxed" | "normal" | "compact" | "ultra-compact";

export type ResumeStyle = "classic" | "split-sidebar" | "executive" | "minimal" | "technical";

export interface DesignSettings {
  fontFamily?: "font-sans" | "font-serif" | "font-mono" | "font-executive" | "font-geometric";
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl";
  resumeStyle?: ResumeStyle;
  sectionOrder?: string[];
  density?: ResumeDensity;
  sectionSpacing?: number; // 0.6 to 1.4 multiplier
  itemSpacing?: number;    // 0.6 to 1.4 multiplier
  lineHeight?: number;     // 1.2 to 1.6 multiplier
  autoFitOnePage?: boolean;
  balancePageHeight?: boolean;
}

export interface FitAnalysis {
  status: "fits" | "underutilized" | "overflowing" | "perfect";
  pageCount: number;
  utilizationPercentage: number;
  overflowLines: number;
  overflowPercentage: number;
  contentHeightPx: number;
  targetPageHeightPx: number;
  readabilityGrade: "Excellent" | "Good" | "Tight" | "Needs Attention";
  atsSafetyGrade: "Excellent" | "Good" | "Warning";
  contentDensity: "Optimal" | "Relaxed" | "Compact" | "Dense";
  recommendedAction?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  design?: DesignSettings;
}

export type SaveState = "idle" | "typing" | "saving" | "saved" | "error";

export interface ResumeState {
  id: string | null;
  title: string;
  data: ResumeData;
  saveState: SaveState;
  past: ResumeData[];
  future: ResumeData[];
}

export interface PillarScore {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number; // percentage
  status: "strong" | "moderate" | "weak";
  summary: string;
  recommendation: string;
}

export interface UpliftStep {
  title: string;
  estimatedPoints: number;
  action: string;
  rationale: string;
  groundedContext: string;
}

export interface ApplicationStrengthResult {
  isTargeted: boolean;
  score: number; // Overall score 0-100
  tierLabel: "Top Tier Contender" | "Strong Match" | "Moderate Match" | "High Risk";
  readabilityScore: number;
  projectedScore: number;
  potentialUplift: number;
  pillars: PillarScore[];
  upliftPath: UpliftStep[];
  strengths: string[];
  weaknesses: string[];
  missingRequirements: string[];
  recruiterRisks: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  executiveSummary: string;
}
