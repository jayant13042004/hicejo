"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Undo2,
  Redo2,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderDot,
  UserRound,
  Check,
  AlertCircle,
  Palette,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Upload,
  ChevronRight,
  FileText
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useTheme } from "@/components/shared/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sub-component containing search params loading logic
function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");
  const { theme, toggleTheme } = useTheme();

  const {
    id,
    title,
    data,
    saveState,
    past,
    future,
    loadResume,
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
    importResumeData,
    undo,
    redo
  } = useResumeStore();

  const [activeTab, setActiveTab] = React.useState<"personal" | "summary" | "experience" | "education" | "projects" | "skills" | "design">("personal");
  const [enhancingId, setEnhancingId] = React.useState<string | null>(null);
  
  // Local state for skill entry
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillCategory, setNewSkillCategory] = React.useState("");

  // Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importTab, setImportTab] = React.useState<"text" | "portfolio">("text");
  const [importRawText, setImportRawText] = React.useState("");
  const [portfolioResumes, setPortfolioResumes] = React.useState<any[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Fetch initial resume draft if ID is provided
  React.useEffect(() => {
    const fetchResume = async () => {
      if (!resumeIdParam) {
        // Reset to initial blank resume
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
            sectionOrder: ["summary", "experience", "projects", "education", "skills"]
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
  }, [resumeIdParam]);

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
            // Replace URL query params dynamically
            const newUrl = `${window.location.pathname}?id=${result.data.id}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
          }
          setSaveState("saved");
        } else {
          console.error("Auto-save failed from server:", result.error);
          setSaveState("error");
        }
      } catch (err) {
        console.error("Auto-save network error:", err);
        setSaveState("error");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, title, id, saveState]);

  // Enhancer fetch endpoint trigger
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

      if (result.success && result.enhanced) {
        if (itemType === "experience") {
          updateExperience(itemId, { description: result.enhanced });
        } else {
          updateProject(itemId, { description: result.enhanced });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnhancingId(null);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // Skill grouping helper
  const groupedSkills = React.useMemo(() => {
    const groups: Record<string, typeof data.skills> = {};
    data.skills.forEach((s) => {
      const cat = s.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [data.skills]);

  // Section order movements
  const sectionLabels: Record<string, string> = {
    summary: "Professional Summary",
    experience: "Work Experience",
    projects: "Personal Projects",
    education: "Education",
    skills: "Technical Skills"
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const order = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    const temp = order[index];
    order[index] = order[index - 1];
    order[index - 1] = temp;
    updateDesignSettings({ sectionOrder: order });
  };

  const handleMoveDown = (index: number) => {
    const order = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    if (index === order.length - 1) return;
    const temp = order[index];
    order[index] = order[index + 1];
    order[index + 1] = temp;
    updateDesignSettings({ sectionOrder: order });
  };

  // Font family mappings
  const fontClassMap = {
    "font-sans": "font-sans",
    "font-serif": "font-serif",
    "font-mono": "font-mono"
  };

  // Font size multiplier mappings
  const fontSizeMap = {
    sm: "text-[12px] leading-[1.4] space-y-4",
    md: "text-[14px] leading-[1.5] space-y-5.5",
    lg: "text-[16px] leading-[1.6] space-y-7"
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillName.trim() === "") return;
    addSkill(newSkillName.trim(), newSkillCategory.trim());
    setNewSkillName("");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Print Specific CSS Overrides */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0mm; /* Removes default browser headers, footers, and margins */
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body * {
            visibility: hidden;
          }
          #resume-print-area, #resume-print-area * {
            visibility: visible;
          }
          #resume-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm !important; /* Optimized tight margin spacing */
            background: white !important;
            background-image: none !important; /* Strip screen pagination line */
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Editor Header Toolbar (Hidden during print) */}
      <header className="no-print flex h-16 items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveState("typing");
            }}
            className="text-base font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 max-w-[200px] truncate"
          />

          {/* Sync Status Indicators */}
          <div className="flex items-center gap-2">
            {saveState === "saving" && (
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Saving...</span>
              </span>
            )}
            {saveState === "saved" && (
              <span className="inline-flex items-center text-xs text-emerald-500 gap-1.5">
                <Check className="h-3 w-3" />
                <span>Saved to cloud</span>
              </span>
            )}
            {saveState === "error" && (
              <span className="inline-flex items-center text-xs text-destructive gap-1.5">
                <AlertCircle className="h-3 w-3" />
                <span>Auto-save failed</span>
              </span>
            )}
          </div>
        </div>

        {/* Undo/Redo/Download Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <Upload className="h-3.5 w-3.5 text-primary" />
            <span>Import</span>
          </button>
          <Button onClick={triggerPrint} className="bg-gradient-to-r from-primary to-violet-600 gap-2">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Interactive Input Forms (Hidden during print) */}
        <div className="no-print w-1/2 flex flex-col h-full border-r border-border bg-card/30">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-border overflow-x-auto shrink-0 scrollbar-none px-4 py-2 gap-1">
            {[
              { id: "personal", label: "Contact", icon: UserRound },
              { id: "summary", label: "Summary", icon: Sparkles },
              { id: "experience", label: "Work History", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "projects", label: "Projects", icon: FolderDot },
              { id: "skills", label: "Skills", icon: Wrench },
              { id: "design", label: "Design", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Scroll Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Info</h3>
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h3>
                <textarea
                  rows={8}
                  placeholder="Detail your career achievements, main stack strengths, and general background objectives..."
                  value={data.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none"
                />
              </div>
            )}

            {/* Experience Work History Tab */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Work History</h3>
                  <Button size="sm" onClick={addExperience} className="gap-1.5 h-8">
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
                            placeholder="Senior Frontend Developer"
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

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Description & Impact
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEnhanceBullet(exp.id, exp.description, "experience")}
                              isLoading={enhancingId === exp.id}
                              disabled={!exp.description || exp.description.trim() === ""}
                              className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10 gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>AI Enhance</span>
                            </Button>
                          </div>
                          <textarea
                            rows={5}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            placeholder="Use bullets separated by newlines. Start with strong action verbs..."
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.experience.length === 0 && (
                    <div className="text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
                      No work history experiences added yet. Click "Add Experience" to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education History Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Education</h3>
                  <Button size="sm" onClick={addEducation} className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add School</span>
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
                            label="School / University Name"
                            placeholder="Stanford University"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                          />
                          <Input
                            label="Degree Program"
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          />
                          <Input
                            label="Field Of Study"
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
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start Date"
                              placeholder="Sep 2018"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End Date"
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
                    <div className="text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
                      No education nodes added yet. Click "Add School" to begin.
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
                  <Button size="sm" onClick={addProject} className="gap-1.5 h-8">
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
                            placeholder="E-Commerce API Service"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                          />
                          <Input
                            label="Your Role"
                            placeholder="Lead Developer"
                            value={proj.role}
                            onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                          />
                          <Input
                            label="Project Link / Code URL"
                            placeholder="github.com/sarah/ecommerce"
                            value={proj.link}
                            onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start"
                              placeholder="Jul 2021"
                              value={proj.startDate}
                              onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End"
                              placeholder="Oct 2021"
                              value={proj.endDate}
                              onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Description & Impact
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEnhanceBullet(proj.id, proj.description, "projects")}
                              isLoading={enhancingId === proj.id}
                              disabled={!proj.description || proj.description.trim() === ""}
                              className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10 gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>AI Enhance</span>
                            </Button>
                          </div>
                          <textarea
                            rows={4}
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                            placeholder="Built modular microservices to handle concurrent checkout traffic..."
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.projects.length === 0 && (
                    <div className="text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
                      No projects added yet. Click "Add Project" to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categorized Skills</h3>
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
                      placeholder="Languages, Tools, etc."
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full h-10">
                      Add
                    </Button>
                  </div>
                </form>

                {/* Listing of skills by categories */}
                <div className="space-y-6 pt-4">
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
                      No skills listed. Fill in details above and click "Add" to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Design & Typography Customizer Tab */}
            {activeTab === "design" && (
              <div className="space-y-6">
                {/* 1. Typography */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Typography Style</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "font-sans", label: "Sans-Serif", desc: "Clean & Modern" },
                      { id: "font-serif", label: "Serif", desc: "Traditional / Classic" },
                      { id: "font-mono", label: "Monospace", desc: "Tech / Code" }
                    ].map((fontOpt) => (
                      <button
                        key={fontOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontFamily: fontOpt.id as any })}
                        className={`flex flex-col p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          (data.design?.fontFamily || "font-sans") === fontOpt.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{fontOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{fontOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Text Scaling */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Text Scale</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "sm", label: "Small", desc: "Compact sizing" },
                      { id: "md", label: "Medium", desc: "Balanced grid" },
                      { id: "lg", label: "Large", desc: "Maximum readability" }
                    ].map((sizeOpt) => (
                      <button
                        key={sizeOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontSize: sizeOpt.id as any })}
                        className={`flex flex-col p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          (data.design?.fontSize || "md") === sizeOpt.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{sizeOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{sizeOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Section Order controller */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Section Ordering</h3>
                  <div className="space-y-2">
                    {(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"]).map((secId, index, arr) => (
                      <div
                        key={secId}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 text-xs font-semibold"
                      >
                        <span>{sectionLabels[secId]}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-1 rounded bg-muted hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5 text-zinc-300" />
                          </button>
                          <button
                            type="button"
                            disabled={index === arr.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-1 rounded bg-muted hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5 text-zinc-300" />
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

        {/* Right Side: A4 Page Preview Panel */}
        <div className="w-1/2 flex items-start justify-center p-8 bg-muted/40 overflow-y-auto h-full">
          {/* Simulated A4 Resume Sheet with Slate-Gray visual Page Break Line (Hidden in print) */}
          <div
            id="resume-print-area"
            className={`w-[210mm] min-h-[297mm] p-[12mm_15mm] bg-white text-black shadow-lg border border-border/30 rounded-sm flex flex-col ${
              fontClassMap[data.design?.fontFamily || "font-sans"]
            } ${
              fontSizeMap[data.design?.fontSize || "md"]
            }`}
            style={{
              backgroundImage: "linear-gradient(to bottom, transparent 296mm, #94a3b8 296mm, #94a3b8 297mm, transparent 297mm)",
              backgroundSize: "100% 297mm"
            }}
          >
            {/* Personal Details Block (Always on top) */}
            <div className="text-center space-y-1.5 border-b border-zinc-200 pb-3 shrink-0">
              <h2 className="text-2xl font-extrabold tracking-tight uppercase">
                {data.personalInfo.fullName || "Your Full Name"}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3.5 text-[0.8em] text-zinc-600 font-semibold uppercase tracking-wide">
                {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
                {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Dynamic Sections rendering according to sectionOrder */}
            {(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"]).map((secId) => {
              // 1. Professional Summary section
              if (secId === "summary" && data.summary) {
                return (
                  <div key="summary" className="space-y-1 section-item break-inside-avoid">
                    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                      Professional Summary
                    </h3>
                    <p className="text-[0.95em] text-zinc-700 leading-relaxed text-justify whitespace-pre-line">
                      {data.summary}
                    </p>
                  </div>
                );
              }

              // 2. Work History section
              if (secId === "experience" && data.experience.length > 0) {
                return (
                  <div key="experience" className="space-y-2 section-item break-inside-avoid">
                    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {data.experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
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
                  <div key="projects" className="space-y-2 section-item break-inside-avoid">
                    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                      Personal Projects
                    </h3>
                    <div className="space-y-3">
                      {data.projects.map((proj) => (
                        <div key={proj.id} className="space-y-1">
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
                  <div key="education" className="space-y-2 section-item break-inside-avoid">
                    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                      Education
                    </h3>
                    <div className="space-y-3">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="space-y-0.5 text-[0.95em]">
                          <div className="flex items-center justify-between font-bold text-[1.05em]">
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

              // 5. Technical Skills section (Grouped by Category on separate rows)
              if (secId === "skills" && data.skills.length > 0) {
                const keys = Object.keys(groupedSkills);
                return (
                  <div key="skills" className="space-y-2 section-item break-inside-avoid">
                    <h3 className="text-[1.1em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
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
                      // Fetch other saved resumes
                      const fetchPortfolio = async () => {
                        try {
                          const res = await fetch("/api/resume");
                          const result = await res.json();
                          if (result.success && result.data) {
                            // Filter out the current active resume
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
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Resume Text
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer font-medium uppercase tracking-wider">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload File (PDF/Word/Text)</span>
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
                              const res = await fetch("/api/parse-file", {
                                method: "POST",
                                body: fData
                              });
                              const result = await res.json();
                              if (result.success && result.text) {
                                setImportRawText(result.text);
                              } else {
                                setImportError(result.error || "Failed to extract text from file.");
                              }
                            } catch {
                              setImportError("File upload connection failed.");
                            } finally {
                              setIsParsing(false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="Paste your resume text here. AI will extract and structure all skills, experiences, projects, and education..."
                      value={importRawText}
                      onChange={(e) => setImportRawText(e.target.value)}
                      className="w-full p-3 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Choose Saved Resume
                    </label>
                    <div className="space-y-2">
                      {portfolioResumes.length > 0 ? (
                        portfolioResumes.map((pRes: any) => (
                          <button
                            key={pRes.id}
                            type="button"
                            onClick={async () => {
                              try {
                                setIsParsing(true);
                                setImportError(null);
                                // Fetch detail JSON for this resume
                                const detailRes = await fetch(`/api/resume/${pRes.id}`);
                                const detailResult = await detailRes.json();
                                if (detailResult.success && detailResult.data?.content) {
                                  importResumeData(detailResult.data.content);
                                  setIsImportModalOpen(false);
                                } else {
                                  setImportError("Failed to fetch target resume details.");
                                }
                              } catch {
                                setImportError("Connection failed.");
                              } finally {
                                setIsParsing(false);
                              }
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted text-left cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium text-foreground">{pRes.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No other saved resumes found in your portfolio.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportError(null);
                  }}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                {importTab === "text" && (
                  <Button
                    type="button"
                    isLoading={isParsing}
                    disabled={!importRawText.trim() || isParsing}
                    onClick={async () => {
                      setIsParsing(true);
                      setImportError(null);
                      try {
                        const res = await fetch("/api/ai/parse", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ resumeText: importRawText })
                        });
                        const result = await res.json();
                        if (result.success && result.data) {
                          importResumeData(result.data);
                          setIsImportModalOpen(false);
                          setImportRawText("");
                        } else {
                          setImportError(result.error || "Failed to parse resume text.");
                        }
                      } catch {
                        setImportError("Server connection failure.");
                      } finally {
                        setIsParsing(false);
                      }
                    }}
                    className="h-9 text-xs bg-gradient-to-r from-primary to-violet-600 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run AI Import</span>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main page component wrapped in Suspense boundary for Next.js App Router compilation
export default function BuilderPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">
            Loading Resume Builder...
          </span>
        </div>
      </div>
    }>
      <ResumeBuilderContent />
    </React.Suspense>
  );
}
