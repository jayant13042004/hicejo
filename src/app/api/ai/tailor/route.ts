import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, insertDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json();

    if ((!resumeId && (!resumeText || resumeText.trim() === "")) || !company || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, error: "Please provide resume details, target company, job title, and description." }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";
    let isRawText = false;

    if (resumeId) {
      // 1. Try Supabase if user is signed in
      try {
        const supabase = await createServerSideClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (user && !authError) {
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
        console.warn("Supabase lookup error in tailor:", err);
      }

      // 2. Try demo resume by ID
      if (!resumeContent) {
        const resume = getDemoResume(resumeId);
        if (resume) {
          resumeContent = resume.content;
          resumeTitle = resume.title;
        }
      }

      // 3. Fallback to first demo resume
      if (!resumeContent) {
        const allDemo = getDemoResume("1");
        if (allDemo) {
          resumeContent = allDemo.content;
          resumeTitle = allDemo.title;
        }
      }
    }

    if (!resumeContent) {
      resumeContent = resumeText;
      resumeTitle = "Uploaded Resume";
      isRawText = true;
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Mock Tailored Content Fallback
    if (!isConfigured) {
      let sourceJson: any = {
        personalInfo: { fullName: "Alex Johnson", email: "alex@example.com", phone: "(555) 019-2834", location: "San Francisco, CA" },
        summary: "",
        experience: [],
        education: [],
        projects: [],
        skills: []
      };

      if (!isRawText && resumeContent) {
        sourceJson = JSON.parse(JSON.stringify(resumeContent));
      }

      sourceJson.summary = `Software Engineer experienced in building scalable web applications and distributed services. Skilled in React, TypeScript, and modern backend architecture, with a focus on delivering high-performance features for ${company}'s ${jobTitle} requirements.`;
      
      const mockSkillId = crypto.randomUUID();
      sourceJson.skills.push({ id: mockSkillId, name: `${company} Architecture` });

      const changesMade = [
        {
          section: "summary",
          itemId: "summary-block",
          original: !isRawText ? (resumeContent.summary || "") : "General Summary",
          tailored: sourceJson.summary,
          reason: `Adapted focus to highlight alignment with ${company} ${jobTitle} requirements.`
        }
      ];

      if (sourceJson.experience.length > 0) {
        sourceJson.experience[0].description = `• Built and optimized core service APIs, reducing request latency by 22% and improving system reliability.\n• Refactored legacy frontend components into modular TypeScript modules, decreasing bundle size and cutting feature development turnaround.\n• Integrated automated unit and integration tests, ensuring zero critical regressions across releases.`;
        changesMade.push({
          section: "experience",
          itemId: sourceJson.experience[0].id,
          original: !isRawText ? (resumeContent.experience[0].description || "") : "",
          tailored: sourceJson.experience[0].description,
          reason: "Quantified work achievements using clear engineering verbs and aligned terminology with target responsibilities."
        });
      }

      const newTitle = `${company} - ${jobTitle} Tailored`;
      let tailoredResumeId = crypto.randomUUID();

      if (await isDemoMode()) {
        const newResume = insertDemoResume(newTitle, sourceJson);
        tailoredResumeId = newResume.id;
      }

      return NextResponse.json({
        success: true,
        data: {
          tailoredResumeId,
          tailoredResumeTitle: newTitle,
          tailoredContent: sourceJson,
          changesMade
        }
      });
    }

    const isTech = isTechnicalRole(jobTitle);

    const systemPrompt = `You are a principal recruiter and elite resume strategist known for producing resumes that read 100% HUMAN-WRITTEN, natural, and authentic.
You will receive a candidate's resume and a target job description.
Your goal is to tailor the candidate's summary, work experience bullet points, projects, and skills to highlight keywords and competencies matching the target job description WITHOUT sounding like generic AI generated text.

CRITICAL ANTI-AI-SLOP & HUMAN WRITING RULES:
1. STRICTLY FORBIDDEN WORDS/CLICHÉS:
   - NEVER use: "spearheaded", "orchestrated", "synergized", "leveraged", "pioneered", "game-changing", "cutting-edge", "transformative", "tapestry", "seamlessly", "testament to", "delved", "fostered", "dynamic", "beacon", "unwavering", "catalyst", "harnessed", "endeavor", "realm".
2. USE CRISP, NATURAL ACTION VERBS:
   - Use direct, authentic active verbs: ${isTech ? "Built, Designed, Shipped, Scaled, Automated, Migrated, Refactored, Reduced, Wrote, Integrated, Deployed, Benchmarked, Optimized, Implemented." : "Negotiated, Closed, Managed, Structured, Scaled, Forecasted, Standardized, Executed, Launched, Partnered, Streamlined, Reduced, Analyzed."}
3. GROUND IN REALITY (NO FAKE METRICS):
   - Preserve all real metrics from the candidate's background.
   - NEVER fabricate unbelievable business stats (e.g. do NOT invent "boosted company revenue by 48%" or "increased enterprise sales by $2M" if not present in the candidate's original resume).
   - If introducing numbers or impact, keep them grounded in realistic scope (${isTech ? "latency reduction, test coverage %, database query times, API response times, number of daily events, batch runtimes" : "deal cycle times, conversion rates, pipeline retention, cost reduction %, deal size, SLAs, operational throughput"}).
4. BULLET POINT DENSITY & STYLE:
   - Each bullet point must be between 15 and 28 words.
   - Format each bullet as: Action Verb + Scope/Problem + Concrete Result or Method.
   - Each bullet MUST start with a bullet character "• ".
5. SUMMARY SECTION RULES:
   - NO generic fluff: Do NOT say "Results-oriented, passionate professional with a proven track record of excellence."
   - Write a crisp, 2 to 3 sentence summary stating exact domain, primary expertise, and key focus matching the target job.
6. PRESERVE FACTUAL INTEGRITY:
   - Keep candidate contact info, company names, school names, degrees, and dates factual and unchanged.
7. Generate valid UUID strings for 'id' fields in experience, education, projects, and skills.

Respond in a STRICT, single JSON object matching this schema:
{
  "tailoredContent": {
    "personalInfo": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "website": "string",
      "linkedin": "string"
    },
    "summary": "string",
    "experience": [
      {
        "id": "string",
        "company": "string",
        "position": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "current": boolean,
        "description": "string (rewritten bullet points separated by newline)"
      }
    ],
    "education": [
      {
        "id": "string",
        "school": "string",
        "degree": "string",
        "fieldOfStudy": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "current": boolean
      }
    ],
    "projects": [
      {
        "id": "string",
        "name": "string",
        "role": "string",
        "link": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string"
      }
    ],
    "skills": [
      { "id": "string", "name": "string", "category": "string" }
    ]
  },
  "changesMade": [
    {
      "section": "string ('summary' | 'experience' | 'projects' | 'skills')",
      "itemId": "string",
      "original": "string",
      "tailored": "string",
      "reason": "string (why this change improves alignment with the target job)"
    }
  ]
}
Return only raw JSON without markdown code fences.`;

    const userPrompt = `Candidate Resume Data:
${typeof resumeContent === "string" ? resumeContent.slice(0, 3500) : JSON.stringify(resumeContent)}

Target Company: ${company}
Target Job Title: ${jobTitle}
Target Job Description:
${jobDescription.slice(0, 2000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 3500
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to tailor resume." }, { status: 500 });
    }

    // Strip markdown code fences if present
    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    const result = JSON.parse(cleanJson);

    const newTitle = `${company} - ${jobTitle} Tailored`;
    let tailoredResumeId = crypto.randomUUID();

    try {
      let saved = false;
      const supabase = await createServerSideClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newResume } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            title: newTitle,
            content: result.tailoredContent,
            ats_score: 85
          })
          .select()
          .single();

        if (newResume) {
          tailoredResumeId = newResume.id;
          saved = true;
        }
      }

      if (!saved) {
        const newResume = insertDemoResume(newTitle, result.tailoredContent);
        tailoredResumeId = newResume.id;
      }
    } catch (dbErr) {
      console.warn("Database cache warning in tailor endpoint:", dbErr);
      const newResume = insertDemoResume(newTitle, result.tailoredContent);
      tailoredResumeId = newResume.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        tailoredResumeId,
        tailoredResumeTitle: newTitle,
        tailoredContent: result.tailoredContent,
        changesMade: result.changesMade || []
      }
    });
  } catch (error: any) {
    console.error("Resume tailor failure:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to tailor resume" }, { status: 500 });
  }
}
