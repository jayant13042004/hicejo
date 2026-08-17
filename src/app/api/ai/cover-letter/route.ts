import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, insertDemoCoverLetter } from "@/lib/supabase/demo";

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json();

    if ((!resumeId && (!resumeText || resumeText.trim() === "")) || !company || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, error: "Please provide resume details, target company, job title, and description." }, { status: 400 });
    }

    let resumeContent: any = null;
    let resumeTitle = "";

    if (resumeId) {
      if (isDemoMode()) {
        const resume = getDemoResume(resumeId);
        if (!resume) {
          return NextResponse.json({ success: false, error: "Resume draft not found" }, { status: 404 });
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
      resumeTitle = "Candidate Resume";
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
${company} Headquarters

Subject: Application for ${jobTitle} Role

Dear Hiring Team at ${company},

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}. Having followed ${company}’s recent product milestones, I am excited about the opportunity to contribute my technical background in building scalable, modern applications to your engineering organization.

Throughout my experience, I have focused on engineering resilient software architectures that directly accelerate business KPIs. In my previous work, I delivered high-performance full-stack features that improved user response times by 30% and simplified system workflows across cross-functional squads. I pride myself on writing clean, well-tested code and collaborating closely with design and product teams to exceed stakeholder expectations.

What excites me most about ${company} is your commitment to pushing the envelope in product quality and customer experience. I am confident that my technical skills and proactive mindset will allow me to hit the ground running and make an immediate impact on your upcoming goals.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background aligns with the needs of the ${jobTitle} role.

Sincerely,

Candidate Name`;

      return NextResponse.json({ success: true, data: { content: mockContent, id: crypto.randomUUID() } });
    }

    const systemPrompt = `You are an elite executive career strategist and professional cover letter writer.
Generate a tailored, persuasive, and beautifully written formal business cover letter.

Structure:
1. Candidate header details (Name, Contact information).
2. Current Date.
3. Hiring Team / Company block (e.g. Hiring Team at [Target Company]).
4. Subject line specifying the application position.
5. Opening hook paragraph demonstrating specific interest in [Target Company] and the [Target Job Title] role.
6. 1-2 Body paragraphs bridging candidate's actual accomplishments, technical strengths, and metrics directly to the requirements in the job description.
7. Strong closing paragraph requesting a conversation, followed by a professional sign-off ("Sincerely,") and candidate name.

Format Rules:
- Return ONLY the clean, raw cover letter text with proper paragraph spacing.
- Do NOT wrap in markdown quotes, backticks, or explanatory commentary.`;

    const userPrompt = `Candidate Resume Information:
${formattedResumeText.slice(0, 3500)}

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
      if (isDemoMode()) {
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
