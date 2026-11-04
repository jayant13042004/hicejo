import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResumes } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { jdAnalysis, overrideResumeId } = await request.json();

    if (!jdAnalysis || !jdAnalysis.roleFamily) {
      return NextResponse.json(
        { success: false, error: "JD analysis data is required." },
        { status: 400 }
      );
    }

    // If user manually selected a resume, honor that choice
    if (overrideResumeId) {
      return NextResponse.json({
        success: true,
        data: {
          selectedResumeId: overrideResumeId,
          isOverride: true,
          reason: "You manually selected this resume.",
          alternativeIds: []
        }
      });
    }

    // Fetch user's resumes
    let resumes: any[] = [];
    try {
      if (await isDemoMode()) {
        resumes = getDemoResumes();
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("resumes")
            .select("id, title, content, role_family, is_master, ats_score, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(10);
          resumes = data || [];
        }
      }
    } catch {
      // non-fatal
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          selectedResumeId: null,
          reason: "No saved resumes found. Please create a resume first.",
          alternativeIds: []
        }
      });
    }

    // Build resume summaries for AI comparison
    const resumeSummaries = resumes.map((r: any) => {
      const c = r.content || {};
      const skills = (c.skills || []).map((s: any) => s.name || s).join(", ");
      const expTitles = (c.experience || []).map((e: any) => e.title).join(", ");
      const projNames = (c.projects || []).map((p: any) => p.name).join(", ");
      return {
        id: r.id,
        title: r.title,
        roleFamily: r.role_family || "general",
        isMaster: r.is_master || false,
        skills,
        experienceTitles: expTitles,
        projectNames: projNames,
        atsScore: r.ats_score || 0
      };
    });

    const { openai, modelFast } = getAIClient();

    const systemPrompt = `You are selecting the best starting resume for a job application.
Return ONLY valid JSON: { "selectedId": "uuid", "reason": "1-2 sentences", "alternativeIds": ["uuid", ...] }
Select the resume that best matches the job's role family and required skills. If a resume is marked as master (isMaster: true) for the matching role family, prefer it. Never fabricate reasoning — base it on the data provided.`;

    const userPrompt = `Job Analysis:
- Role Family: ${jdAnalysis.roleFamily}
- Job Title: ${jdAnalysis.jobTitle || ""}
- Key Skills Required: ${(jdAnalysis.keySkills || []).join(", ")}
- Mandatory Requirements: ${(jdAnalysis.mandatoryRequirements || []).slice(0, 5).join("; ")}

Available Resumes:
${JSON.stringify(resumeSummaries, null, 2)}

Which resume ID is the best starting point? Return alternativeIds for the next 1-2 best options.`;

    const response = await openai.chat.completions.create({
      model: modelFast,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 512
    });

    const rawContent = response.choices[0]?.message?.content?.trim() || "{}";
    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    const result = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: {
        selectedResumeId: result.selectedId || resumes[0]?.id,
        reason: result.reason || "Selected based on role family match.",
        alternativeIds: result.alternativeIds || [],
        allResumes: resumeSummaries
      }
    });
  } catch (error: any) {
    console.error("Master resume selection error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to select master resume." },
      { status: 500 }
    );
  }
}
