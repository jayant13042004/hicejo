import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText } = await request.json();

    if (!resumeId && !resumeText) {
      return NextResponse.json({ success: false, error: "Missing resumeId or resumeText" }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";

    if (resumeId) {
      if (isDemoMode()) {
        const resume = getDemoResume(resumeId);
        if (!resume) {
          return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
        }
        resumeContent = resume.content;
        resumeTitle = resume.title;
      } else {
        const supabase = await createServerSideClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Fetch original resume
        const { data: resume, error: resumeError } = await supabase
          .from("resumes")
          .select("content, title")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single();

        if (resumeError || !resume) {
          return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
        }
        resumeContent = resume.content;
        resumeTitle = resume.title;
      }
    } else {
      resumeContent = resumeText;
      resumeTitle = "Uploaded Text Resume";
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured) {
      const personalInfo = typeof resumeContent === "object" ? (resumeContent.personalInfo || {}) : {};
      const fullName = personalInfo.fullName || "Developer";

      const mockRoast = {
        roastScore: 42,
        roastLevel: "Brutally Charred",
        brutalIntro: `Well, ${fullName}, this resume reads like an outdated instruction manual for a VHS player. You’ve managed to load it with enough generic buzzwords to put a recruiter to sleep within three seconds. Let’s dissect this masterpiece of mediocrity.`,
        critiques: [
          {
            area: "Summary",
            insult: "Your professional summary claims you're a 'results-driven innovator.' The only result you've driven here is my desire to close this browser tab.",
            fix: "Delete the generic adjectives. State exactly what stack you use, what scale you built for, and back it up with a real product metric."
          },
          {
            area: "Experience",
            insult: "You 'wrote code and collaborated with squads.' Truly groundbreaking. My smart toaster also runs code and talks to my Wi-Fi router.",
            fix: "Rewrite bullet points using the X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]. Quantify every single experience row."
          },
          {
            area: "Skills",
            insult: "Listing 'Microsoft Word' and 'JSON' as technical skills is like listing 'breathing' on a health application. We expect you to know how to save a file.",
            fix: "Clean up the skills list. Remove generic computer usage terms. Group them logically into Languages, Frameworks, and Tools."
          },
          {
            area: "Formatting",
            insult: "Your date layout is a chaotic neutral alignment. Some are abbreviated, some use slashes, and some are just years. Did you generate this using a random number generator?",
            fix: "Format every timeline date to a consistent pattern, preferably 'Month Year' (e.g. January 2024)."
          }
        ],
        verdict: "A generic template holding generic achievements. Delete 50% of the buzzwords and rewrite with concrete numbers before applying anywhere."
      };

      return NextResponse.json({ success: true, data: mockRoast });
    }

    const systemPrompt = `You are a brutally honest, highly sarcastic tech recruiter and senior engineering manager.
You audit resumes and roast them with hilarious, meme-worthy, and biting commentary (similar to Twitter roasts or Reddit's r/resumes).
However, your critiques MUST also include a helpful, clear, and actionable "fix" to improve the candidate's odds.

Analyze the resume data and respond in a strict, single JSON format matching this schema:
{
  "roastScore": number (0 to 100, where lower means more roasted/worse),
  "roastLevel": string ("Brutally Charred" | "Crispy" | "Medium Rare"),
  "brutalIntro": "string (funny, savage paragraph detailing the candidate's general experience presentation)",
  "critiques": [
    {
      "area": "string ('Summary', 'Experience', 'Projects', 'Skills', or 'Formatting')",
      "insult": "string (brutal, funny, highly specific insult targeting the section's cliches or issues)",
      "fix": "string (action-oriented, constructive advice explaining how to improve it)"
    }
  ],
  "verdict": "string (concluding savage advice)"
}
Return only the raw JSON. Do not wrap in markdown blocks.`;

    const userPrompt = `Resume Title: ${resumeTitle}
Resume Content: ${typeof resumeContent === "string" ? resumeContent : JSON.stringify(resumeContent)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const analysis = JSON.parse(rawContent);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
