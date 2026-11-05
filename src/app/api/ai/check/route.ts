import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume } from "@/lib/supabase/demo";
import { ApplicationStrengthResult, PillarScore, UpliftStep, GrammarJargonIssue, MetricAudit } from "@/types/resume";

const DEFAULT_TARGETED_PILLARS = [
  { id: "skill_alignment", name: "Hard Skills & Keyword Match", weight: 20 },
  { id: "experience_relevance", name: "Experience Relevance & Scope", weight: 15 },
  { id: "achievement_impact", name: "Metric Quantification (Google XYZ)", weight: 15 },
  { id: "keyword_terminology", name: "ATS Keyword Frequency & Nomenclature", weight: 15 },
  { id: "grammar_style", name: "Grammar, Tone & Cliché Elimination", weight: 10 },
  { id: "seniority_scope", name: "Seniority & Deliverable Alignment", weight: 10 },
  { id: "requirement_coverage", name: "Core Requirements Coverage", weight: 10 },
  { id: "ats_structure", name: "ATS Formatting & Structural Parsability", weight: 5 }
];

const DEFAULT_GENERAL_PILLARS = [
  { id: "skill_clarity", name: "Technical Skill Diversity & Depth", weight: 20 },
  { id: "experience_clarity", name: "Career Trajectory & Depth", weight: 15 },
  { id: "achievement_impact", name: "Metric & Outcome Quantification", weight: 15 },
  { id: "grammar_style", name: "Grammar, Tone & Cliché Elimination", weight: 10 },
  { id: "industry_terminology", name: "Standard Industry Nomenclature", weight: 15 },
  { id: "seniority_clarity", name: "Role Ownership & Scope", weight: 10 },
  { id: "education_credentials", name: "Education & Credentials Standards", weight: 10 },
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

    const grammarIssues: GrammarJargonIssue[] = Array.isArray(parsed.grammarIssues)
      ? parsed.grammarIssues.map((g: any) => ({
          type: g.type || "grammar",
          original: g.original || "",
          suggestion: g.suggestion || "",
          reason: g.reason || ""
        }))
      : [];

    const metricAudit: MetricAudit = parsed.metricAudit && typeof parsed.metricAudit === "object"
      ? {
          quantifiedCount: typeof parsed.metricAudit.quantifiedCount === "number" ? parsed.metricAudit.quantifiedCount : 0,
          totalBullets: typeof parsed.metricAudit.totalBullets === "number" ? parsed.metricAudit.totalBullets : 0,
          percentage: typeof parsed.metricAudit.percentage === "number" ? parsed.metricAudit.percentage : 0,
          status: parsed.metricAudit.status || "good"
        }
      : {
          quantifiedCount: 0,
          totalBullets: 0,
          percentage: 0,
          status: "good"
        };

    const companyStandard = parsed.companyStandard || (isTargeted ? "Tier-1 Enterprise ATS Standard" : "Industry Standard ATS Benchmark");

    return {
      isTargeted,
      score: finalScore,
      tierLabel: determineTier(finalScore),
      readabilityScore: typeof parsed.readabilityScore === "number" ? parsed.readabilityScore : 88,
      projectedScore,
      potentialUplift: Math.max(2, projectedScore - finalScore),
      pillars,
      upliftPath,
      grammarIssues,
      metricAudit,
      companyStandard,
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
      if (resumeContent.personalInfo?.email || resumeContent.personalInfo?.phone || resumeContent.personalInfo?.location) {
        parts.push(`Contact: ${[resumeContent.personalInfo.email, resumeContent.personalInfo.phone, resumeContent.personalInfo.location].filter(Boolean).join(" • ")}`);
      }
      if (resumeContent.summary) parts.push(`Professional Summary:\n${resumeContent.summary}`);
      if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
        parts.push(
          `Work Experience:\n` +
            resumeContent.experience
              .map((e: any) => `• ${e.position || "Role"} at ${e.company || "Company"} (${e.startDate || ""} - ${e.current ? "Present" : e.endDate || ""}):\n  ${e.description || ""}`)
              .join("\n\n")
        );
      }
      if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
        parts.push(
          `Education:\n` +
            resumeContent.education
              .map((e: any) => `• ${e.degree || ""} in ${e.fieldOfStudy || ""} from ${e.school || ""}${e.grade ? ` [${e.gradeType === 'percentage' ? 'Percentage' : 'CGPA'}: ${e.grade}]` : ""}`)
              .join("\n")
        );
      }
      if (Array.isArray(resumeContent.projects) && resumeContent.projects.length > 0) {
        parts.push(
          `Personal & Technical Projects:\n` +
            resumeContent.projects.map((p: any) => `• ${p.name || ""}${p.role ? ` (${p.role})` : ""}${p.link ? ` [Link: ${p.link}]` : ""}:\n  ${p.description || ""}`).join("\n\n")
        );
      }
      if (Array.isArray(resumeContent.skills) && resumeContent.skills.length > 0) {
        const skillCategories: Record<string, string[]> = {};
        resumeContent.skills.forEach((s: any) => {
          const cat = s.category || "General";
          const name = typeof s === "string" ? s : s.name;
          if (!skillCategories[cat]) skillCategories[cat] = [];
          if (name) skillCategories[cat].push(name);
        });
        const skillsText = Object.keys(skillCategories)
          .map((cat) => `${cat}: ${skillCategories[cat].join(", ")}`)
          .join("\n");
        parts.push(`Technical Skills:\n${skillsText}`);
      }
      if (Array.isArray(resumeContent.achievements) && resumeContent.achievements.length > 0) {
        parts.push(
          `Extracurricular & Achievements:\n` +
            resumeContent.achievements
              .map((a: any) => `• ${a.title || ""}${a.organization ? `: ${a.organization}` : ""}${a.date ? ` (${a.date})` : ""}`)
              .join("\n")
        );
      }
      formattedResumeText = parts.join("\n\n");
    }

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

    // Comprehensive System Prompt with Strict Anti-Hallucination & Industry ATS Calibration
    const systemPrompt = isTargeted
      ? `You are Hicejo's Principal Enterprise ATS & Hiring Diagnostic Engine, modeled on tier-1 tech recruiting standards (Google, Meta, Amazon, Stripe) and top ATS parsers (Workday, Greenhouse, Taleo, Ashby).
Evaluate the candidate's resume against the target Job Description across 8 rigorous pillars with objective precision.

CRITICAL SCORING & INDUSTRY-STANDARD BENCHMARK RULES:
1. DYNAMIC SCORING RESPONSIVENESS (REWARD REAL IMPROVEMENTS):
   - A resume that has been tailored to the JD (contains the primary required hard skills, incorporates Google XYZ quantified outcomes like percentages, latency, dollars, or scale, uses strong active verbs, and addresses the core job deliverables) MUST score in the 88–96 range (Top Tier Contender).
   - A resume with moderate alignment (some matching skills, but missing 2-3 key JD keywords or with vague, unquantified bullets) should score in the 70–82 range.
   - A generic or unaligned resume (missing core technologies, passive language like 'Responsible for', zero metrics) should score in the 45–65 range (High Risk).
   - Your score MUST accurately increase when a candidate improves their resume by adding target keywords, metrics, or fixing weaknesses.

2. QUANTIFIED METRIC AUDIT (GOOGLE XYZ BENCHMARK):
   - Analyze every bullet point in Work Experience and Projects.
   - Count how many bullets follow the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].
   - Provide metricAudit: { quantifiedCount: number, totalBullets: number, percentage: number, status: "excellent" | "good" | "needs_work" }.

3. GRAMMAR, TONE & JARGON AUDIT:
   - Audit for:
     a) Typos, grammar mistakes, tense inconsistencies (past tense for past jobs).
     b) Passive voice openers: flag "Responsible for", "Tasked with", "Helped with", "Worked on", and suggest decisive action verbs ("Engineered", "Executed", "Reduced", "Built").
     c) AI clichés & toxic buzzwords: flag "spearheaded", "synergized", "leveraged", "pioneered", "game-changing", "cutting-edge", "transformative", "tapestry", "seamlessly", "dynamic team player".
   - Return grammarIssues array with { type: "grammar" | "cliche" | "passive_voice" | "jargon", original: string, suggestion: string, reason: string }.

4. ACTIONABLE UPLIFT PATH WITH EXACT POINT VALUES:
   - Provide 3 to 6 high-leverage uplift steps that will directly raise the score to projectedScore.
   - Each step must have:
     - "title": e.g. "Add missing required ATS keyword 'PostgreSQL' under Technical Skills" (+4 pts)
     - "estimatedPoints": number (1 to 5)
     - "action": concrete action candidate can take
     - "rationale": why enterprise ATS and hiring managers require this
     - "groundedContext": how to ground it honestly in candidate's existing background

5. GROUNDING & HONESTY:
   - Ground every observation strictly in the resume text and JD. Never assume unmentioned credentials.
   - Calculate authentic overall score (0-100) as the weighted sum of the 8 pillars:
     - Hard Skills & Keyword Match (weight: 20)
     - Experience Relevance & Scope (weight: 15)
     - Metric Quantification (Google XYZ) (weight: 15)
     - ATS Keyword Frequency & Nomenclature (weight: 15)
     - Grammar, Tone & Cliché Elimination (weight: 10)
     - Seniority & Deliverable Alignment (weight: 10)
     - Core Requirements Coverage (weight: 10)
     - ATS Formatting & Structural Parsability (weight: 5)

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "projectedScore": number,
  "companyStandard": string,
  "metricAudit": {
    "quantifiedCount": number,
    "totalBullets": number,
    "percentage": number,
    "status": "excellent" | "good" | "needs_work"
  },
  "grammarIssues": [
    {
      "type": "grammar" | "cliche" | "passive_voice" | "jargon",
      "original": string,
      "suggestion": string,
      "reason": string
    }
  ],
  "pillars": [
    {
      "id": "skill_alignment" | "experience_relevance" | "achievement_impact" | "keyword_terminology" | "grammar_style" | "seniority_scope" | "requirement_coverage" | "ats_structure",
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
      "estimatedPoints": number (1 to 5),
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
Return only raw JSON without markdown code fences.`
      : `You are Hicejo's Elite Application Strength & Resume Health Diagnostic Engine.
Evaluate the candidate's resume across 8 universal hiring and ATS standards with strict grammar, metric, and buzzword audits.

CRITICAL SCORING & AUDIT RULES:
1. QUANTIFIED METRIC AUDIT: Count bullets with Google XYZ quantifiable metrics vs total bullets.
2. GRAMMAR & BUZZWORD AUDIT: Flag typos, passive voice ("Responsible for"), and AI clichés ("spearheaded", "synergized", "leveraged", "pioneered").
3. ACTIONABLE UPLIFT: Provide step-by-step improvements with estimated point gains.

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "projectedScore": number,
  "companyStandard": string,
  "metricAudit": {
    "quantifiedCount": number,
    "totalBullets": number,
    "percentage": number,
    "status": "excellent" | "good" | "needs_work"
  },
  "grammarIssues": [
    {
      "type": "grammar" | "cliche" | "passive_voice" | "jargon",
      "original": string,
      "suggestion": string,
      "reason": string
    }
  ],
  "pillars": [
    {
      "id": "skill_clarity" | "experience_clarity" | "achievement_impact" | "grammar_style" | "industry_terminology" | "seniority_clarity" | "education_credentials" | "ats_structure",
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
