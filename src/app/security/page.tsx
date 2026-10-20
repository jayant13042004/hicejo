import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Key, 
  Database, 
  FileCheck, 
  ArrowLeft, 
  AlertCircle,
  EyeOff,
  Trash2
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Security & Trust Architecture | Hicejo",
  description: "Explore Hicejo's enterprise security framework: zero AI model training on private resumes, AES-256 encryption, and full data deletion sovereignty.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 space-y-16">
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
              <span>Enterprise Grade Security</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Security & Data Sovereignty
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Your resume contains your entire personal and professional trajectory. We treat it with institutional-grade cryptographic protection and zero-leakage guarantees.
            </p>
          </div>

          {/* Core Guarantees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <EyeOff className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Zero AI Model Training</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We contractually enforce zero-retention policies with our AI inference providers. Your uploaded resumes, cover letters, and notes are never ingested to train public or foundational machine learning models.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">End-to-End Encryption</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All data in transit is protected using modern TLS 1.3 protocol with elliptic curve cryptography. All stored database records and resume snapshots are encrypted at rest using industry-standard AES-256.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">SOC 2 Hosted Infrastructure</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hicejo&apos;s infrastructure runs on verified SOC 2 Type II and ISO 27001 compliant cloud platforms with redundant data centers, continuous monitoring, and automated vulnerability scanning.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Irreversible Data Purge</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You maintain complete ownership of your career data. If you choose to delete your account or specific resumes, all associated records, vectors, and backups are permanently purged from our databases.
              </p>
            </div>
          </div>

          {/* Deep Dive Sections */}
          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Application Level Defenses</h2>
              <p>
                Our engineering team maintains strict security hygiene across the entire development lifecycle:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Row Level Security (RLS):</strong> Every database query is strictly partitioned by authenticated user identifier at the database engine level, preventing cross-tenant data leaks.</li>
                <li><strong>Secure Cookie & Session Tokens:</strong> Authentication tokens utilize <code>HttpOnly</code>, <code>SameSite=Lax</code>, and <code>Secure</code> flags to prevent cross-site scripting (XSS) and cross-site request forgery (CSRF).</li>
                <li><strong>Rate Limiting & Abuse Prevention:</strong> AI inference endpoints are protected by token bucket rate limiters to prevent brute-force exploitation and denial of service.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Vulnerability Disclosure & Bug Bounty</h2>
              <p>
                We believe in collaborative security research. If you believe you have discovered a potential security vulnerability in any Hicejo service, please contact our security response team immediately at{" "}
                <a href="mailto:security@hicejo.com" className="text-foreground font-semibold underline">
                  security@hicejo.com
                </a>.
              </p>
              <p className="text-xs">
                Please provide detailed steps to reproduce. We commit to acknowledging receipt within 24 hours and keeping you updated throughout the remediation process.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
