import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResumes, getDemoProfile } from "@/lib/supabase/demo";
import { getFactBankTextSummary, mergeWithDefaultFactBank } from "@/lib/factBank";

export async function POST(request: Request) {
  try {
    const { jobDescription, jobUrl, company, jobTitle, candidateContext } = await request.json();

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Please provide a job description (at least 50 characters)." },
        { status: 400 }
      );
    }

    const { openai, modelPro } = getAIClient();

    // 1. Fetch user's custom Fact Bank (with newly uploaded projects/skills) or fallback to default
    let customFactBank: any = null;
    try {
      if (await isDemoMode()) {
        const demo = getDemoProfile();
        if (demo?.fact_bank) customFactBank = demo.fact_bank;
        else if (demo?.resume_text) {
          try { customFactBank = JSON.parse(demo.resume_text); } catch {}
        }
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("fact_bank, resume_text")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.fact_bank) customFactBank = profile.fact_bank;
          else if (profile?.resume_text) {
            try { customFactBank = JSON.parse(profile.resume_text); } catch {}
          }
        }
      }
    } catch {}

    const activeFactBank = mergeWithDefaultFactBank(customFactBank);
    const verifiedFactBankText = getFactBankTextSummary(activeFactBank);

    // 2. Fetch any saved user resumes to supplement/match against
    let savedResumesText = "";
    try {
      if (await isDemoMode()) {
        const resumes = getDemoResumes();
        if (resumes && resumes.length > 0) {
          savedResumesText = resumes
            .slice(0, 3)
            .map((r: any) => `[Saved Resume: ${r.title}]\n${JSON.stringify(r.content || {}, null, 1)}`)
            .join("\n\n---\n\n");
        }
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: resumes } = await supabase
            .from("resumes")
            .select("title, content, role_family, is_master")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(5);

          if (resumes && resumes.length > 0) {
            savedResumesText = resumes
              .map((r: any) => {
                const c = r.content || {};
                const exp = (c.experience || []).map((e: any) =>
                  `${e.title} @ ${e.company} (${e.startDate}–${e.endDate}): ${(e.bullets || []).join("; ")}`
                ).join("\n");
                const proj = (c.projects || []).map((p: any) =>
                  `${p.name}: ${(p.bullets || []).join("; ")}`
                ).join("\n");
                const skills = (c.skills || []).map((s: any) => s.name || s).join(", ");
                const edu = (c.education || []).map((e: any) =>
                  `${e.degree} ${e.field} @ ${e.institution} (${e.graduationDate})`
                ).join("; ");
                return `[Saved Resume: ${r.title}${r.role_family ? ` | Family: ${r.role_family}` : ""}]\nEducation: ${edu}\nExperience:\n${exp}\nProjects:\n${proj}\nSkills: ${skills}`;
              })
              .join("\n\n---\n\n");
          }
        }
      }
    } catch {
      // non-fatal
    }

    const candidateProfileCorpus = candidateContext
      ? `${candidateContext}\n\n${verifiedFactBankText}`
      : `${verifiedFactBankText}${savedResumesText ? `\n\n=== SAVED RESUMES ===\n${savedResumesText}` : ""}`;

    const systemPrompt = `You are a rigorous, honest job-fit analyst for a fresher candidate (IIT Hyderabad B.Tech graduate, Chemical Engineering + Entrepreneurship double major, 0 years professional experience, targeting Data Analytics, Data Science, AI/ML, Software Engineering, Business Analytics, Consulting, Product Analytics roles).

Your analysis must be:
- Strictly evidence-based — never inflate fit scores
- Honest about disqualifiers — do not hide them
- Practical — tell the candidate exactly what matters

Return ONLY valid JSON matching this exact schema:
{
  "company": "string",
  "jobTitle": "string",
  "location": "string",
  "roleFamily": "data_analyst|data_scientist|ai_ml|sde|business_analytics|consulting|product|other",
  "experienceRequired": "string (e.g. 0-2 years, 3+ years, fresher)",
  "eligibility": "string (degree/CGPA/batch requirements if any)",
  "mandatoryRequirements": ["array of hard requirements"],
  "preferredQualifications": ["array of nice-to-haves"],
  "keySkills": ["skills extracted from JD"],
  "actualHiringPriorities": ["what employer really cares about, in order"],
  "matches": ["genuine matches with candidate's background — only real ones"],
  "partialMatches": ["areas where candidate has some but not full alignment"],
  "gaps": ["genuine gaps — skills/experience the candidate truly lacks"],
  "disqualifiers": ["potential hard blockers: experience gates, degree mismatch, location, work auth, etc."],
  "fitScore": 0-100,
  "verdict": "priority_apply|apply|apply_with_caution|skip",
  "verdictReason": "2-3 sentences: direct, honest reasoning for the verdict",
  "estimatedCTC": "string or null — only when reliable info available, label as estimate",
  "timeInvestment": "low|medium|high",
  "timeInvestmentReason": "1 sentence explaining effort level",
  "applicationStrategy": "2-3 sentences: how to approach this application",
  "bestResumeFamily": "data_analyst|data_scientist|ai_ml|sde|business_analytics|consulting|product|any",
  "atsKeywords": ["important keywords to include in resume/cover letter"]
}

Fit score guide:
- 85-100: Excellent match, strong candidate
- 70-84: Good match, competitive  
- 55-69: Partial match, worth trying
- 40-54: Weak match, significant gaps
- <40: Poor match, skip unless specific reason

Verdict guide:
- priority_apply: 70+ score, no hard disqualifiers, strong match
- apply: 55-69 score, manageable gaps, worth the effort
- apply_with_caution: 40-54 score or has potential disqualifiers
- skip: <40 score or hard disqualifier (experience gate, degree mismatch, etc.)`;

    const userPrompt = `Analyze this job and assess fit for the candidate.

JD URL: ${jobUrl || "Not provided"}
Company (if known): ${company || "Extract from JD"}
Title (if known): ${jobTitle || "Extract from JD"}

JOB DESCRIPTION:
${jobDescription.slice(0, 20000)}

CANDIDATE'S VERIFIED PROFILE & RESUMES (for comparison):
${candidateProfileCorpus}`;

    const response = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4096
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI analysis failed." }, { status: 500 });
    }

    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    const analysis = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error("JD analysis error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze job description." },
      { status: 500 }
    );
  }
}
