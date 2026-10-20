export type JobSource = "all" | "linkedin" | "wellfound" | "indeed" | "remotive" | "direct";
export type WorkplaceType = "remote" | "hybrid" | "onsite";
export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "any";

export interface JobListing {
  id: string;
  externalId?: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  workplaceType: WorkplaceType;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  
  // Compensation
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryPeriod?: "yearly" | "monthly" | "hourly";
  
  // Content & Requirements
  description: string;
  descriptionHtml?: string;
  requiredSkills: string[];
  
  // Provenance & Links
  source: Exclude<JobSource, "all">;
  sourceUrl: string;
  applyUrl: string;
  postedAt: string; // ISO date string
  expiresAt?: string;
  
  // Monetization & Partnership
  isFeatured?: boolean;
  isDirectPartner?: boolean;
  commissionModel?: "none" | "cpc" | "cpa" | "placement_fee";
  commissionAmount?: number;
  employerContactEmail?: string;
}

export interface JobFilterState {
  query: string;
  source: JobSource;
  workplaceType: "all" | WorkplaceType;
  experienceLevel: "all" | ExperienceLevel;
  jobType: "all" | JobType;
  sortBy: "recent" | "match" | "salary_high";
  minSalary: number;
}

export interface JobMatchAnalysis {
  jobId: string;
  score: number;
  tier: "strong" | "moderate" | "growth";
  matchedSkills: string[];
  missingSkills: string[];
  matchSummary: string;
}
