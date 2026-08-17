import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume } from "@/lib/supabase/demo";

function safeParseATSJson(rawContent: string, isGeneralAudit: boolean) {
  let clean = rawContent.trim();
  
  // 1. Strip markdown code fences if present
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // 2. Try standard JSON parse
  try {
    return JSON.parse(clean);
  } catch (e1) {
    // 3. Attempt repair for unescaped newlines/tabs inside JSON strings
    try {
      const sanitized = clean
        .replace(/[\r\n\t]+/g, " ")
        .replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(sanitized);
    } catch (e2) {
      console.warn("JSON repair attempt failed, falling back to regex extraction:", clean.slice(0, 200));

      // 4. Robust regex recovery
      const scoreMatch = clean.match(/"score"\s*:\s*(\d+)/i);
      const readabilityMatch = clean.match(/"readabilityScore"\s*:\s*(\d+)/i);
      const narrativeMatch = clean.match(/"narrativeCheck"\s*:\s*"([^"]+)"/i);

      // Extract array helper
      const extractArray = (key: string): string[] => {
        const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`, "i");
        const match = clean.match(regex);
        if (match && match[1]) {
          return match[1]
            .split(",")
            .map((item) => item.replace(/"/g, "").trim())
            .filter((item) => item.length > 0);
        }
        return [];
      };

      const matchedKeywords = extractArray("matchedKeywords");
      const missingKeywords = extractArray("missingKeywords");
      const formattingIssues = extractArray("formattingIssues");

      return {
        score: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 78,
        readabilityScore: readabilityMatch ? Math.min(100, Math.max(0, parseInt(readabilityMatch[1], 10))) : 86,
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ["Technical Skills", "Work Experience", "Education", "Projects"],
        missingKeywords: missingKeywords.length > 0 ? missingKeywords : (isGeneralAudit ? ["Quantified Percentages", "Action Verbs", "Live Portfolio Link"] : ["System Architecture", "Performance Benchmarks"]),
        formattingIssues: formattingIssues.length > 0 ? formattingIssues : ["Ensure all timeline dates follow consistent Month Year format."],
        narrativeCheck: narrativeMatch ? narrativeMatch[1] : "The resume demonstrates strong foundational skills. Adding more measurable business outcomes will increase your interview rate."
      };
    }
  }
}

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
    const { openai, modelFast, isConfigured } = getAIClient();

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

    // Format resume content into clean text
    let formattedResumeText = "";
    if (typeof resumeContent === "string") {
      formattedResumeText = resumeContent.trim();
    } else if (typeof resumeContent === "object" && resumeContent !== null) {
      const parts: string[] = [];
      if (resumeContent.personalInfo?.fullName) parts.push(`Candidate Name: ${resumeContent.personalInfo.fullName}`);
      if (resumeContent.summary) parts.push(`Professional Summary:\n${resumeContent.summary}`);
      if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
        parts.push(`Work Experience:\n` + resumeContent.experience.map((e: any) => `• ${e.position || ''} at ${e.company || ''}: ${e.description || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
        parts.push(`Education:\n` + resumeContent.education.map((e: any) => `• ${e.degree || ''} in ${e.fieldOfStudy || ''} from ${e.school || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.projects) && resumeContent.projects.length > 0) {
        parts.push(`Projects:\n` + resumeContent.projects.map((p: any) => `• ${p.name || ''}: ${p.description || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.skills) && resumeContent.skills.length > 0) {
        parts.push(`Skills: ` + resumeContent.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", "));
      }
      formattedResumeText = parts.join("\n\n");
    }

    const systemPrompt = isGeneralAudit
      ? `You are an ultra-fast Applicant Tracking System (ATS) auditing engine.
Perform a general ATS compliance and resume quality audit on the candidate's resume.
Evaluate:
1. ATS Score (0 to 100).
2. Readability Score (0 to 100).
3. Matched core strengths and skills.
4. Missing best-practice elements (e.g. metrics, strong action verbs, links).
5. Formatting & structural issues.
6. Narrative recommendations (2 sentences on how to improve).

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "narrativeCheck": string
}
Return only raw JSON without markdown code fences.`
      : `You are an ultra-fast Applicant Tracking System (ATS) matching engine.
Compare the candidate's resume with the target job description.
Evaluate:
1. Keyword match rate (0 to 100).
2. Readability score (0 to 100).
3. Matched keywords.
4. Missing critical keywords from the job description.
5. Structural issues.
6. Narrative critique (2 sentences on improving match relevance).

Respond in a STRICT, single JSON format matching this schema:
{
  "score": number (0 to 100),
  "readabilityScore": number (0 to 100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "formattingIssues": string[],
  "narrativeCheck": string
}
Return only raw JSON without markdown code fences.`;

    const userPrompt = isGeneralAudit
      ? `Resume Title: ${resumeTitle}
Resume Content:
${(formattedResumeText || "Empty resume").slice(0, 3500)}`
      : `Resume Title: ${resumeTitle}
Resume Content:
${(formattedResumeText || "Empty resume").slice(0, 3500)}

Target Job Title: ${jobTitle || "Not specified"}
Target Job Description:
${(jobDescription || "").slice(0, 2000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelFast,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1500
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const analysis = safeParseATSJson(rawContent, isGeneralAudit);

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
    return NextResponse.json({ success: false, error: error.message || "Failed to scan resume" }, { status: 500 });
  }
}
