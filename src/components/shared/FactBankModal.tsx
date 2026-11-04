"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Plus, Trash2, Edit3, Check, UploadCloud,
  FileText, ShieldCheck, AlertCircle, RefreshCw, FolderGit2,
  Cpu, Wrench, Layers, ExternalLink, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VerifiedFactBank, VerifiedProject } from "@/lib/factBank";

interface FactBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function FactBankModal({ isOpen, onClose, onUpdated }: FactBankModalProps) {
  const [activeTab, setActiveTab] = React.useState<"projects" | "skills" | "upload">("projects");
  const [factBank, setFactBank] = React.useState<VerifiedFactBank | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Manual project form
  const [isAddingProject, setIsAddingProject] = React.useState(false);
  const [newProject, setNewProject] = React.useState<VerifiedProject>({
    name: "",
    role: "Creator",
    link: "",
    technologies: [],
    metrics: "",
    verifiedBullets: [""]
  });
  const [techInput, setTechInput] = React.useState("");

  // Upload / Extract
  const [extractText, setExtractText] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractedPreview, setExtractedPreview] = React.useState<{
    projects: VerifiedProject[];
    skillGroups: Record<string, string[]>;
  } | null>(null);
  const [extractError, setExtractError] = React.useState("");

  // Load fact bank
  const loadFactBank = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/fact-bank");
      const data = await res.json();
      if (data.success && data.data) {
        setFactBank(data.data);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadFactBank();
      setExtractedPreview(null);
      setExtractError("");
    }
  }, [isOpen, loadFactBank]);

  // Save updated fact bank to server
  const handleSave = async (updatedBank?: VerifiedFactBank) => {
    const toSave = updatedBank || factBank;
    if (!toSave) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/fact-bank", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave)
      });
      const data = await res.json();
      if (data.success) {
        setFactBank(data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        onUpdated?.();
      }
    } catch {
      // non-fatal
    } finally {
      setIsSaving(false);
    }
  };

  // Add project to state
  const handleAddProject = () => {
    if (!newProject.name.trim() || !factBank) return;
    const techs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const bullets = newProject.verifiedBullets.filter((b) => b.trim());

    const projectToAdd: VerifiedProject = {
      ...newProject,
      id: crypto.randomUUID(),
      technologies: techs.length > 0 ? techs : newProject.technologies,
      verifiedBullets: bullets.length > 0 ? bullets : ["Designed and implemented core architecture."]
    };

    const updated: VerifiedFactBank = {
      ...factBank,
      projects: [...factBank.projects, projectToAdd]
    };

    setFactBank(updated);
    setIsAddingProject(false);
    setNewProject({
      name: "",
      role: "Creator",
      link: "",
      technologies: [],
      metrics: "",
      verifiedBullets: [""]
    });
    setTechInput("");
    handleSave(updated);
  };

  // Remove project
  const handleRemoveProject = (index: number) => {
    if (!factBank) return;
    const updated: VerifiedFactBank = {
      ...factBank,
      projects: factBank.projects.filter((_, i) => i !== index)
    };
    setFactBank(updated);
    handleSave(updated);
  };

  // File upload extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setExtractError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/parse-file", {
        method: "POST",
        body: formData
      });
      const parseData = await parseRes.json();
      if (!parseData.success || !parseData.text) {
        throw new Error(parseData.error || "Failed to parse document.");
      }
      setExtractText(parseData.text);
      await runAIExtraction(parseData.text);
    } catch (err: any) {
      setExtractError(err.message || "Failed to process file.");
      setIsExtracting(false);
    }
  };

  // Run AI extraction
  const runAIExtraction = async (textToExtract: string) => {
    setIsExtracting(true);
    setExtractError("");
    try {
      const res = await fetch("/api/fact-bank/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToExtract })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Extraction failed.");
      setExtractedPreview(data.data);
    } catch (err: any) {
      setExtractError(err.message || "Failed to extract projects and skills.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Append extracted items to Fact Bank
  const handleAppendExtracted = () => {
    if (!factBank || !extractedPreview) return;
    const newProjects = [...factBank.projects, ...(extractedPreview.projects || [])];
    const newSkillGroups = { ...factBank.skillGroups };
    for (const [category, skills] of Object.entries(extractedPreview.skillGroups || {})) {
      if (!newSkillGroups[category]) {
        newSkillGroups[category] = skills;
      } else {
        const set = new Set([...newSkillGroups[category], ...skills]);
        newSkillGroups[category] = Array.from(set);
      }
    }

    const updated: VerifiedFactBank = {
      ...factBank,
      projects: newProjects,
      skillGroups: newSkillGroups
    };

    setFactBank(updated);
    setExtractedPreview(null);
    setExtractText("");
    setActiveTab("projects");
    handleSave(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Candidate Fact Bank</h2>
              <p className="text-xs text-muted-foreground">Your verified source of truth for projects, skills & evidence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-border/40 bg-muted/20">
          <button
            onClick={() => setActiveTab("projects")}
            className={cn(
              "px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2",
              activeTab === "projects"
                ? "border-indigo-500 text-indigo-400 bg-background/50"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Projects ({factBank?.projects?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={cn(
              "px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2",
              activeTab === "skills"
                ? "border-indigo-500 text-indigo-400 bg-background/50"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Skills & Tools
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2",
              activeTab === "upload"
                ? "border-indigo-500 text-indigo-400 bg-background/50"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload / Extract with AI
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Loading your verified fact bank…
            </div>
          ) : (
            <>
              {/* ── PROJECTS TAB ── */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Projects here are used by the JD Analyzer to match requirements and generate proof-grounded resume bullets.
                    </p>
                    <button
                      onClick={() => setIsAddingProject(true)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Project
                    </button>
                  </div>

                  {/* Add Project Form */}
                  {isAddingProject && (
                    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">New Project Details</span>
                        <button
                          onClick={() => setIsAddingProject(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Project Name *"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          className="col-span-2 px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Your Role (e.g. Creator, Lead)"
                          value={newProject.role}
                          onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                          className="px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Project / GitHub Link (optional)"
                          value={newProject.link}
                          onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                          className="px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Technologies (comma separated, e.g. Python, SQL, Power BI)"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          className="col-span-2 px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Measurable Metrics (e.g. 10,000 users, 20% speedup, 15+ KPIs)"
                          value={newProject.metrics}
                          onChange={(e) => setNewProject({ ...newProject, metrics: e.target.value })}
                          className="col-span-2 px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <textarea
                          rows={3}
                          placeholder="Bullet points (Action verb + description + outcome) — one per line"
                          value={newProject.verifiedBullets.join("\n")}
                          onChange={(e) => setNewProject({ ...newProject, verifiedBullets: e.target.value.split("\n") })}
                          className="col-span-2 px-3 py-2 text-xs bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddingProject(false)}
                          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddProject}
                          disabled={!newProject.name.trim()}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                        >
                          Save Project
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Projects List */}
                  <div className="space-y-3">
                    {factBank?.projects?.map((proj, i) => (
                      <div key={proj.id || i} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-foreground">{proj.name}</span>
                              {proj.role && (
                                <span className="text-[10px] text-muted-foreground">· {proj.role}</span>
                              )}
                              {proj.metrics && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {proj.metrics}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {proj.technologies?.map((tech, ti) => (
                                <span key={ti} className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProject(i)}
                            className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                            title="Remove project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <ul className="space-y-1 text-xs text-foreground/80 pl-3 list-disc">
                          {proj.verifiedBullets?.map((b, bi) => (
                            <li key={bi} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SKILLS TAB ── */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Verified technical and analytical skill groups currently active in your profile:
                  </p>
                  <div className="space-y-3">
                    {Object.entries(factBank?.skillGroups || {}).map(([category, skills]) => (
                      <div key={category} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                        <span className="text-xs font-bold text-foreground block">{category}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, si) => (
                            <span key={si} className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── UPLOAD / EXTRACT TAB ── */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Upload project reports, a resume PDF, or paste text (from GitHub READMEs, portfolio notes). The AI will extract projects and skills into your Fact Bank.
                  </p>

                  {/* Document upload zone */}
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/60 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors text-center">
                    <UploadCloud className="h-8 w-8 text-indigo-400 mb-2" />
                    <span className="text-xs font-semibold text-foreground">Upload Document (.pdf, .docx, .txt)</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Drag and drop or click to browse</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or paste project text directly</span>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Paste project descriptions, tech stack details, metrics, or GitHub READMEs here…"
                    value={extractText}
                    onChange={(e) => setExtractText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />

                  {extractError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {extractError}
                    </p>
                  )}

                  <button
                    onClick={() => runAIExtraction(extractText)}
                    disabled={isExtracting || extractText.trim().length < 20}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Extracting projects & skills with AI…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Extract with AI
                      </>
                    )}
                  </button>

                  {/* Extracted Preview */}
                  {extractedPreview && (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Found {extractedPreview.projects?.length || 0} Projects & {Object.keys(extractedPreview.skillGroups || {}).length} Skill Groups
                        </span>
                        <button
                          onClick={handleAppendExtracted}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add to Fact Bank
                        </button>
                      </div>

                      <div className="space-y-2">
                        {extractedPreview.projects?.map((p, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs">
                            <span className="font-semibold text-foreground">{p.name}</span>
                            {p.metrics && <span className="ml-2 text-emerald-400 text-[10px]">({p.metrics})</span>}
                            <p className="text-muted-foreground text-[10px] mt-0.5">
                              Tech: {p.technologies?.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="h-3.5 w-3.5" /> Changes saved to Fact Bank
              </span>
            ) : (
              "All additions are instantly available for JD analysis & resume tailoring"
            )}
          </span>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
