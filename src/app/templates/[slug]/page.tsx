import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { LayoutTemplate, ArrowRight, CheckCircle2, FileText, Download, Sparkles, User, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { STARTER_TEMPLATES } from "@/data/starterTemplates";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "software-engineer-resume" },
    { slug: "product-manager-resume" },
    { slug: "data-scientist-resume" },
    { slug: "marketing-specialist-resume" },
    { slug: "college-student-resume" }
  ];
}

const SLUG_MAP: Record<string, string> = {
  "software-engineer-resume": "software-engineer",
  "product-manager-resume": "product-manager",
  "data-scientist-resume": "data-scientist",
  "marketing-specialist-resume": "marketing-specialist",
  "college-student-resume": "college-student"
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const templateId = SLUG_MAP[slug];
  const template = STARTER_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return { title: "ATS Resume Template | Hicejo" };
  }

  return {
    title: `${template.name} Resume Template & ATS Examples (2026) | Hicejo`,
    description: `Free, ATS-tested ${template.name} resume template. Includes verified bullet points, metrics, and technical skills layout. Free download & instant builder import.`,
    keywords: [
      `${template.role} resume`,
      `${template.name} ATS template`,
      "free resume template download",
      "best ATS resume 2026"
    ]
  };
}

export default async function TemplateDetailsPage({ params }: Props) {
  const { slug } = await params;
  const templateId = SLUG_MAP[slug];
  const template = STARTER_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    notFound();
  }

  const { data } = template;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    "name": `${template.name} Resume Template`,
    "description": template.description,
    "author": {
      "@type": "Organization",
      "name": "Hicejo"
    },
    "fileFormat": "application/pdf",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
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
        <section className="relative pt-16 pb-12 md:pt-24 md:pb-16 border-b border-border/40 bg-card/20">
          <div className="mx-auto max-w-5xl px-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span>Verified ATS Template ({template.category})</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              {template.name} <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Resume Template</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
              {template.description} Optimized with quantifiable achievements, modern keyword density, and strict 1-page A4 formatting.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/dashboard/builder`}>
                <Button size="lg" className="bg-primary text-primary-foreground font-bold px-7 h-11 gap-2 shadow-lg shadow-primary/20 text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Use This Template in Builder</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/checker">
                <Button size="lg" variant="outline" className="h-11 px-5 text-xs font-semibold">
                  Scan Your Current Resume
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Interactive Resume Document Sheet */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="mx-auto max-w-4xl px-6 space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                Document Preview & Layout Architecture
              </h2>
              <p className="text-xs text-muted-foreground">
                Standard A4 single-page layout tested against Workday, Greenhouse, and Lever.
              </p>
            </div>

            {/* A4 Paper Mock */}
            <div className="bg-white text-zinc-900 rounded-lg shadow-2xl border border-zinc-200 p-8 sm:p-12 space-y-6 font-sans max-w-[794px] mx-auto text-xs leading-relaxed">
              {/* Header */}
              <div className="text-center border-b border-zinc-200 pb-3 space-y-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-zinc-950">
                  {data.personalInfo.fullName}
                </h2>
                <p className="text-zinc-600 text-[11px] font-medium">
                  {data.personalInfo.location} • {data.personalInfo.email} • {data.personalInfo.phone}
                </p>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                    Professional Summary
                  </h3>
                  <p className="text-zinc-700 text-justify leading-relaxed">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                    Work Experience
                  </h3>
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex items-center justify-between font-bold text-zinc-900 text-[11.5px]">
                        <span>{exp.position} — {exp.company}</span>
                        <span className="text-zinc-500 font-medium text-[10.5px]">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-zinc-700">
                        {exp.description.split("\n").map((b, i) => (
                          <li key={i} className="leading-relaxed">
                            {b.replace(/^[•\-\s]*/, "")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                    Skills & Core Competencies
                  </h3>
                  <p className="text-zinc-700 leading-relaxed">
                    {data.skills.map((s) => s.name).join(" • ")}
                  </p>
                </div>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">
                    Education
                  </h3>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between text-zinc-800">
                      <span className="font-bold">{edu.degree} in {edu.fieldOfStudy} — {edu.school}</span>
                      <span className="text-zinc-500 text-[10.5px]">{edu.startDate} - {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom CTA Card */}
            <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  Ready to personalize this {template.role} template?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Open in Hicejo&apos;s AI Resume Builder with 1 click. Unlimited free edits and instant PDF download.
                </p>
              </div>
              <Link href="/dashboard/builder">
                <Button className="bg-primary text-primary-foreground font-bold shrink-0 text-xs gap-1.5 shadow-md">
                  <span>Start Editing Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
