import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
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

      sourceJson.summary = `Accomplished engineer specializing in launching core platform services at ${company}. Experienced implementing scalable systems using React and TypeScript, aligning directly with requirements for the ${jobTitle} role.`;
      
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
        sourceJson.experience[0].description = `Spearheaded software integration layouts, reducing request overheads by 22% and improving compatibility parameters for modern web platforms.\nRefactored legacy features to align with optimized developer workflows matching ${company}'s standards.`;
        changesMade.push({
          section: "experience",
          itemId: sourceJson.experience[0].id,
          original: !isRawText ? (resumeContent.experience[0].description || "") : "",
          tailored: sourceJson.experience[0].description,
          reason: "Quantified work achievements and aligned terminology with target responsibilities."
        });
      }

      const newTitle = `${company} - ${jobTitle} Tailored`;
      let tailoredResumeId = crypto.randomUUID();

      if (isDemoMode()) {
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

    const systemPrompt = `You are an expert resume writer and technical recruiter.
You will receive a candidate's resume and a target job description.
Your goal is to tailor the candidate's summary, work experience bullet points, projects, and skills to highlight keywords and competencies matching the target job description.

Rules:
1. Preserve true factual metrics and experiences while rephrasing bullets to match the job terminology and emphasize quantifiable impact.
2. If given raw text, parse all details (Name, Contact, Summary, Experience, Education, Projects, Skills) into the structured schema below.
3. Keep personal contact info, company names, school names, degrees, and dates factual and unchanged.
4. Generate UUID strings for 'id' fields in experience, education, projects, and skills.

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
      if (isDemoMode()) {
        const newResume = insertDemoResume(newTitle, result.tailoredContent);
        tailoredResumeId = newResume.id;
      } else {
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

          if (newResume) tailoredResumeId = newResume.id;
        }
      }
    } catch (dbErr) {
      console.warn("Database cache warning in tailor endpoint:", dbErr);
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
