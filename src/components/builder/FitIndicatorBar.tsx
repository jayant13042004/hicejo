"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Target, RefreshCw, Printer } from "lucide-react";
import { FitAnalysis } from "@/types/resume";
import { Button } from "@/components/ui/button";

interface FitIndicatorBarProps {
  fitAnalysis: FitAnalysis;
  onFixToOnePage: () => void;
  onFillPage?: () => void;
  onPrint?: () => void;
  isFixing: boolean;
  isAnalysisOpen: boolean;
  onToggleAnalysis: () => void;
}

export function FitIndicatorBar({
  fitAnalysis,
  onFixToOnePage,
  onFillPage,
  onPrint,
  isFixing,
  isAnalysisOpen,
  onToggleAnalysis,
}: FitIndicatorBarProps) {
  const isOverflowing = fitAnalysis.status === "overflowing";
  const isPerfect = fitAnalysis.status === "perfect";
  const isUnderutilized = fitAnalysis.status === "underutilized";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 px-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md shadow-xs transition-all">
      {/* Left: Fit Status Badge */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {isOverflowing ? (
            <motion.div
              key="overflow"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 animate-pulse" />
              <span>
                ⚠ {fitAnalysis.overflowLines} {fitAnalysis.overflowLines === 1 ? "LINE" : "LINES"} OVERFLOWING
              </span>
            </motion.div>
          ) : isPerfect ? (
            <motion.div
              key="perfect"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>✓ PERFECT 1-PAGE FIT ({fitAnalysis.utilizationPercentage}% UTILIZED)</span>
            </motion.div>
          ) : isUnderutilized ? (
            <motion.div
              key="under"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>✓ 1 PAGE — {fitAnalysis.utilizationPercentage}% UTILIZED</span>
            </motion.div>
          ) : (
            <motion.div
              key="fits"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>✓ 1 PAGE — {fitAnalysis.utilizationPercentage}% UTILIZED</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Drawer Expand Toggle */}
        <button
          type="button"
          onClick={onToggleAnalysis}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <span>Fit Audit</span>
          {isAnalysisOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Right: Fix Action */}
      <div className="flex items-center gap-2.5">
        {/* Fix to 1 Page One-Click Button (Visible especially on overflow) */}
        {isOverflowing && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <Button
              size="sm"
              onClick={onFixToOnePage}
              disabled={isFixing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs text-xs gap-1.5 h-7.5 px-3 font-semibold"
            >
              {isFixing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>✨ Fix to 1 Page</span>
            </Button>
          </motion.div>
        )}

        {/* Fill 1 Page (100%) Button to eliminate bottom white space */}
        {!isOverflowing && onFillPage && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <Button
              size="sm"
              onClick={onFillPage}
              disabled={isFixing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs text-xs gap-1.5 h-7.5 px-3 font-semibold"
              title="Expand typography and spacing so your resume fills 100% of the page with no trailing white space"
            >
              {isFixing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>📐 Fill 1 Page (100%)</span>
            </Button>
          </motion.div>
        )}

        {/* Optional Secondary Print / Vector dialog button */}
        {onPrint && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrint}
            className="h-7.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border border-border/40 hover:bg-muted/50"
            title="Open browser print dialog (for vector print)"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
