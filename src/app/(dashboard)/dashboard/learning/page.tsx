"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlayCircle,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Check,
  ArrowRight,
  GraduationCap,
  Search,
  Filter,
  Layers,
  Copy,
  TrendingUp,
  Target,
  Plus,
  Trash2,
  X,
  Undo2,
  RotateCcw,
  Compass
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROLE_CURRICULA, RoleCurriculum, SkillItem, SkillResource, getCuratedCurriculumForRole, POPULAR_ROLES } from "@/data/learningCurricula";
import { useResumeStore } from "@/store/useResumeStore";
import {
  getSkillProgressMap,
  setSkillProgressStage,
  SkillStage,
  SkillProgressRecord,
  STORAGE_KEYS
} from "@/lib/hicejoState";

export interface CustomSkillItem extends SkillItem {
  roleId: string;
  moduleId: string;
  isCustom?: boolean;
}

export default function LearningPage() {
  const { careerProfile } = useResumeStore();

  // 1. Determine Initial Role from careerProfile, localStorage, or default to swe-dsa
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hicejo_learning_role");
      if (saved && ROLE_CURRICULA.some((r) => r.id === saved)) {
        return saved;
      }
    }
    if (careerProfile?.targetRole) {
      const matched = getCuratedCurriculumForRole(careerProfile.targetRole, careerProfile.experienceLevel);
      if (matched) return matched.id;
    }
    return "swe-dsa";
  });

  // Keep in sync if careerProfile loads or changes
  React.useEffect(() => {
    if (careerProfile?.targetRole) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("hicejo_learning_role") : null;
      if (!saved) {
        const matched = getCuratedCurriculumForRole(careerProfile.targetRole, careerProfile.experienceLevel);
        if (matched) setSelectedRoleId(matched.id);
      }
    }
  }, [careerProfile]);

  // Current active role curriculum
  const activeCurriculum: RoleCurriculum =
    ROLE_CURRICULA.find((r) => r.id === selectedRoleId) || ROLE_CURRICULA[0];

  // 2. Persistent Custom Skills State
  const [customSkills, setCustomSkills] = React.useState<CustomSkillItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("hicejo_custom_skills");
        if (stored) return JSON.parse(stored);
      } catch (err) {
        console.warn("Failed to load custom skills", err);
      }
    }
    return [];
  });

  const saveCustomSkills = (skills: CustomSkillItem[]) => {
    setCustomSkills(skills);
    if (typeof window !== "undefined") {
      localStorage.setItem("hicejo_custom_skills", JSON.stringify(skills));
    }
  };

  // 3. Persistent Deleted Skill IDs State
  const [deletedSkillIds, setDeletedSkillIds] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("hicejo_deleted_skills");
        if (stored) return new Set(JSON.parse(stored));
      } catch (err) {
        console.warn("Failed to load deleted skills", err);
      }
    }
    return new Set();
  });

  const saveDeletedSkillIds = (deleted: Set<string>) => {
    setDeletedSkillIds(deleted);
    if (typeof window !== "undefined") {
      localStorage.setItem("hicejo_deleted_skills", JSON.stringify(Array.from(deleted)));
    }
  };

  // 4. Persistent Skill Progress Map State (learn -> practice -> evidence -> demonstrated)
  const [skillProgress, setSkillProgress] = React.useState<Record<string, SkillProgressRecord>>(() => {
    return getSkillProgressMap();
  });

  const [completedSkillIds, setCompletedSkillIds] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("hicejo_completed_skills");
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (err) {
        console.warn("Failed to parse completed skills from storage", err);
      }
    }
    // New users start with zero demonstrated skills. Progress must be earned.
    return new Set();
  });

  const handleUpdateSkillStage = (skillId: string, stage: SkillStage) => {
    const updated = setSkillProgressStage(skillId, stage);
    setSkillProgress({ ...updated });
    
    // Sync completedSkillIds
    const completedList = Object.keys(updated).filter(
      (id) => updated[id].stage === "evidence" || updated[id].stage === "demonstrated"
    );
    setCompletedSkillIds(new Set(completedList));
  };

  // 5. Effective Modules (Base skills without deleted, plus custom skills)
  const effectiveModules = React.useMemo(() => {
    return activeCurriculum.modules.map((mod) => {
      const baseSkills = mod.skills.filter((s) => !deletedSkillIds.has(s.id));
      const modCustomSkills = customSkills.filter(
        (cs) => cs.roleId === selectedRoleId && cs.moduleId === mod.id && !deletedSkillIds.has(cs.id)
      );
      return {
        ...mod,
        skills: [...baseSkills, ...modCustomSkills],
      };
    });
  }, [activeCurriculum, deletedSkillIds, customSkills, selectedRoleId]);

  // Compute Overall Statistics for Active Role
  const allRoleSkills = React.useMemo(() => {
    return effectiveModules.flatMap((m) => m.skills);
  }, [effectiveModules]);

  // 6. UI Navigation & Filtering State
  const [expandedModuleId, setExpandedModuleId] = React.useState<string>(
    effectiveModules[0]?.id || ""
  );
  const [selectedSkill, setSelectedSkill] = React.useState<SkillItem>(
    effectiveModules[0]?.skills[0] || ({} as SkillItem)
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "pending" | "completed">("all");
  const [copiedBullet, setCopiedBullet] = React.useState(false);

  // Undo and Status Toast Notification
  const [notification, setNotification] = React.useState<{
    message: string;
    undoSkillId?: string;
  } | null>(null);

  // Auto-dismiss notification after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Ensure selected skill remains valid when skills change
  React.useEffect(() => {
    if (allRoleSkills.length > 0) {
      const stillExists = allRoleSkills.some((s) => s.id === selectedSkill?.id);
      if (!stillExists) {
        setSelectedSkill(allRoleSkills[0]);
      }
    } else {
      setSelectedSkill({} as SkillItem);
    }
  }, [allRoleSkills, selectedSkill]);

  // When role changes, update expanded module and selected skill
  const handleRoleChange = (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    if (typeof window !== "undefined") {
      localStorage.setItem("hicejo_learning_role", newRoleId);
    }
    const curr = ROLE_CURRICULA.find((r) => r.id === newRoleId) || ROLE_CURRICULA[0];
    if (curr.modules.length > 0) {
      setExpandedModuleId(curr.modules[0].id);
      if (curr.modules[0].skills.length > 0) {
        setSelectedSkill(curr.modules[0].skills[0]);
      }
    }
  };

  // Toggle skill completion and persist
  const toggleSkillComplete = (skillId: string) => {
    setCompletedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("hicejo_completed_skills", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Delete Skill handler (works for both default and custom skills)
  const handleDeleteSkill = (skillId: string, skillName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Add to deletedSkillIds
    const nextDeleted = new Set(deletedSkillIds);
    nextDeleted.add(skillId);
    saveDeletedSkillIds(nextDeleted);

    // 2. Remove from completed set if present
    if (completedSkillIds.has(skillId)) {
      const nextCompleted = new Set(completedSkillIds);
      nextCompleted.delete(skillId);
      setCompletedSkillIds(nextCompleted);
      if (typeof window !== "undefined") {
        localStorage.setItem("hicejo_completed_skills", JSON.stringify(Array.from(nextCompleted)));
      }
    }

    // 3. Set undo notification
    setNotification({
      message: `Deleted "${skillName}" from your curriculum.`,
      undoSkillId: skillId,
    });
  };

  // Undo Delete handler
  const handleUndoDelete = (skillId: string) => {
    const nextDeleted = new Set(deletedSkillIds);
    nextDeleted.delete(skillId);
    saveDeletedSkillIds(nextDeleted);
    setNotification(null);
  };

  // Restore All Default Skills for current role
  const handleRestoreDefaults = () => {
    // Remove default skill IDs of the active curriculum from deletedSkillIds
    const defaultIds = new Set(activeCurriculum.modules.flatMap((m) => m.skills.map((s) => s.id)));
    const nextDeleted = new Set<string>();
    deletedSkillIds.forEach((id) => {
      if (!defaultIds.has(id)) {
        nextDeleted.add(id);
      }
    });
    saveDeletedSkillIds(nextDeleted);
    setNotification({ message: "Default curriculum skills restored." });
  };

  // Helper to determine the best practice link (LeetCode or external interactive practice sandbox)
  const getSkillPracticeLink = (skill: SkillItem) => {
    const practiceRes = skill.resources?.find(
      (r) => r.type === "practice" || r.link.includes("leetcode.com") || r.link.includes("hackerrank.com")
    );
    if (practiceRes?.link) {
      const isLeetCode = practiceRes.link.includes("leetcode.com");
      return {
        url: practiceRes.link,
        isLeetCode,
        label: isLeetCode ? "LeetCode" : "Practice Online"
      };
    }
    return {
      url: `https://leetcode.com/problemset/?search=${encodeURIComponent(skill.name)}`,
      isLeetCode: true,
      label: "LeetCode"
    };
  };

  // 7. Add Skill Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [targetModuleId, setTargetModuleId] = React.useState(effectiveModules[0]?.id || "");
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillDesc, setNewSkillDesc] = React.useState("");
  const [newSkillDifficulty, setNewSkillDifficulty] = React.useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [newSkillDuration, setNewSkillDuration] = React.useState("90 min");
  const [newSkillBullet, setNewSkillBullet] = React.useState("");
  const [newSkillResourceTitle, setNewSkillResourceTitle] = React.useState("");
  const [newSkillResourceLink, setNewSkillResourceLink] = React.useState("");
  const [newSkillResourceType, setNewSkillResourceType] = React.useState<"video" | "notes" | "practice">("notes");
  const [addError, setAddError] = React.useState("");

  const openAddModal = (moduleId?: string) => {
    setTargetModuleId(moduleId || expandedModuleId || effectiveModules[0]?.id || "");
    setNewSkillName("");
    setNewSkillDesc("");
    setNewSkillDifficulty("Intermediate");
    setNewSkillDuration("90 min");
    setNewSkillBullet("");
    setNewSkillResourceTitle("");
    setNewSkillResourceLink("");
    setNewSkillResourceType("notes");
    setAddError("");
    setIsAddModalOpen(true);
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      setAddError("Please provide a skill name.");
      return;
    }

    const resources: SkillResource[] = [];
    if (newSkillResourceLink.trim()) {
      const link = newSkillResourceLink.trim().startsWith("http")
        ? newSkillResourceLink.trim()
        : `https://${newSkillResourceLink.trim()}`;
      resources.push({
        title: newSkillResourceTitle.trim() || `${newSkillName.trim()} Documentation & Guide`,
        link,
        type: newSkillResourceType,
      });
    }

    const newSkill: CustomSkillItem = {
      id: `custom-sk-${Date.now()}`,
      roleId: selectedRoleId,
      moduleId: targetModuleId,
      name: newSkillName.trim(),
      desc:
        newSkillDesc.trim() ||
        `Hands-on practice and conceptual mastery of ${newSkillName.trim()} for production application.`,
      duration: newSkillDuration.trim() || "90 min",
      difficulty: newSkillDifficulty,
      completed: false,
      portfolioBullet:
        newSkillBullet.trim() ||
        `Engineered solutions utilizing ${newSkillName.trim()}, improving system robustness, throughput, and developer productivity.`,
      resources,
      isCustom: true,
    };

    saveCustomSkills([...customSkills, newSkill]);
    setExpandedModuleId(targetModuleId);
    setSelectedSkill(newSkill);
    setIsAddModalOpen(false);
    setNotification({ message: `Added "${newSkill.name}" to curriculum!` });
  };

  // Copy portfolio bullet to clipboard
  const handleCopyBullet = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2000);
  };

  const totalSkillsCount = allRoleSkills.length;
  
  // Counts by stage
  const demonstratedCount = allRoleSkills.filter(
    (s) => skillProgress[s.id]?.stage === "demonstrated"
  ).length;
  const evidenceCount = allRoleSkills.filter(
    (s) => skillProgress[s.id]?.stage === "evidence" || skillProgress[s.id]?.stage === "demonstrated"
  ).length;
  const practicedCount = allRoleSkills.filter(
    (s) => skillProgress[s.id]?.stage === "practiced" || skillProgress[s.id]?.stage === "evidence" || skillProgress[s.id]?.stage === "demonstrated"
  ).length;
  const learnedCount = allRoleSkills.filter(
    (s) => skillProgress[s.id]?.stage && skillProgress[s.id]?.stage !== "not_started"
  ).length;

  const demonstratedPercent = totalSkillsCount > 0 ? Math.round((demonstratedCount / totalSkillsCount) * 100) : 0;

  // Count deleted default skills for current role to show restore option
  const deletedDefaultsCount = activeCurriculum.modules
    .flatMap((m) => m.skills)
    .filter((s) => deletedSkillIds.has(s.id)).length;

  return (
    <DashboardShell title="Skills & Learning">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header with Role Selector & Add Skill Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Skills & Verified Evidence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Skills & Learning
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Learn concepts &rarr; Practice &rarr; Build Real Evidence &rarr; Demonstrate in Interview.
            </p>
          </div>

          {/* Role Dropdown & Add Skill Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 hidden sm:inline-block">
                Target Role:
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="h-10 px-3 text-xs font-bold rounded-xl border border-primary/30 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer min-w-[220px]"
              >
                <optgroup label="Software Engineering & Algorithms">
                  <option value="swe-dsa">Software Engineer (DSA & Problem Solving — Striver / takeUforward)</option>
                  <option value="fullstack">Full Stack & Frontend Engineer (React/Next.js)</option>
                  <option value="backend-distributed">Backend & Distributed Systems Engineer</option>
                  <option value="mobile-engineer">Mobile Application Engineer (iOS/React Native)</option>
                </optgroup>
                <optgroup label="Cloud, Infrastructure & Security">
                  <option value="devops">DevOps, Cloud & Platform Engineer</option>
                  <option value="cybersecurity">Cybersecurity & InfoSec Analyst</option>
                </optgroup>
                <optgroup label="Data, AI & Machine Learning">
                  <option value="ai-ml">Data Scientist & ML Engineer</option>
                  <option value="data-engineer">Data Engineer & Analytics Specialist</option>
                </optgroup>
                <optgroup label="Product, Design & Leadership">
                  <option value="product-manager">Product Manager & Technical PM</option>
                  <option value="ui-ux">Product Designer & UI/UX Specialist</option>
                  <option value="eng-manager">Engineering Manager & Tech Lead</option>
                </optgroup>
              </select>
            </div>

            <Button
              type="button"
              onClick={() => openAddModal()}
              className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </div>
        </div>

        {/* Connected Career Profile Alert */}
        {careerProfile?.targetRole && (
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">
                Target Role: <strong className="text-primary">{careerProfile.targetRole}</strong> ({careerProfile.experienceLevel})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Active Benchmark
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-primary font-bold hover:underline shrink-0"
            >
              Update Target Role →
            </Link>
          </div>
        )}

        {/* Restore Deleted Skills Banner (if user removed defaults) */}
        {deletedDefaultsCount > 0 && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              You have removed <strong className="text-foreground">{deletedDefaultsCount}</strong> default skill{deletedDefaultsCount > 1 ? "s" : ""} from this curriculum.
            </span>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restore Default Skills</span>
            </button>
          </div>
        )}

        {/* Target Requirements Demonstrated: Primary Success Metric Card */}
        <Card className="border-border/60 bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">Target Role Preparation</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Honest Assessment
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                <strong className="text-primary font-black text-lg">{demonstratedCount}/{totalSkillsCount}</strong> target requirements demonstrated
              </p>
              <p className="text-xs text-muted-foreground">
                Hicejo measures verified proof you can explain and defend under interview scrutiny, not passive lesson completion.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-primary font-mono">{demonstratedPercent}%</span>
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase">Demonstrated</span>
              </div>
            </div>
          </div>

          {/* 4-Stage Progress Stack */}
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex border border-border/40">
              <div
                title="Demonstrated"
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${totalSkillsCount > 0 ? (demonstratedCount / totalSkillsCount) * 100 : 0}%` }}
              />
              <div
                title="Evidence Built"
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${totalSkillsCount > 0 ? (Math.max(0, evidenceCount - demonstratedCount) / totalSkillsCount) * 100 : 0}%` }}
              />
              <div
                title="Practiced"
                className="h-full bg-blue-400 transition-all duration-500"
                style={{ width: `${totalSkillsCount > 0 ? (Math.max(0, practicedCount - evidenceCount) / totalSkillsCount) * 100 : 0}%` }}
              />
            </div>

            {/* 4 Stages Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>DEMONSTRATED</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">{demonstratedCount}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Can defend in interview</p>
              </div>

              <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>EVIDENCE</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">{evidenceCount}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real project proof built</p>
              </div>

              <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>PRACTICE</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">{practicedCount}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Can use / solve problems</p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span>LEARN</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">{learnedCount}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Understand the concept</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Authentic Industry Roadmaps & Curated Practice Platforms Banner */}
        {(activeCurriculum.externalRoadmapUrl || activeCurriculum.preparationPlatformUrl) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-primary/25 bg-primary/[0.03] shadow-2xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Official Community Roadmap & Verified Prep
                </span>
              </div>
              <h3 className="text-xs font-bold text-foreground">
                Authentic, Industry-Standard Curricula & Sheets
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Genuine competencies mapped to official industry roadmaps (roadmap.sh) and top competitive preparation platforms (takeUforward / Striver).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeCurriculum.externalRoadmapUrl && (
                <a
                  href={activeCurriculum.externalRoadmapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  <span>{activeCurriculum.externalRoadmapLabel || "roadmap.sh"}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              )}

              {activeCurriculum.preparationPlatformUrl && (
                <a
                  href={activeCurriculum.preparationPlatformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{activeCurriculum.preparationPlatformLabel || "takeUforward"}</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              )}

              {activeCurriculum.secondaryRoadmapUrl && (
                <a
                  href={activeCurriculum.secondaryRoadmapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{activeCurriculum.secondaryRoadmapLabel || "Secondary Roadmap"}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Skills ({totalSkillsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === "pending"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              To Practice ({Math.max(0, totalSkillsCount - completedSkillIds.size)})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === "completed"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mastered ({completedSkillIds.size})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search skills, patterns, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs bg-card border-border/60"
            />
          </div>
        </div>

        {/* Main 2-Column Curriculum View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Modules Accordion (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {effectiveModules.map((mod) => {
              // Filter skills inside module
              const matchingSkills = mod.skills.filter((s) => {
                const isCompleted = completedSkillIds.has(s.id);
                if (filterMode === "pending" && isCompleted) return false;
                if (filterMode === "completed" && !isCompleted) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return (
                    s.name.toLowerCase().includes(q) ||
                    s.desc.toLowerCase().includes(q) ||
                    s.portfolioBullet.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              if (matchingSkills.length === 0 && searchQuery) return null;

              const isExpanded = expandedModuleId === mod.id;
              const completedInMod = mod.skills.filter((s) => completedSkillIds.has(s.id)).length;
              const allModCompleted = completedInMod === mod.skills.length && mod.skills.length > 0;

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(isExpanded ? "" : mod.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                          allModCompleted
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {allModCompleted ? <Check className="h-4 w-4" /> : mod.number}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-foreground block leading-snug truncate">
                          {mod.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {completedInMod} of {mod.skills.length} mastered
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground shrink-0 ml-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 space-y-2 border-t border-border/40 pt-3">
                      {matchingSkills.length > 0 ? (
                        matchingSkills.map((skill) => {
                          const currentStage: SkillStage = skillProgress[skill.id]?.stage || "not_started";
                          const isCompleted = currentStage === "demonstrated" || currentStage === "evidence";
                          const isSelected = selectedSkill?.id === skill.id;
                          const isCustomSkill = "isCustom" in skill && Boolean(skill.isCustom);

                          return (
                            <div
                              key={skill.id}
                              onClick={() => setSelectedSkill(skill)}
                              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                                isSelected
                                  ? "border-primary/50 bg-primary/5 shadow-xs"
                                  : "border-border/40 bg-muted/15 hover:bg-muted/30"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStage: SkillStage =
                                      currentStage === "demonstrated"
                                        ? "not_started"
                                        : currentStage === "evidence"
                                        ? "demonstrated"
                                        : currentStage === "practiced"
                                        ? "evidence"
                                        : currentStage === "learned"
                                        ? "practiced"
                                        : "learned";
                                    handleUpdateSkillStage(skill.id, nextStage);
                                  }}
                                  title={`Current stage: ${currentStage}. Click to advance.`}
                                  className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                                    currentStage === "demonstrated"
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : currentStage === "evidence"
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : currentStage === "practiced"
                                      ? "bg-blue-500 border-blue-500 text-white"
                                      : currentStage === "learned"
                                      ? "bg-amber-500/20 border-amber-500 text-amber-600"
                                      : "border-border bg-background hover:border-primary"
                                  }`}
                                >
                                  {(currentStage === "demonstrated" || currentStage === "evidence") && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                </button>
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold block truncate ${
                                        currentStage === "demonstrated"
                                          ? "text-emerald-700 dark:text-emerald-300 font-bold"
                                          : isSelected
                                          ? "text-primary font-bold"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {skill.name}
                                    </span>
                                    {isCustomSkill && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary uppercase shrink-0">
                                        Custom
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                    <span
                                      className={`font-mono px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                                        currentStage === "demonstrated"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                          : currentStage === "evidence"
                                          ? "bg-primary/10 text-primary border border-primary/20"
                                          : currentStage === "practiced"
                                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                          : currentStage === "learned"
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                          : "bg-secondary text-muted-foreground"
                                      }`}
                                    >
                                      {currentStage === "not_started" ? "To Learn" : currentStage}
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground font-mono">{skill.duration}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span
                                      className={
                                        skill.difficulty === "Advanced"
                                          ? "text-purple-500 font-medium"
                                          : skill.difficulty === "Intermediate"
                                          ? "text-blue-500 font-medium"
                                          : "text-emerald-500 font-medium"
                                      }
                                    >
                                      {skill.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {(() => {
                                  const practice = getSkillPracticeLink(skill);
                                  return (
                                    <a
                                      href={practice.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      title={`Practice ${skill.name} on ${practice.label}`}
                                      className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <PlayCircle className="h-3 w-3" />
                                      <span className="hidden sm:inline">Practice</span>
                                      <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                    </a>
                                  );
                                })()}

                                {/* Delete Skill Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSkill(skill.id, skill.name, e)}
                                  title="Delete skill"
                                  className="p-1 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-4 text-center border border-dashed border-border/60 rounded-xl bg-muted/5 space-y-1">
                          <p className="text-xs text-muted-foreground">No skills in this module match the active filter.</p>
                        </div>
                      )}

                      {/* Add Skill inside Module Button */}
                      <button
                        type="button"
                        onClick={() => openAddModal(mod.id)}
                        className="w-full py-2 px-3 border border-dashed border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-primary/5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Skill to {mod.title}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Skill Detail & Action Pane (5 cols) */}
          <div className="lg:col-span-5">
            {selectedSkill && selectedSkill.id ? (
              <Card className="sticky top-6 border-border/60 bg-card p-6 shadow-xs space-y-5">
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        selectedSkill.difficulty === "Advanced"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                          : selectedSkill.difficulty === "Intermediate"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {selectedSkill.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{selectedSkill.duration}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {selectedSkill.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedSkill.desc}
                  </p>
                </div>

                {/* 5-STEP CONCEPTUAL PROGRESSION */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                      Progression Arc
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Learn &rarr; Practice &rarr; Evidence &rarr; Resume &rarr; Interview
                    </span>
                  </div>

                  {/* Stage Selector Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {[
                      { stage: "learned" as SkillStage, label: "1. Learn", desc: "Understand concept" },
                      { stage: "practiced" as SkillStage, label: "2. Practice", desc: "Can solve problems" },
                      { stage: "evidence" as SkillStage, label: "3. Evidence", desc: "Real project proof" },
                      { stage: "demonstrated" as SkillStage, label: "4. Demonstrated", desc: "Can defend in interview" },
                    ].map((step) => {
                      const isCurrentStage = (skillProgress[selectedSkill.id]?.stage || "not_started") === step.stage;
                      return (
                        <button
                          key={step.stage}
                          type="button"
                          onClick={() => handleUpdateSkillStage(selectedSkill.id, step.stage)}
                          className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                            isCurrentStage
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-card border-border/70 hover:bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold block">{step.label}</span>
                          <span className={`text-[10px] block leading-tight ${isCurrentStage ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {step.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Honest Verification Notice */}
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <strong className="text-foreground">Honest Preparation:</strong> Only mark &quot;Demonstrated&quot; once you have actually solved problems, built real proof, and can explain trade-offs under interview pressure.
                  </p>
                </div>

                {/* Primary Action Buttons: LeetCode Practice & Career AI Advisor */}
                <div className="space-y-2">
                  {(() => {
                    const practice = getSkillPracticeLink(selectedSkill);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href={practice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button
                            type="button"
                            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                          >
                            <PlayCircle className="h-4 w-4" />
                            <span>{practice.isLeetCode ? "Practice on LeetCode" : "Practice Online"}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                          </Button>
                        </a>

                        <Link
                          href={`/dashboard/chat?prompt=${encodeURIComponent(
                            `I am learning and practicing "${selectedSkill.name}". Can you quiz me on core concepts, present a realistic coding challenge or scenario, and evaluate my solution step-by-step?`
                          )}`}
                          className="block w-full"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 border-border/80 hover:bg-muted font-bold text-xs gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span>Practice with AI Chat</span>
                          </Button>
                        </Link>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateSkillStage(
                        selectedSkill.id,
                        (skillProgress[selectedSkill.id]?.stage === "demonstrated" ? "not_started" : "demonstrated")
                      )}
                      className={`flex-1 h-8.5 font-bold text-xs gap-2 cursor-pointer ${
                        skillProgress[selectedSkill.id]?.stage === "demonstrated"
                          ? "bg-emerald-600/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-600/20"
                          : "border-border/80 hover:bg-muted"
                      }`}
                    >
                      {skillProgress[selectedSkill.id]?.stage === "demonstrated" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Demonstrated (Verified)</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Mark as Demonstrated</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDeleteSkill(selectedSkill.id, selectedSkill.name)}
                      className="h-8.5 px-3 font-semibold text-xs text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 gap-1.5 cursor-pointer transition-colors"
                      title="Delete skill from curriculum"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>

                {/* Curated Resources */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Curated Learning Resources ({selectedSkill.resources?.length || 0})
                  </span>
                  {selectedSkill.resources && selectedSkill.resources.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSkill.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {res.type === "video" ? (
                              <PlayCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            ) : res.type === "notes" ? (
                              <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                            ) : (
                              <FileCode className="h-4 w-4 text-emerald-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                {res.type === "video" ? "Video Course" : res.type === "notes" ? "Documentation / Notes" : "Interactive Practice"}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/10 p-3 rounded-xl border border-border/60">
                      No external links attached. Use the portfolio evidence below to practice directly.
                    </p>
                  )}
                </div>

                {/* Evidence Bridge (Turns learning into resume bullet point) */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>Ready-to-Use Resume Evidence</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyBullet(selectedSkill.portfolioBullet)}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedBullet ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/60 font-mono text-[11px] leading-relaxed">
                    &quot;{selectedSkill.portfolioBullet}&quot;
                  </p>

                  <Link href="/dashboard/builder" className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold h-8 gap-1.5 cursor-pointer">
                      <span>Add to Active Resume Draft</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs space-y-2">
                <p>No skill currently selected.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAddModal()}
                  className="text-xs font-bold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add a Skill</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 text-foreground space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Add Skill to Curriculum</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {addError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleAddSkillSubmit} className="space-y-4 text-xs">
              {/* Target Module */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                  Curriculum Module
                </label>
                <select
                  value={targetModuleId}
                  onChange={(e) => setTargetModuleId(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {effectiveModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.number}: {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Name */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                  Skill Name *
                </label>
                <Input
                  required
                  placeholder="e.g. GraphQL & Apollo Client, Kafka Event Streaming, Kubernetes Pod Mesh"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="h-9 text-xs"
                />

                {/* Quick Skill Suggestions from Current Role */}
                {(() => {
                  const matchedRole = POPULAR_ROLES.find((r) => r.id === selectedRoleId) || POPULAR_ROLES[0];
                  if (!matchedRole || !matchedRole.commonSkills?.length) return null;
                  return (
                    <div className="space-y-1 pt-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Quick suggestions for {matchedRole.title}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedRole.commonSkills.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewSkillName(s)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted hover:bg-primary/15 hover:text-primary transition-colors cursor-pointer border border-border/70"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Difficulty & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                    Difficulty Level
                  </label>
                  <select
                    value={newSkillDifficulty}
                    onChange={(e) => setNewSkillDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                    className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                    Estimated Duration
                  </label>
                  <Input
                    placeholder="e.g. 60 min, 2 hours"
                    value={newSkillDuration}
                    onChange={(e) => setNewSkillDuration(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Skill Description */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                  Description / Core Focus
                </label>
                <Textarea
                  rows={2}
                  placeholder="Summary of what this skill covers and key interview concepts to master..."
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Portfolio Evidence Bullet */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                  Resume Evidence Bullet (STAR Format)
                </label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Architected distributed event stream handling 2M events/sec, reducing sync latency by 45%."
                  value={newSkillBullet}
                  onChange={(e) => setNewSkillBullet(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Leave blank to auto-generate a high-impact bullet template.
                </p>
              </div>

              {/* Optional Resource Link */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="font-bold text-muted-foreground uppercase tracking-wider block text-[11px]">
                  Learning Resource (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newSkillResourceType}
                    onChange={(e) => setNewSkillResourceType(e.target.value as "video" | "notes" | "practice")}
                    className="h-9 px-2 text-xs font-semibold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="notes">Notes / Doc</option>
                    <option value="video">Video</option>
                    <option value="practice">Practice</option>
                  </select>
                  <Input
                    placeholder="Resource Title"
                    value={newSkillResourceTitle}
                    onChange={(e) => setNewSkillResourceTitle(e.target.value)}
                    className="h-9 text-xs col-span-2"
                  />
                </div>
                <Input
                  placeholder="https://documentation-or-tutorial-url.com"
                  value={newSkillResourceLink}
                  onChange={(e) => setNewSkillResourceLink(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save & Add Skill</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Undo / Status Toast Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-40 bg-card border border-border/90 shadow-2xl rounded-2xl p-4 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-foreground font-medium">{notification.message}</span>
          {notification.undoSkillId && (
            <button
              type="button"
              onClick={() => handleUndoDelete(notification.undoSkillId!)}
              className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer pl-1"
            >
              <Undo2 className="h-3 w-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground p-1 cursor-pointer ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
