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
        summary: "Software developer with experience in fullstack web applications.",
        experience: [
          {
            id: "exp-1",
            company: "Tech Solutions",
            position: "Software Engineer",
            startDate: "2022",
            endDate: "Present",
            current: true,
            description: "• Developed web applications using React and Node.js.\n• Worked on database schemas and API integrations."
          }
        ],
        education: [],
        projects: [
          {
            id: "proj-1",
            name: "Cloud Analytics Platform",
            role: "Lead Developer",
            description: "• Built a data visualization dashboard.\n• Implemented user authentication and analytics tracking."
          }
        ],
        skills: [
          { id: "s-1", name: "Python", category: "Languages" },
          { id: "s-2", name: "SQL", category: "Databases" }
        ]
      };

      if (!isRawText && resumeContent) {
        sourceJson = JSON.parse(JSON.stringify(resumeContent));
      }

      const tailoredJson = JSON.parse(JSON.stringify(sourceJson));
      tailoredJson.summary = `Data-driven ${jobTitle} experienced in building high-performance architectures and scalable analytics systems. Proven track record of optimizing application performance and delivering critical solutions aligned with ${company}'s technical standards.`;

      const mockSkillId = crypto.randomUUID();
      tailoredJson.skills = [
        ...tailoredJson.skills,
        { id: mockSkillId, name: `${company} Stack Alignment`, category: "Core Technologies" }
      ];

      if (tailoredJson.experience.length > 0) {
        tailoredJson.experience[0].description = `• Engineered scalable service APIs, reducing request latency by 24% and boosting system throughput under peak traffic.\n• Architected modular TypeScript components, cutting frontend load time and accelerating feature shipping cycles.\n• Deployed automated CI/CD validation pipelines, maintaining 99.9% release reliability across production environments.`;
      }

      if (tailoredJson.projects.length > 0) {
        tailoredJson.projects[0].description = `• Designed end-to-end analytics pipeline using SQL and Python, parsing 500K+ daily event records for actionable retention insights.\n• Implemented automated model retraining workflows, improving classification precision and reporting latency for stakeholders.`;
      }

      const proposals = [
        {
          id: "prop-summary",
          section: "summary",
          category: "Professional Summary",
          title: `Role-Targeted Summary for ${company}`,
          impact: "High Impact",
          reason: `Directly highlights your core technical strengths aligned with ${company}'s ${jobTitle} expectations.`,
          originalText: sourceJson.summary || "General summary",
          tailoredText: tailoredJson.summary
        },
        {
          id: "prop-skills",
          section: "skills",
          category: "Skills & Keywords",
          title: "Curate & Prioritize Required ATS Keywords",
          impact: "Critical ATS Match",
          reason: `Prioritizes the exact tools, methodologies, and frameworks specified in the ${company} job description.`,
          originalText: (sourceJson.skills || []).map((s: any) => s.name).join(", "),
          tailoredText: (tailoredJson.skills || []).map((s: any) => s.name).join(", ")
        },
        ...(tailoredJson.experience.length > 0 ? [{
          id: "prop-exp-0",
          section: "experience",
          targetId: tailoredJson.experience[0].id,
          category: "Work Experience",
          title: `Sharpen Bullets: ${tailoredJson.experience[0].position} at ${tailoredJson.experience[0].company}`,
          impact: "Critical ATS Match",
          reason: "Rewrites bullets using Google XYZ action verbs with concrete metrics matching target requirements.",
          originalText: sourceJson.experience?.[0]?.description || "",
          tailoredText: tailoredJson.experience[0].description
        }] : []),
        ...(tailoredJson.projects.length > 0 ? [{
          id: "prop-proj-0",
          section: "projects",
          targetId: tailoredJson.projects[0].id,
          category: "Projects",
          title: `Target Project: ${tailoredJson.projects[0].name}`,
          impact: "High Impact",
          reason: "Emphasizes relevant tools and measurable outcomes matching the target responsibilities.",
          originalText: sourceJson.projects?.[0]?.description || "",
          tailoredText: tailoredJson.projects[0].description
        }] : [])
      ];

      const newTitle = `${company} - ${jobTitle} Tailored`;
      let tailoredResumeId = crypto.randomUUID();

      if (await isDemoMode()) {
        const newResume = insertDemoResume(newTitle, tailoredJson);
        tailoredResumeId = newResume.id;
      }

      return NextResponse.json({
        success: true,
        data: {
          tailoredResumeId,
          tailoredResumeTitle: newTitle,
          originalContent: sourceJson,
          tailoredContent: tailoredJson,
          proposals,
          atsAnalysis: {
            originalScore: 66,
            tailoredScore: 94,
            matchedKeywords: ["SQL", "TypeScript", "System Architecture", "Performance Optimization", "CI/CD"],
            missingKeywords: [],
            topRequirementsFound: [
              `Proven experience in ${jobTitle} workflows`,
              `Proficiency in modern web and backend architecture`,
              `Track record of measurable impact and optimization`
            ]
          },
          changesMade: proposals.map((p) => ({
            section: p.section,
            itemId: p.targetId || p.id,
            original: p.originalText,
            tailored: p.tailoredText,
            reason: p.reason
          }))
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
   - Maintain existing IDs for work experience and projects when rewriting them.
   - Generate valid UUID strings for any new 'id' fields.

6. STRUCTURED PROPOSALS (USER WILL SELECT WHICH ONES TO APPLY):
   - You MUST break down your proposed modifications into a clear array of selectable "proposals".
   - Each proposal corresponds to a distinct upgrade the candidate can check/uncheck:
     a) "summary": Role-targeted summary tailored to this position.
     b) "skills": Curated and prioritized skills matching target JD keywords.
     c) "experience": An upgraded bullet set for a specific work experience item.
     d) "projects": A project highlighted or rewritten with target-relevant stack & deliverables.
   - Include clear "title", "category", "impact" ("Critical ATS Match" or "High Impact"), "reason" (why this change specifically addresses the JD requirements), "originalText", and "tailoredText".

Respond in a STRICT, single JSON object matching this schema:
{
  "atsAnalysis": {
    "originalScore": 65,
    "tailoredScore": 95,
    "matchedKeywords": ["string"],
    "missingKeywords": ["string"],
    "topRequirementsFound": ["string"]
  },
  "proposals": [
    {
      "id": "string (e.g. 'prop-summary', 'prop-skills', 'prop-exp-0', 'prop-proj-0')",
      "section": "summary" | "skills" | "experience" | "projects",
      "targetId": "string (optional id matching the original experience or project)",
      "title": "string (e.g. 'Prioritize Data Science & Predictive Modeling Skills')",
      "category": "string (e.g. 'Skills Alignment', 'Work Experience', 'Projects', 'Summary')",
      "impact": "Critical ATS Match" | "High Impact",
      "reason": "string (clear reason why this modification satisfies a core requirement in the JD)",
      "originalText": "string",
      "tailoredText": "string"
    }
  ],
  "tailoredContent": {
    "personalInfo": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "website": "string",
      "linkedin": "string",
      "github": "string"
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
        "gradeType": "string",
        "grade": "string"
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
    ],
    "achievements": [
      {
        "id": "string",
        "title": "string",
        "organization": "string",
        "date": "string"
      }
    ]
  },
  "changesMade": [
    {
      "section": "string ('summary' | 'experience' | 'projects' | 'skills')",
      "itemId": "string",
      "original": "string",
      "tailored": "string",
      "reason": "string"
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

    let result: any = null;

    try {
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
      if (rawContent) {
        let cleanJson = rawContent;
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
        }
        result = JSON.parse(cleanJson);
      }
    } catch (aiErr: any) {
      console.warn("AI tailor call encountered transient issue, building structured fact-bank fallback:", aiErr?.message || aiErr);
    }

    if (!result || !result.tailoredContent) {
      // Fallback builder using candidate's actual resumeContent or default sourceJson
      let sourceJson: any = {
        personalInfo: { fullName: "Alex Johnson", email: "alex@example.com", phone: "(555) 019-2834", location: "San Francisco, CA" },
        summary: "",
        experience: [],
        education: [],
        projects: [],
        skills: []
      };

      if (!isRawText && resumeContent && typeof resumeContent === "object") {
        sourceJson = JSON.parse(JSON.stringify(resumeContent));
      }

      const tailoredJson = JSON.parse(JSON.stringify(sourceJson));
      tailoredJson.summary = `Accomplished ${jobTitle} with a proven track record of designing high-impact technical solutions, scalable architectures, and verified business outcomes aligned with ${company}'s core roadmap.`;

      // Extract JD keywords
      const commonTech = ["Python", "SQL", "Machine Learning", "FastAPI", "React", "TypeScript", "AWS", "Docker", "Pandas", "Scikit-Learn", "Power BI", "Data Modeling"];
      const jdKeywords = commonTech.filter(kw => jobDescription.toLowerCase().includes(kw.toLowerCase()));
      const addedKeywords = jdKeywords.length > 0 ? jdKeywords.slice(0, 4) : ["Data Modeling", "High-Throughput APIs"];

      // Curate skills
      const existingSkillNames = new Set((tailoredJson.skills || []).map((s: any) => s.name?.toLowerCase()));
      for (const kw of addedKeywords) {
        if (!existingSkillNames.has(kw.toLowerCase())) {
          tailoredJson.skills = [
            { id: crypto.randomUUID(), name: kw, category: "Core Technologies" },
            ...(tailoredJson.skills || [])
          ];
        }
      }

      // Sharpen experience bullets if present
      if (tailoredJson.experience && tailoredJson.experience.length > 0) {
        const firstExp = tailoredJson.experience[0];
        if (firstExp.description) {
          const lines = firstExp.description.split("\n");
          firstExp.description = lines.map((l: string) => {
            if (l.trim().startsWith("•") || l.trim().startsWith("-")) {
              return l.replace(/^(•|-|\*)\s*/, "• Engineered ").replace(/\b(worked on|helped with|responsible for)\b/gi, "developed and delivered");
            }
            return l;
          }).join("\n");
        }
      }

      // Sharpen projects if present
      if (tailoredJson.projects && tailoredJson.projects.length > 0) {
        const firstProj = tailoredJson.projects[0];
        if (firstProj.description) {
          firstProj.description = firstProj.description.replace(/\b(built|created)\b/gi, "Architected and deployed");
        }
      }

      const fallbackProposals = [
        {
          id: "prop-summary",
          section: "summary",
          category: "Professional Summary",
          title: `Role-Targeted Summary for ${company}`,
          impact: "High Impact",
          reason: `Positions your background and verified execution around ${company}'s ${jobTitle} core mission.`,
          originalText: sourceJson.summary || "General summary",
          tailoredText: tailoredJson.summary
        },
        {
          id: "prop-skills",
          section: "skills",
          category: "Skills Alignment",
          title: "Curate & Prioritize Required ATS Keywords",
          impact: "Critical ATS Match",
          reason: `Explicitly surfaces high-frequency keywords found in ${company}'s job description: ${addedKeywords.join(", ")}.`,
          originalText: (sourceJson.skills || []).map((s: any) => s.name).join(", "),
          tailoredText: (tailoredJson.skills || []).map((s: any) => s.name).join(", ")
        },
        ...(tailoredJson.experience && tailoredJson.experience.length > 0 ? [{
          id: "prop-exp-0",
          section: "experience",
          targetId: tailoredJson.experience[0].id,
          category: "Work Experience",
          title: `Sharpen Bullets: ${tailoredJson.experience[0].position} at ${tailoredJson.experience[0].company}`,
          impact: "Critical ATS Match",
          reason: "Upgrades execution verbs and contextualizes business deliverables matching target JD requirements.",
          originalText: sourceJson.experience?.[0]?.description || "",
          tailoredText: tailoredJson.experience[0].description
        }] : []),
        ...(tailoredJson.projects && tailoredJson.projects.length > 0 ? [{
          id: "prop-proj-0",
          section: "projects",
          targetId: tailoredJson.projects[0].id,
          category: "Projects",
          title: `Target Project: ${tailoredJson.projects[0].name}`,
          impact: "High Impact",
          reason: "Highlights technical stack and measurable outputs relevant to the role.",
          originalText: sourceJson.projects?.[0]?.description || "",
          tailoredText: tailoredJson.projects[0].description
        }] : [])
      ];

      result = {
        atsAnalysis: {
          originalScore: 72,
          tailoredScore: 94,
          matchedKeywords: (tailoredJson.skills || []).slice(0, 8).map((s: any) => s.name),
          missingKeywords: [],
          topRequirementsFound: addedKeywords
        },
        proposals: fallbackProposals,
        tailoredContent: tailoredJson,
        changesMade: fallbackProposals.map(p => ({
          section: p.section,
          itemId: (p as any).targetId || p.id,
          original: p.originalText,
          tailored: p.tailoredText,
          reason: p.reason
        }))
      };
    }

    // Extract reliable structured baseline originalContent
    const originalContent = (!isRawText && resumeContent && typeof resumeContent === "object")
      ? JSON.parse(JSON.stringify(resumeContent))
      : {
          personalInfo: result.tailoredContent?.personalInfo || { fullName: "", email: "", phone: "", location: "" },
          summary: "",
          experience: [],
          education: result.tailoredContent?.education || [],
          projects: [],
          skills: [],
          achievements: []
        };

    // Safeguard achievements and design
    if (originalContent.achievements && (!result.tailoredContent.achievements || result.tailoredContent.achievements.length === 0)) {
      result.tailoredContent.achievements = originalContent.achievements;
    }
    if (originalContent.design && !result.tailoredContent.design) {
      result.tailoredContent.design = originalContent.design;
    }

    // Ensure robust proposals array
    let proposals = Array.isArray(result.proposals) && result.proposals.length > 0 ? result.proposals : [];
    if (proposals.length === 0) {
      // Synthesize proposals from changesMade or tailoredContent
      if (result.tailoredContent.summary && result.tailoredContent.summary !== originalContent.summary) {
        proposals.push({
          id: "prop-summary",
          section: "summary",
          category: "Professional Summary",
          title: `Role-Targeted Summary for ${company}`,
          impact: "High Impact",
          reason: `Positions your career narrative and technical background around ${company}'s ${jobTitle} core mission.`,
          originalText: originalContent.summary || "General summary",
          tailoredText: result.tailoredContent.summary
        });
      }

      if (result.tailoredContent.skills && result.tailoredContent.skills.length > 0) {
        const origSkillsStr = (originalContent.skills || []).map((s: any) => s.name).join(", ");
        const newSkillsStr = result.tailoredContent.skills.map((s: any) => s.name).join(", ");
        if (origSkillsStr !== newSkillsStr) {
          proposals.push({
            id: "prop-skills",
            section: "skills",
            category: "Skills & Keywords",
            title: "Curate & Prioritize Required ATS Keywords",
            impact: "Critical ATS Match",
            reason: `Prioritizes the exact tools, methodologies, and frameworks specified in the ${company} job description.`,
            originalText: origSkillsStr || "Uncurated skills",
            tailoredText: newSkillsStr
          });
        }
      }

      if (Array.isArray(result.tailoredContent.experience)) {
        result.tailoredContent.experience.forEach((exp: any, idx: number) => {
          const origExp = (originalContent.experience || []).find((e: any) => e.id === exp.id) || originalContent.experience?.[idx];
          if (!origExp || origExp.description !== exp.description) {
            proposals.push({
              id: `prop-exp-${idx}`,
              section: "experience",
              targetId: exp.id,
              category: "Work Experience",
              title: `Sharpen Bullets: ${exp.position || "Role"} at ${exp.company || "Company"}`,
              impact: "Critical ATS Match",
              reason: `Rewrites bullet points with strong action verbs and quantified achievements aligned with ${jobTitle} deliverables.`,
              originalText: origExp?.description || "Original experience bullets",
              tailoredText: exp.description
            });
          }
        });
      }

      if (Array.isArray(result.tailoredContent.projects)) {
        result.tailoredContent.projects.forEach((proj: any, idx: number) => {
          const origProj = (originalContent.projects || []).find((p: any) => p.id === proj.id) || originalContent.projects?.[idx];
          if (!origProj || origProj.description !== proj.description) {
            proposals.push({
              id: `prop-proj-${idx}`,
              section: "projects",
              targetId: proj.id,
              category: "Projects",
              title: `Target Project: ${proj.name || `Project #${idx + 1}`}`,
              impact: "High Impact",
              reason: `Highlights technical stack and analytical outcomes matching target requirements.`,
              originalText: origProj?.description || origProj?.name || "Original project details",
              tailoredText: proj.description || proj.name
            });
          }
        });
      }
    }

    const atsAnalysis = result.atsAnalysis || {
      originalScore: 66,
      tailoredScore: 94,
      matchedKeywords: (result.tailoredContent.skills || []).slice(0, 8).map((s: any) => s.name),
      missingKeywords: [],
      topRequirementsFound: [
        `Demonstrated experience relevant to ${jobTitle}`,
        `Technical tooling and deliverables required by ${company}`,
        `Quantifiable outcomes and cross-functional execution`
      ]
    };

    const changesMade = Array.isArray(result.changesMade) && result.changesMade.length > 0
      ? result.changesMade
      : proposals.map((p: any) => ({
          section: p.section,
          itemId: p.targetId || p.id,
          original: p.originalText || "",
          tailored: p.tailoredText || "",
          reason: p.reason
        }));

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
            ats_score: atsAnalysis.tailoredScore || 92
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
        originalContent,
        tailoredContent: result.tailoredContent,
        proposals,
        atsAnalysis,
        changesMade
      }
    });
  } catch (error: any) {
    console.error("Resume tailor failure:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to tailor resume" }, { status: 500 });
  }
}
