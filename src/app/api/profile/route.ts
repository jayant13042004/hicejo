import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoProfile, updateDemoProfile } from "@/lib/supabase/demo";

// GET /api/profile - Fetch candidate profile metadata
export async function GET() {
  try {
    if (isDemoMode()) {
      const profile = getDemoProfile();
      return NextResponse.json({ success: true, data: profile });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Try fetching profile
    let { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Auto-initialize profile if missing
    if (!profile) {
      const { data: newProfile, error: initError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || "",
          target_role: "",
          target_industry: "",
          target_salary: ""
        })
        .select()
        .single();

      if (initError) {
        return NextResponse.json({ success: false, error: initError.message }, { status: 500 });
      }
      profile = newProfile;
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/profile - Update candidate profile metadata
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (isDemoMode()) {
      const updateData: any = {};
      if (body.fullName !== undefined) updateData.full_name = body.fullName;
      if (body.targetRole !== undefined) updateData.target_role = body.targetRole;
      if (body.targetIndustry !== undefined) updateData.target_industry = body.targetIndustry;
      if (body.targetSalary !== undefined) updateData.target_salary = body.targetSalary;

      const updated = updateDemoProfile(updateData);
      return NextResponse.json({ success: true, data: updated });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.full_name = body.fullName;
    if (body.targetRole !== undefined) updateData.target_role = body.targetRole;
    if (body.targetIndustry !== undefined) updateData.target_industry = body.targetIndustry;
    if (body.targetSalary !== undefined) updateData.target_salary = body.targetSalary;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedProfile, error: dbError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
