"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [category, setCategory] = React.useState("support");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6 space-y-16">
          {/* Header */}
          <div className="space-y-4 max-w-2xl">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Direct Support & Helpdesk</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Get in Touch with the Hicejo Team
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Have questions about your subscription, need help optimizing your resume, or want to report a technical issue? We are here to help you accelerate your career.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-lg space-y-6">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Message Dispatched</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Thank you for contacting Hicejo. Our career support specialists typically respond within 12-24 business hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="text-xs mt-2"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Reason for Contact</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "support", label: "Tech Support" },
                        { id: "billing", label: "Billing / Plan" },
                        { id: "feedback", label: "Feature Request" },
                        { id: "partnership", label: "Partnership" },
                        { id: "privacy", label: "Data / Privacy" },
                        { id: "other", label: "General Query" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors text-left ${
                            category === cat.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Your Name</label>
                      <Input
                        required
                        placeholder="Alex Morgan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-xs bg-background/50 border-border/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Email Address</label>
                      <Input
                        required
                        type="email"
                        placeholder="alex@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-xs bg-background/50 border-border/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Subject</label>
                    <Input
                      required
                      placeholder="Question regarding ATS score / subscription..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="text-xs bg-background/50 border-border/80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Detailed Message</label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Please describe how we can assist you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="text-xs bg-background/50 border-border/80 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-5"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Message</span>
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Sidebar Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Direct Channels</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                      General & Technical Inquiries
                    </span>
                    <a href="mailto:support@hicejo.com" className="text-foreground font-medium hover:underline">
                      support@hicejo.com
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                      Privacy & Data Security
                    </span>
                    <a href="mailto:privacy@hicejo.com" className="text-foreground font-medium hover:underline">
                      privacy@hicejo.com
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                      Partnerships & University Programs
                    </span>
                    <a href="mailto:partners@hicejo.com" className="text-foreground font-medium hover:underline">
                      partners@hicejo.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Response Time Guarantee</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We review every submission carefully. Pro plan members receive priority queue routing with typical turnaround times under 6 hours on weekdays.
                </p>
                <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% human support from career engineers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
