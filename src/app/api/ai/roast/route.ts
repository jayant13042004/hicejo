import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText } = await request.json();

    if (!resumeId && (!resumeText || resumeText.trim() === "")) {
      return NextResponse.json({ success: false, error: "Please select a resume or paste resume text to roast." }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";

    if (resumeId) {
      if (isDemoMode()) {
        const resume = getDemoResume(resumeId);
        if (!resume) {
          return NextResponse.json({ success: false, error: "Resume draft not found" }, { status: 404 });
        }
        resumeContent = resume.content;
        resumeTitle = resume.title;
      } else {
        const supabase = await createServerSideClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          return NextResponse.json({ success: false, error: "Please log in to roast your saved drafts." }, { status: 401 });
        }

        // Fetch original resume
        const { data: resume, error: resumeError } = await supabase
          .from("resumes")
          .select("content, title")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single();

        if (resumeError || !resume) {
          return NextResponse.json({ success: false, error: "Saved resume could not be retrieved." }, { status: 404 });
        }
        resumeContent = resume.content;
        resumeTitle = resume.title;
      }
    } else {
      resumeContent = resumeText;
      resumeTitle = "Uploaded Resume";
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    // Format resume content into structured text
    let formattedResumeText = "";
    if (typeof resumeContent === "string") {
      formattedResumeText = resumeContent.trim();
    } else if (typeof resumeContent === "object" && resumeContent !== null) {
      const parts: string[] = [];
      if (resumeContent.personalInfo?.fullName) parts.push(`Candidate Name: ${resumeContent.personalInfo.fullName}`);
      if (resumeContent.summary) parts.push(`Professional Summary:\n${resumeContent.summary}`);
      if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
        parts.push(`Work Experience:\n` + resumeContent.experience.map((e: any) => `• ${e.position || 'Position'} at ${e.company || 'Company'} (${e.startDate || ''} - ${e.endDate || ''}):\n  ${e.description || 'No description'}`).join("\n"));
      }
      if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
        parts.push(`Education:\n` + resumeContent.education.map((e: any) => `• ${e.degree || 'Degree'} in ${e.fieldOfStudy || ''} from ${e.school || 'School'}`).join("\n"));
      }
      if (Array.isArray(resumeContent.projects) && resumeContent.projects.length > 0) {
        parts.push(`Projects:\n` + resumeContent.projects.map((p: any) => `• ${p.name || 'Project'} (${p.role || ''}): ${p.description || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.skills) && resumeContent.skills.length > 0) {
        parts.push(`Skills: ` + resumeContent.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", "));
      }
      formattedResumeText = parts.join("\n\n");
    }

    if (!formattedResumeText || formattedResumeText.trim().length === 0) {
      formattedResumeText = "Empty resume with no listed experience or accomplishments.";
    }

    // Offline / Mock fallback mode
    if (!isConfigured) {
      const mockRoast = {
        roastScore: 42,
        roastLevel: "Brutally Charred",
        brutalIntro: `This resume reads like an instruction manual for a discontinued device. You’ve managed to load it with enough generic buzzwords to put a recruiter to sleep within three seconds. Let’s dissect this masterpiece of mediocrity.`,
        critiques: [
          {
            area: "Summary",
            insult: "Your summary claims you're a 'results-driven innovator.' The only result driven here is the urge to close the browser tab.",
            fix: "Delete the generic adjectives. State exactly what tech stack you use, what scale you built for, and back it up with a real product metric."
          },
          {
            area: "Experience",
            insult: "You 'wrote code and collaborated with squads.' Truly groundbreaking. My smart fridge also runs code and talks to my Wi-Fi.",
            fix: "Rewrite bullet points using the X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]."
          },
          {
            area: "Skills",
            insult: "Listing generic computer terms as core technical skills is like listing 'breathing' on a health application.",
            fix: "Group skills logically into Languages, Frameworks, and Cloud Tools."
          },
          {
            area: "Formatting",
            insult: "Your date formatting and bullet structure are wildly inconsistent. Did you write this in 4 different font sizes?",
            fix: "Format every timeline date to a consistent pattern (e.g. January 2024)."
          }
        ],
        verdict: "A generic template holding generic achievements. Delete 50% of the buzzwords and rewrite with concrete numbers before applying anywhere."
      };

      return NextResponse.json({ success: true, data: mockRoast });
    }

    const systemPrompt = `You are a brutally honest, highly sarcastic senior tech recruiter and engineering director.
You roast resumes with hilarious, meme-worthy, and biting commentary (similar to Reddit's r/resumes or tech Twitter roasts).
Critiques MUST be specific to the resume content provided, funny, and MUST each include an actionable constructive "fix".

Respond in a STRICT, single JSON object matching this schema:
{
  "roastScore": number (0 to 100, where lower means more roasted/flawed),
  "roastLevel": string ("Brutally Charred" | "Crispy" | "Medium Rare"),
  "brutalIntro": string (savage, hilarious 2-3 sentence opener tearing down their presentation),
  "critiques": [
    {
      "area": string ("Summary" | "Experience" | "Projects" | "Skills" | "Formatting"),
      "insult": string (sarcastic, biting critique targeting specific flaws or generic phrases in this resume),
      "fix": string (constructive, high-leverage advice to immediately improve this section)
    }
  ],
  "verdict": string (closing savage summary verdict)
}
Return only raw valid JSON without markdown code fences.`;

    const userPrompt = `Resume Title: ${resumeTitle}
Resume Content:
${formattedResumeText.slice(0, 4000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to generate a critique response." }, { status: 500 });
    }

    // Strip code fences if model returned them
    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    try {
      const analysis = JSON.parse(cleanJson);
      return NextResponse.json({ success: true, data: analysis });
    } catch (parseErr) {
      console.error("JSON parse error from AI:", parseErr, cleanJson);
      return NextResponse.json({ success: false, error: "Failed to parse AI roast output." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Roast endpoint failure:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process resume roast." }, { status: 500 });
  }
}
