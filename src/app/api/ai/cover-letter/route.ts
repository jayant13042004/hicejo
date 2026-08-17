import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, insertDemoCoverLetter } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json();

    if ((!resumeId && !resumeText) || !company || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";

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
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured) {
      // Mock Cover Letter for testing
      const personalInfo = typeof resumeContent === "object" ? (resumeContent.personalInfo || {}) : {};
      const fullName = personalInfo.fullName || "Candidate Name";
      const email = personalInfo.email || "candidate@email.com";
      const phone = personalInfo.phone || "(555) 000-0000";
      const location = personalInfo.location || "San Francisco, CA";

      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const mockContent = `${fullName}
${location} | ${phone} | ${email}

${today}

Hiring Manager
${company} Recruiting Team
${company} Headquarters

Subject: Application for ${jobTitle} Role

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}. Having followed ${company}’s recent innovations and commitment to engineering excellence, I am excited about the opportunity to contribute my skills in front-end design, TypeScript development, and user-centric architecture to your growing team.

My technical background aligns cleanly with the challenges at ${company}. In my previous experience, I focused on refactoring legacy application modules into responsive Next.js frameworks, which resulted in a 24% boost in overall page loading performance. Additionally, collaborating in cross-functional squads allowed me to design API integration schemas that cut client request latency by 35%. I am confident that this blend of clean-code practices and quantitative impact will allow me to deliver immediate value to your codebase.

What excites me most about ${company} is your focus on building scalable products that redefine user productivity. I would welcome the opportunity to discuss how my background in modern web standards and responsive interfaces can help accelerate your upcoming product goals.

Thank you for your time and consideration. I look forward to hearing from you regarding next steps.

Sincerely,

${fullName}`;

      let letterId = crypto.randomUUID();
      if (isDemoMode()) {
        const newLetter = insertDemoCoverLetter(company, jobTitle, mockContent, resumeId || null);
        letterId = newLetter.id;
      } else {
        const supabase = await createServerSideClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newLetter, error: dbError } = await supabase
          .from("cover_letters")
          .insert({
            user_id: user!.id,
            resume_id: resumeId || null,
            job_title: jobTitle,
            company,
            content: mockContent
          })
          .select()
          .single();

        if (dbError) {
          return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
        }
        letterId = newLetter.id;
      }

      return NextResponse.json({ success: true, data: { content: mockContent, id: letterId } });
    }

    const systemPrompt = `You are a professional cover letter writer and career strategist.
Generate a highly engaging, professional, and personalized cover letter matching the candidate's resume details and the target job description.
Structure the cover letter following standard formal business guidelines:
1. Candidate header details (Name, contact information).
2. Current Date.
3. Hiring Manager block (Recruiting Team at the target company).
4. Subject line specifying the application role.
5. Opening hook paragraph aligning candidate credentials with the company's culture and job.
6. Body paragraph detailing specific technical achievements and quantified impact from their resume experience.
7. Closing paragraph indicating interest in a discussion, followed by a professional sign-off and candidate name.

Respond with ONLY the raw cover letter text. Do not wrap in markdown quotes. Do not add comments or options.`;

    const userPrompt = `Candidate Resume Data: ${typeof resumeContent === "string" ? resumeContent : JSON.stringify(resumeContent)}

Target Company: ${company}
Target Job Title: ${jobTitle}
Target Job Description: ${jobDescription}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 800
    });

    const letterContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!letterContent) {
      return NextResponse.json({ success: false, error: "AI failed to write cover letter" }, { status: 500 });
    }

    let letterId = crypto.randomUUID();
    if (isDemoMode()) {
      const newLetter = insertDemoCoverLetter(company, jobTitle, letterContent, resumeId || null);
      letterId = newLetter.id;
    } else {
      const supabase = await createServerSideClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newLetter, error: dbError } = await supabase
        .from("cover_letters")
        .insert({
          user_id: user!.id,
          resume_id: resumeId || null,
          job_title: jobTitle,
          company,
          content: letterContent
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
      }
      letterId = newLetter.id;
    }

    return NextResponse.json({ success: true, data: { content: letterContent, id: letterId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
