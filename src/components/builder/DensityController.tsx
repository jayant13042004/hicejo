"use client";

import * as React from "react";
import { ResumeDensity } from "@/types/resume";
import { SlidersHorizontal, ShieldCheck } from "lucide-react";

interface DensityControllerProps {
  currentDensity: ResumeDensity;
  onChangeDensity: (density: ResumeDensity) => void;
}

const densityLevels: { id: ResumeDensity; label: string; description: string }[] = [
  { id: "relaxed", label: "Relaxed", description: "Spacious margins & tall line height (Best for 1-2 experiences)" },
  { id: "normal", label: "Normal", description: "Balanced default spacing and typography" },
  { id: "compact", label: "Compact", description: "Tightened section & bullet margins (Saves 3-5 lines)" },
  { id: "ultra-compact", label: "Ultra-Compact", description: "Maximum safe ATS density (Saves 6-9 lines without shrinking text)" }
];

export function DensityController({ currentDensity, onChangeDensity }: DensityControllerProps) {
  const currentIndex = densityLevels.findIndex((d) => d.id === currentDensity);
  const activeLevel = densityLevels[currentIndex !== -1 ? currentIndex : 1];

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resume Density Control
          </span>
        </div>
        <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
          {activeLevel.label}
        </span>
      </div>

      {/* Segmented Track */}
      <div className="relative pt-1 pb-1">
        <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-lg text-center">
          {densityLevels.map((lvl) => {
            const isActive = lvl.id === currentDensity;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onChangeDensity(lvl.id)}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-card shadow-sm text-foreground font-bold border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description & Safe Bounds Notice */}
      <div className="flex items-start justify-between gap-3 text-[11px] text-muted-foreground">
        <p className="leading-relaxed">{activeLevel.description}</p>
        <div className="flex items-center gap-1 shrink-0 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>ATS Safe Bounds</span>
        </div>
      </div>
    </div>
  );
}
