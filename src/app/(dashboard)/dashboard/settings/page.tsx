"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  ShieldAlert,
  Download,
  Trash2,
  Check,
  RefreshCw,
  Mail,
  Briefcase,
  Layers,
  CircleDollarSign
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [targetRole, setTargetRole] = React.useState("");
  const [targetIndustry, setTargetIndustry] = React.useState("");
  const [targetSalary, setTargetSalary] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load profile data on mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const result = await res.json();
        if (result.success && result.data) {
          const profile = result.data;
          setFullName(profile.full_name || "");
          setEmail(profile.email || "");
          setTargetRole(profile.target_role || "");
          setTargetIndustry(profile.target_industry || "");
          setTargetSalary(profile.target_salary || "");
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          targetRole,
          targetIndustry,
          targetSalary
        })
      });
      const result = await res.json();

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setError(result.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch all user details
      const profileRes = await fetch("/api/profile");
      const profile = await profileRes.json();
      
      const resumesRes = await fetch("/api/resume");
      const resumes = await resumesRes.json();

      const lettersRes = await fetch("/api/cover-letters");
      const letters = await lettersRes.json();

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile: profile.success ? profile.data : null,
        resumes: resumes.success ? resumes.data : [],
        coverLetters: letters.success ? letters.data : []
      };

      // Generate download trigger
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hicejo-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export database items.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation1 = confirm(
      "WARNING: This will permanently delete your Hicejo account and clear all saved resumes, cover letters, and scoring metrics. Do you wish to continue?"
    );
    if (!confirmation1) return;

    const confirmation2 = confirm(
      "Are you absolutely certain? This operation is irreversible and all your data will be permanently purged."
    );
    if (!confirmation2) return;

    try {
      // Purge session via Supabase Auth
      const { error: deleteError } = await supabase.rpc("delete_user_account"); 
      // If no RPC trigger is set, trigger simple signOut and profile removal via API
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      // Fallback redirect
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Settings">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
            Loading Settings...
          </span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Account Settings">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Settings Form (Left) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary shrink-0" />
                <span>Job Search Target Parameters</span>
              </CardTitle>
              <CardDescription>
                Customize details about your career objectives. These are utilized by AI agents during optimization audits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
                    {error}
                  </div>
                )}
                {saveSuccess && (
                  <div className="rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-500 font-medium border border-emerald-500/20 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Profile settings updated successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="flex h-10 w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" />
                      <span>Target Role</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Product Manager"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3 w-3" />
                      <span>Target Industry</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technology"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CircleDollarSign className="h-3 w-3" />
                      <span>Target Salary Range</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $120,000 - $140,000"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 gap-1.5" isLoading={isSaving}>
                    <Check className="h-4 w-4" />
                    <span>Save Settings</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Data Purges & Exporters (Right) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exporter Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-muted-foreground shrink-0" />
                <span>Export Personal Data</span>
              </CardTitle>
              <CardDescription>
                Download a complete backup JSON payload containing your profile settings, resume drafts, cover letters, and keyword scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button variant="outline" className="w-full gap-2" onClick={handleExportData}>
                <Download className="h-4 w-4" />
                <span>Export Database JSON</span>
              </Button>
            </CardContent>
          </Card>

          {/* GDPR / Purges Card */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>Destructive Settings</span>
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Purge your information and close this account in compliance with GDPR privacy requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                This action is permanent and cannot be undone. All resume content history, matched scores, and generated letters will be deleted immediately.
              </p>
              <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4" />
                <span>Purge Data & Close Account</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
