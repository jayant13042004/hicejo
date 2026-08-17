import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { BLOG_ARTICLES } from "@/data/blogArticles";

export const metadata: Metadata = {
  title: "Career & Resume Guides — Beat the ATS & Land Interviews | Hicejo Blog",
  description: "Expert advice, ATS algorithms breakdown, resume writing formulas, and interview strategies to accelerate your career.",
  keywords: ["resume blog", "career advice", "ATS guide 2026", "resume tips", "how to write a resume"]
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="pt-20 pb-12 md:pt-28 md:pb-16 border-b border-border/40 bg-card/20">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Career Advice & ATS Guides</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              Master the Modern <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Job Search</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Actionable guides, ATS algorithm breakdowns, and resume writing frameworks written by hiring experts.
            </p>
          </div>
        </section>

        {/* Articles List */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BLOG_ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col p-6 rounded-2xl border border-border/80 hover:border-primary/60 bg-card hover:bg-card/80 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h2>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
