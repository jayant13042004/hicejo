import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResumes, insertDemoResume } from "@/lib/supabase/demo";

// GET /api/resume - Get all resumes for user
export async function GET() {
  try {
    if (isDemoMode()) {
      const resumes = getDemoResumes();
      return NextResponse.json({ success: true, data: resumes });
    }

    const supabase = await createServerSideClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: resumes, error: dbError } = await supabase
      .from("resumes")
      .select("id, title, ats_score, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: resumes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/resume - Create a new blank resume
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (isDemoMode()) {
      const newResume = insertDemoResume(body.title, body.content);
      return NextResponse.json({ success: true, data: newResume });
    }

    const supabase = await createServerSideClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const title = body.title || "Untitled Resume";
    const content = body.content || {
      personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "" },
      summary: "",
      experience: [],
      education: [],
      projects: [],
      skills: []
    };

    const { data: newResume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        content,
        ats_score: 0
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newResume });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
