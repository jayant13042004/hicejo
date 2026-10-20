export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
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
