import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/supabase/demo";

// In-memory demo applications store (session-scoped)
const demoApplications: any[] = [];

function getDemoApplications() {
  return demoApplications;
}

function insertDemoApplication(data: any) {
  const app = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  demoApplications.push(app);
  return app;
}

// GET /api/applications — list all applications for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const roleFamily = searchParams.get("role_family");

    if (await isDemoMode()) {
      let apps = getDemoApplications();
      if (status) apps = apps.filter((a) => a.status === status);
      if (priority) apps = apps.filter((a) => a.priority === priority);
      return NextResponse.json({ success: true, data: apps });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase
      .from("applications")
      .select(`
        id, company, job_title, job_id, job_url, role_family, location,
        date_discovered, date_applied, fit_score, priority, verdict,
        source, status, notes, follow_up_date, compensation,
        master_resume_id, tailored_resume_id,
        created_at, updated_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (roleFamily) query = query.eq("role_family", roleFamily);

    const { data: applications, error: dbError } = await query;

    if (dbError) {
      // Table may not exist yet — instruct user to run migration
      if (dbError.code === "42P01") {
        return NextResponse.json({
          success: false,
          error: "Applications table not found. Please run the database migration (src/lib/supabase/migrations/001_job_tracker.sql) in your Supabase SQL editor.",
          migrationRequired: true,
          data: []
        });
      }
      return NextResponse.json({ success: false, error: dbError.message, data: [] });
    }

    return NextResponse.json({ success: true, data: applications || [] });
  } catch (error: any) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST /api/applications — create new application
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const appData = {
      company: body.company || "",
      job_title: body.jobTitle || body.job_title || "",
      job_id: body.jobId || body.job_id || null,
      job_url: body.jobUrl || body.job_url || null,
      role_family: body.roleFamily || body.role_family || null,
      location: body.location || null,
      fit_score: body.fitScore ?? body.fit_score ?? null,
      priority: body.priority || null,
      verdict: body.verdict || null,
      source: body.source || "portal",
      master_resume_id: body.masterResumeId || body.master_resume_id || null,
      tailored_resume_id: body.tailoredResumeId || body.tailored_resume_id || null,
      status: body.status || "saved",
      notes: body.notes || null,
      follow_up_date: body.followUpDate || body.follow_up_date || null,
      job_description: body.jobDescription || body.job_description || null,
      jd_analysis: body.jdAnalysis || body.jd_analysis || null,
      compensation: body.compensation || null
    };

    if (await isDemoMode()) {
      const app = insertDemoApplication(appData);
      return NextResponse.json({ success: true, data: app });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: application, error: dbError } = await supabase
      .from("applications")
      .insert({ ...appData, user_id: user.id })
      .select()
      .single();

    if (dbError) {
      if (dbError.code === "42P01") {
        return NextResponse.json({
          success: false,
          error: "Applications table not found. Please run the database migration.",
          migrationRequired: true
        }, { status: 503 });
      }
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create application." },
      { status: 500 }
    );
  }
}
