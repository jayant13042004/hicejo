"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Flame,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  Briefcase,
  Mic,
  BookOpen,
  FileUp,
  CheckCircle2,
  Code2,
  SlidersHorizontal,
  TrendingUp,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { BrandMark } from "@/components/shared/BrandMark";

const suiteTools = [
  {
    number: "01",
    icon: Sparkles,
    badge: "Core Flagship",
    title: "Bullet-by-Bullet Resume Tailor",
    description:
      "Dynamically adapt your experience to match any company and job description. Generates quantified, Google XYZ bullet points with transparent before/after diffs.",
    href: "/tools/resume-tailor",
    linkLabel: "Try Resume Tailor",
  },
  {
    number: "02",
    icon: ShieldCheck,
    badge: "2026 Recruiter Standard",
    title: "ATS Resume Checker & Auto-Fix",
    description:
      "Audit your resume across 4 critical pillars: Content Impact, Keyword Match, Structure, and Parsability. Apply automated 1-click fixes to immediately reach 90+ score.",
    href: "/tools/ats-resume-checker",
    linkLabel: "Audit your resume",
  },
  {
    number: "03",
    icon: Mic,
    badge: "Voice & Text",
    title: "AI Mock Interview Studio",
    description:
      "Practice authentic hiring loops tailored to your target company (Google, Amazon, Bloomberg, McKinsey). Features live coding scratchpads and realistic hiring manager feedback.",
    href: "/dashboard/interview",
    linkLabel: "Start interview practice",
  },
  {
    number: "04",
    icon: FileText,
    badge: "Single-Page ATS",
    title: "High-Impact Resume Builder",
    description:
      "Build clean, focused resumes with automated achievement expanders. Exports 100% selectable, ATS-readable PDFs with embedded invisible text layers.",
    href: "/templates",
    linkLabel: "Explore templates",
  },
  {
    number: "05",
    icon: Briefcase,
    badge: "Job Match Engine",
    title: "Target Job Tracker & Gap Engine",
    description:
      "Import job listings from LinkedIn, Indeed, or Glassdoor. Discover hidden hard requirements, track your application pipeline, and see your match readiness score.",
    href: "/dashboard/jobs",
    linkLabel: "Track target jobs",
  },
  {
    number: "06",
    icon: BookOpen,
    badge: "Proof-Grounded",
    title: "Skills Roadmap & Evidence Builder",
    description:
      "Turn missing job requirements into verified qualifications with curated, step-by-step project curricula built specifically for your target role.",
    href: "/dashboard/learning",
    linkLabel: "View skill roadmaps",
  },
];

const freeIncludes = [
  "1 Active Resume Draft & Templates",
  "Daily ATS Resume Score Scans",
  "Resume Roast Evaluations",
  "100% Selectable ATS PDF Downloads",
  "Standard Job Tracker Pipeline"
];

const proIncludes = [
  "Unlimited Custom Resume Tailoring",
  "Unlimited ATS Keyword Scans & 1-Click Fixes",
  "Full AI Mock Interview Studio Loops (Google, Amazon, Bloomberg)",
  "Unlimited Role-Matched Cover Letters",
  "Target Job Scraping & Hard Requirements Extraction",
  "Verified Skills Roadmaps & Proof Curricula",
  "Multi-Resume Version History & Comparison"
];

function ProductPreview() {
  const [activeTab, setActiveTab] = React.useState<"tailor" | "checker" | "interview">("tailor");

  return (
    <div className="home-preview" aria-label="Interactive Hicejo workspace preview">
      {/* Window Toolbar */}
      <div className="home-preview-toolbar flex items-center justify-between px-4 py-2 border-b border-border/60 bg-card/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="home-window-controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground ml-2">
            Hicejo Workspace
          </span>
        </div>

        {/* Interactive Mode Pills */}
        <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/50 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab("tailor")}
            className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === "tailor"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✨ Tailor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checker")}
            className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === "checker"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🛡️ ATS 94%
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === "interview"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎙️ Interview
          </button>
        </div>
      </div>

      <div className="home-preview-body grid min-h-[360px] grid-cols-[48px_minmax(0,1fr)] bg-background">
        {/* Left Rail */}
        <aside className="home-preview-rail flex flex-col items-center gap-3 py-4 border-r border-border/50 bg-secondary/30" aria-hidden="true">
          <div className="home-rail-mark flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <BrandMark className="h-4 w-4" />
          </div>
          <span className={`home-rail-icon flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${activeTab === "tailor" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"}`}>
            <Sparkles size={15} />
          </span>
          <span className={`home-rail-icon flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${activeTab === "checker" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"}`}>
            <ShieldCheck size={15} />
          </span>
          <span className={`home-rail-icon flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${activeTab === "interview" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"}`}>
            <Mic size={15} />
          </span>
        </aside>

        {/* Dynamic Interactive Body */}
        <div className="p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {activeTab === "tailor" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Resume Tailoring Engine</span>
                  <p className="text-xs font-bold text-foreground">Target: Bloomberg · Senior Software Engineer</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                  +4 Keywords Matched
                </span>
              </div>

              {/* Before & After comparison card */}
              <div className="space-y-2 text-left">
                <div className="p-2.5 rounded-md bg-muted/40 border border-border/60 text-[11px]">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Original Bullet (Generic)
                  </span>
                  <p className="text-muted-foreground text-xs leading-snug">
                    &ldquo;Worked on database performance and backend APIs for real-time market data ingestion.&rdquo;
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-primary/5 border border-primary/25 text-[11px] relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> Tailored with Proof (Google XYZ Formula)
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">100% Truth Grounded</span>
                  </div>
                  <p className="text-foreground text-xs font-medium leading-snug">
                    &ldquo;Architected distributed worker pools handling <span className="text-primary font-bold">1.2M market events/sec</span>, cutting p99 query latency by <span className="text-primary font-bold">38%</span> while strictly eliminating concurrency memory leaks.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span>Rationale: Quantifies scale and addresses hard concurrency constraint.</span>
                <span className="text-primary font-semibold">1-Click Apply →</span>
              </div>
            </div>
          )}

          {activeTab === "checker" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">2026 Recruiter Standard</span>
                  <p className="text-xs font-bold text-foreground">ATS Audit: Senior Full Stack Engineer</p>
                </div>
                <div className="flex items-baseline gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <span className="text-sm font-extrabold text-emerald-600">94</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">/ 100</span>
                </div>
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2 rounded border border-border/60 bg-muted/20">
                  <span className="text-[9px] text-muted-foreground block">Content Quality</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-foreground">96%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Pass</span>
                  </div>
                </div>
                <div className="p-2 rounded border border-border/60 bg-muted/20">
                  <span className="text-[9px] text-muted-foreground block">Keyword Match</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-foreground">92%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Pass</span>
                  </div>
                </div>
                <div className="p-2 rounded border border-border/60 bg-muted/20">
                  <span className="text-[9px] text-muted-foreground block">Format & Density</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-foreground">98%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Single Page</span>
                  </div>
                </div>
                <div className="p-2 rounded border border-border/60 bg-muted/20">
                  <span className="text-[9px] text-muted-foreground block">Parsability</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-foreground">100%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Selectable</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-left">
                <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                  1-Click Auto Fix Available
                </span>
                <p className="text-xs text-foreground leading-snug">
                  Add 2 missing keywords (<span className="font-semibold">Kafka, Redis Cluster</span>) directly into your experience bullet points.
                </p>
              </div>
            </div>
          )}

          {activeTab === "interview" && (
            <div className="space-y-3 animate-in fade-in duration-200 text-left">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Interview Studio</span>
                  <p className="text-xs font-bold text-foreground">Bloomberg · Technical Round 1: DSA & Concurrency</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium border border-red-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  Live Voice
                </span>
              </div>

              {/* Chat snippet */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-md bg-secondary/60 border border-border/50 text-xs">
                  <span className="text-[10px] font-bold text-primary block mb-0.5">Alex (Bloomberg Interviewer)</span>
                  <p className="text-muted-foreground leading-snug">
                    &ldquo;How would you design an efficient worker pool that limits concurrent API calls while preventing memory leaks under high backpressure?&rdquo;
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-card border border-border/70 text-xs font-mono bg-muted/30">
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                    <span>LIVE SCRATCHPAD (PYTHON)</span>
                    <span className="text-emerald-600 font-semibold">Syntax Checked</span>
                  </div>
                  <pre className="text-[10px] text-foreground leading-tight overflow-x-auto">
{`async def worker_pool(tasks, max_concurrency=10):
    sem = asyncio.Semaphore(max_concurrency)
    async def worker(t):
        async with sem:
            return await process_event(t)`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="home-preview-foot flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><LockKeyhole size={11} /> 100% Private & Proof-Grounded</span>
            <span>Switch tabs above to preview live features</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="home-page">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-grid" aria-hidden="true" />
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <p className="home-eyebrow">
                <span className="home-eyebrow-spark"><Sparkles size={13} /></span>
                The Operating System for Getting Hired
              </p>
              <h1>
                Land the offer.
                <br />
                <em>From tailored resume to final loop.</em>
              </h1>
              <p className="home-hero-description">
                Stop throwing generic resumes into the applicant tracking black box.
                Hicejo matches your real experience to job descriptions, tailors every bullet point with proof, audits your ATS score, and simulates company-specific hiring interviews.
              </p>
              <div className="home-hero-actions">
                <Link href="/register" className="home-button home-button-primary">
                  Start Tailoring Free <ArrowRight size={16} />
                </Link>
                <Link href="#product-suite" className="home-button home-button-secondary">
                  Explore Platform Tools
                </Link>
              </div>
              <div className="home-hero-reassurance">
                <Check size={14} />
                <span>Free to start</span>
                <span className="home-reassurance-dot">·</span>
                <span>No credit card required</span>
                <span className="home-reassurance-dot">·</span>
                <span>100% Selectable ATS PDFs</span>
              </div>
            </div>

            <div className="home-hero-art">
              <div className="home-orbit home-orbit-one" aria-hidden="true" />
              <div className="home-orbit home-orbit-two" aria-hidden="true" />
              <ProductPreview />
              <div className="home-hero-note">
                <span className="home-note-icon"><ShieldCheck size={16} /></span>
                <span><strong>Your real experience stays yours.</strong><br />AI tailoring grounded in verified proof, never fabricated claims.</span>
              </div>
            </div>
          </div>

          <div className="home-hero-bottom">
            <span>Target any role.</span>
            <span className="home-hero-bottom-line" />
            <span>Tailor with evidence.</span>
            <span className="home-hero-bottom-line" />
            <span>Clear the hiring loop.</span>
          </div>
        </section>

        {/* Proof Metrics Strip */}
        <section className="border-y border-border/60 bg-secondary/30 py-6">
          <div className="section-shell grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">94%</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Average ATS Pass Rate</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">11+</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Role Disciplines & Loops</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">&lt; 30s</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Bullet-by-Bullet Tailoring</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">100%</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Selectable & Legible PDFs</p>
            </div>
          </div>
        </section>

        {/* The 3-Step Journey ("How Hicejo Works") */}
        <section className="home-how section-shell py-20" id="how-it-works">
          <div className="home-section-intro text-center max-w-2xl mx-auto mb-14">
            <p className="home-overline">A STRUCTURED PATH TO OFFERS</p>
            <h2>From job description<br />to <em>interview ready.</em></h2>
            <p>
              Most job seekers spray generic resumes and hope for the best. Hicejo gives you an unfair advantage with role-specific targeting, metric tailoring, and authentic interview practice.
            </p>
          </div>
          <div className="home-steps">
            {[
              {
                number: "01",
                title: "Import & Match Role",
                text: "Import any job URL from LinkedIn or paste a job description. Hicejo extracts hard requirements, missing skills, and calculates your baseline match readiness."
              },
              {
                number: "02",
                title: "Tailor with Proof",
                text: "Adapt every bullet point to the target company using Google's XYZ formula. Audit your ATS score and auto-fix formatting or keyword gaps in 1 click."
              },
              {
                number: "03",
                title: "Simulate the Loop",
                text: "Rehearse authentic company interview rounds (Google DSA, Amazon 16 LPs, Bloomberg, Consulting cases) with live voice/text and honest hiring evaluations."
              },
            ].map((step) => (
              <article className="home-step" key={step.number}>
                <span className="home-step-number">{step.number}</span>
                <div className="home-step-marker" aria-hidden="true"><span /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Complete Product Suite Grid */}
        <section className="home-tools section-shell py-20" id="product-suite">
          <div className="home-tools-heading">
            <div>
              <p className="home-overline">THE COMPLETE CAREER OS</p>
              <h2>Everything you need<br /><em>to get hired.</em></h2>
            </div>
            <p>
              A cohesive suite of intelligence tools designed to help ambitious candidates stand out, beat recruiter filters, and ace high-stakes interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suiteTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article className="home-tool-card flex flex-col justify-between" key={tool.number}>
                  <div>
                    <div className="home-tool-card-top flex items-center justify-between mb-3">
                      <span className="home-tool-icon"><Icon size={19} strokeWidth={1.8} /></span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link href={tool.href} className="home-text-link text-xs font-semibold text-primary flex items-center gap-1.5">
                      {tool.linkLabel} <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bonus Features Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Link href="/tools/resume-roast" className="home-extra-tool flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Flame size={18} />
                </span>
                <div>
                  <strong className="text-xs text-foreground block">Resume Roast</strong>
                  <span className="text-[11px] text-muted-foreground">Brutally honest, hilarious yet actionable teardown of your resume.</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">Roast me <ArrowRight size={14} /></span>
            </Link>

            <Link href="/tools/cover-letter-generator" className="home-extra-tool flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                  <FileUp size={18} />
                </span>
                <div>
                  <strong className="text-xs text-foreground block">Cover Letter Generator</strong>
                  <span className="text-[11px] text-muted-foreground">Generate tailored, culture-aligned cover letters matched to your resume.</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">Generate <ArrowRight size={14} /></span>
            </Link>
          </div>
        </section>

        {/* Editorial Principles Section */}
        <section className="home-principles">
          <div className="home-principles-inner">
            <div className="home-principles-copy">
              <p className="home-overline">PROOF OVER PROMISES</p>
              <h2>Good AI should make your real work <em>sound like you.</em></h2>
              <p>
                Recruiters can spot generic ChatGPT buzzwords instantly. Hicejo is built on proof-grounded tailoring: we structure and amplify the achievements you already have, without inventing fake titles, hallucinated metrics, or hollow buzzwords.
              </p>
              <Link href="/security" className="home-text-link home-light-link">
                How we protect your career data <ArrowRight size={15} />
              </Link>
            </div>
            <div className="home-principle-list">
              <div className="home-principle">
                <span className="home-principle-icon"><ShieldCheck size={18} /></span>
                <div>
                  <h3>Evidence over exaggeration</h3>
                  <p>Quantify real contributions with the Google XYZ formula. Never pad applications with invented claims.</p>
                </div>
              </div>
              <div className="home-principle">
                <span className="home-principle-icon"><Target size={18} /></span>
                <div>
                  <h3>Role-calibrated targeting</h3>
                  <p>Tailor specifically for the hiring manager reading your application, from early-stage startups to Big Tech loops.</p>
                </div>
              </div>
              <div className="home-principle">
                <span className="home-principle-icon"><LockKeyhole size={18} /></span>
                <div>
                  <h3>Honest interview evaluations</h3>
                  <p>Practice with realistic hiring bar standards that reject non-answers and guide you to real technical clarity.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparent Pricing Section */}
        <section className="home-pricing section-shell py-20" id="pricing">
          <div className="home-pricing-intro text-center max-w-xl mx-auto mb-14">
            <p className="home-overline">TRANSPARENT PRICING</p>
            <h2>Invest in your next chapter.</h2>
            <p>Start completely free. Upgrade when you are ready to accelerate your application pipeline.</p>
          </div>
          <div className="home-price-grid max-w-4xl mx-auto">
            <article className="home-price-card">
              <p className="home-price-name">Free Tier</p>
              <p className="home-price-description">Essential tools to start your search.</p>
              <p className="home-price-amount">$0 <span>/ month</span></p>
              <Link href="/register" className="home-button home-button-secondary home-price-button">
                Get started free <ArrowRight size={15} />
              </Link>
              <ul>
                {freeIncludes.map((item) => (
                  <li key={item}><Check size={15} />{item}</li>
                ))}
              </ul>
            </article>

            <article className="home-price-card home-price-card-featured">
              <span className="home-price-label">Most Popular</span>
              <p className="home-price-name">Career Pro</p>
              <p className="home-price-description">The full OS to land high-paying offers.</p>
              <p className="home-price-amount">$19 <span>/ month</span></p>
              <Link href="/register" className="home-button home-button-primary home-price-button">
                Upgrade to Career Pro <ArrowRight size={15} />
              </Link>
              <ul>
                {proIncludes.map((item) => (
                  <li key={item}><Check size={15} />{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="home-final-cta">
          <div className="home-final-cta-inner">
            <span className="home-final-spark"><Sparkles size={18} /></span>
            <p className="home-overline">READY TO STAND OUT?</p>
            <h2>Stop guessing what recruiters want.<br /><em>Start proving it.</em></h2>
            <p>Join thousands of ambitious candidates using Hicejo to tailor resumes, beat ATS filters, and clear interview loops.</p>
            <Link href="/register" className="home-button home-button-light">
              Build & Tailor Your Resume Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <Link href="/" className="home-wordmark">
              <span className="home-footer-mark"><BrandMark className="h-5 w-5" /></span>
              Hice<span>jo</span>
            </Link>
            <p>The Operating System for ambitious professionals getting hired in 2026.</p>
          </div>
          <div className="home-footer-links">
            <div>
              <span>PRODUCT SUITE</span>
              <Link href="/tools/resume-tailor">Resume Tailor</Link>
              <Link href="/tools/ats-resume-checker">ATS Resume Checker</Link>
              <Link href="/dashboard/interview">Interview Studio</Link>
              <Link href="/dashboard/builder">Resume Builder</Link>
              <Link href="/tools/cover-letter-generator">Cover Letters</Link>
              <Link href="/tools/resume-roast">Resume Roast</Link>
            </div>
            <div>
              <span>RESOURCES</span>
              <Link href="/templates">Resume Templates</Link>
              <Link href="/blog">Career Notes & Guides</Link>
              <Link href="/dashboard/learning">Skills Roadmaps</Link>
              <Link href="/about">About Hicejo</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <span>SECURITY & TRUST</span>
              <Link href="/security">Security & Encryption</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} Hicejo Inc. All rights reserved.</span>
          <span>Proof-grounded career intelligence.</span>
        </div>
      </footer>
    </>
  );
}
