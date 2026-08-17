import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Zap, Target, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Score Online — Instant 2026 Audit | Hicejo",
  description: "Check your resume against modern Applicant Tracking Systems (Workday, Greenhouse, Lever). Get an instant ATS match score, keyword gap analysis, and formatting review.",
  keywords: ["ATS resume checker", "resume score", "free resume audit", "ATS keyword match", "beat applicant tracking system"]
};

export default function ATSCheckerLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hicejo ATS Resume Score Checker",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Evaluate your resume for ATS compliance, structural integrity, and keywords with sub-second Gemini AI analysis."
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Free ATS Compliance Audit</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Test If Your Resume Can Pass The <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">ATS Screen</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              75% of resumes are discarded by automated recruiters before a human ever reads them. Run an instant ATS compatibility scan to uncover missing keywords and layout flaws.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard/checker">
                <Button size="lg" className="bg-primary text-primary-foreground font-bold px-8 h-12 gap-2 shadow-lg shadow-primary/20 text-sm">
                  <span>Scan Your Resume Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/builder">
                <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold">
                  Build ATS-Friendly Resume
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>3 Free Scans Daily</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>No Credit Card Required</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Sub-Second Gemini Speed</span>
              </span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="mx-auto max-w-5xl px-6 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                How Hicejo Audits Your Resume
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
                Engineered to replicate the parsing logic of top enterprise recruiting platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Job Keyword Match</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compares your experience against targeted job descriptions to identify exact skills, frameworks, and tools you need to include.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Format & Structure Audit</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifies tables, non-standard headings, invalid date formats, or missing contact links that cause ATS parser crashes.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Measurable Impact Check</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Detects weak bullet points lacking quantified metrics (% growth, $ revenue, hours saved) and suggests immediate enhancements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-border/40">
          <div className="mx-auto max-w-3xl px-6 space-y-8">
            <h2 className="text-2xl font-extrabold text-center text-foreground">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h3 className="font-bold text-sm text-foreground">What is an ATS (Applicant Tracking System)?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  An ATS is software used by employers (such as Workday, Taleo, Greenhouse, and Lever) to collect, parse, sort, and rank job applications. It scans resumes for relevant keywords, job titles, and quantifiable metrics before recruiters review them.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h3 className="font-bold text-sm text-foreground">How is Hicejo&apos;s ATS score calculated?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our algorithm evaluates keyword relevance, section hierarchy (Summary, Experience, Education, Skills), date consistency, and bullet point impact to deliver an accurate 0–100 score.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <h3 className="font-bold text-sm text-foreground">Is the ATS checker really free?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes! You get 3 free comprehensive ATS scans every single day, with no credit card required.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center pt-6">
              <Link href="/dashboard/checker">
                <Button size="lg" className="bg-primary text-primary-foreground font-bold px-8 h-12 gap-2 shadow-lg">
                  <span>Start Free ATS Scan</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
