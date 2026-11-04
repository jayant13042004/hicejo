import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoProfile, updateDemoProfile } from "@/lib/supabase/demo";
import { JAYANT_FACT_BANK, mergeWithDefaultFactBank, VerifiedFactBank } from "@/lib/factBank";

// In-memory fallback if needed
let localFactBankCache: VerifiedFactBank | null = null;

// GET /api/fact-bank — Retrieve candidate fact bank
export async function GET() {
  try {
    if (await isDemoMode()) {
      const demo = getDemoProfile();
      let customFb = demo?.fact_bank;
      if (!customFb && demo?.resume_text) {
        try { customFb = JSON.parse(demo.resume_text); } catch {}
      }
      const merged = mergeWithDefaultFactBank(customFb || localFactBankCache);
      return NextResponse.json({ success: true, data: merged });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const merged = mergeWithDefaultFactBank(localFactBankCache);
      return NextResponse.json({ success: true, data: merged });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("fact_bank, resume_text")
      .eq("id", user.id)
      .maybeSingle();

    let customData: any = null;
    if (profile?.fact_bank) {
      customData = profile.fact_bank;
    } else if (profile?.resume_text) {
      try {
        const parsed = JSON.parse(profile.resume_text);
        if (parsed.projects || parsed.skillGroups) customData = parsed;
      } catch {}
    }

    const merged = mergeWithDefaultFactBank(customData || localFactBankCache);
    return NextResponse.json({ success: true, data: merged });
  } catch (error: any) {
    console.error("GET /api/fact-bank error:", error);
    return NextResponse.json({ success: true, data: JAYANT_FACT_BANK });
  }
}

// PUT /api/fact-bank — Update candidate fact bank (projects, skills, etc.)
export async function PUT(request: Request) {
  try {
    const body: Partial<VerifiedFactBank> = await request.json();
    const updated = mergeWithDefaultFactBank(body);
    localFactBankCache = updated;

    if (await isDemoMode()) {
      updateDemoProfile({
        fact_bank: updated,
        resume_text: JSON.stringify(updated)
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: true, data: updated, localOnly: true });
    }

    // Try saving to fact_bank column, fallback to resume_text
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        fact_bank: updated,
        resume_text: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (dbError && dbError.code === "42703") {
      // Column fact_bank does not exist, save into resume_text
      await supabase
        .from("profiles")
        .update({
          resume_text: JSON.stringify(updated),
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/fact-bank error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update fact bank." },
      { status: 500 }
    );
  }
}
