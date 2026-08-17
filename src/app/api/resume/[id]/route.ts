import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume, deleteDemoResume } from "@/lib/supabase/demo";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/resume/[id] - Get details of a specific resume
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isDemoMode()) {
      const resume = getDemoResume(id);
      if (!resume) {
        return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: resume });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: resume });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/resume/[id] - Update a specific resume
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (isDemoMode()) {
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.content !== undefined) updateData.content = body.content;
      if (body.ats_score !== undefined) updateData.ats_score = body.ats_score;

      const updated = updateDemoResume(id, updateData);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updated });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.ats_score !== undefined) updateData.ats_score = body.ats_score;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedResume, error: dbError } = await supabase
      .from("resumes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedResume });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/resume/[id] - Delete a specific resume
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isDemoMode()) {
      deleteDemoResume(id);
      return NextResponse.json({ success: true, message: "Resume deleted successfully" });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
