"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulletAlternative {
  text: string;
  reductionPercentage?: number;
  style?: string;
}

interface SmartBulletCompressorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  itemId: string;
  itemType: "experience" | "projects";
  onApplyBullet: (itemId: string, itemType: "experience" | "projects", oldBullet: string, newBullet: string) => void;
}

export function SmartBulletCompressorModal({
  isOpen,
  onClose,
  originalBullet,
  itemId,
  itemType,
  onApplyBullet,
}: SmartBulletCompressorModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [alternatives, setAlternatives] = React.useState<BulletAlternative[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAlternatives = React.useCallback(async () => {
    if (!originalBullet) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/compress-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: originalBullet,
          roleContext: itemType === "experience" ? "Work Experience Achievement" : "Project Technical Contribution"
        })
      });

      const result = await res.json();
      if (result.success && result.data?.alternatives) {
        // Format alternatives array
        const formatted = result.data.alternatives.map((alt: any) =>
          typeof alt === "string" ? { text: alt, style: "Concise" } : alt
        );
        setAlternatives(formatted);
      } else {
        setError(result.error || "Failed to compress bullet point.");
      }
    } catch {
      setError("Network connection failed.");
    } finally {
      setIsLoading(false);
    }
  }, [originalBullet, itemType]);

  React.useEffect(() => {
    if (isOpen && originalBullet) {
      fetchAlternatives();
    }
  }, [isOpen, originalBullet, fetchAlternatives]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Sparkles className="h-5 w-5" />
              <span>Smart Bullet Compression</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Original Bullet Card */}
            <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Original ({originalBullet.length} characters)</span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">&quot;{originalBullet}&quot;</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 text-xs text-destructive bg-destructive/15 border border-destructive/25 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                <RefreshCw className="h-7 w-7 text-primary animate-spin" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Compressing with Gemini...</p>
                  <p className="text-[11px] text-muted-foreground">Preserving metrics, tools, and outcomes.</p>
                </div>
              </div>
            )}

            {/* Alternatives List */}
            {!isLoading && alternatives.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Optimized Alternatives
                  </span>
                  <button
                    type="button"
                    onClick={fetchAlternatives}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {alternatives.map((alt, idx) => {
                    const savings = Math.max(0, Math.round(((originalBullet.length - alt.text.length) / originalBullet.length) * 100));
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary/10">
                            {alt.style || `Alternative ${idx + 1}`}
                          </span>
                          {savings > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              -{savings}% character count
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-foreground font-medium leading-relaxed">
                          &quot;{alt.text}&quot;
                        </p>

                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              onApplyBullet(itemId, itemType, originalBullet, alt.text);
                              onClose();
                            }}
                            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-white font-semibold gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Use This</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Notice */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Metrics & technical keywords protected</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">
              Keep Original
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
