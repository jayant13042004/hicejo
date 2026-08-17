import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Flame, Sparkles, CheckCircle2, ArrowRight, Skull, Terminal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Free AI Resume Roast — Get Roasted & Fix Your Resume | Hicejo",
  description: "Get a hilarious yet brutally constructive AI roast of your resume. Uncover cliches, buzzwords, and weak bullet points with sub-second Gemini AI.",
  keywords: ["AI resume roast", "roast my resume", "brutal resume review", "free resume feedback", "resume roasting online"]
};

export default function ResumeRoastLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hicejo AI Resume Roast",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Expose buzzwords, formatting flaws, and narrative cliches with brutal honesty and actionable fixes."
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-semibold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5" />
              <span>Viral AI Resume Roaster</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Can Your Resume Survive Our <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent">AI Roast Room?</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              No sugarcoating. Upload your resume or paste your text to get incinerated by Gemini AI — then learn the exact bullet point fixes that will actually get you hired.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard/roast">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 h-12 gap-2 shadow-lg shadow-orange-500/20 text-sm">
                  <Flame className="h-4 w-4" />
                  <span>Roast My Resume Now</span>
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
                <span>2 Free Roasts Daily</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>100% Confidential</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Actionable Rewrite Fixes</span>
              </span>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="mx-auto max-w-5xl px-6 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                Brutal Truth + Actionable Fixes
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
                Every roast comes with diagnostic feedback so you can upgrade your resume immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Skull className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Unsparing Roasts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Call out empty buzzwords like &quot;detail-oriented team player&quot; and &quot;spearheaded cross-functional synergies&quot;.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Terminal className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Live Terminal Diagnostic</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Watch real-time scanner logs analyze your document architecture, grammar, and timeline inconsistencies.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Instant Rewrite Guidance</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get exact, high-impact bullet replacements ready to paste directly into the Resume Builder.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
