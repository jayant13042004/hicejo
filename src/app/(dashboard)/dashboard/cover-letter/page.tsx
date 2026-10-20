"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Clipboard,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Upload,
  Edit3,
  Eye,
  Download,
  FileCheck,
  Save,
  X,
  FileText
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { consumeCredit } from "@/lib/credits";
import { useResumeStore } from "@/store/useResumeStore";

interface ResumeOption {
  id: string;
  title: string;
}
export default function CoverLetterPage() {
  const { activeJobContext } = useResumeStore();

  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");

  // Prefill from active application context if available
  React.useEffect(() => {
    if (activeJobContext) {
      if (activeJobContext.company) setCompany((prev) => prev || activeJobContext.company || "");
      if (activeJobContext.jobTitle) setJobTitle((prev) => prev || activeJobContext.jobTitle || "");
      if (activeJobContext.jobDescription) setJobDescription((prev) => prev || activeJobContext.jobDescription || "");
    }
  }, [activeJobContext]);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isExtractingFile, setIsExtractingFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [letterContent, setLetterContent] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // PDF Download Modal states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
  const [downloadFileName, setDownloadFileName] = React.useState("");
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);

  // Fetch resumes list on mount
  React.useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resume");
        const result = await res.json();
        if (result.success && result.data) {
          setResumes(result.data);
          if (result.data.length > 0) {
            setSelectedResumeId(result.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    };
    loadResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingFile(true);
    setError(null);
    setUploadedFileName(file.name);
    try {
      const fData = new FormData();
      fData.append("file", file);
      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: fData
      });
      const result = await res.json();
      if (result.success && result.text) {
        setResumeText(result.text);
        setSourceType("text");
      } else {
        setError(result.error || "Failed to extract text from file.");
      }
    } catch {
      setError("File upload connection failed. Please paste text directly.");
    } finally {
      setIsExtractingFile(false);
      e.target.value = "";
    }
  };


  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) {
      setError("Please select a saved resume or switch to 'Paste / Upload Text'.");
      return;
    }
    if (sourceType === "text" && !resumeText.trim()) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }
    if (!company.trim() || !jobTitle.trim() || !jobDescription.trim()) {
      setError("Please fill out the target company, job title, and description.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLetterContent(null);
    setIsCopied(false);
    setIsEditing(false);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText.trim() : undefined,
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim()
        })
      });
      const result = await res.json();

      if (result.success && result.data?.content) {
        setLetterContent(result.data.content);
        consumeCredit("cover_letter");
      } else {
        setError(result.error || "Failed to generate cover letter.");
      }
    } catch {
      setError("Server connection failure. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!letterContent) return;
    try {
      await navigator.clipboard.writeText(letterContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleOpenDownloadModal = () => {
    const defaultName = `${(company || "Target").trim().replace(/[^a-zA-Z0-9_-]/g, "_")}_Cover_Letter`;
    setDownloadFileName(defaultName);
    setIsDownloadModalOpen(true);
  };

  const handleExecutePDFDownload = async () => {
    if (!letterContent) return;

    setIsDownloadingPDF(true);
    if (isEditing) {
      setIsEditing(false);
    }

    try {
      // 1. Allow React a brief tick to update DOM if isEditing was toggled
      await new Promise((resolve) => setTimeout(resolve, 80));

      const letterEl = document.getElementById("letter-print-area");
      const { jsPDF } = await import("jspdf");

      let dataUrl: string | null = null;

      if (letterEl) {
        const prevShadow = letterEl.style.boxShadow;
        const prevBorder = letterEl.style.border;
        letterEl.style.boxShadow = "none";
        letterEl.style.border = "none";

        try {
          const { toPng } = await import("html-to-image");
          dataUrl = await toPng(letterEl, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            filter: (node: HTMLElement) => {
              if (node.classList && (node.classList.contains("no-print") || node.hasAttribute("data-no-print"))) {
                return false;
              }
              return true;
            }
          });
        } catch (imgErr) {
          console.warn("toPng failed on cover letter, using html2canvas fallback:", imgErr);
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(letterEl, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false
          });
          dataUrl = canvas.toDataURL("image/jpeg", 0.98);
        } finally {
          letterEl.style.boxShadow = prevShadow;
          letterEl.style.border = prevBorder;
        }
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      if (dataUrl) {
        pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
        try {
          if (letterContent && letterContent.trim()) {
            const splitText = pdf.splitTextToSize(letterContent.trim(), 190);
            pdf.text(splitText, 10, 10, { renderingMode: "invisible" });
          }
        } catch {
          // Non-blocking fallback
        }
      } else {
        // Pure text fallback to ensure it is never blank
        pdf.setFont("times", "normal");
        pdf.setFontSize(11);
        const splitText = pdf.splitTextToSize(letterContent, 170);
        pdf.text(splitText, 20, 25);
      }

      const filename = `${downloadFileName.trim() || "Cover_Letter"}.pdf`;
      pdf.save(filename);
      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error("PDF download failed:", err);
      try {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        pdf.setFont("times", "normal");
        pdf.setFontSize(11);
        const splitText = pdf.splitTextToSize(letterContent, 170);
        pdf.text(splitText, 20, 25);
        pdf.save(`${downloadFileName.trim() || "Cover_Letter"}.pdf`);
        setIsDownloadModalOpen(false);
      } catch (fallbackErr) {
        console.error("Critical PDF failure:", fallbackErr);
        alert("Encountered an issue exporting PDF. Please try copying the text.");
      }
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSaveEdits = () => {
    setSaveSuccessMessage("Edits saved to view");
    setIsEditing(false);
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  return (
    <DashboardShell title="Cover Letter Generator" featureKey="cover_letter">
      <div className="space-y-6">
        <div className="pb-4 border-b border-border/60">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Targeted Cover Letter Generator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synthesize your proven achievements into a concise, professional letter tailored to the target role.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Config Forms (Left) */}
          <div className="no-print lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Generator Configurator</CardTitle>
                  <CardDescription className="text-xs">Setup parameters to target job postings.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {activeJobContext && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Target: <strong>{activeJobContext.jobTitle || "Role"}</strong> {activeJobContext.company ? `@ ${activeJobContext.company}` : ""}
                      </span>
                    </div>
                    {activeJobContext.atsScore !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold shrink-0">
                        {activeJobContext.atsScore}% Match
                      </span>
                    )}
                  </div>
                )}
                <form onSubmit={handleGenerate} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Input Source Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Resume Source
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setSourceType("draft");
                          setError(null);
                        }}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "draft"
                            ? "bg-card shadow-sm text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Saved Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSourceType("text");
                          setError(null);
                        }}
                        className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                          sourceType === "text"
                            ? "bg-card shadow-sm text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Paste / Upload Text
                      </button>
                    </div>
                  </div>

                  {/* Contextual Input Fields */}
                  {sourceType === "draft" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Resume Draft
                      </label>
                      {resumes.length > 0 ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {resumes.map((res) => (
                            <option key={res.id} value={res.id}>
                              {res.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-muted-foreground py-3 px-3 rounded-lg border border-dashed border-border flex flex-col gap-2">
                          <p>No saved resumes found. Switch to Paste / Upload Text to add your resume.</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSourceType("text")}
                            className="text-xs h-7 self-start"
                          >
                            Switch to Paste / Upload Text
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Resume Text Content
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-semibold uppercase tracking-wide">
                          {isExtractingFile ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          <span>{isExtractingFile ? "Extracting..." : "Upload File"}</span>
                          <input
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                            disabled={isExtractingFile}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {uploadedFileName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Extracted from: {uploadedFileName}</span>
                        </div>
                      )}

                      <textarea
                        rows={5}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Target Company Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Google, Linear"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Role Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Job Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Job Description / Requirements
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste key responsibilities and qualifications from the job posting..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 font-bold"
                    isLoading={isGenerating}
                    disabled={isGenerating || isExtractingFile}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isGenerating ? "Crafting Cover Letter..." : "Generate Cover Letter"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel (Right) */}
          <div className="lg:col-span-7 space-y-4">
            {letterContent ? (
              <div className="space-y-4">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl border border-border/60 bg-card shadow-xs no-print">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isEditing
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted text-muted-foreground hover:text-foreground border-transparent"
                      }`}
                    >
                      {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                      <span>{isEditing ? "Preview Document" : "Edit Text Directly"}</span>
                    </button>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleSaveEdits}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </button>
                    )}

                    {saveSuccessMessage && (
                      <span className="text-xs text-emerald-500 font-medium">
                        ✓ {saveSuccessMessage}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="text-xs font-semibold gap-1.5 h-8"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                      <span>{isCopied ? "Copied!" : "Copy Text"}</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleOpenDownloadModal}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-semibold shadow-xs h-8"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </div>

                {/* Cover Letter Sheet (Editable or Styled Preview) */}
                <div className="flex items-start justify-center pb-12">
                  <div
                    id="letter-print-area"
                    className="relative w-full max-w-[210mm] min-h-[297mm] p-[20mm_22mm] bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-sm font-serif leading-relaxed text-[14px]"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-sans font-medium flex items-center justify-between no-print">
                          <span>✏️ Direct Editing Mode: You can type, modify, or add paragraphs below.</span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="font-bold underline cursor-pointer text-amber-900"
                          >
                            Done Editing
                          </button>
                        </div>
                        <textarea
                          rows={24}
                          value={letterContent}
                          onChange={(e) => setLetterContent(e.target.value)}
                          className="w-full h-full p-4 border border-zinc-300 rounded bg-zinc-50/50 text-zinc-900 font-serif text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-line text-justify text-zinc-800 selection:bg-primary/20">
                        {letterContent}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border/80 rounded-xl bg-card p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    Awaiting Target Role Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Select your resume draft and input the job requirements on the left to generate an authentic, evidence-backed cover letter.
                  </p>
                </div>
                <div className="w-full max-w-sm p-4 rounded-lg bg-secondary/30 border border-border/50 text-left space-y-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span>Generated Document Structure:</span>
                  </div>
                  <div className="space-y-1">
                    <p>• Header & Contact details aligned with resume</p>
                    <p>• High-conviction opening tying candidate background to role</p>
                    <p>• 2 targeted achievement narratives with quantified results</p>
                    <p>• Professional closing and mutual next steps</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct PDF Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Download Cover Letter PDF</h3>
                    <p className="text-xs text-muted-foreground">Save pure A4 document directly to your device</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  PDF File Name
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={downloadFileName}
                    onChange={(e) => setDownloadFileName(e.target.value)}
                    placeholder="Stripe_Cover_Letter"
                    className="font-mono text-xs"
                    autoFocus
                  />
                  <span className="text-xs font-mono text-muted-foreground font-semibold">.pdf</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDownloadModalOpen(false)}
                  disabled={isDownloadingPDF}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleExecutePDFDownload}
                  disabled={isDownloadingPDF || !downloadFileName.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-bold"
                >
                  {isDownloadingPDF ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>{isDownloadingPDF ? "Generating PDF..." : "Download Now"}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
