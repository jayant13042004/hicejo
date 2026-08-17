"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Clipboard,
  Check,
  Printer,
  RefreshCw,
  Sparkles,
  ArrowRight,
  FileText,
  Upload,
  Edit3,
  Eye,
  Download,
  FileCheck,
  Save
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeOption {
  id: string;
  title: string;
}

const SAMPLE_RESUME_TEXT = `Alex Johnson | Senior Full Stack Engineer
San Francisco, CA | (555) 019-2834 | alex.johnson@example.com | linkedin.com/in/alexj-tech

PROFESSIONAL SUMMARY
Full Stack Engineer with 6+ years of experience specializing in React, Next.js, TypeScript, Node.js, and cloud architecture. Proven track record of scaling high-throughput distributed applications and building responsive, accessible web interfaces.

EXPERIENCE
Lead Full Stack Developer — Apex Cloud Technologies (2022 - Present)
• Architected core customer-facing dashboards in Next.js/React, improving page load speeds by 42%.
• Engineered event-driven microservices in Node.js/TypeScript handling 15M+ daily requests.
• Led agile squad of 6 engineers, standardizing design tokens and component test coverage to 90%.

Software Engineer — Nova Global Solutions (2019 - 2022)
• Developed responsive user interfaces with TypeScript, React, and Tailwind CSS.
• Built RESTful and GraphQL APIs integrated with PostgreSQL and Redis caching.

EDUCATION
B.S. in Computer Science — California State University (2015 - 2019)

SKILLS
React, Next.js, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker, AWS, Tailwind CSS`;

export default function CoverLetterPage() {
  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isExtractingFile, setIsExtractingFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [letterContent, setLetterContent] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null);

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
        console.error("Failed to load drafts:", err);
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
        setSourceType("text"); // Switch to text tab so the user sees their extracted text
      } else {
        setError(result.error || "Failed to extract text from file.");
      }
    } catch {
      setError("File upload connection failed. Please paste text directly.");
    } finally {
      setIsExtractingFile(false);
      e.target.value = ""; // Reset input so re-uploading works
    }
  };

  const handleLoadSample = () => {
    setSourceType("text");
    setResumeText(SAMPLE_RESUME_TEXT);
    setCompany("Stripe");
    setJobTitle("Senior Full Stack Engineer");
    setJobDescription("We are looking for a Senior Full Stack Engineer to lead frontend architecture and developer workflows. Must have strong experience with React, TypeScript, Next.js, Node.js, scalable APIs, and cross-functional team collaboration.");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) {
      setError("Please select a saved resume draft or paste your resume text.");
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

  const handleDirectDownloadPDF = async () => {
    const letterEl = document.getElementById("letter-print-area");
    if (!letterEl || !letterContent) return;

    setIsDownloadingPDF(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const cloned = letterEl.cloneNode(true) as HTMLElement;
      cloned.querySelectorAll(".no-print").forEach((el) => el.remove());
      cloned.style.boxShadow = "none";
      cloned.style.border = "none";
      cloned.style.margin = "0";
      cloned.style.width = "794px"; // 210mm
      cloned.style.minHeight = "1123px"; // 297mm
      cloned.style.backgroundColor = "#ffffff";
      cloned.style.color = "#09090b";

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";
      container.appendChild(cloned);
      document.body.appendChild(container);

      const canvas = await html2canvas(cloned, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      const filename = `${company ? company.replace(/[^a-zA-Z0-9_-]/g, "_") : "Target"}_Cover_Letter.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF download failed:", err);
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSaveEdits = () => {
    setSaveSuccessMessage("Edits saved to current view");
    setIsEditing(false);
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  return (
    <DashboardShell title="Cover Letter Generator">
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground text-sm">
            Generate high-converting, professional cover letters tailored to your target company and job description. Edit and customize directly before downloading.
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
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Load Sample Job
                </button>
              </CardHeader>
              <CardContent>
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
                        placeholder="Paste your resume text here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Company Name */}
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
                    className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-md gap-2 font-bold"
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
                      onClick={handleDirectDownloadPDF}
                      disabled={isDownloadingPDF}
                      className="bg-gradient-to-r from-primary to-violet-600 gap-1.5 text-xs font-semibold shadow-xs h-8"
                    >
                      {isDownloadingPDF ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>{isDownloadingPDF ? "Exporting..." : "Download PDF"}</span>
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
              <div className="h-[460px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-card/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Ready to Generate Cover Letter
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                  Fill in the company name, role, and job description on the left, then click <strong>&quot;Generate Cover Letter&quot;</strong>. You will be able to edit the generated letter freely before downloading.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
