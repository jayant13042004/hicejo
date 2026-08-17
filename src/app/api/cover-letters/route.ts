import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoCoverLetters } from "@/lib/supabase/demo";

// GET /api/cover-letters - Get all cover letters for user
export async function GET() {
  try {
    if (isDemoMode()) {
      const letters = getDemoCoverLetters();
      return NextResponse.json({ success: true, data: letters });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: letters, error: dbError } = await supabase
      .from("cover_letters")
      .select("id, company, job_title, created_at, content, resume_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: letters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
