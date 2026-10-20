import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Cookie, ShieldCheck, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Cookie Policy | Hicejo",
  description: "Understand how Hicejo uses cookies and browser storage technologies to maintain sessions, preferences, and privacy.",
};

export default function CookiePolicyPage() {
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
              <Cookie className="h-3.5 w-3.5" />
              <span>Cookies & Tracking Technologies</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Cookie Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>

          {/* Body */}
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files placed on your computer or mobile device when you access websites. They are widely used to make websites work properly, provide secure authentication, preserve your configuration preferences, and deliver anonymous usage insights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Categories of Cookies We Deploy</h2>
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    A. Strictly Necessary Cookies (Essential)
                  </h3>
                  <p className="text-xs">
                    These cookies are mandatory for the application to function. They handle secure user logins, maintain authenticated sessions (<code>sb-auth-token</code>), protect against CSRF attacks, and remember your dark/light appearance preferences.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    B. Functional & Persistence Cookies
                  </h3>
                  <p className="text-xs">
                    These allow the resume builder to cache draft state, preserve typography selections, and retain custom section orderings so you do not lose edits while working across browser tabs.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    C. Payment & Verification Cookies
                  </h3>
                  <p className="text-xs">
                    When upgrading to Hicejo Pro, our payment processor (Stripe) may place secure tokens to prevent credit card fraud and authenticate checkout sessions.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. What We Do NOT Do</h2>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium text-xs">
                We do NOT participate in cross-site tracking, behavioral ad networks, or data resale brokers. We will never sell your browsing habits or profile to third-party ad exchanges.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Managing Your Cookie Preferences</h2>
              <p>
                Most modern browsers allow you to control cookies through their settings. You can configure your browser to block third-party cookies, notify you when a cookie is placed, or delete cookies upon exit. Note that disabling essential cookies may prevent you from logging into your Hicejo account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Questions & Contact</h2>
              <p>
                If you have questions about our use of cookies or privacy practices, please email our Data Protection Officer at{" "}
                <a href="mailto:privacy@hicejo.com" className="text-foreground font-semibold underline">
                  privacy@hicejo.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
