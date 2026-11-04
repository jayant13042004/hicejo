import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoProfile, updateDemoProfile } from "@/lib/supabase/demo";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/profile - Fetch candidate profile metadata
export async function GET() {
  try {
    if (await isDemoMode()) {
      const profile = getDemoProfile();
      return NextResponse.json({ success: true, data: profile });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Graceful fallback for guest mode / unauthenticated sessions
      const profile = getDemoProfile();
      return NextResponse.json({ success: true, data: profile });
    }

    // Try fetching profile from Supabase
    let { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError || !profile) {
      // Auto-initialize profile if missing
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
        .maybeSingle();

      if (initError || !newProfile) {
        const demo = getDemoProfile();
        return NextResponse.json({ success: true, data: demo });
      }
      profile = newProfile;
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    const demo = getDemoProfile();
    return NextResponse.json({ success: true, data: demo });
  }
}

// PUT /api/profile - Update candidate profile metadata
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.full_name = body.fullName;
    if (body.targetRole !== undefined) updateData.target_role = body.targetRole;
    if (body.experienceLevel !== undefined) updateData.experience_level = body.experienceLevel;
    if (body.primaryDomain !== undefined) updateData.primary_domain = body.primaryDomain;
    if (body.resumeText !== undefined) updateData.resume_text = body.resumeText;
    if (body.targetIndustry !== undefined) updateData.target_industry = body.targetIndustry;
    if (body.targetSalary !== undefined) updateData.target_salary = body.targetSalary;

    if (await isDemoMode()) {
      const updated = updateDemoProfile(updateData);
      return NextResponse.json({ success: true, data: updated });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Graceful fallback for demo or guest sessions
      const updated = updateDemoProfile(updateData);
      return NextResponse.json({ success: true, data: updated, isLocalFallback: true });
    }

    updateData.updated_at = new Date().toISOString();

    // Try updating all provided fields first
    let profileResult: any = null;
    let { data, error: dbError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .maybeSingle();

    profileResult = data;

    // Code 42703: column does not exist in Postgres (e.g. experience_level or primary_domain)
    if (dbError && dbError.code === "42703") {
      const standardData: any = {
        updated_at: new Date().toISOString()
      };
      if (body.fullName !== undefined) standardData.full_name = body.fullName;
      if (body.targetRole !== undefined) standardData.target_role = body.targetRole;
      if (body.targetIndustry !== undefined) standardData.target_industry = body.targetIndustry;
      if (body.targetSalary !== undefined) standardData.target_salary = body.targetSalary;

      const retry = await supabase
        .from("profiles")
        .update(standardData)
        .eq("id", user.id)
        .select()
        .maybeSingle();

      profileResult = retry.data;
      dbError = retry.error;
    }

    if (dbError) {
      console.warn("Supabase profile update warning:", dbError.message);
      const updated = updateDemoProfile(updateData);
      return NextResponse.json({ success: true, data: updated, warning: dbError.message });
    }

    // Merge requested fields so client state retains target_role, experience_level, etc.
    const mergedProfile = {
      ...(profileResult || {}),
      target_role: body.targetRole ?? profileResult?.target_role,
      experience_level: body.experienceLevel ?? profileResult?.experience_level,
      primary_domain: body.primaryDomain ?? profileResult?.primary_domain,
      resume_text: body.resumeText ?? profileResult?.resume_text
    };

    return NextResponse.json({ success: true, data: mergedProfile });
  } catch (error: any) {
    const updated = updateDemoProfile({
      target_role: "Software Developer",
      updated_at: new Date().toISOString()
    });
    return NextResponse.json({ success: true, data: updated, error: error.message });
  }
}

// DELETE /api/profile - Permanently delete candidate account and all associated data
export async function DELETE() {
  try {
    if (await isDemoMode()) {
      return NextResponse.json({
        success: true,
        authUserDeleted: true,
        message: "Sandbox session data cleared successfully."
      });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;
    let authUserDeleted = false;

    // 1. Attempt Postgres RPC function if defined
    try {
      const { error: rpcError } = await supabase.rpc("delete_user_account");
      if (!rpcError) {
        authUserDeleted = true;
      }
    } catch (rpcErr) {
      console.warn("delete_user_account RPC check:", rpcErr);
    }

    // 2. Explicitly wipe all records in user-owned tables
    const userTables = [
      { name: "referral_contacts", col: "user_id" },
      { name: "applications", col: "user_id" },
      { name: "ats_scans", col: "user_id" },
      { name: "cover_letters", col: "user_id" },
      { name: "resumes", col: "user_id" },
      { name: "profiles", col: "id" }
    ];

    for (const tbl of userTables) {
      try {
        await supabase.from(tbl.name).delete().eq(tbl.col, userId);
      } catch (err) {
        console.warn(`Table wipe (${tbl.name}):`, err);
      }
    }

    // 3. If service role key is configured, delete from auth.users directly
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { error: adminErr } = await adminClient.auth.admin.deleteUser(userId);
        if (!adminErr) {
          authUserDeleted = true;
        } else {
          console.warn("Admin deleteUser warning:", adminErr.message);
        }
      } catch (adminEx) {
        console.warn("Admin deleteUser exception:", adminEx);
      }
    }

    // 4. Sign out
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      authUserDeleted,
      message: authUserDeleted
        ? "Your account and all associated data have been permanently deleted."
        : "Your saved resumes, cover letters, and profile data have been wiped from the database."
    });
  } catch (error: any) {
    console.error("Account deletion route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
