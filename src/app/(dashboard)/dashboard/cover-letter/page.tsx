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
  Upload
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeOption {
  id: string;
  title: string;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = React.useState<ResumeOption[]>([]);
  const [sourceType, setSourceType] = React.useState<"draft" | "text">("draft");
  const [selectedResumeId, setSelectedResumeId] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [letterContent, setLetterContent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

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
        console.error(err);
      }
    };
    loadResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsGenerating(true);
    setError(null);
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
      } else {
        setError(result.error || "Failed to extract text from file.");
      }
    } catch {
      setError("File upload connection failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === "draft" && !selectedResumeId) return;
    if (sourceType === "text" && !resumeText.trim()) return;
    if (!company || !jobTitle || !jobDescription) return;

    setIsGenerating(true);
    setError(null);
    setLetterContent(null);
    setIsCopied(false);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: sourceType === "draft" ? selectedResumeId : undefined,
          resumeText: sourceType === "text" ? resumeText : undefined,
          company,
          jobTitle,
          jobDescription
        })
      });
      const result = await res.json();

      if (result.success && result.data?.content) {
        setLetterContent(result.data.content);
      } else {
        setError(result.error || "Failed to generate cover letter.");
      }
    } catch {
      setError("Server connection failure.");
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardShell title="Cover Letter Generator">
      <div className="space-y-8">
        {/* Print-specific style configuration */}
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
            #letter-print-area, #letter-print-area * {
              visibility: visible;
            }
            #letter-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              padding: 15mm 20mm; /* Beautiful inner margins: 15mm top/bottom, 20mm left/right */
              background: white !important;
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

        <div>
          <p className="text-muted-foreground text-sm">
            Generate high-converting, professional cover letters tailored to your target company and job description.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Config Forms (Left) */}
          <div className="no-print lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generator Configurator</CardTitle>
                <CardDescription>Setup parameters to target custom postings.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
                      {error}
                    </div>
                  )}

                  {/* Input Source Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Resume Source
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setSourceType("draft")}
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
                        onClick={() => setSourceType("text")}
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
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Credentials Resume
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
                        <div className="text-xs text-muted-foreground py-2 px-1 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>No resumes found. Create a draft in Builder first.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Resume Text Content
                        </label>
                        <label className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer font-medium uppercase tracking-wider">
                          <Upload className="h-3 w-3" />
                          <span>Upload File (PDF/Word/Text)</span>
                          <input
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Paste the raw text of your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        required
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
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
                      placeholder="e.g. stripe"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Target Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Job Description
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste responsibilities and key requirements here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-violet-600 gap-2"
                    isLoading={isGenerating}
                    disabled={
                      (sourceType === "draft" && resumes.length === 0) ||
                      (sourceType === "text" && !resumeText.trim()) ||
                      !company ||
                      !jobTitle ||
                      !jobDescription
                    }
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Cover Letter</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Paper Preview Card (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-4">
            <AnimatePresence mode="wait">
              {isGenerating && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Drafting Cover Letter...</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Analyzing resume achievements and compiling paragraphs. Takes about 5 seconds.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isGenerating && !letterContent && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex flex-col items-center justify-center py-28 text-center border border-dashed border-border rounded-2xl bg-card/25"
                >
                  <FileUp className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">Letter Preview Canvas</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                    Run the generator configuration to view the tailored output.
                  </p>
                </motion.div>
              )}

              {!isGenerating && letterContent && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-full space-y-4"
                >
                  {/* Actions Header Bar */}
                  <div className="no-print flex items-center justify-between w-full p-3 rounded-lg border border-border bg-card shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Export Options
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="h-8 gap-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-3.5 w-3.5" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrint}
                        className="h-8 gap-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print / PDF</span>
                      </Button>
                    </div>
                  </div>

                  {/* Simulated A4 Letter Preview */}
                  <div
                    id="letter-print-area"
                    className="w-full md:w-[210mm] min-h-[297mm] p-[20mm] bg-white text-black shadow-lg border border-border/30 rounded-sm text-xs leading-relaxed font-sans whitespace-pre-wrap text-justify"
                  >
                    {letterContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
