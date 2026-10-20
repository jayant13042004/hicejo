import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Sparkles, ShieldCheck, Target, Users, Award, ArrowRight, Heart } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | Hicejo Career Operating System",
  description: "Learn about Hicejo's mission to eliminate generic resume fluff and guide candidates from target role to offer with truthful evidence.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40 bg-card/20">
          <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Our Purpose & Mission</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              We Believe Careers Should Be Built on <br />
              <span className="underline decoration-primary decoration-4 underline-offset-8">
                Truthful Evidence
              </span>, Not AI Fluff.
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hicejo was founded on a simple observation: the modern job hunt is flooded with generic generative AI spam, while recruiters crave verified skill evidence. We engineered the antidote.
            </p>
          </div>
        </section>

        {/* The Problem & Our Philosophy */}
        <section className="py-16 md:py-24 border-b border-border/40">
          <div className="mx-auto max-w-5xl px-6 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">The Broken Status Quo</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">The Era of AI Hallucinations in Hiring</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generic AI resume tools encourage applicants to fabricate revenue metrics, hallucinate skills they have never touched, and blast thousands of automated applications. The result? Rejection rates are at historic highs, and hiring managers don&apos;t trust resumes anymore.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  At Hicejo, our philosophy is the polar opposite: <strong>Evidence First.</strong> If you lack a key qualification for your dream job, we don&apos;t lie for you. We diagnose the gap, map a learning roadmap, and help you produce demonstrable portfolio proof.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-border/80 bg-card shadow-lg space-y-6">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span>The Hicejo Core Principles</span>
                </h3>
                <ul className="space-y-4 text-xs text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>Zero Hallucination Guarantee:</strong> We never generate fictional metrics or false work history. Every recommendation is grounded in your background.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>1-Page Geometric Precision:</strong> Automated layout solvers ensure your document fits single-page A4 standards with 100% vector text for ATS parsers.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span><strong>Continuous Career Arc:</strong> From target role decomposition to live mock interview practice, every step is integrated into one operating system.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Team / Story Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border/40 text-center">
              <div className="p-6 rounded-xl border border-border/60 bg-muted/20">
                <span className="text-3xl md:text-4xl font-black text-foreground block">100%</span>
                <span className="text-xs text-muted-foreground mt-1 block">Vector ATS Readable</span>
              </div>
              <div className="p-6 rounded-xl border border-border/60 bg-muted/20">
                <span className="text-3xl md:text-4xl font-black text-emerald-500 block">8-Pillar</span>
                <span className="text-xs text-muted-foreground mt-1 block">Diagnostic Depth</span>
              </div>
              <div className="p-6 rounded-xl border border-border/60 bg-muted/20">
                <span className="text-3xl md:text-4xl font-black text-primary block">0%</span>
                <span className="text-xs text-muted-foreground mt-1 block">AI Model Resume Training</span>
              </div>
              <div className="p-6 rounded-xl border border-border/60 bg-muted/20">
                <span className="text-3xl md:text-4xl font-black text-foreground block">5-Step</span>
                <span className="text-xs text-muted-foreground mt-1 block">Candidate Career Arc</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-3xl px-6 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Experience Career Precision?</h2>
            <p className="text-sm text-muted-foreground">
              Build your truthful, 1-page vector resume and practice your target interview today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-12 gap-2 shadow-xs">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="lg" className="h-12 px-6">
                  Browse ATS Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Note */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        &copy; 2026 Hicejo Inc. All rights reserved. Built for ambitious candidates worldwide.
      </footer>
    </div>
  );
}
