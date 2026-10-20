import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, getDemoResumes, insertDemoCoverLetter } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json().catch(() => ({}));

    const targetCompany = (company || "Target Company").trim();
    const targetJobTitle = (jobTitle || "Software Engineer").trim();
    const targetJobDescription = (jobDescription || "Seeking an experienced engineer with problem-solving skills and teamwork.").trim();

    let resumeContent: any = null;
    let resumeTitle = "";

    if (resumeId) {
      // 1. Try Supabase user resumes
      try {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
        console.warn("Supabase lookup error:", err);
      }

      // 2. Try demo resume by ID
      if (!resumeContent) {
        const demoResume = getDemoResume(resumeId);
        if (demoResume) {
          resumeContent = demoResume.content;
          resumeTitle = demoResume.title;
        }
      }

      // 3. Try first demo resume
      if (!resumeContent) {
        const allDemo = getDemoResumes();
        if (allDemo.length > 0) {
          resumeContent = allDemo[0].content;
          resumeTitle = allDemo[0].title;
        }
      }
    }

    if (!resumeContent && resumeText && resumeText.trim().length > 0) {
      resumeContent = resumeText.trim();
      resumeTitle = "Candidate Resume";
    }

    if (!resumeContent) {
      const allDemo = getDemoResumes();
      if (allDemo.length > 0) {
        resumeContent = allDemo[0].content;
        resumeTitle = allDemo[0].title;
      } else {
        resumeContent = "Experienced software engineer with React, Next.js, and TypeScript expertise.";
        resumeTitle = "Candidate Resume";
      }
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Format resume content into clean text
    let formattedResumeText = "";
    if (typeof resumeContent === "string") {
      formattedResumeText = resumeContent.trim();
    } else if (typeof resumeContent === "object" && resumeContent !== null) {
      const parts: string[] = [];
      if (resumeContent.personalInfo?.fullName) parts.push(`Candidate Name: ${resumeContent.personalInfo.fullName}`);
      if (resumeContent.personalInfo?.email) parts.push(`Email: ${resumeContent.personalInfo.email}`);
      if (resumeContent.personalInfo?.phone) parts.push(`Phone: ${resumeContent.personalInfo.phone}`);
      if (resumeContent.personalInfo?.location) parts.push(`Location: ${resumeContent.personalInfo.location}`);
      if (resumeContent.summary) parts.push(`Professional Summary:\n${resumeContent.summary}`);
      if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
        parts.push(`Work Experience:\n` + resumeContent.experience.map((e: any) => `• ${e.position || 'Role'} at ${e.company || 'Company'} (${e.startDate || ''} - ${e.endDate || ''}):\n  ${e.description || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
        parts.push(`Education:\n` + resumeContent.education.map((e: any) => `• ${e.degree || 'Degree'} from ${e.school || 'School'}`).join("\n"));
      }
      if (Array.isArray(resumeContent.projects) && resumeContent.projects.length > 0) {
        parts.push(`Projects:\n` + resumeContent.projects.map((p: any) => `• ${p.name || 'Project'}: ${p.description || ''}`).join("\n"));
      }
      if (Array.isArray(resumeContent.skills) && resumeContent.skills.length > 0) {
        parts.push(`Skills: ` + resumeContent.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", "));
      }
      formattedResumeText = parts.join("\n\n");
    }

    if (!formattedResumeText) {
      formattedResumeText = typeof resumeContent === "string" ? resumeContent : "Experienced candidate applying for the role.";
    }

    // Mock mode fallback
    if (!isConfigured) {
      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const mockContent = `Candidate Name
San Francisco, CA | (555) 019-2834 | candidate@example.com

${today}

Hiring Team
${company}

Subject: ${jobTitle} Application

Dear ${company} Hiring Team,

I'm applying for the ${jobTitle} role at ${company}. Having worked extensively on modern web applications and backend systems with React and TypeScript, I've spent the past few years solving the exact performance and architectural challenges outlined in your posting.

At my previous role, I focused on reducing latency and streamlining core workflows, improving response times by 30% and building modular components that made shipping new features significantly faster for our team. I care deeply about clean system design, readable code, and building features that solve real user problems without unnecessary complexity.

${company}'s work on scalable user-facing products aligns closely with what I do best. I would love the opportunity to share how my experience with full-stack development and API architecture can support your team's upcoming initiatives.

Thanks for your time and consideration.

Best regards,

Candidate Name`;

      return NextResponse.json({ success: true, data: { content: mockContent, id: crypto.randomUUID() } });
    }

    const isTech = isTechnicalRole(targetJobTitle);

    const systemPrompt = `You are a professional hiring manager and career strategist known for crafting 100% HUMAN-WRITTEN, authentic, conversational yet professional cover letters.

CRITICAL ANTI-AI-SLOP & HUMAN WRITING RULES:
1. STRICTLY FORBIDDEN OPENINGS & PHRASES:
   - NEVER start with: "I am writing to express my enthusiastic interest...", "I was thrilled to see the opening for...", "I am delighted to submit my application...", "As a seasoned professional with a proven track record..."
   - NEVER use hollow buzzwords: "spearheaded", "orchestrated", "synergized", "leveraged", "pioneered", "game-changing", "cutting-edge", "transformative", "tapestry", "seamlessly", "testament to", "fostered", "dynamic", "pushing the envelope".
2. AUTHENTIC HUMAN OPENING:
   - Start immediately with directness and credibility: State the exact position applied for and connect the candidate's core specialty directly to a real priority in the job description in the first 2 sentences.
3. CONCRETE BODY (SHOW, DON'T TELL):
   - In 1 to 2 short paragraphs, describe real achievements and problems solved from the candidate's resume (${isTech ? "e.g. latency, reliability, modular architecture, API design, testing" : "e.g. deal pipeline, customer retention, campaign conversion, operational efficiency, cross-functional execution"}) mapped to the company's needs.
   - Mention the company's actual product or domain naturally — do NOT write generic corporate flattery.
4. CRISP & RESPECTFUL SIGN-OFF:
   - Close in 1-2 lines stating availability to discuss mutual fit.
   - Sign off with "Best regards," or "Sincerely," followed by the candidate's name.
5. LENGTH & FORMAT:
   - Keep the entire letter concise (under 280 words). Short, punchy, human letters get read; lengthy robotic fluff gets ignored.
   - Return ONLY the clean, raw cover letter text with proper paragraph breaks.
   - Do NOT wrap in markdown code fences or explanatory commentary.`;

    const userPrompt = `Candidate Resume Information:
${formattedResumeText.slice(0, 3500)}

Target Company: ${targetCompany}
Target Job Title: ${targetJobTitle}
Target Job Description:
${targetJobDescription.slice(0, 2000)}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    let letterContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!letterContent) {
      return NextResponse.json({ success: false, error: "AI failed to write cover letter" }, { status: 500 });
    }

    // Strip code fences if present
    if (letterContent.startsWith("```")) {
      letterContent = letterContent.replace(/^```(?:markdown|text)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    let letterId = crypto.randomUUID();
    try {
      if (await isDemoMode()) {
        const newLetter = insertDemoCoverLetter(company, jobTitle, letterContent, resumeId || null);
        letterId = newLetter.id;
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newLetter } = await supabase
            .from("cover_letters")
            .insert({
              user_id: user.id,
              resume_id: resumeId || null,
              job_title: jobTitle,
              company,
              content: letterContent
            })
            .select()
            .single();

          if (newLetter) letterId = newLetter.id;
        }
      }
    } catch (dbErr) {
      console.warn("Cover letter database cache warning:", dbErr);
    }

    return NextResponse.json({ success: true, data: { content: letterContent, id: letterId } });
  } catch (error: any) {
    console.error("Cover letter endpoint failure:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate cover letter" }, { status: 500 });
  }
}
