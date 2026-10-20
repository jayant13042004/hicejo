"use client";

import * as React from "react";
import {
  Sparkles,
  Target,
  Briefcase,
  Globe,
  Check,
  ArrowRight,
  X,
  Compass,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumeStore } from "@/store/useResumeStore";
import { STORAGE_KEYS } from "@/lib/hicejoState";
import { POPULAR_ROLES } from "@/data/learningCurricula";

const SENIORITY_LEVELS = [
  { id: "entry", label: "Entry / Junior", range: "0–2 yrs", desc: "Building core skills and seeking first full-time role" },
  { id: "mid", label: "Mid-Level", range: "2–5 yrs", desc: "Independent execution with proven project ownership", recommended: true },
  { id: "senior", label: "Senior", range: "5–8 yrs", desc: "Leading complex initiatives, architectural choices & mentorship" },
  { id: "lead", label: "Lead / Staff", range: "8+ yrs", desc: "Cross-functional strategy, org influence & high-stakes delivery" }
];

const TARGET_MARKETS = [
  { id: "us", label: "United States & North America", flag: "🇺🇸", desc: "US Tech, Enterprise & Remote Market" },
  { id: "uk-eu", label: "UK & European Union", flag: "🇬🇧", desc: "London, Berlin, Amsterdam & Remote EU" },
  { id: "canada", label: "Canada", flag: "🇨🇦", desc: "Toronto, Vancouver & Canadian hubs" },
  { id: "remote", label: "Global / Fully Remote", flag: "🌏", desc: "Worldwide remote-first companies (USD / EUR contracts)" },
  { id: "india", label: "India & South Asia", flag: "🇮🇳", desc: "Bangalore, NCR, Hyderabad & High-Growth Startups" },
  { id: "apac", label: "Australia & APAC", flag: "🇦🇺", desc: "Sydney, Melbourne, Singapore & APAC tech" }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [targetRoleInput, setTargetRoleInput] = React.useState("");
  const [selectedLevel, setSelectedLevel] = React.useState("Mid-Level");
  const [selectedMarket, setSelectedMarket] = React.useState("United States & North America");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { careerProfile, setCareerProfile, setActiveJobContext, activeJobContext } = useResumeStore();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if onboarding was completed previously
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    const hasTargetRole = careerProfile?.targetRole && careerProfile?.isConfigured;

    if (!completed && !hasTargetRole) {
      // Small delay so user sees dashboard context first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }

    // Listen to manual open trigger from header/settings
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-onboarding", handleOpen);
    return () => window.removeEventListener("open-onboarding", handleOpen);
  }, [careerProfile?.targetRole, careerProfile?.isConfigured]);

  const handleComplete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRole = targetRoleInput.trim() || "Full Stack Engineer";

    setIsSubmitting(true);

    try {
      // 1. Update Zustand store
      setCareerProfile({
        targetRole: cleanRole,
        experienceLevel: selectedLevel,
        primaryDomain: selectedMarket,
        targetCountry: selectedMarket,
        isConfigured: true
      });

      if (!activeJobContext?.jobTitle) {
        setActiveJobContext({
          jobTitle: cleanRole,
          company: "",
          jobDescription: ""
        });
      }

      // 2. Persist in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
        localStorage.setItem(
          STORAGE_KEYS.CAREER_PROFILE,
          JSON.stringify({
            targetRole: cleanRole,
            experienceLevel: selectedLevel,
            primaryDomain: selectedMarket,
            targetCountry: selectedMarket,
            isConfigured: true
          })
        );
      }

      // 3. Sync to API profile in background
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: cleanRole,
          experienceLevel: selectedLevel,
          primaryDomain: selectedMarket
        })
      }).catch(() => {});

      setIsOpen(false);
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/70 bg-gradient-to-r from-primary/5 via-muted/40 to-card">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>30-Second Personalization</span>
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer transition p-1"
              aria-label="Skip onboarding"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-foreground mt-2 tracking-tight">
            Personalize Your Career Operating System
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Answer 3 quick questions so your job matches, skills roadmap, and interview simulations focus strictly on your target role.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleComplete} className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Question 1: Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span>1. What is your target role? *</span>
            </label>
            <Input
              required
              placeholder="e.g. Full Stack Engineer, Digital Marketing Manager, Account Executive, Financial Analyst..."
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              className="h-9 text-xs"
            />

            {/* Quick-Pick Popular Role Chips */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block font-medium">Or choose a popular track:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_ROLES.map((r) => {
                  const isSelected = targetRoleInput.toLowerCase() === r.title.toLowerCase();
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTargetRoleInput(r.title)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                      }`}
                    >
                      {r.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question 2: Seniority / Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span>2. What is your experience / seniority level?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SENIORITY_LEVELS.map((lvl) => {
                const isSelected = selectedLevel.startsWith(lvl.label);
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setSelectedLevel(`${lvl.label} (${lvl.range})`)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-primary/5 border-primary ring-1 ring-primary/30"
                        : "bg-card border-border/70 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{lvl.label}</span>
                      {lvl.recommended && (
                        <span className="text-[8px] font-bold px-1 rounded bg-primary/10 text-primary">Default</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{lvl.range}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 3: Target Country / Market Focus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>3. Where is your target job market / location?</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TARGET_MARKETS.map((m) => {
                const isSelected = selectedMarket === m.label;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarket(m.label)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-primary/5 border-primary ring-1 ring-primary/30"
                        : "bg-card border-border/70 hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-base">{m.flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground block truncate">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground block truncate">{m.desc}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition"
            >
              Skip for now
            </button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Configuring..." : "Personalize My Dashboard & Start"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
