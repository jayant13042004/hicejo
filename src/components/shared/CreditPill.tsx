"use client";

import * as React from "react";
import { Zap, Sparkles } from "lucide-react";
import { getCreditUsage, DAILY_LIMITS, FeatureKey } from "@/lib/credits";
import { UpgradeModal } from "./UpgradeModal";

interface CreditPillProps {
  currentFeature?: FeatureKey;
}

export function CreditPill({ currentFeature }: CreditPillProps) {
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const [usage, setUsage] = React.useState({
    ats_check: 0,
    roast: 0,
    tailor: 0,
    cover_letter: 0
  });

  const refreshCredits = React.useCallback(() => {
    const data = getCreditUsage();
    setUsage({
      ats_check: data.ats_check || 0,
      roast: data.roast || 0,
      tailor: data.tailor || 0,
      cover_letter: data.cover_letter || 0
    });
  }, []);

  React.useEffect(() => {
    refreshCredits();
    window.addEventListener("hicejo_credits_updated", refreshCredits);
    return () => window.removeEventListener("hicejo_credits_updated", refreshCredits);
  }, [refreshCredits]);

  let displayLabel = "Free Plan";
  if (currentFeature) {
    const limit = DAILY_LIMITS[currentFeature];
    const used = usage[currentFeature] || 0;
    const remaining = Math.max(0, limit - used);
    displayLabel = `${remaining}/${limit} Free Today`;
  }

  return (
    <>
      <button
        onClick={() => setIsUpgradeOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/80 bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium cursor-pointer transition-colors"
        title="View Daily Credits & Pro Plan"
      >
        <span className="font-mono text-[11px] text-muted-foreground">{displayLabel}</span>
        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline-block">Upgrade</span>
      </button>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </>
  );
}
