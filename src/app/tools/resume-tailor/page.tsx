import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Sparkles, ArrowRight, CheckCircle2, Target, ArrowLeftRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Free AI Resume Tailor — Match Any Job Description in 60s | Hicejo",
  description: "Automatically tailor your resume bullet points and summary to match any job description. Boost your ATS match score and get 3x more interview callbacks.",
  keywords: ["AI resume tailor", "tailor resume to job description", "resume keyword matcher", "custom resume generator", "job match resume"]
};

export default function ResumeTailorLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hicejo AI Resume Tailor",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Adapt and rewrite experience statements dynamically to align with requirements for a specific company and role."
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Job Match Tailoring</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Tailor Your Resume To Any Job Description In <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-primary bg-clip-text text-transparent">Seconds</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Never send a generic resume again. Paste the target job description and watch Gemini AI rephrase your experience bullets to highlight matching skills, keywords, and business impact.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard/tailor">
                <Button size="lg" className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white font-bold px-8 h-12 gap-2 shadow-lg shadow-primary/20 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Tailor My Resume Free</span>
                </Button>
              </Link>
              <Link href="/dashboard/builder">
                <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold">
                  Open Resume Builder
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>2 Free Tailored Resumes Daily</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Side-by-Side Diff Review</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>1-Click Export to Builder</span>
              </span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="mx-auto max-w-5xl px-6 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                How Resume Tailoring Works
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
                Maintain 100% truthful metrics while highlighting relevant keywords recruiters search for.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">1. Paste Job Post</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter target company name, title, and job requirements from LinkedIn, Indeed, or company careers pages.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">2. AI Keyword Alignment</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our algorithm rewrites your summary and experience bullet points to integrate missing core competencies.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">3. 1-Click Builder Sync</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export directly to the Resume Builder or download a clean, single-page vector A4 PDF immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
