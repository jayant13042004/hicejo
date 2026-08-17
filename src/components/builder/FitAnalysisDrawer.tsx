"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FitAnalysis, ResumeData } from "@/types/resume";
import { ShieldCheck, TrendingUp, Sparkles, CheckCircle2, AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FitAnalysisDrawerProps {
  isOpen: boolean;
  fitAnalysis: FitAnalysis;
  resumeData: ResumeData;
  onOpenCompressor: (bulletText: string, itemId: string, itemType: "experience" | "projects") => void;
  onAutoOptimize: () => void;
}

export function FitAnalysisDrawer({
  isOpen,
  fitAnalysis,
  resumeData,
  onOpenCompressor,
  onAutoOptimize
}: FitAnalysisDrawerProps) {
  if (!isOpen) return null;

  const isOverflowing = fitAnalysis.status === "overflowing";

  // Identify verbose bullets in experience & projects (>140 chars)
  const verboseBullets: { text: string; itemId: string; itemType: "experience" | "projects"; title: string }[] = [];

  resumeData.experience?.forEach((exp) => {
    exp.description?.split("\n").forEach((b) => {
      if (b.trim().length > 140) {
        verboseBullets.push({
          text: b.trim(),
          itemId: exp.id,
          itemType: "experience",
          title: `${exp.position || "Role"} at ${exp.company || "Company"}`
        });
      }
    });
  });

  resumeData.projects?.forEach((proj) => {
    proj.description?.split("\n").forEach((b) => {
      if (b.trim().length > 140) {
        verboseBullets.push({
          text: b.trim(),
          itemId: proj.id,
          itemType: "projects",
          title: proj.name || "Project"
        });
      }
    });
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border border-border/70 rounded-2xl bg-card p-5 space-y-5 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold tracking-tight">One-Page Fit & Readability Audit</h3>
        </div>
        {isOverflowing && (
          <Button
            size="sm"
            onClick={onAutoOptimize}
            className="bg-gradient-to-r from-primary to-violet-600 text-xs h-7.5 px-3 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Optimize Automatically</span>
          </Button>
        )}
      </div>

      {/* Grid of Key Diagnostic Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Utilization */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Page Utilization</p>
          <p className="text-lg font-black text-foreground">{fitAnalysis.utilizationPercentage}%</p>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverflowing ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(fitAnalysis.utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Readability */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Readability</p>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-foreground">{fitAnalysis.readabilityGrade}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Typography scale</p>
        </div>

        {/* Metric 3: ATS Safety */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ATS Safety</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-bold text-foreground">{fitAnalysis.atsSafetyGrade}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Parseable headers</p>
        </div>

        {/* Metric 4: Density */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Content Density</p>
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-violet-500 shrink-0" />
            <p className="text-sm font-bold text-foreground">{fitAnalysis.contentDensity}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Vertical flow</p>
        </div>
      </div>

      {/* Recommendations & Actionable Opportunities */}
      {isOverflowing && verboseBullets.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Candidate Bullets for Compression ({verboseBullets.length})
            </p>
            <span className="text-[11px] text-muted-foreground">AI preserves all metrics & technologies</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {verboseBullets.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-primary">{item.title}</p>
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                    &quot;{item.text}&quot;
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenCompressor(item.text, item.itemId, item.itemType)}
                  className="shrink-0 text-xs h-7 px-2.5 gap-1 hover:bg-primary hover:text-white border-primary/30"
                >
                  <Sparkles className="h-3 w-3 text-primary group-hover:text-white" />
                  <span>Shorten</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
