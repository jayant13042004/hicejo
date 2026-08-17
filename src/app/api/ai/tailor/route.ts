import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, insertDemoResume } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json();

    if ((!resumeId && !resumeText) || !company || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
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
      resumeTitle = "Uploaded Text Resume";
      isRawText = true;
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured) {
      // Mock Tailored Content
      let sourceJson: any = {
        personalInfo: { fullName: "Candidate Name", email: "candidate@email.com", phone: "(555) 000-0000", location: "San Francisco, CA" },
        summary: "",
        experience: [],
        education: [],
        projects: [],
        skills: []
      };

      if (!isRawText && resumeContent) {
        sourceJson = JSON.parse(JSON.stringify(resumeContent));
      }

      sourceJson.summary = `Accomplished engineer specializing in launching core projects at ${company}. Experienced implementing scalable systems using React and TypeScript, aligning cleanly with requirements for the ${jobTitle} role.`;
      
      const mockSkillId = crypto.randomUUID();
      sourceJson.skills.push({ id: mockSkillId, name: `${company} API Architecture` });

      const changesMade = [
        {
          section: "summary",
          itemId: "summary-block",
          original: !isRawText ? (resumeContent.summary || "") : "Raw Text Input",
          tailored: sourceJson.summary,
          reason: `Adapted focus to highlight alignment with ${company} team requirements.`
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
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newResume, error: dbError } = await supabase
          .from("resumes")
          .insert({
            user_id: user!.id,
            title: newTitle,
            content: sourceJson,
            ats_score: 82
          })
          .select()
          .single();

        if (dbError) {
          return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
        }
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

    const systemPrompt = `You are a professional resume writer and optimization assistant.
You will receive a candidate's resume (either in structured JSON format or as unstructured raw text) and a target job description.
Your goal is to tailor the candidate's resume (specifically the executive summary, experience bullet points, and projects) to highlight matching skills and keywords.

IF you receive unstructured raw text, you MUST parse the text and extract all parts into the required structured "tailoredContent" schema. Ensure you generate random UUID strings for "id" fields in "experience", "projects", and "skills".
Do NOT modify personal contact info, company names, school names, degrees, or dates. Only adapt bullet details and summaries. Keep sections structurally identical.

You MUST respond in a strict JSON format matching this schema:
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
        "description": "string (rewritten bullets, separated by newlines)"
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
        "description": "string (rewritten bullets, separated by newlines)"
      }
    ],
    "skills": [ { "id": "string", "name": "string", "category": "string" } ]
  },
  "changesMade": [
    {
      "section": "string ('summary', 'experience', 'projects', or 'skills')",
      "itemId": "string (the matching item's uuid, or 'summary-block')",
      "original": "string (original text)",
      "tailored": "string (tailored text)",
      "reason": "string (brief justification of changes)"
    }
  ]
}

Return ONLY the raw JSON. Do not wrap in markdown blocks.`;

    const userPrompt = `Original Resume Data: ${typeof resumeContent === "string" ? resumeContent : JSON.stringify(resumeContent)}

Target Company: ${company}
Target Job Title: ${jobTitle}
Target Job Description: ${jobDescription}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const result = JSON.parse(rawContent);

    const newTitle = `${company} - ${jobTitle} Tailored`;
    let tailoredResumeId = crypto.randomUUID();

    if (isDemoMode()) {
      const newResume = insertDemoResume(newTitle, result.tailoredContent);
      tailoredResumeId = newResume.id;
    } else {
      const supabase = await createServerSideClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newResume, error: dbError } = await supabase
        .from("resumes")
        .insert({
          user_id: user!.id,
          title: newTitle,
          content: result.tailoredContent,
          ats_score: 80
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
      }
      tailoredResumeId = newResume.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        tailoredResumeId,
        tailoredResumeTitle: newTitle,
        tailoredContent: result.tailoredContent,
        changesMade: result.changesMade
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
