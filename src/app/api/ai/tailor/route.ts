import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, insertDemoResume, getDemoProfile } from "@/lib/supabase/demo";
import { getFactBankTextSummary, mergeWithDefaultFactBank } from "@/lib/factBank";

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

    // Fetch candidate's verified fact bank so tailoring engine can choose from all verified projects & skills
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
    const factBankSummary = getFactBankTextSummary(activeFactBank);

    const isTech = isTechnicalRole(jobTitle);

    const systemPrompt = `You are a principal recruiter and elite resume strategist known for producing resumes that read 100% HUMAN-WRITTEN, natural, and authentic.
You will receive a candidate's resume, their complete verified fact bank of projects and skills, and a target job description.
Your goal is to tailor the candidate's summary, work experience bullet points, projects, and skills to maximize ATS match probability and recruiter impact for the target role WITHOUT sounding like generic AI generated text.

CRITICAL ATS SELECTION, PROJECT SELECTION & SKILLS CURATION RULES:

1. INTELLIGENT PROJECT SELECTION (KEEP ONLY THE BEST 2-3):
   - Review ALL verified projects from the candidate's Fact Bank and Resume.
   - Select the 2 to 3 projects that most directly demonstrate the core competencies required by the Target Job Description.
   - For Data Analyst / BI roles: prioritize projects with SQL, Power BI, Tableau, cohort analysis, customer segmentation, or revenue metrics.
   - For Data Science / ML roles: prioritize projects with time-series forecasting, predictive modeling, Scikit-Learn, XGBoost, or ROC-AUC metrics.
   - For SDE / Engineering roles: prioritize projects with API design, backend architecture, C++, Python, or SDK development.
   - DO NOT include all projects. Prune irrelevant or lower-priority projects so the resume fits cleanly on 1 page with maximum relevance.

2. SKILLS CURATION & ATS KEYWORD ALIGNMENT:
   - Analyze the target JD's required and preferred technologies, tools, and methodologies.
   - Curate and re-order the candidate's verified skills: place the exact skills matching the JD at the very top of the list.
   - Match the exact casing and phrasing used by the employer (e.g. if JD specifies "Power BI", "Exploratory Data Analysis", "PostgreSQL", or "RESTful APIs", use that exact terminology).
   - Group the skills into 3 to 4 clean, structured categories (e.g. "Programming & Scripting", "Data Analysis & BI", "Databases & Frameworks").
   - NEVER invent or claim skills the candidate does not have; only draw from their verified skill groups and project evidence.

3. EXHAUSTIVE FULL-JD KEYWORD PARSING:
   - Thoroughly parse the ENTIRE Target Job Description (Responsibilities, Minimum Requirements, Preferred Qualifications, Team Stack).
   - Naturally weave high-frequency JD keywords, technical tools, and problem-solving language into the experience bullets, projects, and summary.
   - Ensure high ATS match score while keeping every achievement natural and believable.

4. CRITICAL ANTI-AI-SLOP & HUMAN WRITING RULES:
   - STRICTLY FORBIDDEN WORDS/CLICHÉS: NEVER use "spearheaded", "orchestrated", "synergized", "leveraged", "pioneered", "game-changing", "cutting-edge", "transformative", "tapestry", "seamlessly", "testament to", "delved", "fostered", "dynamic", "beacon", "unwavering", "catalyst", "harnessed", "endeavor", "realm".
   - USE CRISP, NATURAL ACTION VERBS: ${isTech ? "Built, Designed, Shipped, Scaled, Automated, Migrated, Refactored, Reduced, Wrote, Integrated, Deployed, Benchmarked, Optimized, Implemented." : "Negotiated, Closed, Managed, Structured, Scaled, Forecasted, Standardized, Executed, Launched, Partnered, Streamlined, Reduced, Analyzed."}
   - GROUND IN REALITY (NO FAKE METRICS): Preserve real metrics from the candidate's background. NEVER fabricate fake business metrics.
   - BULLET POINT DENSITY: Each bullet point must be between 15 and 28 words, formatted as: Action Verb + Scope/Problem + Concrete Result. Start each with "• ".
   - SUMMARY: Crisp 2-3 sentence statement of exact domain, technical expertise, and alignment with the target role.

5. PRESERVE FACTUAL INTEGRITY:
   - Keep candidate contact info, company names, school names, degrees, and dates factual and unchanged.
   - Generate valid UUID strings for 'id' fields.

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
        "current": boolean,
        "gradeType": "string (optional: 'cgpa' | 'percentage' | 'gpa')",
        "grade": "string (optional: e.g. '8.8 / 10' or '85%')"
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

    const userPrompt = `CANDIDATE'S VERIFIED FACT BANK (SOURCE OF ALL PROJECTS, SKILLS & EVIDENCE):
${factBankSummary}

CURRENT RESUME DATA:
${typeof resumeContent === "string" ? resumeContent.slice(0, 15000) : JSON.stringify(resumeContent)}

TARGET COMPANY: ${company}
TARGET JOB TITLE: ${jobTitle}
TARGET JOB DESCRIPTION (ANALYZE FULLY FOR KEYWORDS & REQUIREMENTS):
${jobDescription.slice(0, 20000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 8192
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
