"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Palette,
  Sparkles,
  Printer,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Scissors
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/store/useResumeStore";
import { Experience, Education, Project, Skill, FitAnalysis, ResumeDensity } from "@/types/resume";
import { FitIndicatorBar } from "@/components/builder/FitIndicatorBar";
import { DensityController } from "@/components/builder/DensityController";
import { FitAnalysisDrawer } from "@/components/builder/FitAnalysisDrawer";
import { SmartBulletCompressorModal } from "@/components/builder/SmartBulletCompressorModal";

const fontClassMap: Record<string, string> = {
  "font-sans": "font-sans",
  "font-serif": "font-serif",
  "font-mono": "font-mono"
};

const fontSizeMap: Record<string, string> = {
  "sm": "text-[12px] leading-snug",
  "md": "text-[14px] leading-normal",
  "lg": "text-[16px] leading-relaxed"
};

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const {
    id,
    title,
    data,
    saveState,
    loadResume,
    importResumeData,
    setResumeId,
    setTitle,
    setSaveState,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    updateDesignSettings,
    setDensity,
    toggleAutoFitOnePage,
    applyCompressedBullet,
    undo,
    redo,
    past,
    future,
  } = useResumeStore();

  const [activeTab, setActiveTab] = React.useState<
    "personal" | "summary" | "experience" | "education" | "projects" | "skills" | "design"
  >("personal");

  const [enhancingId, setEnhancingId] = React.useState<string | null>(null);
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillCategory, setNewSkillCategory] = React.useState("");

  // Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importTab, setImportTab] = React.useState<"text" | "portfolio">("text");
  const [importRawText, setImportRawText] = React.useState("");
  const [portfolioResumes, setPortfolioResumes] = React.useState<any[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Fit Analysis and Auto-Optimizer states
  const resumeDocumentRef = React.useRef<HTMLDivElement | null>(null);
  const resumeContentRef = React.useRef<HTMLDivElement | null>(null);
  const [fitAnalysis, setFitAnalysis] = React.useState<FitAnalysis>({
    status: "fits",
    pageCount: 1,
    utilizationPercentage: 85,
    overflowLines: 0,
    overflowPercentage: 0,
    contentHeightPx: 800,
    targetPageHeightPx: 1020,
    readabilityGrade: "Excellent",
    atsSafetyGrade: "Excellent",
    contentDensity: "Optimal"
  });
  const [isAnalysisOpen, setIsAnalysisOpen] = React.useState(false);
  const [isFixing, setIsFixing] = React.useState(false);

  // Smart Bullet Compressor Modal states
  const [compressorState, setCompressorState] = React.useState<{
    isOpen: boolean;
    bulletText: string;
    itemId: string;
    itemType: "experience" | "projects";
  }>({
    isOpen: false,
    bulletText: "",
    itemId: "",
    itemType: "experience"
  });

  // Fetch initial resume draft if ID is provided
  React.useEffect(() => {
    const fetchResume = async () => {
      if (!resumeIdParam) {
        loadResume(null, "Untitled Resume", {
          personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "" },
          summary: "",
          experience: [],
          education: [],
          projects: [],
          skills: [],
          design: {
            fontFamily: "font-sans",
            fontSize: "md",
            sectionOrder: ["summary", "experience", "projects", "education", "skills"],
            density: "normal",
            sectionSpacing: 1.0,
            itemSpacing: 1.0,
            lineHeight: 1.4,
            autoFitOnePage: false
          }
        });
        return;
      }

      try {
        const res = await fetch(`/api/resume/${resumeIdParam}`);
        const result = await res.json();
        if (result.success && result.data) {
          loadResume(result.data.id, result.data.title, result.data.content);
        }
      } catch (err) {
        console.error("Failed to load resume draft", err);
      }
    };
    fetchResume();
  }, [resumeIdParam, loadResume]);

  // Real-time A4 DOM Height & Fit Calculation
  React.useEffect(() => {
    const calculateFit = () => {
      if (!resumeContentRef.current) return;
      const contentEl = resumeContentRef.current;
      const contentHeightPx = contentEl.scrollHeight || contentEl.offsetHeight;

      // Available printable content height for 1 A4 page:
      // Total A4 height (297mm ≈ 1122.5px) minus top/bottom padding (12mm + 15mm = 27mm ≈ 102px) = ~1020px.
      const availablePageContentHeightPx = 1020;
      
      const isOverflowing = contentHeightPx > availablePageContentHeightPx + 4;
      const utilization = Math.min(100, Math.max(10, Math.round((contentHeightPx / availablePageContentHeightPx) * 100)));
      const overflowLines = isOverflowing ? Math.max(1, Math.ceil((contentHeightPx - availablePageContentHeightPx) / 20)) : 0;
      const overflowPercentage = isOverflowing ? Math.max(1, Math.round(((contentHeightPx - availablePageContentHeightPx) / availablePageContentHeightPx) * 100)) : 0;

      let status: FitAnalysis["status"] = "fits";
      if (isOverflowing) status = "overflowing";
      else if (utilization < 75) status = "underutilized";
      else if (utilization >= 75 && utilization <= 99) status = "perfect";

      const currentDensity = data.design?.density || "normal";
      const currentFontSize = data.design?.fontSize || "md";

      let readabilityGrade: FitAnalysis["readabilityGrade"] = "Excellent";
      if (currentDensity === "ultra-compact" || currentFontSize === "sm") {
        readabilityGrade = "Good";
      }

      let contentDensity: FitAnalysis["contentDensity"] = "Optimal";
      if (currentDensity === "relaxed") contentDensity = "Relaxed";
      else if (currentDensity === "compact") contentDensity = "Compact";
      else if (currentDensity === "ultra-compact") contentDensity = "Dense";

      setFitAnalysis({
        status,
        pageCount: isOverflowing ? 2 : 1,
        utilizationPercentage: utilization,
        overflowLines,
        overflowPercentage,
        contentHeightPx,
        targetPageHeightPx: availablePageContentHeightPx,
        readabilityGrade,
        atsSafetyGrade: "Excellent",
        contentDensity,
        recommendedAction: isOverflowing ? `Shorten ${Math.min(3, overflowLines)} bullets or apply compact density` : undefined
      });
    };

    calculateFit();
    const observer = new ResizeObserver(calculateFit);
    if (resumeContentRef.current) {
      observer.observe(resumeContentRef.current);
    }
    return () => observer.disconnect();
  }, [data]);

  // Debounced Auto-save to cloud DB
  React.useEffect(() => {
    if (saveState !== "typing") return;

    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const endpoint = id ? `/api/resume/${id}` : "/api/resume";
        const method = id ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: data
          })
        });
        const result = await res.json();

        if (result.success && result.data) {
          if (!id) {
            setResumeId(result.data.id);
            const newUrl = `${window.location.pathname}?id=${result.data.id}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
          }
          setSaveState("saved");
        } else {
          console.error("Auto-save server response:", result.error);
          setSaveState("error");
        }
      } catch (err) {
        console.error("Auto-save network error:", err);
        setSaveState("error");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, title, id, saveState, setResumeId, setSaveState]);

  // Hierarchical 5-Stage Auto-Fit Solver
  const handleFixToOnePage = React.useCallback(() => {
    setIsFixing(true);
    const currentDensity = data.design?.density || "normal";
    const currentFontSize = data.design?.fontSize || "md";

    // Priority 1 & 2: Step through density levels
    if (currentDensity === "relaxed") {
      setDensity("normal");
    } else if (currentDensity === "normal") {
      setDensity("compact");
    } else if (currentDensity === "compact") {
      setDensity("ultra-compact");
    } else if (currentDensity === "ultra-compact") {
      // Priority 3: Typography adjustment within safe bounds
      if (currentFontSize === "lg") {
        updateDesignSettings({ fontSize: "md" });
      } else if (currentFontSize === "md") {
        updateDesignSettings({ fontSize: "sm" });
      } else {
        // Priority 4 & 5: Heavily overflowing -> open analysis drawer for AI bullet compression
        setIsAnalysisOpen(true);
      }
    }

    setTimeout(() => {
      setIsFixing(false);
    }, 400);
  }, [data.design, setDensity, updateDesignSettings]);

  // Continuous Auto-Fit when "Perfect 1-Page Mode" is active
  React.useEffect(() => {
    if (data.design?.autoFitOnePage && fitAnalysis.status === "overflowing" && !isFixing) {
      const timer = setTimeout(() => {
        handleFixToOnePage();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data.design?.autoFitOnePage, fitAnalysis.status, isFixing, handleFixToOnePage]);

  // AI Bullet Enhancer endpoint trigger
  const handleEnhanceBullet = async (itemId: string, text: string, itemType: "experience" | "projects") => {
    if (!text || text.trim() === "") return;
    setEnhancingId(itemId);

    try {
      const res = await fetch("/api/ai/enhance-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulletText: text })
      });
      const result = await res.json();
      if (result.success && result.data?.enhanced) {
        if (itemType === "experience") {
          updateExperience(itemId, { description: result.data.enhanced });
        } else {
          updateProject(itemId, { description: result.data.enhanced });
        }
      }
    } catch (err) {
      console.error("Failed to enhance bullet", err);
    } finally {
      setEnhancingId(null);
    }
  };

  // Group skills by category
  const groupedSkills = React.useMemo(() => {
    const map: Record<string, Skill[]> = {};
    data.skills.forEach((sk) => {
      const cat = sk.category?.trim() || "Technical Skills";
      if (!map[cat]) map[cat] = [];
      map[cat].push(sk);
    });
    return map;
  }, [data.skills]);

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkill(newSkillName.trim(), newSkillCategory.trim() || "Technical Skills");
    setNewSkillName("");
  };

  // Section Ordering handlers
  const handleMoveUp = (index: number) => {
    const list = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      updateDesignSettings({ sectionOrder: list });
    }
  };

  const handleMoveDown = (index: number) => {
    const list = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    if (index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      updateDesignSettings({ sectionOrder: list });
    }
  };

  // Compute live spacing multiplier styles based on density
  const sectionSpacingMultiplier = data.design?.sectionSpacing || 1.0;
  const itemSpacingMultiplier = data.design?.itemSpacing || 1.0;
  const lineHeightMultiplier = data.design?.lineHeight || 1.4;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Top Action Header */}
      <header className="h-16 border-b border-border/40 bg-card px-6 flex items-center justify-between shrink-0 no-print">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 rounded transition-colors"
          />
          {/* Cloud Auto-save state pill */}
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            {saveState === "saving" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Saving draft...</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Saved to cloud</span>
              </>
            )}
            {saveState === "typing" && (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Unsaved changes</span>
              </>
            )}
            {saveState === "error" && (
              <>
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>Auto-save failed</span>
              </>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* History Controls */}
          <div className="flex items-center bg-muted p-1 rounded-lg mr-2 border border-border/40">
            <button
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Resume</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-gradient-to-r from-primary to-violet-600 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Form Editor Panel */}
        <div className="w-1/2 flex flex-col border-r border-border/40 bg-card/40 h-full no-print">
          {/* Navigation Form Tabs */}
          <div className="flex items-center gap-1 p-2 bg-muted/40 border-b border-border/40 overflow-x-auto text-xs font-medium">
            {[
              { id: "personal", label: "Contact", icon: UserRound },
              { id: "summary", label: "Summary", icon: FileText },
              { id: "experience", label: "Work History", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "skills", label: "Skills", icon: Cpu },
              { id: "design", label: "Design & Density", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "bg-card shadow-xs text-primary font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your Full Name"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="(555) 123-4567"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  />
                  <Input
                    label="Location (City, State)"
                    placeholder="City, State"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                  />
                  <Input
                    label="Personal Website Portfolio"
                    placeholder="https://yourportfolio.com"
                    value={data.personalInfo.website}
                    onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                  />
                  <Input
                    label="LinkedIn Profile Link"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Professional Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h3>
                  {data.summary && data.summary.length > 180 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCompressorState({
                        isOpen: true,
                        bulletText: data.summary,
                        itemId: "summary",
                        itemType: "experience"
                      })}
                      className="text-xs h-7 px-2.5 gap-1 text-primary border-primary/30"
                    >
                      <Scissors className="h-3 w-3" />
                      <span>Compress Summary</span>
                    </Button>
                  )}
                </div>
                <textarea
                  rows={8}
                  placeholder="Detail your career achievements, main stack strengths, and general background objectives..."
                  value={data.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Work History Tab */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Work History</h3>
                  <Button size="sm" onClick={addExperience} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Experience</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.experience.map((exp) => (
                    <Card key={exp.id} className="relative border border-border/80">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Company Name"
                            placeholder="Stripe"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          />
                          <Input
                            label="Job Position Title"
                            placeholder="Senior Software Engineer"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                          />
                          <Input
                            label="Office Location"
                            placeholder="San Francisco, CA"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start Date"
                              placeholder="Jan 2022"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End Date"
                              placeholder="Present"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Bullet Achievements (one per line)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEnhanceBullet(exp.id, exp.description, "experience")}
                                disabled={enhancingId === exp.id || !exp.description}
                                className="h-7 text-xs gap-1 border-primary/20 hover:border-primary text-primary"
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>{enhancingId === exp.id ? "Enhancing..." : "AI Enhance"}</span>
                              </Button>
                            </div>
                          </div>
                          <textarea
                            rows={5}
                            placeholder="• Built a scalable distributed service reducing latency by 40%..."
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.experience.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No work experiences added yet. Click &quot;Add Experience&quot; above to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Education</h3>
                  <Button size="sm" onClick={addEducation} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Education</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <Card key={edu.id} className="relative border border-border/80">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="University / Institution"
                            placeholder="Stanford University"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                          />
                          <Input
                            label="Degree Name"
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          />
                          <Input
                            label="Field of Study"
                            placeholder="Computer Science"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                          />
                          <Input
                            label="Location"
                            placeholder="Stanford, CA"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2 md:col-span-2">
                            <Input
                              label="Start Date"
                              placeholder="Sep 2018"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="Graduation Date"
                              placeholder="Jun 2022"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.education.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No educational records added yet. Click &quot;Add Education&quot; above to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Projects</h3>
                  <Button size="sm" onClick={addProject} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.projects.map((proj) => (
                    <Card key={proj.id} className="relative border border-border/80">
                      <button
                        onClick={() => removeProject(proj.id)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Project Name"
                            placeholder="AI Agent Hub"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                          />
                          <Input
                            label="Your Role / Contribution"
                            placeholder="Lead Developer"
                            value={proj.role}
                            onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                          />
                          <Input
                            label="Demo URL / GitHub Link"
                            placeholder="https://github.com/yourname/project"
                            value={proj.link}
                            onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start Date"
                              placeholder="Oct 2023"
                              value={proj.startDate}
                              onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End Date"
                              placeholder="Present"
                              value={proj.endDate}
                              onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Key Highlights & Tech Used
                            </label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnhanceBullet(proj.id, proj.description, "projects")}
                              disabled={enhancingId === proj.id || !proj.description}
                              className="h-7 text-xs gap-1 border-primary/20 hover:border-primary text-primary"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>{enhancingId === proj.id ? "Enhancing..." : "AI Enhance"}</span>
                            </Button>
                          </div>
                          <textarea
                            rows={4}
                            placeholder="• Built a full-stack Next.js app serving 10,000+ monthly active users..."
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.projects.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No projects added yet. Click &quot;Add Project&quot; above to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Customizer Tab */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <form onSubmit={handleAddSkillSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-6">
                    <Input
                      label="Skill Name"
                      placeholder="React, TypeScript, SQL..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Category"
                      placeholder="Languages, Frameworks, Cloud..."
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full h-10 font-semibold">
                      Add
                    </Button>
                  </div>
                </form>

                {/* Listing of skills by categories */}
                <div className="space-y-4 pt-2">
                  {Object.keys(groupedSkills).map((catName) => (
                    <Card key={catName} className="border-border/60">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                          {catName}
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {groupedSkills[catName].map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-medium"
                            >
                              <span>{skill.name}</span>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="hover:text-destructive cursor-pointer opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {data.skills.length === 0 && (
                    <div className="w-full text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
                      No skills listed. Fill in details above and click &quot;Add&quot; to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Design, Density & Layout Tab */}
            {activeTab === "design" && (
              <div className="space-y-6">
                {/* 1. Resume Density Controller */}
                <DensityController
                  currentDensity={data.design?.density || "normal"}
                  onChangeDensity={(density) => setDensity(density)}
                />

                {/* 2. Typography Style */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typography Style</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "font-sans", label: "Sans-Serif", desc: "Clean & Modern" },
                      { id: "font-serif", label: "Serif", desc: "Classic Executive" },
                      { id: "font-mono", label: "Monospace", desc: "Tech / Code" }
                    ].map((fontOpt) => (
                      <button
                        key={fontOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontFamily: fontOpt.id as any })}
                        className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          (data.design?.fontFamily || "font-sans") === fontOpt.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{fontOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{fontOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Text Scaling */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Font Scale</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "sm", label: "Small (12px)", desc: "Compact sizing" },
                      { id: "md", label: "Medium (14px)", desc: "Standard grid" },
                      { id: "lg", label: "Large (16px)", desc: "Spacious layout" }
                    ].map((sizeOpt) => (
                      <button
                        key={sizeOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontSize: sizeOpt.id as any })}
                        className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          (data.design?.fontSize || "md") === sizeOpt.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{sizeOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{sizeOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Section Order controller */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section Ordering</h3>
                  <div className="space-y-2">
                    {(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"]).map((secId, index, arr) => (
                      <div
                        key={secId}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-xs font-semibold capitalize"
                      >
                        <span>{secId === "summary" ? "Professional Summary" : secId}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === arr.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Exact A4 Page Preview Panel */}
        <div className="w-1/2 flex flex-col bg-muted/30 overflow-y-auto h-full p-6 space-y-4">
          {/* 1-Page Fit Indicator Header */}
          <FitIndicatorBar
            fitAnalysis={fitAnalysis}
            autoFitEnabled={!!data.design?.autoFitOnePage}
            onToggleAutoFit={toggleAutoFitOnePage}
            onFixToOnePage={handleFixToOnePage}
            isFixing={isFixing}
            isAnalysisOpen={isAnalysisOpen}
            onToggleAnalysis={() => setIsAnalysisOpen(!isAnalysisOpen)}
          />

          {/* Expandable Diagnostic Fit Analysis Drawer */}
          <FitAnalysisDrawer
            isOpen={isAnalysisOpen}
            fitAnalysis={fitAnalysis}
            resumeData={data}
            onOpenCompressor={(bulletText, itemId, itemType) => setCompressorState({
              isOpen: true,
              bulletText,
              itemId,
              itemType
            })}
            onAutoOptimize={handleFixToOnePage}
          />

          {/* A4 Canvas Container with Scaled Visuals */}
          <div className="flex items-start justify-center pb-12">
            <div className="relative">
              {/* Exact A4 Document Sheet (210mm width, 297mm target single page height) */}
              <div
                id="resume-print-area"
                ref={resumeDocumentRef}
                className={`relative w-[210mm] min-h-[297mm] p-[12mm_15mm] bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-xs flex flex-col transition-all resume-a4-page ${
                  fontClassMap[data.design?.fontFamily || "font-sans"]
                } ${
                  fontSizeMap[data.design?.fontSize || "md"]
                }`}
                style={{
                  lineHeight: lineHeightMultiplier
                }}
              >
                {/* Visual Page 1 Boundary Marker Line (Calculated at exactly 297mm) */}
                <div
                  className="absolute left-0 right-0 top-[297mm] pointer-events-none no-print"
                  style={{
                    display: fitAnalysis.status === "overflowing" ? "block" : "none"
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-amber-500/80" />
                    <span className="absolute px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-md">
                      ⚠ Page 1 Boundary (Overflow Detected)
                    </span>
                  </div>
                </div>

                {/* Inner Content Measurer (Without min-height constraint) */}
                <div ref={resumeContentRef} className="flex flex-col w-full flex-1">
                  {/* Personal Details Header (Always at Top) */}
                  <div
                    className="text-center border-b border-zinc-200 shrink-0"
                    style={{
                      paddingBottom: `${10 * sectionSpacingMultiplier}px`,
                      marginBottom: `${12 * sectionSpacingMultiplier}px`
                    }}
                  >
                  <h2 className="text-2xl font-extrabold tracking-tight uppercase text-zinc-950">
                    {data.personalInfo.fullName || "Your Full Name"}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-3.5 text-[0.8em] text-zinc-600 font-semibold uppercase tracking-wide mt-1.5">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
                    {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
                  </div>
                </div>

                {/* Dynamic Sections rendering according to sectionOrder */}
                <div className="flex flex-col flex-1" style={{ gap: `${14 * sectionSpacingMultiplier}px` }}>
                  {(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"]).map((secId) => {
                    // 1. Professional Summary section
                    if (secId === "summary" && data.summary) {
                      return (
                        <div key="summary" className="space-y-1 section-item break-inside-avoid">
                          <h3 className="text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                            Professional Summary
                          </h3>
                          <p className="text-[0.95em] text-zinc-700 text-justify whitespace-pre-line leading-relaxed">
                            {data.summary}
                          </p>
                        </div>
                      );
                    }

                    // 2. Work History section
                    if (secId === "experience" && data.experience.length > 0) {
                      return (
                        <div key="experience" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className="text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                            Work Experience
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${10 * itemSpacingMultiplier}px` }}>
                            {data.experience.map((exp) => (
                              <div key={exp.id} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[1em] font-bold">
                                  <span className="text-zinc-900">{exp.position} — {exp.company}</span>
                                  <span className="text-zinc-600 font-medium text-[0.9em]">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                {exp.location && (
                                  <p className="text-[0.8em] text-zinc-500 font-semibold uppercase tracking-wide">
                                    {exp.location}
                                  </p>
                                )}
                                {exp.description && (
                                  <ul className="list-disc list-outside pl-4 space-y-0.5">
                                    {exp.description.split("\n").filter(b => b.trim() !== "").map((bullet, i) => (
                                      <li key={i} className="text-[0.95em] text-zinc-700 leading-relaxed">
                                        {bullet.replace(/^[•\-\s]*/, "")}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 3. Projects section
                    if (secId === "projects" && data.projects.length > 0) {
                      return (
                        <div key="projects" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className="text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                            Personal Projects
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${10 * itemSpacingMultiplier}px` }}>
                            {data.projects.map((proj) => (
                              <div key={proj.id} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[1em] font-bold">
                                  <span className="text-zinc-900">{proj.name} — {proj.role}</span>
                                  <span className="text-zinc-600 font-medium text-[0.9em]">{proj.startDate} - {proj.endDate}</span>
                                </div>
                                {proj.link && (
                                  <p className="text-[0.8em] text-blue-600 font-semibold">
                                    {proj.link}
                                  </p>
                                )}
                                {proj.description && (
                                  <ul className="list-disc list-outside pl-4 space-y-0.5">
                                    {proj.description.split("\n").filter(b => b.trim() !== "").map((bullet, i) => (
                                      <li key={i} className="text-[0.95em] text-zinc-700 leading-relaxed">
                                        {bullet.replace(/^[•\-\s]*/, "")}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 4. Education section
                    if (secId === "education" && data.education.length > 0) {
                      return (
                        <div key="education" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className="text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                            Education
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${8 * itemSpacingMultiplier}px` }}>
                            {data.education.map((edu) => (
                              <div key={edu.id} className="space-y-0.5 text-[0.95em]">
                                <div className="flex items-center justify-between font-bold text-[1em]">
                                  <span className="text-zinc-900">{edu.school}</span>
                                  <span className="text-zinc-600 font-medium text-[0.9em]">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <div className="flex items-center justify-between text-zinc-700 text-[0.95em]">
                                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                                  {edu.location && <span className="text-zinc-500 font-medium">{edu.location}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 5. Technical Skills section
                    if (secId === "skills" && data.skills.length > 0) {
                      const keys = Object.keys(groupedSkills);
                      return (
                        <div key="skills" className="space-y-1 section-item break-inside-avoid">
                          <h3 className="text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                            Skills & Technologies
                          </h3>
                          <div className="space-y-1 text-[0.95em] text-zinc-700 leading-relaxed">
                            {keys.map((catKey) => {
                              const rowSkills = groupedSkills[catKey].map(s => s.name).join(", ");
                              return (
                                <div key={catKey} className="grid grid-cols-12 gap-2">
                                  <span className="col-span-3 font-bold text-zinc-900 uppercase text-[0.85em] tracking-wide">
                                    {catKey}:
                                  </span>
                                  <span className="col-span-9">
                                    {rowSkills}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Smart Bullet Compressor Modal */}
      <SmartBulletCompressorModal
        isOpen={compressorState.isOpen}
        onClose={() => setCompressorState((prev) => ({ ...prev, isOpen: false }))}
        originalBullet={compressorState.bulletText}
        itemId={compressorState.itemId}
        itemType={compressorState.itemType}
        onApplyBullet={(itemId, itemType, oldB, newB) => {
          applyCompressedBullet(itemId, itemType, oldB, newB);
        }}
      />

      {/* Import Resume Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] no-print text-foreground"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">Import Resume Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inject credentials from another file or raw text. This overwrites current details.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 py-2 bg-muted/30 border-b border-border">
                <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImportTab("text")}
                    className={`py-1.5 rounded-md text-center cursor-pointer transition-colors ${
                      importTab === "text"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Paste Text / File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportTab("portfolio");
                      const fetchPortfolio = async () => {
                        try {
                          const res = await fetch("/api/resume");
                          const result = await res.json();
                          if (result.success && result.data) {
                            setPortfolioResumes(result.data.filter((r: any) => r.id !== id));
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      };
                      fetchPortfolio();
                    }}
                    className={`py-1.5 rounded-md text-center cursor-pointer transition-colors ${
                      importTab === "portfolio"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Select from Portfolio
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {importError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
                    {importError}
                  </div>
                )}

                {importTab === "text" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Resume Text or Upload Document
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer font-medium">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload File (.pdf, .docx, .txt)</span>
                        <input
                          type="file"
                          accept=".txt,.pdf,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsParsing(true);
                            setImportError(null);
                            try {
                              const fData = new FormData();
                              fData.append("file", file);
                              const parseRes = await fetch("/api/parse-file", {
                                method: "POST",
                                body: fData
                              });
                              const parseData = await parseRes.json();
                              if (parseData.success && parseData.text) {
                                setImportRawText(parseData.text);
                              } else {
                                setImportError(parseData.error || "Failed to extract text from file.");
                              }
                            } catch {
                              setImportError("File upload extraction failed.");
                            } finally {
                              setIsParsing(false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <textarea
                      rows={10}
                      placeholder="Paste raw text or upload a document to auto-parse..."
                      value={importRawText}
                      onChange={(e) => setImportRawText(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {portfolioResumes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No other resumes available in your library.
                      </p>
                    ) : (
                      portfolioResumes.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-sm">{p.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(p.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                setIsParsing(true);
                                const res = await fetch(`/api/resume/${p.id}`);
                                const single = await res.json();
                                if (single.success && single.data) {
                                  importResumeData(single.data.content);
                                  setIsImportModalOpen(false);
                                }
                              } catch {
                                setImportError("Failed to load portfolio draft.");
                              } finally {
                                setIsParsing(false);
                              }
                            }}
                          >
                            Import
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {importTab === "text" && (
                <div className="p-4 border-t border-border flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    isLoading={isParsing}
                    disabled={!importRawText.trim()}
                    onClick={async () => {
                      setIsParsing(true);
                      setImportError(null);
                      try {
                        const res = await fetch("/api/ai/parse", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rawText: importRawText })
                        });
                        const result = await res.json();
                        if (result.success && result.data) {
                          importResumeData(result.data);
                          setIsImportModalOpen(false);
                          setImportRawText("");
                        } else {
                          setImportError(result.error || "Failed to parse text structure.");
                        }
                      } catch {
                        setImportError("Server connection failed during AI parsing.");
                      } finally {
                        setIsParsing(false);
                      }
                    }}
                    className="bg-primary text-primary-foreground font-semibold"
                  >
                    Parse with AI
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm font-semibold">Loading Resume Builder...</span>
        </div>
      }
    >
      <ResumeBuilderContent />
    </React.Suspense>
  );
}
