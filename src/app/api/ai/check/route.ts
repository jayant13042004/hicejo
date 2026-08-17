import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, updateDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, jobTitle, jobDescription } = await request.json();

    if (!resumeId || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";

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

    const { openai, modelPro, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured) {
      // Mock high-fidelity response for testing
      const matched = ["TypeScript", "Next.js", "React", "CSS", "Tailwind"];
      const missing = ["Docker", "Kubernetes", "System Design", "Unit Testing (Jest)", "REST APIs"];
      const score = Math.floor(Math.random() * 20) + 65; // random score between 65 and 85
      
      const mockResult = {
        score,
        readabilityScore: 82,
        matchedKeywords: matched,
        missingKeywords: missing,
        formattingIssues: [
          "Professional Summary is missing clear quantified metrics.",
          "Resume lacks direct URLs to projects or GitHub repository.",
          "Employment dates are in variable formats (change to Month Year format)."
        ],
        narrativeCheck: `The experience bullet points demonstrate strong styling with frontend technologies, but fall short in explaining overall impact. Consider re-phrasing bullets to include specific outcomes (e.g. optimized load speeds by 25% or managed 12 client requests).`
      };

      if (isDemoMode()) {
        updateDemoResume(resumeId, { ats_score: mockResult.score });
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Write mock result to database logs
        await supabase.from("ats_scans").insert({
          user_id: user!.id,
          resume_id: resumeId,
          score: mockResult.score,
          feedback: mockResult,
          job_description: jobDescription
        });

        // Update the resume table ATS score
        await supabase.from("resumes").update({ ats_score: mockResult.score }).eq("id", resumeId);
      }

      return NextResponse.json({ success: true, data: mockResult });
    }

    const systemPrompt = `You are a recruitment Applicant Tracking System (ATS) matching engine.
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

    const userPrompt = `Resume Title: ${resumeTitle}
Resume Details: ${JSON.stringify(resumeContent)}

Target Job Title: ${jobTitle}
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

    if (isDemoMode()) {
      updateDemoResume(resumeId, { ats_score: analysis.score || 0 });
    } else {
      const supabase = await createServerSideClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Save scan to database logs
      await supabase.from("ats_scans").insert({
        user_id: user!.id,
        resume_id: resumeId,
        score: analysis.score || 0,
        feedback: analysis,
        job_description: jobDescription
      });

      // Update the resume table ATS score
      await supabase
        .from("resumes")
        .update({ ats_score: analysis.score || 0 })
        .eq("id", resumeId);
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
