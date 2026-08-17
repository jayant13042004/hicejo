import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { FileUp, Sparkles, CheckCircle2, ArrowRight, Edit3, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Free AI Cover Letter Generator — Custom & Editable | Hicejo",
  description: "Generate tailored, highly persuasive cover letters matching your resume and target job in seconds. Edit directly on canvas and download clean PDF.",
  keywords: ["AI cover letter generator", "free cover letter builder", "tailored cover letter", "job match cover letter", "editable cover letter"]
};

export default function CoverLetterLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hicejo AI Cover Letter Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Craft persuasive, personalized cover letters tailored to your candidate background and target company requirements."
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold uppercase tracking-wider">
              <FileUp className="h-3.5 w-3.5" />
              <span>AI Cover Letter Writer</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Write Compelling, Custom Cover Letters In <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-primary bg-clip-text text-transparent">Seconds</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Say goodbye to generic cover letter templates. Hicejo connects your genuine career accomplishments with the company’s mission to produce persuasive, personalized letters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard/cover-letter">
                <Button size="lg" className="bg-primary text-primary-foreground font-bold px-8 h-12 gap-2 shadow-lg shadow-primary/20 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Cover Letter Free</span>
                </Button>
              </Link>
              <Link href="/dashboard/builder">
                <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold">
                  Build Resume First
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>2 Free Letters Daily</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Direct Canvas Self-Editing</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>1-Click PDF Download & Copy</span>
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="mx-auto max-w-5xl px-6 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                Why Job Seekers Love Hicejo Cover Letters
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
                Designed to sound natural, executive, and compelling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Zero Fluff Narrative</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Focuses directly on relevant achievements and metrics that prove you are the right fit for the role.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Edit3 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Direct Canvas Editing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Type, edit, and fine-tune your letter directly in the styled document view before downloading.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">1-Click PDF Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export crisp, perfectly formatted standard A4 PDFs ready for instant job board attachment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
