import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { BLOG_ARTICLES } from "@/data/blogArticles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Blog Article | Hicejo" };

  return {
    title: `${article.title} | Hicejo Career Hub`,
    description: article.excerpt,
    keywords: [article.category, "ATS resume tips", "how to write a resume", "resume advice 2026"]
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "author": {
      "@type": "Organization",
      "name": "Hicejo"
    },
    "datePublished": "2026-08-15",
    "dateModified": "2026-08-18"
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <article className="mx-auto max-w-3xl px-6 space-y-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all guides</span>
          </Link>

          {/* Article Header */}
          <div className="space-y-4 border-b border-border/40 pb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10">
                {article.category}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              {article.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            <div className="text-xs text-muted-foreground pt-2">
              By <span className="font-semibold text-foreground">{article.author}</span> • {article.date}
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline max-w-none text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* In-Article Promotion Card */}
          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Test Your Resume in 30 Seconds</span>
              </div>
              <h3 className="font-bold text-base text-foreground">
                Run Hicejo&apos;s Free ATS Score Checker
              </h3>
              <p className="text-xs text-muted-foreground">
                Get an instant breakdown of your resume score, keyword match, and layout errors.
              </p>
            </div>
            <Link href="/dashboard/checker">
              <Button className="bg-primary text-primary-foreground font-bold shrink-0 text-xs gap-1.5 shadow-md">
                <span>Scan Resume Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
