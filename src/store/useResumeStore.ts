import { create } from "zustand";
import { ResumeData, PersonalInfo, Experience, Education, Project, Skill, SaveState, DesignSettings, ResumeDensity } from "@/types/resume";

export interface PendingImprovement {
  type?: "uplift" | "roast" | "tailor";
  title: string;
  description?: string;
  details?: string;
  targetSection?: "personal" | "summary" | "experience" | "skills" | "projects" | "education" | string;
  actionableSnippet?: string;
}

export interface UserCareerProfile {
  targetRole: string;
  experienceLevel: string;
  primaryDomain: string;
  targetCountry?: string;
  resumeText: string;
  isConfigured: boolean;
}

export interface ActiveJobContext {
  jobTitle: string;
  company?: string;
  jobDescription: string;
  atsScore?: number;
  matchTier?: string;
  sourceTool?: "checker" | "tailor" | "roast" | "interview";
  pendingImprovement?: PendingImprovement;
  lastUpdated: string;
}

interface ResumeStore {
  id: string | null;
  title: string;
  data: ResumeData;
  saveState: SaveState;
  past: ResumeData[];
  future: ResumeData[];
  
  // User Career Profile (Target Role, Seniority Level, Baseline Resume)
  careerProfile: UserCareerProfile | null;
  setCareerProfile: (profile: Partial<UserCareerProfile>) => void;

  // Active Target Job Context for Connected OS Workflow
  activeJobContext: ActiveJobContext | null;
  pendingImprovement: PendingImprovement | null;
  setActiveJobContext: (context: Partial<ActiveJobContext>) => void;
  clearActiveJobContext: () => void;
  setPendingImprovement: (improvement: PendingImprovement | null) => void;
  loadTailoredDraft: (id: string | null, title: string, data: ResumeData, jobContext?: Partial<ActiveJobContext>) => void;

  // Load entire resume
  loadResume: (id: string | null, title: string, data: ResumeData) => void;
  importResumeData: (data: ResumeData) => void;
  
  // Actions
  setResumeId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setSaveState: (state: SaveState) => void;
  
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  
  addExperience: () => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  addEducation: () => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  addProject: () => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  addSkill: (name?: string, category?: string) => void;
  updateSkill: (id: string, name: string, category?: string) => void;
  removeSkill: (id: string) => void;

  updateDesignSettings: (design: Partial<DesignSettings>) => void;
  setDensity: (density: ResumeDensity) => void;
  toggleAutoFitOnePage: () => void;
  applyCompressedBullet: (itemId: string, itemType: "experience" | "projects", oldBullet: string, newBullet: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const defaultDesign: DesignSettings = {
  fontFamily: "font-sans",
  fontSize: "md",
  sectionOrder: ["summary", "experience", "projects", "education", "skills"],
  density: "normal",
  sectionSpacing: 1.0,
  itemSpacing: 1.0,
  lineHeight: 1.4,
  autoFitOnePage: false
};

const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  design: defaultDesign
};

function getInitialCareerProfile(): UserCareerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("hicejo_career_profile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function persistCareerProfile(profile: UserCareerProfile | null) {
  if (typeof window === "undefined") return;
  try {
    if (profile) {
      localStorage.setItem("hicejo_career_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("hicejo_career_profile");
    }
  } catch {}
}

function getInitialJobContext(): ActiveJobContext | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("hicejo_active_job_context");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function persistJobContext(context: ActiveJobContext | null) {
  if (typeof window === "undefined") return;
  try {
    if (context) {
      localStorage.setItem("hicejo_active_job_context", JSON.stringify(context));
    } else {
      localStorage.removeItem("hicejo_active_job_context");
    }
  } catch {}
}

export const useResumeStore = create<ResumeStore>((set, get) => {
  // Helper to record history before mutation
  const saveHistory = (state: any) => ({
    past: [...state.past.slice(-29), JSON.parse(JSON.stringify(state.data))], // max history stack 30
    future: [],
  });

  return {
    id: null,
    title: "Untitled Resume",
    data: initialResumeData,
    saveState: "idle",
    past: [],
    future: [],

    careerProfile: getInitialCareerProfile(),
    setCareerProfile: (updates) => {
      set((state) => {
        const current = state.careerProfile || {
          targetRole: "",
          experienceLevel: "Mid-Level (2-5 yrs)",
          primaryDomain: "",
          resumeText: "",
          isConfigured: false
        };
        const next = { ...current, ...updates, isConfigured: true };
        persistCareerProfile(next);
        return { careerProfile: next };
      });
    },

    activeJobContext: getInitialJobContext(),
    pendingImprovement: getInitialJobContext()?.pendingImprovement || null,

    setActiveJobContext: (context) => {
      set((state) => {
        const merged: ActiveJobContext = state.activeJobContext
          ? { ...state.activeJobContext, ...context, lastUpdated: new Date().toISOString() }
          : {
              jobTitle: context.jobTitle || "",
              company: context.company || "",
              jobDescription: context.jobDescription || "",
              atsScore: context.atsScore,
              matchTier: context.matchTier,
              sourceTool: context.sourceTool,
              pendingImprovement: context.pendingImprovement,
              lastUpdated: new Date().toISOString(),
              ...context
            };
        persistJobContext(merged);
        return {
          activeJobContext: merged,
          ...(context.pendingImprovement !== undefined ? { pendingImprovement: context.pendingImprovement || null } : {})
        };
      });
    },

    clearActiveJobContext: () => {
      persistJobContext(null);
      set({ activeJobContext: null, pendingImprovement: null });
    },

    setPendingImprovement: (improvement) => {
      set((state) => {
        const updatedContext: ActiveJobContext = state.activeJobContext
          ? {
              ...state.activeJobContext,
              pendingImprovement: improvement || undefined,
              lastUpdated: new Date().toISOString()
            }
          : {
              jobTitle: "Target Position",
              company: "Target Company",
              jobDescription: "",
              pendingImprovement: improvement || undefined,
              lastUpdated: new Date().toISOString()
            };
        persistJobContext(updatedContext);
        return {
          activeJobContext: updatedContext,
          pendingImprovement: improvement || null
        };
      });
    },

    loadTailoredDraft: (id, title, data, jobContext) => {
      set((state) => {
        const past = [...state.past.slice(-29), JSON.parse(JSON.stringify(state.data))];
        const mergedData = {
          ...data,
          design: {
            ...defaultDesign,
            ...(data.design || {})
          }
        };

        let updatedContext = state.activeJobContext;
        if (jobContext) {
          updatedContext = {
            jobTitle: jobContext.jobTitle || state.activeJobContext?.jobTitle || "",
            company: jobContext.company || state.activeJobContext?.company || "",
            jobDescription: jobContext.jobDescription || state.activeJobContext?.jobDescription || "",
            atsScore: jobContext.atsScore ?? state.activeJobContext?.atsScore,
            matchTier: jobContext.matchTier ?? state.activeJobContext?.matchTier,
            sourceTool: "tailor",
            pendingImprovement: jobContext.pendingImprovement ?? state.activeJobContext?.pendingImprovement,
            lastUpdated: new Date().toISOString(),
            ...jobContext
          };
          persistJobContext(updatedContext);
        }

        return {
          id,
          title,
          data: mergedData,
          past,
          future: [],
          saveState: "saved",
          activeJobContext: updatedContext,
          pendingImprovement: updatedContext?.pendingImprovement || null
        };
      });
    },

    loadResume: (id, title, data) => {
      // Ensure default design settings exist on load
      const mergedData = {
        ...data,
        design: {
          ...defaultDesign,
          ...(data.design || {})
        }
      };
      set({ id, title, data: mergedData, past: [], future: [], saveState: "idle" });
    },

    importResumeData: (data) => {
      set((state) => {
        const mergedData = {
          ...data,
          design: {
            ...defaultDesign,
            ...(state.data.design || {}),
            ...(data.design || {})
          }
        };
        return {
          data: mergedData,
          past: [...state.past, state.data],
          future: [],
          saveState: "typing"
        };
      });
    },

    setResumeId: (id) => set({ id }),
    setTitle: (title) => set({ title, saveState: "typing" }),
    setSaveState: (saveState) => set({ saveState }),

    updatePersonalInfo: (info) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        personalInfo: { ...state.data.personalInfo, ...info },
      },
      saveState: "typing",
    })),

    updateSummary: (summary) => set((state) => ({
      ...saveHistory(state),
      data: { ...state.data, summary },
      saveState: "typing",
    })),

    addExperience: () => set((state) => {
      const newExp: Experience = {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      };
      return {
        ...saveHistory(state),
        data: {
          ...state.data,
          experience: [newExp, ...state.data.experience],
        },
        saveState: "typing",
      };
    }),

    updateExperience: (id, exp) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        experience: state.data.experience.map((item) =>
          item.id === id ? { ...item, ...exp } : item
        ),
      },
      saveState: "typing",
    })),

    removeExperience: (id) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        experience: state.data.experience.filter((item) => item.id !== id),
      },
      saveState: "typing",
    })),

    addEducation: () => set((state) => {
      const newEdu: Education = {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        fieldOfStudy: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      };
      return {
        ...saveHistory(state),
        data: {
          ...state.data,
          education: [newEdu, ...state.data.education],
        },
        saveState: "typing",
      };
    }),

    updateEducation: (id, edu) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        education: state.data.education.map((item) =>
          item.id === id ? { ...item, ...edu } : item
        ),
      },
      saveState: "typing",
    })),

    removeEducation: (id) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        education: state.data.education.filter((item) => item.id !== id),
      },
      saveState: "typing",
    })),

    addProject: () => set((state) => {
      const newProj: Project = {
        id: crypto.randomUUID(),
        name: "",
        role: "",
        link: "",
        startDate: "",
        endDate: "",
        description: "",
      };
      return {
        ...saveHistory(state),
        data: {
          ...state.data,
          projects: [newProj, ...state.data.projects],
        },
        saveState: "typing",
      };
    }),

    updateProject: (id, proj) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        projects: state.data.projects.map((item) =>
          item.id === id ? { ...item, ...proj } : item
        ),
      },
      saveState: "typing",
    })),

    removeProject: (id) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        projects: state.data.projects.filter((item) => item.id !== id),
      },
      saveState: "typing",
    })),

    addSkill: (name = "", category = "") => set((state) => {
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        name,
        category: category.trim(),
      };
      return {
        ...saveHistory(state),
        data: {
          ...state.data,
          skills: [...state.data.skills, newSkill],
        },
        saveState: "typing",
      };
    }),

    updateSkill: (id, name, category) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        skills: state.data.skills.map((item) =>
          item.id === id ? { ...item, name, category: category !== undefined ? category.trim() : item.category } : item
        ),
      },
      saveState: "typing",
    })),

    removeSkill: (id) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        skills: state.data.skills.filter((item) => item.id !== id),
      },
      saveState: "typing",
    })),

    updateDesignSettings: (design) => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        design: {
          ...defaultDesign,
          ...(state.data.design || {}),
          ...design
        }
      },
      saveState: "typing"
    })),

    setDensity: (density: ResumeDensity) => {
      const densityPresets: Record<ResumeDensity, { sectionSpacing: number; itemSpacing: number; lineHeight: number }> = {
        "relaxed": { sectionSpacing: 1.3, itemSpacing: 1.25, lineHeight: 1.55 },
        "normal": { sectionSpacing: 1.0, itemSpacing: 1.0, lineHeight: 1.4 },
        "compact": { sectionSpacing: 0.8, itemSpacing: 0.8, lineHeight: 1.3 },
        "ultra-compact": { sectionSpacing: 0.65, itemSpacing: 0.65, lineHeight: 1.22 }
      };

      const preset = densityPresets[density] || densityPresets.normal;

      set((state) => ({
        ...saveHistory(state),
        data: {
          ...state.data,
          design: {
            ...defaultDesign,
            ...(state.data.design || {}),
            density,
            ...preset
          }
        },
        saveState: "typing"
      }));
    },

    toggleAutoFitOnePage: () => set((state) => ({
      ...saveHistory(state),
      data: {
        ...state.data,
        design: {
          ...defaultDesign,
          ...(state.data.design || {}),
          autoFitOnePage: !(state.data.design?.autoFitOnePage)
        }
      },
      saveState: "typing"
    })),

    applyCompressedBullet: (itemId, itemType, oldBullet, newBullet) => set((state) => {
      if (itemType === "experience") {
        return {
          ...saveHistory(state),
          data: {
            ...state.data,
            experience: state.data.experience.map((item) => {
              if (item.id !== itemId) return item;
              const bullets = item.description.split("\n");
              const updatedBullets = bullets.map((b) => b.trim() === oldBullet.trim() ? newBullet : b);
              return { ...item, description: updatedBullets.join("\n") };
            })
          },
          saveState: "typing"
        };
      } else {
        return {
          ...saveHistory(state),
          data: {
            ...state.data,
            projects: state.data.projects.map((item) => {
              if (item.id !== itemId) return item;
              const bullets = item.description.split("\n");
              const updatedBullets = bullets.map((b) => b.trim() === oldBullet.trim() ? newBullet : b);
              return { ...item, description: updatedBullets.join("\n") };
            })
          },
          saveState: "typing"
        };
      }
    }),

    undo: () => set((state) => {
      if (state.past.length === 0) return {};
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        future: [JSON.parse(JSON.stringify(state.data)), ...state.future],
        data: previous,
        saveState: "typing",
      };
    }),

    redo: () => set((state) => {
      if (state.future.length === 0) return {};
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, JSON.parse(JSON.stringify(state.data))],
        future: newFuture,
        data: next,
        saveState: "typing",
      };
    }),

    clearHistory: () => set({ past: [], future: [] }),
  };
});
