"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileUp,
  Trash2,
  ExternalLink,
  Clipboard,
  Check,
  Plus,
  RefreshCw,
  TrendingUp,
  Inbox
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeItem {
  id: string;
  title: string;
  ats_score: number;
  updated_at: string;
}

interface LetterItem {
  id: string;
  company: string;
  job_title: string;
  content: string;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"resumes" | "letters">("resumes");
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [letters, setLetters] = React.useState<LetterItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const resumesRes = await fetch("/api/resume");
      const resumesData = await resumesRes.json();
      if (resumesData.success) setResumes(resumesData.data);

      const lettersRes = await fetch("/api/cover-letters");
      const lettersData = await lettersRes.json();
      if (lettersData.success) setLetters(lettersData.data);
    } catch (err) {
      console.error("Error loading documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume draft? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setResumes(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLetter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cover letter? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/cover-letters/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setLetters(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLetter = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <DashboardShell title="History & Saved Documents">
      <div className="space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-border/40 pb-px gap-4 no-print">
          <button
            onClick={() => setActiveTab("resumes")}
            className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
              activeTab === "resumes" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Resume Drafts</span>
            {activeTab === "resumes" && (
              <motion.div
                layoutId="history-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("letters")}
            className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
              activeTab === "letters" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Cover Letters</span>
            {activeTab === "letters" && (
              <motion.div
                layoutId="history-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {/* Gallery viewport */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Loading Documents...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "resumes" ? (
              <motion.div
                key="resumes-grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Create Card Button */}
                <Card
                  onClick={() => router.push("/dashboard/builder")}
                  className="border-dashed border-border/80 hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center py-10 px-6 text-center hover:bg-muted/10 transition-all hover:-translate-y-1"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm">New Resume Draft</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    Initialize a clean builder workflow to design tailored credentials.
                  </p>
                </Card>

                {resumes.map((res) => (
                  <Card key={res.id} hoverEffect className="flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        {res.ats_score > 0 && (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            <TrendingUp className="h-3 w-3" />
                            <span>Score: {res.ats_score}%</span>
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold mt-4 truncate">{res.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Updated: {formatDate(res.updated_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4 border-t border-border/30 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/builder?id=${res.id}`)}
                        className="h-8 gap-1"
                      >
                        <span>Edit Draft</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <button
                        onClick={() => handleDeleteResume(res.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="letters-grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {letters.map((letItem) => (
                  <Card key={letItem.id} hoverEffect className="flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 shrink-0">
                        <FileUp className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-bold mt-4 truncate">
                        {letItem.company}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Target: {letItem.job_title} • {formatDate(letItem.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4 border-t border-border/30 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLetter(letItem.id, letItem.content)}
                        className="h-8 gap-1.5"
                      >
                        {copiedId === letItem.id ? (
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
                      <button
                        onClick={() => handleDeleteLetter(letItem.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardFooter>
                  </Card>
                ))}

                {letters.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-border/80 rounded-2xl bg-card/20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm font-semibold">No cover letters generated yet.</p>
                    <p className="text-xs text-muted-foreground/80 max-w-xs leading-relaxed">
                      Visit the Cover Letter Gen workspace to compile a tailored application document.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardShell>
  );
}
