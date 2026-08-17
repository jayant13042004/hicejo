"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Flame, FileUp, FileText, ArrowRight, Zap, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export default function Home() {

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      desc: "Draft clean, bulletproof resumes with automated achievement expanders and dynamic templates.",
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "text-blue-500",
    },
    {
      icon: ShieldCheck,
      title: "ATS Resume Checker",
      desc: "Identify keyword matching errors and layout flaws using the same algorithms recruiters use.",
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-500",
    },
    {
      icon: Target,
      title: "Resume Tailor",
      desc: "Instantly adapt your experience bullet points to match any specific job description.",
      color: "from-violet-500/20 to-purple-500/20",
      accent: "text-violet-500",
    },
    {
      icon: FileUp,
      title: "Cover Letter Generator",
      desc: "Write engaging, high-conversion cover letters customized to your target role with one click.",
      color: "from-pink-500/20 to-rose-500/20",
      accent: "text-pink-500",
    },
    {
      icon: Flame,
      title: "Resume Roast",
      desc: "Receive raw, sarcastic, and highly actionable feedback exposing structural design weaknesses.",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-500",
    },
    {
      icon: Zap,
      title: "Saved Resumes Gallery",
      desc: "Keep history logs of custom tailoring iterations and download ready PDFs.",
      color: "from-cyan-500/20 to-sky-500/20",
      accent: "text-cyan-500",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Introducing the Operating System for Getting Hired</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-none bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-transparent"
            >
              Accelerate Your Career with <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-secondary bg-clip-text text-transparent">
                Intelligence-Driven Resumes
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Stop sending generic resumes into the applicant tracking black box. Hicejo helps you build, roast, tailor, and track your application funnel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/25">
                  <span>Start Building Free</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Explore Features
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-24 border-t border-border/40 bg-card/20 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything You Need To Secure Offers</h2>
              <p className="mt-4 text-muted-foreground">
                We packed the tools recruiters use directly into Hicejo. Analyze keywords, build drafts, and generate responses instantly.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div key={index} variants={itemVariants}>
                    <Card hoverEffect className="h-full">
                      <CardContent className="p-8 space-y-4">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} ${feat.accent}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">{feat.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-muted-foreground">Get started for free, then upgrade to unlock unlimited AI processing power.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="flex flex-col justify-between p-8 border-border/60">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Standard Free</h3>
                    <p className="text-sm text-muted-foreground mt-2">Perfect for starting your search.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {["1 Active Resume Draft", "3 AI ATS Keyword Scans", "1 Tailored Cover Letter", "Standard PDF Downloads"].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">Get Started Free</Button>
                  </Link>
                </div>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col justify-between p-8 border-primary/40 relative overflow-hidden bg-primary/5">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Popular
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Career Pro</h3>
                    <p className="text-sm text-muted-foreground mt-2">For serious applicants seeking offers.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$19</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Unlimited Resumes & Drafts",
                      "Unlimited ATS Keywords Scanning",
                      "Unlimited Custom Tailored Bullets",
                      "Unlimited Cover Letter Generations",
                      "Unlimited Resume Roasts",
                      "Premium Formatting Templates",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-primary to-violet-600 shadow-md">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold">Hicejo</span>
            </div>
            <p className="text-sm text-muted-foreground">&copy; 2026 Hicejo Inc. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
