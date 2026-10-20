import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { FileText, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Terms of Service | Hicejo",
  description: "Terms and conditions governing the use of Hicejo, the AI Job Search & Application OS.",
};

export default function TermsPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" />
              <span>Legal Agreements</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>

          {/* Terms Body */}
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account, browsing, or utilizing any services provided by Hicejo (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Description of Service</h2>
              <p>
                Hicejo provides career preparation tools, including AI-assisted resume building, applicant tracking system (ATS) compatibility analysis, job tailoring recommendations, cover letter generation, and diagnostic critiques.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. User Conduct & Accuracy of Information</h2>
              <p>
                You are solely responsible for the content of your resumes, cover letters, and communications submitted to employers. While Hicejo enforces strict anti-hallucination guardrails in its AI generation routines, you acknowledge that you are responsible for reviewing and verifying all factual claims, employment histories, and credentials before submitting them to any employer.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Intellectual Property & Ownership</h2>
              <p>
                You retain complete intellectual property rights to all resume text, biographical details, and personal data you input into Hicejo. Hicejo retains all rights, title, and interest in its proprietary software, algorithms, user interfaces, branding, and scoring engines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Subscriptions & Billing</h2>
              <p>
                Hicejo offers free access with daily credit allotments, as well as paid Pro tiers. Paid subscriptions are billed on a recurring monthly cycle. You may cancel your subscription at any time via your account settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Limitation of Liability</h2>
              <p>
                Hicejo does not guarantee job interviews, offers, or specific employment outcomes. The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. Under no circumstances will Hicejo be liable for any indirect, consequential, or incidental damages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">7. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
