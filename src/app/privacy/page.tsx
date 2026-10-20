import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | Hicejo",
  description: "Learn how Hicejo protects your resume data. Zero model training on user resumes, full GDPR/CCPA data sovereignty, and secure encryption.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-border/40 pb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Data Sovereignty & Privacy</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>

          {/* Policy Body */}
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Our Core Commitment to Your Privacy</h2>
              <p>
                At Hicejo, we understand that your resume contains sensitive personal information, including your full name, contact information, employment history, and educational background. We treat your career data with the highest security standards.
              </p>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                <strong>Our Plain-English Privacy Guarantee:</strong> We do NOT sell your personal information, and we do NOT use your private resumes or cover letters to train public foundational AI models.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
              <p>We collect information you provide directly when using the Hicejo platform:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Details:</strong> Full name and email address when you register via email/password or Google OAuth.</li>
                <li><strong>Resume & Application Content:</strong> Work experiences, education, projects, skills, summaries, and job descriptions you paste or upload for tailoring and ATS scoring.</li>
                <li><strong>Usage & Performance Metrics:</strong> Diagnostic scores, credit balances, and interaction events to ensure reliable application performance.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. How We Process AI Requests</h2>
              <p>
                When you run diagnostics, tailoring, or resume roasts, your content is processed through enterprise AI endpoints provided by Google Cloud (Gemini) or OpenAI. These API calls are governed by enterprise commercial agreements where:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Inputs and outputs are not retained or utilized by upstream providers to train AI models.</li>
                <li>Data transmission occurs over encrypted HTTPS connections (TLS 1.3).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Data Sovereignty & GDPR / CCPA Rights</h2>
              <p>You maintain 100% ownership of all resumes, cover letters, and profile data you create on Hicejo. In your Account Settings, you have direct self-serve access to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Export All Data:</strong> Instantly download a complete JSON archive of all your saved resumes, drafts, and profile data.</li>
                <li><strong>Permanent Account Deletion:</strong> Permanently erase your profile, resumes, scans, and cover letters from our database with a single click.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Security Infrastructure</h2>
              <p>
                User accounts, sessions, and database storage are managed using Supabase with Row Level Security (RLS) policies. Only you can read, modify, or delete your saved drafts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Contact & Data Officer</h2>
              <p>
                If you have any questions regarding this Privacy Policy or wish to make a formal data inquiry, contact our security team at <span className="font-semibold text-foreground">support@hicejo.com</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
