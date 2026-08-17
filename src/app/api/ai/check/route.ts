import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, jobTitle, jobDescription, checkWithoutJd } = await request.json();

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
      resumeTitle = "Uploaded / Pasted Resume";
    }

    const isGeneralAudit = checkWithoutJd || !jobDescription || !jobDescription.trim();
    const { openai, modelPro, isConfigured } = getAIClient();

    // Fallback if AI key is missing
    if (!isConfigured) {
      const matched = ["TypeScript", "Next.js", "React", "CSS", "Tailwind"];
      const missing = isGeneralAudit
        ? ["Quantified Metrics (% / $)", "Action Verbs", "Project Links", "Certifications"]
        : ["Docker", "Kubernetes", "System Design", "Unit Testing (Jest)", "REST APIs"];
      const score = Math.floor(Math.random() * 15) + 72;

      const mockResult = {
        score,
        readabilityScore: 85,
        matchedKeywords: matched,
        missingKeywords: missing,
        formattingIssues: [
          "Professional Summary is missing clear quantified metrics and impact.",
          "Ensure work experience bullets start with strong past-tense action verbs.",
          "Make sure contact details include an active LinkedIn or portfolio link."
        ],
        narrativeCheck: isGeneralAudit
          ? "Your resume demonstrates solid foundational technical skills. To improve ATS parsing, incorporate more quantified metrics in each bullet point and ensure standard section headings."
          : `The experience bullet points demonstrate good familiarity with frontend technologies, but can be aligned more closely with the target role requirements.`
      };

      if (activeResumeId) {
        if (isDemoMode()) {
          updateDemoResume(activeResumeId, { ats_score: mockResult.score });
        } else {
          try {
            const supabase = await createServerSideClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from("ats_scans").insert({
                user_id: user.id,
                resume_id: activeResumeId,
                score: mockResult.score,
                feedback: mockResult,
                job_description: isGeneralAudit ? "General ATS Audit" : jobDescription
              });
              await supabase.from("resumes").update({ ats_score: mockResult.score }).eq("id", activeResumeId);
            }
          } catch {}
        }
      }

      return NextResponse.json({ success: true, data: mockResult });
    }

    const systemPrompt = isGeneralAudit
      ? `You are an expert Applicant Tracking System (ATS) auditing engine and executive recruiter.
Perform a comprehensive general ATS compliance and resume quality audit on the candidate's resume (without a specific job description).
Evaluate:
1. Overall ATS Compatibility Score (0 to 100) based on ATS parseability, standard headers (Summary, Experience, Education, Skills), dates, contact info.
2. Readability Score (0 to 100) based on typography structure, bullet length, clarity, and conciseness.
3. Matched core strengths and key skills identified in the resume.
4. Missing best-practice elements (e.g., quantified metrics, action verbs, leadership keywords, links).
5. Formatting & structural issues (e.g. non-standard dates, missing metrics, passive voice, weak summaries).
6. Narrative critique & recommendations (2-3 actionable sentences on how to elevate the resume).

You MUST respond in a strict, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "narrativeCheck": string
}
Return only the raw JSON. Do not wrap in markdown \`\`\`json blocks.`
      : `You are a recruitment Applicant Tracking System (ATS) matching engine.
Compare the candidate's resume content with the provided target job description.
Analyze for:
1. Keyword match rate (important coding languages, frameworks, concepts).
2. Missing keywords required for the role.
3. Readability score (structure, section headers, spacing clarity).
4. Structural formatting violations (invalid dates, missing contact, length anomalies).
5. Narrative review (action verbs, metrics, tone).

You MUST respond in a strict, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "narrativeCheck": string (2-3 sentences critiquing metrics and impact)
}
Return only the raw JSON. Do not wrap in markdown \`\`\`json blocks.`;

    const userPrompt = isGeneralAudit
      ? `Resume Title: ${resumeTitle}
Resume Details: ${typeof resumeContent === "object" ? JSON.stringify(resumeContent) : resumeContent}`
      : `Resume Title: ${resumeTitle}
Resume Details: ${typeof resumeContent === "object" ? JSON.stringify(resumeContent) : resumeContent}

Target Job Title: ${jobTitle || "Not specified"}
Target Job Description: ${jobDescription}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const analysis = JSON.parse(rawContent);

    if (activeResumeId) {
      if (isDemoMode()) {
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
              job_description: isGeneralAudit ? "General ATS Audit" : jobDescription
            });

            await supabase
              .from("resumes")
              .update({ ats_score: analysis.score || 0 })
              .eq("id", activeResumeId);
          }
        } catch {}
      }
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error("ATS Check API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
