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
  description: string;
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

export interface DesignSettings {
  fontFamily?: "font-sans" | "font-serif" | "font-mono";
  fontSize?: "sm" | "md" | "lg";
  sectionOrder?: string[];
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
