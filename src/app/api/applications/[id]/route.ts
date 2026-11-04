import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/supabase/demo";

// GET /api/applications/[id] — get single application with full JD analysis
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (await isDemoMode()) {
      return NextResponse.json({ success: true, data: null });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: application, error: dbError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (dbError || !application) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// PATCH /api/applications/[id] — update status, notes, fields
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.status !== undefined)             updateData.status = body.status;
    if (body.notes !== undefined)              updateData.notes = body.notes;
    if (body.dateApplied !== undefined)        updateData.date_applied = body.dateApplied;
    if (body.followUpDate !== undefined)       updateData.follow_up_date = body.followUpDate;
    if (body.tailoredResumeId !== undefined)   updateData.tailored_resume_id = body.tailoredResumeId;
    if (body.masterResumeId !== undefined)     updateData.master_resume_id = body.masterResumeId;
    if (body.jdAnalysis !== undefined)         updateData.jd_analysis = body.jdAnalysis;
    if (body.fitScore !== undefined)           updateData.fit_score = body.fitScore;
    if (body.verdict !== undefined)            updateData.verdict = body.verdict;
    if (body.priority !== undefined)           updateData.priority = body.priority;
    if (body.compensation !== undefined)       updateData.compensation = body.compensation;

    if (await isDemoMode()) {
      return NextResponse.json({ success: true, data: { id, ...updateData } });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: updated, error: dbError } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// DELETE /api/applications/[id] — remove application
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (await isDemoMode()) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
