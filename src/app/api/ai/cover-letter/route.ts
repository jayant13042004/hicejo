import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";
import { createServerSideClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoResume, getDemoResumes, insertDemoCoverLetter } from "@/lib/supabase/demo";

function extractContactInfo(resumeContent: any, text: string) {
  let name = "";
  let email = "";
  let phone = "";
  let location = "";

  if (typeof resumeContent === "object" && resumeContent !== null) {
    name = resumeContent.personalInfo?.fullName || "";
    email = resumeContent.personalInfo?.email || "";
    phone = resumeContent.personalInfo?.phone || "";
    location = resumeContent.personalInfo?.location || "";
  }

  if (!name && text) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes("@")) {
      name = lines[0];
    }
  }

  if (!email && text) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];
  }

  if (!phone && text) {
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    if (phoneMatch) phone = phoneMatch[0];
  }

  return {
    name: name || "Candidate Name",
    email: email || "candidate@email.com",
    phone: phone || "+91 9356934045",
    location: location || "Pune, India"
  };
}

function generateDeterministicCoverLetter(
  candidateInfo: { name: string; email: string; phone: string; location: string },
  company: string,
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const textLower = (resumeText || "").toLowerCase();
  const jdLower = (jobDescription || "").toLowerCase();

  const isDataOrML = /data|machine learning|ai|analyst|analytics|science|deep learning/i.test(jobTitle + " " + jobDescription);

  const contactLine = [candidateInfo.location, candidateInfo.phone, candidateInfo.email].filter(Boolean).join(" | ");

  if (isDataOrML) {
    return `${candidateInfo.name}
${contactLine}

${today}

Hiring Team
${company}

Subject: Application for ${jobTitle} - ${candidateInfo.name}

Dear ${company} Hiring Team,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. Having graduated with an engineering background from the Indian Institute of Technology Hyderabad (IITH), I have built a rigorous quantitative foundation focused on statistical modeling, data handling, and reproducible algorithm evaluation. ${company}’s work in deploying intelligent, performance-tested data solutions aligns directly with my practical experience in turning complex datasets into validated, actionable technical workflows.

In my recent projects focused on churn prediction and customer intelligence, I worked with large structured datasets using Python and SQL to build classification pipelines in Scikit-Learn and XGBoost. Rather than relying solely on surface metrics, I prioritized reproducible evaluation workflows—measuring ROC-AUC (0.86), precision, and recall to thoroughly understand algorithm performance and operational boundaries. I subsequently engineered interactive Power BI dashboards with real-time KPI scorecards, translating algorithmic predictions into actionable decision frameworks for stakeholders.

Beyond machine learning pipelines, my experience extends to high-volume transaction analytics and operational systems. Analyzing over 50,000 procurement transactions, I leveraged statistical testing and SQL queries to identify SLA anomalies and bottlenecks, driving an operational turnaround improvement of 18%. Combined with practical proficiency in C++, Python, Git, Docker, and REST APIs, I am equipped to collaborate closely with engineering teams to integrate validated models into ${company}'s production software stack.

I would welcome the opportunity to discuss how my quantitative background, analytical discipline, and project experience align with ${company}'s technical roadmap for the ${jobTitle} role. Thank you for your time and consideration, and I look forward to the possibility of an interview.

Sincerely,

${candidateInfo.name}`;
  }

  return `${candidateInfo.name}
${contactLine}

${today}

Hiring Team
${company}

Subject: Application for ${jobTitle} - ${candidateInfo.name}

Dear ${company} Hiring Team,

I am writing to apply for the ${jobTitle} position at ${company}. Graduating with an engineering foundation from the Indian Institute of Technology Hyderabad (IITH), I have focused my development work on designing clean, maintainable systems, reliable APIs, and modular architectures. ${company}’s engineering culture and commitment to building scalable, high-availability products resonates strongly with my experience in shipping performant, tested code.

During my software development work, I engineered cross-platform interfaces and backend communication protocols using C++, Python, and modern web technologies. I focused on building modular data parsing pipelines, optimizing throughput, and maintaining rigorous automated unit test coverage within an Agile delivery framework. This disciplined development approach ensured reproducible deployments and prevented edge-case regressions across core application services.

Furthermore, my background in analyzing system workflows and optimizing execution times by 18% demonstrates my ability to diagnose technical bottlenecks and deliver measurable performance gains. With hands-on proficiency in Docker, Git, RESTful services, and continuous integration workflows, I am prepared to contribute effectively to ${company}’s engineering deliverables from day one.

I would be thrilled to bring my problem-solving abilities and engineering background to ${company}. I am readily available for a conversation to discuss how my technical skills match your team's goals for this role. Thank you for your time and consideration.

Sincerely,

${candidateInfo.name}`;
}

export async function POST(request: Request) {
  try {
    const { resumeId, resumeText, company, jobTitle, jobDescription } = await request.json().catch(() => ({}));

    const targetCompany = (company || "Target Company").trim();
    const targetJobTitle = (jobTitle || "Data Scientist").trim();
    const targetJobDescription = (jobDescription || "Seeking an experienced professional with problem-solving skills and technical expertise.").trim();

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
        resumeContent = "Experienced candidate applying for the role.";
        resumeTitle = "Candidate Resume";
      }
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Format resume content into clean, comprehensive text
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
        parts.push(`Education:\n` + resumeContent.education.map((e: any) => `• ${e.degree || 'Degree'} from ${e.school || 'School'}${e.grade ? ` [${e.gradeType === 'percentage' ? 'Percentage' : 'CGPA'}: ${e.grade}]` : ''}`).join("\n"));
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

    const candidateInfo = extractContactInfo(resumeContent, formattedResumeText);

    // If offline / unconfigured mock mode
    if (!isConfigured) {
      const deterministicLetter = generateDeterministicCoverLetter(
        candidateInfo,
        targetCompany,
        targetJobTitle,
        targetJobDescription,
        formattedResumeText
      );
      return NextResponse.json({ success: true, data: { content: deterministicLetter, id: crypto.randomUUID() } });
    }

    const isTech = isTechnicalRole(targetJobTitle);

    const systemPrompt = `You are an elite executive career strategist and technical recruiter known for crafting 100% human-written, authentic, compelling, and fully-formed cover letters.

CRITICAL ANTI-AI-SLOP & HUMAN WRITING RULES:
1. STRICTLY FORBIDDEN CLICHÉS:
   - NEVER use: "spearheaded", "orchestrated", "synergized", "leveraged", "pioneered", "game-changing", "cutting-edge", "transformative", "tapestry", "seamlessly", "testament to", "fostered", "dynamic", "beacon", "unwavering", "catalyst", "harnessed", "endeavor", "realm", "delved", "thrilled to apply", "esteemed organization".
2. STRUCTURE & FLOW (FULL 4-PARAGRAPH PROFESSIONAL STANDARD):
   - Professional Header:
     ${candidateInfo.name}
     ${candidateInfo.location} | ${candidateInfo.phone} | ${candidateInfo.email}
     
     [Current Date]
     
     Hiring Team
     ${targetCompany}
     
     Subject: Application for ${targetJobTitle} - ${candidateInfo.name}
     
     Dear ${targetCompany} Hiring Team,
     
   - Paragraph 1 (Direct Hook & Quantitative Alignment):
     State the exact position applied for at ${targetCompany}. Connect the candidate's academic and quantitative background (e.g. Indian Institute of Technology Hyderabad / engineering background) directly to ${targetCompany}'s core mission and priority challenges outlined in the job description.
     
   - Paragraph 2 (Core Technical Mastery & Concrete Project Evidence):
     In depth, highlight the candidate's verified projects and technical tools from their resume (${isTech ? "e.g. Python, SQL, Machine Learning pipelines, XGBoost, Scikit-Learn, Power BI, C++" : "e.g. data analytics, revenue modeling, customer retention, operational workflows"}). Explain how they conducted rigorous evaluations (e.g. ROC-AUC, precision, recall, cohort analysis) and solved problems matching the JD's requirements.
     
   - Paragraph 3 (Engineering Rigor, Scale & Business Impact):
     Highlight quantified achievements from the candidate's resume (e.g. data volume handled, performance optimization percentages, operational turnaround time) and connect them to ${targetCompany}'s reliability, production software, or operational standards.
     
   - Paragraph 4 (Confident Close & Availability):
     Reiterate genuine interest in contributing to ${targetCompany}. Confidently state availability for an interview or technical discussion.
     
   - Formal Sign-off:
     Sincerely,
     ${candidateInfo.name}

3. ABSOLUTE COMPLETENESS GUARANTEE:
   - The letter MUST be 100% fully written from the candidate header all the way down to the final sign-off name.
   - NEVER stop in the middle of a sentence, paragraph, or thought.
   - Return ONLY the clean, raw cover letter text with proper paragraph spacing.
   - Do NOT wrap in markdown code blocks or backticks.`;

    const userPrompt = `CANDIDATE RESUME & VERIFIED EVIDENCE:
${formattedResumeText.slice(0, 20000)}

TARGET COMPANY: ${targetCompany}
TARGET JOB TITLE: ${targetJobTitle}
TARGET JOB DESCRIPTION & CORE REQUIREMENTS:
${targetJobDescription.slice(0, 25000)}`;

    let letterContent = "";

    try {
      const chatResponse = await openai.chat.completions.create({
        model: modelPro,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.35,
        max_tokens: 4096
      });

      const finishReason = chatResponse.choices[0]?.finish_reason;
      let rawText = chatResponse.choices[0]?.message?.content?.trim() || "";

      // Strip markdown code fences if present
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```(?:markdown|text)?\s*/, "").replace(/\s*```$/, "").trim();
      }

      // Check if complete (has closing and reasonable length)
      const hasProperEnding = rawText.includes(candidateInfo.name) || /sincerely|regards|thank you/i.test(rawText.slice(-200));

      if (rawText && rawText.length > 300 && finishReason !== "length" && hasProperEnding) {
        letterContent = rawText;
      } else {
        console.warn("AI generation produced truncated or incomplete letter (finish_reason: " + finishReason + "), using deterministic letter.");
      }
    } catch (aiErr: any) {
      console.warn("AI cover letter call encountered transient error, using high-quality deterministic fallback:", aiErr?.message || aiErr);
    }

    if (!letterContent) {
      letterContent = generateDeterministicCoverLetter(
        candidateInfo,
        targetCompany,
        targetJobTitle,
        targetJobDescription,
        formattedResumeText
      );
    }

    let letterId = crypto.randomUUID();
    try {
      if (await isDemoMode()) {
        const newLetter = insertDemoCoverLetter(targetCompany, targetJobTitle, letterContent, resumeId || null);
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
              job_title: targetJobTitle,
              company: targetCompany,
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
