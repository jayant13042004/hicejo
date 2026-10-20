import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Sparkles, LayoutTemplate, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STARTER_TEMPLATES } from "@/data/starterTemplates";

export const metadata: Metadata = {
  title: "ATS Resume Templates | Free Professional Templates",
  description: "Browse verified, ATS-compliant resume templates built for software engineers, product managers, data scientists, and marketers. One-click load into the Hicejo Builder.",
  keywords: ["ATS resume templates", "tech resume templates", "software engineer resume template", "product manager resume template", "free resume builder"]
};

export default function TemplatesCatalogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 border-b border-border/40 bg-card/20">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span>ATS-Optimized Collection</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Curated Resume Templates <br />
              <span className="underline decoration-primary decoration-4 underline-offset-8 text-foreground">
                Engineered for Impact
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Every template is pre-populated with real industry metrics, modern bullet structures, and strict ATS formatting standards. Click any template to start editing instantly.
            </p>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STARTER_TEMPLATES.map((tmpl) => (
                <Card key={tmpl.id} className="border-border/60 overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tmpl.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        A4 Optimized
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {tmpl.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Pre-quantified experience bullets</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Standard ATS chronological format</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Vector PDF print & single-page ready</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 pt-0 border-t border-border/30 bg-muted/20 flex items-center justify-between gap-3 mt-auto">
                    <Link
                      href={`/templates/${tmpl.id}-resume`}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
                    >
                      Preview Full
                    </Link>
                    <Link href={`/dashboard/builder?template=${tmpl.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary shadow-sm shadow-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Use Template</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
