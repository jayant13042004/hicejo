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
  const [selectedPlan, setSelectedPlan] = React.useState<"sprint" | "monthly">("monthly");
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutNotice, setCheckoutNotice] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutNotice(null);

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: window.location.href
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.simulated) {
        setCheckoutNotice(data.message || `Activated ${selectedPlan === "sprint" ? "Weekend Sprint Pass ($5)" : "Pro Unlimited ($12/mo)"}!`);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutNotice("Could not initialize checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

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
          <div className="relative p-6 bg-muted/40 border-b border-border/60">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center shadow-xs">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Hicejo Pro Power
                </span>
                <h3 className="text-xl font-extrabold text-foreground">
                  Get Hired Faster with Unlimited AI
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
                "Unlimited 1-Click Resume Tailoring for any LinkedIn Job",
                "Instant Before vs After ATS Score Boost (+30% average uplift)",
                "Full Job Application Kits (Tailored Resume + Cover Letter + Top 5 Qs)",
                "Unlimited Clean Vector PDF Downloads & 1-Page Autofit",
                "Sub-Second Priority Gemini AI Engine",
                "Full Mock Interview Simulations & Score Rubrics"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPlan("sprint")}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPlan === "sprint"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Weekend Sprint</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">
                    72 Hours
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-xl font-black text-foreground">$5</span>
                  <span className="text-[11px] text-muted-foreground">one-time</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Perfect for intensive weekend job application marathons.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPlan === "monthly"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Pro Monthly</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
                    Most Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-xl font-black text-foreground">$12</span>
                  <span className="text-[11px] text-muted-foreground">/ month</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Full continuous access throughout your entire job search.
                </p>
              </button>
            </div>

            {/* Notification Feedback */}
            {checkoutNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold text-center">
                ✓ {checkoutNotice}
              </div>
            )}

            {/* Pricing Box CTA */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Selected Plan</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-foreground">
                    {selectedPlan === "sprint" ? "$5" : "$12"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedPlan === "sprint" ? "for 72 Hours" : "/ month (cancel anytime)"}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-xs cursor-pointer px-4 py-2"
              >
                {isCheckingOut ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Unlock Pro Access</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Secure SSL Checkout • Cancel Anytime</span>
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
