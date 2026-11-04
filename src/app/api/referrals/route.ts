import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/supabase/demo";

const demoReferrals: any[] = [];

// GET /api/referrals?application_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("application_id");

    if (await isDemoMode()) {
      const filtered = applicationId
        ? demoReferrals.filter((r) => r.application_id === applicationId)
        : demoReferrals;
      return NextResponse.json({ success: true, data: filtered });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase
      .from("referral_contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (applicationId) query = query.eq("application_id", applicationId);

    const { data, error: dbError } = await query;
    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST /api/referrals — save referral contact + generated messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const contactData = {
      application_id: body.applicationId || body.application_id || null,
      name: body.name || "",
      linkedin_url: body.linkedinUrl || body.linkedin_url || null,
      job_title: body.jobTitle || body.job_title || null,
      company: body.company || null,
      department: body.department || null,
      relationship: body.relationship || "unknown",
      connection_message: body.connectionMessage || body.connection_message || null,
      referral_message: body.referralMessage || body.referral_message || null,
      forwardable_blurb: body.forwardableBlurb || body.forwardable_blurb || null,
      outreach_status: body.outreachStatus || body.outreach_status || "pending",
      notes: body.notes || null
    };

    if (await isDemoMode()) {
      const contact = {
        id: crypto.randomUUID(),
        user_id: "demo-user-id",
        ...contactData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoReferrals.push(contact);
      return NextResponse.json({ success: true, data: contact });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: contact, error: dbError } = await supabase
      .from("referral_contacts")
      .insert({ ...contactData, user_id: user.id })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// PATCH /api/referrals?id=xxx — update outreach status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Contact ID required." }, { status: 400 });

    const body = await request.json();
    const updateData: any = {};
    if (body.outreachStatus !== undefined)   updateData.outreach_status = body.outreachStatus;
    if (body.connectionMessage !== undefined) updateData.connection_message = body.connectionMessage;
    if (body.referralMessage !== undefined)   updateData.referral_message = body.referralMessage;
    if (body.forwardableBlurb !== undefined)  updateData.forwardable_blurb = body.forwardableBlurb;
    if (body.notes !== undefined)             updateData.notes = body.notes;

    if (await isDemoMode()) {
      return NextResponse.json({ success: true, data: { id, ...updateData } });
    }

    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: updated, error: dbError } = await supabase
      .from("referral_contacts")
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
