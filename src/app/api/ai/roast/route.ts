import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, getDemoResumes } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText } = await request.json().catch(() => ({}));

    let resumeContent: any = null;
    let resumeTitle = "";

    if (resumeId) {
      // 1. Try Supabase user resumes
      try {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: resume } = await supabase
            .from("resumes")
            .select("content, title")
            .eq("id", resumeId)
            .eq("user_id", user.id)
            .single();

          if (resume) {
            resumeContent = resume.content;
            resumeTitle = resume.title;
          }
        }
      } catch (err) {
        console.warn("Supabase lookup error:", err);
      }

      // 2. Try demo resume by ID
      if (!resumeContent) {
        const demoResume = getDemoResume(resumeId);
        if (demoResume) {
          resumeContent = demoResume.content;
          resumeTitle = demoResume.title;
        }
      }

      // 3. Try first demo resume
      if (!resumeContent) {
        const allDemo = getDemoResumes();
        if (allDemo.length > 0) {
          resumeContent = allDemo[0].content;
          resumeTitle = allDemo[0].title;
        }
      }
    }

    if (!resumeContent && resumeText && resumeText.trim().length > 0) {
      resumeContent = resumeText.trim();
      resumeTitle = "Uploaded Resume";
    }

    if (!resumeContent) {
      const allDemo = getDemoResumes();
      if (allDemo.length > 0) {
        resumeContent = allDemo[0].content;
        resumeTitle = allDemo[0].title;
      } else {
        resumeContent = "Experienced software engineer with React and Node experience.";
        resumeTitle = "Candidate Profile";
      }
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
        roastScore: 38,
        roastLevel: "Brutally Charred",
        brutalIntro: "This resume reads like an instruction manual for a discontinued device. You've managed to load it with enough generic buzzwords to put a recruiter to sleep within three seconds flat.",
        overallDiagnostic: {
          criticalCount: 3,
          majorCount: 2,
          minorCount: 1,
          topPriority: "Your experience bullets describe activities, not achievements. Rewrite every bullet using the X-Y-Z formula with real metrics from your work."
        },
        critiques: [
          {
            area: "Experience",
            categoryTag: "Impact Metrics",
            severity: "critical",
            insult: "You 'wrote code and collaborated with squads.' Truly groundbreaking. My smart fridge also runs code and talks to my Wi-Fi router — should it apply too?",
            quotedText: "Responsible for writing code and maintaining frontend and backend systems.",
            fix: "Rewrite every bullet using the X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]. Every line should contain at least one number.",
            beforeAfter: {
              before: "Responsible for writing code and maintaining frontend and backend systems.",
              after: "Maintained and shipped features across a React/Node.js stack serving the customer-facing dashboard, contributing to the frontend and backend codebase."
            }
          },
          {
            area: "Summary",
            categoryTag: "Buzzword Overload",
            severity: "critical",
            insult: "Your summary claims you're a 'results-driven self-starter leveraging agile methodologies to synergize cutting-edge tech stacks.' The only result driven here is the urge to close this browser tab immediately.",
            quotedText: "Dynamic, passionate, and results-driven self-starter with 6+ years of experience leveraging agile methodologies to synergize cutting-edge tech stacks",
            fix: "Delete every generic adjective. State exactly what you build, at what scale, and for whom. Lead with your strongest technical differentiator.",
            beforeAfter: {
              before: "Dynamic, passionate, and results-driven self-starter with 6+ years of experience leveraging agile methodologies to synergize cutting-edge tech stacks and drive digital transformation across enterprise squads.",
              after: "Full Stack Engineer with 6+ years building React/Node.js applications. Most recently led frontend architecture for a customer dashboard at Apex Cloud Technologies."
            }
          },
          {
            area: "Experience",
            categoryTag: "Quantification",
            severity: "critical",
            insult: "You 'optimized database queries and improved overall user interface feel.' Improved the feel? What does that even mean? Did you give the UI a massage?",
            quotedText: "Optimized database queries and improved overall user interface feel.",
            fix: "Replace vague claims with measurable outcomes. If you optimized queries, state the latency reduction. If you improved UX, cite the metric (load time, bounce rate, user satisfaction score).",
            beforeAfter: {
              before: "Optimized database queries and improved overall user interface feel.",
              after: "Optimized PostgreSQL queries for the analytics dashboard, reducing average page load time. Redesigned the settings UI based on internal feedback."
            }
          },
          {
            area: "Skills",
            categoryTag: "Skills Relevance",
            severity: "major",
            insult: "Listing 'Microsoft Office, Problem Solving, Communication' as core technical skills is like listing 'breathing' on a health insurance application. Every sentient human has these.",
            quotedText: "Microsoft Office, JIRA, Agile, Problem Solving, Communication",
            fix: "Remove soft skills and generic tools from your technical skills section. Group remaining skills logically: Languages, Frameworks, Cloud/Infra, Databases.",
            beforeAfter: {
              before: "Tools & Others: Git, GitHub, VS Code, Microsoft Office, JIRA, Agile, Problem Solving, Communication",
              after: "DevOps & Tools: Git, GitHub Actions, Docker, JIRA | Databases: MongoDB, PostgreSQL"
            }
          },
          {
            area: "Formatting",
            categoryTag: "Formatting",
            severity: "major",
            insult: "Your date formatting is 'Present' in one place, a year range in another, and your bullet structure looks like it was assembled during a turbulent flight. Consistency called — you didn't answer.",
            quotedText: "(2022 - Present)",
            fix: "Standardize all dates to a consistent format (e.g., 'Jan 2022 – Present'). Use the same bullet style, indentation, and punctuation across every section.",
            beforeAfter: {
              before: "(2022 - Present)",
              after: "Jan 2022 – Present"
            }
          },
          {
            area: "Experience",
            categoryTag: "Missing Context",
            severity: "minor",
            insult: "You 'worked on various client projects.' Which projects? For which clients? Doing what, exactly? This is the resume equivalent of saying 'I did stuff at places.'",
            quotedText: "Worked on various client projects using React, Node.js, and MongoDB.",
            fix: "Replace vague descriptions with specific project scope, your role, and the outcome. Name the type of product even if you can't name the client.",
            beforeAfter: {
              before: "Worked on various client projects using React, Node.js, and MongoDB.",
              after: "Built and shipped a real-time analytics dashboard for an enterprise client using React, Node.js, and MongoDB."
            }
          }
        ],
        verdict: "A generic template holding generic achievements with zero evidence of impact. Delete 50% of the buzzwords, add real numbers to every bullet, and remove 'Problem Solving' from your skills section before applying anywhere that pays above minimum wage."
      };

      return NextResponse.json({ success: true, data: mockRoast });
    }

    const systemPrompt = `You are a brutally honest, highly sarcastic senior tech recruiter and engineering director who has reviewed 50,000+ resumes.
You roast resumes with hilarious, meme-worthy, and biting commentary — but every roast is backed by genuinely useful, specific, actionable career advice.

CRITICAL RULES:
1. Every critique MUST reference a specific phrase, bullet, or pattern from the actual resume provided.
2. The "after" rewrite MUST use ONLY information present in the resume. NEVER invent metrics, skills, companies, projects, or achievements that don't exist in the original text. Restructure and clarify what's already there.
3. If the resume lacks quantifiable metrics, the "after" should acknowledge this honestly (e.g., "Built X feature" rather than fabricating "increased revenue by 40%").
4. Never include the candidate's name, email, phone number, or any personally identifiable information in the brutalIntro or verdict.

Respond in a STRICT JSON object matching this schema:
{
  "roastScore": number (0 to 100, where lower = more flawed. Be harsh but fair: a mediocre resume is 30-45, a decent one is 50-65, a strong one is 70-85),
  "roastLevel": "Brutally Charred" | "Crispy" | "Medium Rare" | "Lightly Toasted",
  "brutalIntro": string (savage, hilarious 2-3 sentence opener. Do NOT mention the candidate's name or any PII. Focus on the resume's writing quality and structure),
  "overallDiagnostic": {
    "criticalCount": number (issues that would likely cause immediate rejection),
    "majorCount": number (issues that significantly weaken the application),
    "minorCount": number (polish items that would improve presentation),
    "topPriority": string (the single most impactful thing to fix first, in 1-2 sentences)
  },
  "critiques": [
    {
      "area": string ("Summary" | "Experience" | "Projects" | "Skills" | "Education" | "Formatting"),
      "categoryTag": string ("Impact Metrics" | "Buzzword Overload" | "Formatting" | "Narrative Structure" | "Skills Relevance" | "Missing Context" | "Quantification" | "ATS Compatibility"),
      "severity": "critical" | "major" | "minor",
      "insult": string (sarcastic, specific critique targeting the exact flaw),
      "quotedText": string (the exact phrase or bullet from the resume being critiqued),
      "fix": string (constructive, high-leverage advice to immediately improve this),
      "beforeAfter": {
        "before": string (the exact original text from the resume),
        "after": string (a rewritten version using ONLY facts present in the resume — never fabricate)
      }
    }
  ],
  "verdict": string (closing savage summary verdict, 2-3 sentences. No PII.)
}

Generate 5-7 critiques, prioritized: critical issues first, then major, then minor.
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
      max_tokens: 1800
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
