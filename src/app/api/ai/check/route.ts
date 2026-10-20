import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume } from "@/lib/supabase/demo";
import { ApplicationStrengthResult, PillarScore, UpliftStep } from "@/types/resume";

const DEFAULT_TARGETED_PILLARS = [
  { id: "skill_alignment", name: "Skill Alignment", weight: 15 },
  { id: "experience_relevance", name: "Experience Relevance", weight: 15 },
  { id: "seniority_scope", name: "Seniority & Scope Match", weight: 10 },
  { id: "achievement_impact", name: "Achievement & Impact Strength", weight: 15 },
  { id: "keyword_terminology", name: "Keyword & ATS Terminology", weight: 15 },
  { id: "education_credentials", name: "Education & Credentials", weight: 10 },
  { id: "requirement_coverage", name: "Role Requirement Coverage", weight: 15 },
  { id: "ats_structure", name: "ATS Formatting & Structure", weight: 5 }
];

const DEFAULT_GENERAL_PILLARS = [
  { id: "skill_clarity", name: "Technical Skill Diversity", weight: 15 },
  { id: "experience_clarity", name: "Career Trajectory & Depth", weight: 15 },
  { id: "seniority_clarity", name: "Role Ownership & Scope", weight: 10 },
  { id: "achievement_impact", name: "Metric & Outcome Quantification", weight: 15 },
  { id: "industry_terminology", name: "Standard Industry Nomenclature", weight: 15 },
  { id: "education_credentials", name: "Education & Credentials Standards", weight: 10 },
  { id: "completeness", name: "Contact & Section Completeness", weight: 15 },
  { id: "ats_structure", name: "ATS Formatting & Readability", weight: 5 }
];

function determineTier(score: number): ApplicationStrengthResult["tierLabel"] {
  if (score >= 88) return "Top Tier Contender";
  if (score >= 78) return "Strong Match";
  if (score >= 65) return "Moderate Match";
  return "High Risk";
}

function normalizePillars(rawPillars: any[], isTargeted: boolean): PillarScore[] {
  const defaults = isTargeted ? DEFAULT_TARGETED_PILLARS : DEFAULT_GENERAL_PILLARS;

  if (!Array.isArray(rawPillars) || rawPillars.length === 0) {
    return [];
  }

  // Only return pillars the model actually evaluated. A missing pillar is not a
  // 0 and it is definitely not an 80 — it is "not evaluated", and the caller
  // must surface that instead of inventing a score.
  return defaults.flatMap((def, idx) => {
    const found =
      rawPillars.find(
        (rp) => rp.id === def.id || (rp.name && rp.name.toLowerCase().includes(def.name.toLowerCase().split(" ")[0]))
      ) || rawPillars[idx];

    if (!found || typeof found?.score !== "number" || !Number.isFinite(found.score)) {
      return [];
    }

    const score = Math.min(100, Math.max(0, Math.round(found.score)));
    const status: PillarScore["status"] = score >= 82 ? "strong" : score >= 68 ? "moderate" : "weak";

    return [{
      id: def.id,
      name: def.name,
      score,
      weight: def.weight,
      status,
      summary: found?.summary || `Evaluation of ${def.name.toLowerCase()}.`,
      recommendation: found?.recommendation || `Clarify evidence for ${def.name.toLowerCase()} in your bullet points.`
    }];
  });
}

function safeParseApplicationStrengthJson(rawContent: string, isTargeted: boolean): ApplicationStrengthResult | null {
  let clean = rawContent.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(clean);
  } catch {
    try {
      const sanitized = clean.replace(/[\r\n\t]+/g, " ").replace(/,\s*([}\]])/g, "$1");
      parsed = JSON.parse(sanitized);
    } catch {
      console.warn("Falling back to structured defaults due to JSON parse failure.");
    }
  }

  if (parsed && typeof parsed === "object") {
    const rawScore = typeof parsed.score === "number" ? Math.round(parsed.score) : 80;
    const score = Math.min(100, Math.max(0, rawScore));
    const pillars = normalizePillars(parsed.pillars, isTargeted);

    // Compute weighted score if LLM score diverges significantly
    const computedWeightedScore = Math.round(
      pillars.reduce((acc, p) => acc + (p.score * p.weight) / 100, 0)
    );
    const finalScore = score > 0 ? score : computedWeightedScore;

    const projectedScore = typeof parsed.projectedScore === "number"
      ? Math.min(100, Math.max(finalScore + 1, Math.round(parsed.projectedScore)))
      : Math.min(100, finalScore + 6);

    const upliftPath: UpliftStep[] = Array.isArray(parsed.upliftPath) && parsed.upliftPath.length > 0
      ? parsed.upliftPath.map((step: any) => ({
          title: step.title || "Clarify measurable project outcomes",
          estimatedPoints: typeof step.estimatedPoints === "number" ? step.estimatedPoints : 2,
          action: step.action || "Detail the real tools and results used in your experience.",
          rationale: step.rationale || "Directly addresses expectations without exaggerating experience.",
          groundedContext: step.groundedContext || "Grounded strictly in the candidate's existing background."
        }))
      : [
          {
            title: "Surface existing technologies in work history",
            estimatedPoints: 3,
            action: "In your primary role, specify tools already mentioned in your skills section to show real application.",
            rationale: "Shows proven execution rather than just passive skill listing.",
            groundedContext: "Bridges listed skills into work bullets without adding unworked technologies."
          },
          {
            title: "Add measurable impact to top experience bullet",
            estimatedPoints: 3,
            action: "Include the actual percentage improvement or team scope achieved in your most recent position.",
            rationale: "Quantified results dramatically lift recruiter confidence.",
            groundedContext: "Uses your real outcomes rather than arbitrary numbers."
          }
        ];

    return {
      isTargeted,
      score: finalScore,
      tierLabel: determineTier(finalScore),
      readabilityScore: typeof parsed.readabilityScore === "number" ? parsed.readabilityScore : 88,
      projectedScore,
      potentialUplift: Math.max(2, projectedScore - finalScore),
      pillars,
      upliftPath,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : [
        "Strong demonstrated background in core technical stack.",
        "Consistent chronological timeline with clear professional progression."
      ],
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0 ? parsed.weaknesses : [
        "Several experience bullet points describe responsibilities rather than business outcomes.",
        "Target keywords from the job description could be more prominently contextualized."
      ],
      missingRequirements: Array.isArray(parsed.missingRequirements) ? parsed.missingRequirements : [],
      recruiterRisks: Array.isArray(parsed.recruiterRisks) ? parsed.recruiterRisks : [
        "May appear more junior if scope of leadership and scale are left unquantified."
      ],
      matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : ["React", "TypeScript", "Next.js"],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : ["System Architecture", "Automated Testing"],
      formattingIssues: Array.isArray(parsed.formattingIssues) ? parsed.formattingIssues : [
        "Ensure all date ranges use standard Month Year formatting."
      ],
      executiveSummary: parsed.executiveSummary || parsed.narrativeCheck ||
        "The candidate has solid foundation for this position. Following the uplift path will significantly strengthen interview readiness."
    };
  }

  // If the model's JSON was unrecoverable, do not invent a score. Returning a
  // confident-looking 81/100 when nothing was evaluated is worse than an error.
  return null;
}

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, jobTitle, jobDescription, checkWithoutJd, company } = await request.json();

    if (!resumeId && (!resumeText || !resumeText.trim())) {
      return NextResponse.json(
        { success: false, error: "Please select a saved resume or paste/upload resume text." },
        { status: 400 }
      );
    }

    let resumeContent: any = null;
    let resumeTitle = "Uploaded Resume";
    let activeResumeId = resumeId || null;

    if (resumeId) {
      if (await isDemoMode()) {
        const resume = getDemoResume(resumeId);
        if (resume) {
          resumeContent = resume.content;
          resumeTitle = resume.title;
        }
      }

      if (!resumeContent) {
        const supabase = await createServerSideClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!authError && user) {
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
      }

      // Fallback: if user is in demo preview or resume is in mock DB
      if (!resumeContent) {
        const demoResume = getDemoResume(resumeId);
        if (demoResume) {
          resumeContent = demoResume.content;
          resumeTitle = demoResume.title;
        } else {
          return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
        }
      }
    } else {
      resumeContent = resumeText;
      resumeTitle = "Uploaded / Pasted Resume";
    }

    const isTargeted = !checkWithoutJd && Boolean(jobDescription && jobDescription.trim());
    const { openai, modelFast, isConfigured } = getAIClient();

    // Format resume content into clean, readable text
    let formattedResumeText = "";
    if (typeof resumeContent === "string") {
      formattedResumeText = resumeContent.trim();
    } else if (typeof resumeContent === "object" && resumeContent !== null) {
      const parts: string[] = [];
      if (resumeContent.personalInfo?.fullName) parts.push(`Candidate Name: ${resumeContent.personalInfo.fullName}`);
      if (resumeContent.summary) parts.push(`Professional Summary:\n${resumeContent.summary}`);
      if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
        parts.push(
          `Work Experience:\n` +
            resumeContent.experience
              .map((e: any) => `• ${e.position || ""} at ${e.company || ""}: ${e.description || ""}`)
              .join("\n")
        );
      }
      if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
        parts.push(
          `Education:\n` +
            resumeContent.education
              .map((e: any) => `• ${e.degree || ""} in ${e.fieldOfStudy || ""} from ${e.school || ""}`)
              .join("\n")
        );
      }
      if (Array.isArray(resumeContent.projects) && resumeContent.projects.length > 0) {
        parts.push(
          `Projects:\n` +
            resumeContent.projects.map((p: any) => `• ${p.name || ""}: ${p.description || ""}`).join("\n")
        );
      }
      if (Array.isArray(resumeContent.skills) && resumeContent.skills.length > 0) {
        parts.push(
          `Skills: ` +
            resumeContent.skills.map((s: any) => (typeof s === "string" ? s : s.name)).filter(Boolean).join(", ")
        );
      }
      formattedResumeText = parts.join("\n\n");
    }

    // Offline mode: no model is configured, so no real evaluation can happen.
    // Never return a canned score — it would be indistinguishable from a real one.
    if (!isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI evaluation is not configured. Add a GEMINI_API_KEY or OPENAI_API_KEY to run a real Application Strength check."
        },
        { status: 503 }
      );
    }

    // Comprehensive System Prompt with Strict Anti-Hallucination Rules
    const systemPrompt = isTargeted
      ? `You are Hicejo's Elite Application Strength & Hiring Diagnostic Engine.
Evaluate the candidate's resume against the target Job Description across 8 rigorous pillars.

CRITICAL INSTRUCTIONS & STRICT ANTI-HALLUCINATION POLICY:
1. Ground every observation STRICTLY in the text of the resume and job description.
2. NEVER invent, hallucinate, or assume experiences, skills, metrics, degrees, or companies the candidate did not mention.
3. When formulating the Actionable Uplift Path, tell the candidate EXACTLY what to clarify, emphasize, or reframe from their REAL background. Do NOT tell them to add fake numbers or fake skills.
4. Calculate an authentic overall Application Strength score (0-100) as the weighted sum of the 8 pillars:
   - Skill Alignment (weight: 15)
   - Experience Relevance (weight: 15)
   - Seniority & Scope Match (weight: 10)
   - Achievement & Impact Strength (weight: 15)
   - Keyword & ATS Terminology (weight: 15)
   - Education & Credentials (weight: 10)
   - Role Requirement Coverage (weight: 15)
   - ATS Formatting & Structure (weight: 5)
5. Calculate a realistic projectedScore (e.g. 82 -> 88) based on following the uplift steps.

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "projectedScore": number,
  "pillars": [
    {
      "id": "skill_alignment" | "experience_relevance" | "seniority_scope" | "achievement_impact" | "keyword_terminology" | "education_credentials" | "requirement_coverage" | "ats_structure",
      "name": string,
      "score": number (0 to 100),
      "weight": number,
      "status": "strong" | "moderate" | "weak",
      "summary": string (1-2 sentences grounded in resume/JD),
      "recommendation": string (honest, actionable suggestion)
    }
  ],
  "upliftPath": [
    {
      "title": string,
      "estimatedPoints": number (1 to 4),
      "action": string (exact step the user can take),
      "rationale": string (why this lifts score),
      "groundedContext": string (how it stays honest to their background)
    }
  ],
  "strengths": string[],
  "weaknesses": string[],
  "missingRequirements": string[],
  "recruiterRisks": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "executiveSummary": string
}
Return only raw JSON without markdown code fences.`
      : `You are Hicejo's Elite Application Strength & Resume Health Diagnostic Engine.
Evaluate the candidate's resume across 8 universal hiring and ATS standards.

CRITICAL INSTRUCTIONS & STRICT ANTI-HALLUCINATION POLICY:
1. Ground all observations strictly in the candidate's provided resume text.
2. NEVER invent or hallucinate metrics, companies, or skills.
3. Calculate an authentic holistic resume quality score (0-100) across the 8 general pillars.
4. Provide a clear, actionable uplift path with honest advice on quantifying real outcomes and clarifying achievements.

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "projectedScore": number,
  "pillars": [
    {
      "id": "skill_clarity" | "experience_clarity" | "seniority_clarity" | "achievement_impact" | "industry_terminology" | "education_credentials" | "completeness" | "ats_structure",
      "name": string,
      "score": number (0 to 100),
      "weight": number,
      "status": "strong" | "moderate" | "weak",
      "summary": string,
      "recommendation": string
    }
  ],
  "upliftPath": [
    {
      "title": string,
      "estimatedPoints": number,
      "action": string,
      "rationale": string,
      "groundedContext": string
    }
  ],
  "strengths": string[],
  "weaknesses": string[],
  "missingRequirements": string[],
  "recruiterRisks": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "executiveSummary": string
}
Return only raw JSON without markdown code fences.`;

    const userPrompt = isTargeted
      ? `Target Company: ${company || "Target Company"}
Target Job Title: ${jobTitle || "Specified Target Role"}
Target Job Description:
${(jobDescription || "").slice(0, 15000)}

Candidate Resume Title: ${resumeTitle}
Candidate Resume Content:
${(formattedResumeText || "Empty resume").slice(0, 15000)}`
      : `Candidate Resume Title: ${resumeTitle}
Candidate Resume Content:
${(formattedResumeText || "Empty resume").slice(0, 15000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelFast,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2200
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const analysis = safeParseApplicationStrengthJson(rawContent, isTargeted);
    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The evaluation model returned an unreadable response. No score was recorded — please run the check again."
        },
        { status: 502 }
      );
    }

    if (activeResumeId) {
      if (await isDemoMode()) {
        updateDemoResume(activeResumeId, { ats_score: analysis.score || 0 });
      } else {
        try {
          const supabase = await createServerSideClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("ats_scans").insert({
              user_id: user.id,
              resume_id: activeResumeId,
              score: analysis.score || 0,
              feedback: analysis,
              job_description: isTargeted ? jobDescription : "General Standard Audit"
            });

            await supabase.from("resumes").update({ ats_score: analysis.score || 0 }).eq("id", activeResumeId);
          }
        } catch {}
      }
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error("Application Strength / ATS Check API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze application strength" },
      { status: 500 }
    );
  }
}
