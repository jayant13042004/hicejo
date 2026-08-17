import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, deleteDemoCoverLetter } from "@/lib/supabase/demo";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/cover-letters/[id] - Delete a specific cover letter
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isDemoMode()) {
      deleteDemoCoverLetter(id);
      return NextResponse.json({ success: true, message: "Cover letter deleted successfully" });
    }

    const supabase = await createServerSideClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from("cover_letters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Cover letter deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
