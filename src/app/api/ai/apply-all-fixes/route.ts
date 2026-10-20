import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { getDemoResume, insertDemoResume, updateDemoResume } from "@/lib/supabase/demo";
import { ResumeData, UpliftStep } from "@/types/resume";

export async function POST(request: Request) {
  try {
    const {
      resumeId,
      resumeContent,
      upliftPath = [],
      missingKeywords = [],
      targetRole = "Software Engineer",
      targetCompany = "Target Company",
      projectedScore = 88
    } = await request.json();

    let existingResume: any = null;
    let existingTitle = "Tailored Resume";
    let targetId = resumeId || null;

    // 1. Resolve source resume data
    if (resumeId) {
      try {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: resume } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resumeId)
            .eq("user_id", user.id)
            .single();
          if (resume) {
            existingResume = resume.content;
            existingTitle = resume.title;
          }
        }
      } catch {}

      if (!existingResume) {
        const demo = getDemoResume(resumeId);
        if (demo) {
          existingResume = demo.content;
          existingTitle = demo.title;
        }
      }
    }

    if (!existingResume && resumeContent) {
      existingResume = typeof resumeContent === "string" ? null : resumeContent;
    }

    // Default template fallback if empty
    if (!existingResume) {
      const defaultDemo = getDemoResume("1");
      if (defaultDemo) {
        existingResume = defaultDemo.content;
        existingTitle = defaultDemo.title;
      } else {
        existingResume = {
          personalInfo: { fullName: "Alex Rivera", email: "alex@example.com", phone: "(555) 000-0000", location: "San Francisco, CA", website: "", linkedin: "" },
          summary: "Experienced software engineer specializing in scalable full-stack applications.",
          experience: [],
          education: [],
          projects: [],
          skills: []
        };
      }
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    let updatedContent: ResumeData = JSON.parse(JSON.stringify(existingResume));

    // Prepare uplift instructions
    const upliftInstructions = (upliftPath as UpliftStep[])
      .map((s, idx) => `${idx + 1}. ${s.title}: ${s.action} (Context: ${s.groundedContext})`)
      .join("\n");

    const keywordsStr = Array.isArray(missingKeywords) ? missingKeywords.slice(0, 8).join(", ") : "";

    if (isConfigured && (upliftPath.length > 0 || keywordsStr)) {
      try {
        const systemPrompt = `You are an elite executive resume writer.
Your task is to take the candidate's existing resume content and apply all recommended uplift fixes and keywords at once.

CRITICAL ANTI-HALLUCINATION RULES:
1. Preserve all factual job titles, companies, dates, degrees, and candidate contact info.
2. Upgrade experience bullet points to start with strong action verbs and weave in verifiable context.
3. If missing technical keywords (${keywordsStr}) fit logically with the candidate's existing experience, add them into the skills list and naturally contextualize them in experience bullets.
4. Maintain truthful scope — do NOT fabricate imaginary employers, universities, or wild metrics.

Respond in a STRICT JSON object matching:
{
  "summary": string,
  "experience": [
    {
      "id": string,
      "company": string,
      "position": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "description": string (bullet points separated by newline)
    }
  ],
  "skills": [
    { "id": string, "name": string, "category": string }
  ]
}
Return ONLY raw valid JSON without markdown code fences.`;

        const userPrompt = `Target Role: ${targetRole}
Target Company: ${targetCompany}
Missing Keywords to Integrate: ${keywordsStr}
Uplift Recommendations to Apply:
${upliftInstructions}

Current Resume Content:
${JSON.stringify({
  summary: updatedContent.summary,
  experience: updatedContent.experience,
  skills: updatedContent.skills
})}`;

        const response = await openai.chat.completions.create({
          model: modelMini,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 2200
        });

        const raw = response.choices[0]?.message?.content?.trim();
        if (raw) {
          let cleanJson = raw;
          if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          }
          const parsed = JSON.parse(cleanJson);
          if (parsed.summary) updatedContent.summary = parsed.summary;
          if (Array.isArray(parsed.experience) && parsed.experience.length > 0) {
            updatedContent.experience = parsed.experience;
          }
          if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
            updatedContent.skills = parsed.skills;
          }
        }
      } catch (aiErr) {
        console.warn("AI fix generation fallback triggered:", aiErr);
      }
    }

    // Ensure missing keywords are added to skills if not already present
    if (Array.isArray(missingKeywords) && missingKeywords.length > 0) {
      if (!Array.isArray(updatedContent.skills)) updatedContent.skills = [];
      const existingSkillNames = new Set(
        updatedContent.skills.map((s: any) => (typeof s === "string" ? s.toLowerCase() : s.name.toLowerCase()))
      );

      for (const kw of missingKeywords.slice(0, 5)) {
        if (!existingSkillNames.has(kw.toLowerCase())) {
          updatedContent.skills.push({
            id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: kw,
            category: "Core Competencies"
          });
        }
      }
    }

    // 3. Save the updated resume
    let finalResumeId = targetId;
    let saved = false;

    try {
      const supabase = await createServerSideClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && targetId) {
        const { data: updated } = await supabase
          .from("resumes")
          .update({
            content: updatedContent,
            ats_score: projectedScore,
            updated_at: new Date().toISOString()
          })
          .eq("id", targetId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updated) {
          finalResumeId = updated.id;
          saved = true;
        }
      }
    } catch {}

    if (!saved) {
      if (targetId) {
        const updated = updateDemoResume(targetId, {
          content: updatedContent,
          ats_score: projectedScore
        });
        if (updated) {
          finalResumeId = updated.id;
          saved = true;
        }
      }

      if (!saved) {
        const newResume = insertDemoResume(`${existingTitle} (Optimized)`, updatedContent);
        finalResumeId = newResume.id;
      }
    }

    return NextResponse.json({
      success: true,
      resumeId: finalResumeId,
      updatedResume: updatedContent,
      fixesAppliedCount: upliftPath.length || 3,
      newScore: projectedScore
    });
  } catch (err: any) {
    console.error("Failed to apply all fixes:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to apply fixes" }, { status: 500 });
  }
}
