"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Zap, X, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground"
        >
          {/* Header Graphic */}
          <div className="relative p-6 bg-gradient-to-br from-primary/20 via-violet-600/10 to-transparent border-b border-border/60">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white shadow-md">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Hicejo Pro Pass
                </span>
                <h3 className="text-xl font-extrabold text-foreground">
                  Unlock Unlimited AI Career Power
                </h3>
              </div>
            </div>

            {featureName && (
              <p className="text-xs text-muted-foreground mt-2">
                You&apos;ve reached today&apos;s free allowance for <strong>{featureName}</strong>. Free limits reset daily at midnight.
              </p>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="p-6 space-y-4">
            <div className="space-y-2.5">
              {[
                "Unlimited AI Resume Tailoring & Job Match Rewrites",
                "Unlimited Instant ATS Score Scans & Keyword Gap Analysis",
                "Unlimited AI Cover Letter Generations & Inline Editing",
                "Unlimited Brutal & Constructive AI Resume Roasts",
                "Priority Ultra-Fast Sub-Second Gemini Engine",
                "Unlimited Clean Vector PDF Downloads"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Special Early Access</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-foreground">$9</span>
                  <span className="text-xs text-muted-foreground">/ month or $29 lifetime</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  alert("Paid checkouts are launching soon! Enjoy your daily free credits.");
                  onClose();
                }}
                className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 font-bold text-xs gap-1.5 shadow-md"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <button
              onClick={onClose}
              className="hover:underline font-semibold cursor-pointer"
            >
              Continue Free
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
