import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";

interface RawParsedData {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience?: Array<{
    id?: string;
    company?: string;
    position?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string | string[];
  }>;
  education?: Array<{
    id?: string;
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    gradeType?: string;
    grade?: string;
    description?: string | string[];
  }>;
  projects?: Array<{
    id?: string;
    name?: string;
    role?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
    description?: string | string[];
  }>;
  skills?: Array<
    | string
    | {
        id?: string;
        name?: string;
        category?: string;
        level?: string;
      }
  >;
  design?: Record<string, any>;
}

/**
 * Normalizes and defensively guarantees all required fields, unique UUIDs,
 * clean bullet points, and typed schema for the builder.
 */
function normalizeResumeData(raw: RawParsedData, originalText = "") {
  const lines = originalText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Personal Info
  const rawPI = raw.personalInfo || {};
  let detectedName = (rawPI.fullName || "").trim();
  if (!detectedName) {
    for (const line of lines.slice(0, 5)) {
      if (
        !line.includes("@") &&
        !line.match(/\d{5,}/) &&
        !line.toLowerCase().includes("resume") &&
        !line.toLowerCase().includes("curriculum") &&
        line.length >= 2 &&
        line.length < 50
      ) {
        detectedName = line;
        break;
      }
    }
  }

  const personalInfo = {
    fullName: detectedName || "Candidate",
    email: (rawPI.email || "").trim(),
    phone: (rawPI.phone || "").trim(),
    location: (rawPI.location || "").trim(),
    website: (rawPI.website || "").trim(),
    linkedin: (rawPI.linkedin || "").trim(),
    github: (rawPI.github || "").trim()
  };

  // 2. Summary
  const summary = (raw.summary || "").trim();

  // Helper to normalize descriptions (arrays to newline-joined string, bullets standardized)
  const formatBulletDescription = (desc: string | string[] | undefined): string => {
    if (!desc) return "";
    let str = "";
    if (Array.isArray(desc)) {
      str = desc.map((b) => String(b || "").trim()).filter(Boolean).join("\n");
    } else {
      str = String(desc).trim();
    }
    // Clean up excessive empty lines
    return str
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  };

  // 3. Experience
  const rawExp = Array.isArray(raw.experience) ? raw.experience : [];
  const experience = rawExp
    .filter((exp) => exp && (exp.company || exp.position || exp.description))
    .map((exp) => ({
      id: exp.id || crypto.randomUUID(),
      company: (exp.company || "").trim(),
      position: (exp.position || "").trim(),
      location: (exp.location || "").trim(),
      startDate: (exp.startDate || "").trim(),
      endDate: (exp.endDate || "").trim(),
      current: Boolean(exp.current),
      description: formatBulletDescription(exp.description)
    }));

  // 4. Education
  const rawEdu = Array.isArray(raw.education) ? raw.education : [];
  const education = rawEdu
    .filter((edu) => edu && (edu.school || edu.degree || edu.fieldOfStudy || edu.description))
    .map((edu) => {
      let gradeType = (edu.gradeType || "none").toLowerCase();
      if (!["cgpa", "percentage", "gpa", "none"].includes(gradeType)) {
        gradeType = "none";
      }
      return {
        id: edu.id || crypto.randomUUID(),
        school: (edu.school || "").trim(),
        degree: (edu.degree || "").trim(),
        fieldOfStudy: (edu.fieldOfStudy || "").trim(),
        location: (edu.location || "").trim(),
        startDate: (edu.startDate || "").trim(),
        endDate: (edu.endDate || "").trim(),
        current: Boolean(edu.current),
        gradeType,
        grade: (edu.grade || "").trim(),
        description: formatBulletDescription(edu.description)
      };
    });

  // 5. Projects
  const rawProj = Array.isArray(raw.projects) ? raw.projects : [];
  const projects = rawProj
    .filter((proj) => proj && (proj.name || proj.role || proj.description))
    .map((proj) => ({
      id: proj.id || crypto.randomUUID(),
      name: (proj.name || "").trim(),
      role: (proj.role || "").trim(),
      link: (proj.link || "").trim(),
      startDate: (proj.startDate || "").trim(),
      endDate: (proj.endDate || "").trim(),
      description: formatBulletDescription(proj.description)
    }));

  // 6. Skills
  const rawSkills = Array.isArray(raw.skills) ? raw.skills : [];
  const seenSkillNames = new Set<string>();
  const skills: Array<{ id: string; name: string; category: string; level: string }> = [];

  rawSkills.forEach((sk) => {
    if (!sk) return;
    let name = "";
    let category = "Technical Skills";
    let level = "Intermediate";

    if (typeof sk === "string") {
      name = sk.trim();
    } else {
      name = (sk.name || "").trim();
      category = (sk.category || "Technical Skills").trim();
      level = (sk.level || "Intermediate").trim();
    }

    if (name && !seenSkillNames.has(name.toLowerCase())) {
      seenSkillNames.add(name.toLowerCase());
      skills.push({
        id: (typeof sk === "object" && sk.id) ? sk.id : crypto.randomUUID(),
        name,
        category,
        level
      });
    }
  });

  // 7. Design settings
  const design = {
    fontFamily: raw.design?.fontFamily || "font-sans",
    fontSize: raw.design?.fontSize || "md",
    sectionOrder: raw.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"],
    density: raw.design?.density || "normal",
    sectionSpacing: raw.design?.sectionSpacing || 1.0,
    itemSpacing: raw.design?.itemSpacing || 1.0,
    lineHeight: raw.design?.lineHeight || 1.4
  };

  return {
    personalInfo,
    summary,
    experience,
    education,
    projects,
    skills,
    design
  };
}

/**
 * Intelligent heuristic fallback parser for offline/no-key mode or when LLM fails
 */
function extractResumeHeuristics(text: string): RawParsedData {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Contact Info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|(?:\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+\d{10,13}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin|github)[a-zA-Z0-9-]+\.(?:com|io|dev|org|net|me|in)(?:\/[^\s]*)?/i);

  // Name
  let fullName = "";
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes("@") &&
      !line.match(/\d{5,}/) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum") &&
      line.length >= 2 &&
      line.length < 50
    ) {
      fullName = line;
      break;
    }
  }

  // Summary / Profile
  let summary = "";
  const summaryIdx = lines.findIndex((l) => /^(?:summary|professional summary|profile|about me|objective)\b/i.test(l));
  if (summaryIdx !== -1) {
    const summaryLines: string[] = [];
    for (let i = summaryIdx + 1; i < Math.min(summaryIdx + 6, lines.length); i++) {
      if (/^(?:experience|work|education|skills|projects|certifications)\b/i.test(lines[i])) break;
      summaryLines.push(lines[i]);
    }
    summary = summaryLines.join(" ");
  }

  // Section splitting
  const sections: Record<string, string[]> = {
    experience: [],
    education: [],
    projects: [],
    skills: []
  };

  let currentSection = "";
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^(?:experience|work experience|employment|work history)\b/i.test(lower)) {
      currentSection = "experience";
      continue;
    } else if (/^(?:education|academics|qualifications)\b/i.test(lower)) {
      currentSection = "education";
      continue;
    } else if (/^(?:projects|personal projects|key projects)\b/i.test(lower)) {
      currentSection = "projects";
      continue;
    } else if (/^(?:skills|technical skills|core competencies|tools)\b/i.test(lower)) {
      currentSection = "skills";
      continue;
    } else if (/^(?:certifications|awards|publications|leadership)\b/i.test(lower)) {
      currentSection = "education";
      continue;
    }

    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  // Experience heuristic extraction
  const experiences: any[] = [];
  let currentExp: any = null;
  const expLines = sections.experience.length > 0 ? sections.experience : lines;

  expLines.forEach((line) => {
    const isHeaderLine =
      line.includes("|") ||
      line.includes(" - ") ||
      /\b(19\d{2}|20\d{2})\b/.test(line) ||
      /\b(engineer|developer|manager|lead|intern|analyst|designer|consultant|architect|specialist)\b/i.test(line);

    if (isHeaderLine && !line.startsWith("-") && !line.startsWith("•") && !line.startsWith("*")) {
      if (currentExp && (currentExp.company || currentExp.position)) {
        experiences.push(currentExp);
      }
      const parts = line.split(/[|•·–—]/).map((p) => p.trim());
      const dates: string[] = Array.from(line.match(/\b(19\d{2}|20\d{2}|Present)\b/gi) || []);
      currentExp = {
        company: parts[0] || "Company",
        position: parts[1] || "Role / Position",
        location: parts[2] && !dates.includes(parts[2]) ? parts[2] : "",
        startDate: dates[0] || "",
        endDate: dates[1] || (line.toLowerCase().includes("present") ? "Present" : ""),
        current: line.toLowerCase().includes("present"),
        description: ""
      };
    } else if (currentExp) {
      const cleanBullet = line.replace(/^[-•*]\s*/, "");
      currentExp.description = currentExp.description ? `${currentExp.description}\n${cleanBullet}` : cleanBullet;
    }
  });
  if (currentExp && (currentExp.company || currentExp.position)) {
    experiences.push(currentExp);
  }

  // Education heuristic extraction
  const education: any[] = [];
  const eduKeywords = ["b.tech", "bachelor", "master", "m.tech", "b.s.", "m.s.", "ph.d", "degree", "university", "institute", "college", "iit", "nit", "school", "high school", "diploma"];
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (eduKeywords.some((k) => lower.includes(k)) && !lower.startsWith("degree university")) {
      const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
      let school = "University / College";
      let degree = "Bachelor's Degree";
      let fieldOfStudy = "Computer Science / Engineering";

      if (/college|university|institute|school|iit|nit/i.test(line)) {
        school = line.split(/[0-9|•]/)[0].trim().slice(0, 50);
      }
      if (/b\.tech|btech|bachelor/i.test(line)) degree = "Bachelor of Technology";
      else if (/m\.tech|mtech|master/i.test(line)) degree = "Master's Degree";
      else if (/ph\.?d/i.test(line)) degree = "Ph.D.";

      let gradeType = "none";
      let grade = "";
      const cgpaMatch = line.match(/\b(?:cgpa|gpa)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+(?:\.[0-9]+)?)?)/i);
      const percentMatch = line.match(/\b([0-9]+(?:\.[0-9]+)?)\s*%/i);
      if (cgpaMatch) {
        gradeType = /gpa/i.test(line) && !/cgpa/i.test(line) ? "gpa" : "cgpa";
        grade = cgpaMatch[1];
      } else if (percentMatch) {
        gradeType = "percentage";
        grade = percentMatch[1].endsWith("%") ? percentMatch[1] : `${percentMatch[1]}%`;
      }

      education.push({
        school,
        degree,
        fieldOfStudy,
        location: "",
        startDate: "",
        endDate: yearMatch ? yearMatch[0] : "Present",
        current: !yearMatch || parseInt(yearMatch[0]) >= new Date().getFullYear(),
        gradeType,
        grade,
        description: line
      });
    }
  });

  // Projects heuristic extraction
  const projects: any[] = [];
  let currentProj: any = null;
  sections.projects.forEach((line) => {
    if (line.includes("|") || line.includes(" - ") || (!line.startsWith("-") && !line.startsWith("•") && line.length < 60)) {
      if (currentProj && currentProj.name) {
        projects.push(currentProj);
      }
      const parts = line.split(/[|•·–—]/).map((p) => p.trim());
      const linkMatch = line.match(/https?:\/\/[^\s]+/);
      currentProj = {
        name: parts[0] || "Project",
        role: parts[1] || "Creator / Developer",
        link: linkMatch ? linkMatch[0] : "",
        startDate: "",
        endDate: "",
        description: ""
      };
    } else if (currentProj) {
      const cleanBullet = line.replace(/^[-•*]\s*/, "");
      currentProj.description = currentProj.description ? `${currentProj.description}\n${cleanBullet}` : cleanBullet;
    }
  });
  if (currentProj && currentProj.name) {
    projects.push(currentProj);
  }

  // Skills
  const commonTech = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL",
    "C++", "Java", "Docker", "Git", "Machine Learning", "PyTorch", "TensorFlow", "Pandas",
    "NumPy", "Tailwind CSS", "Linux", "FastAPI", "AWS", "HTML/CSS", "Figma", "Excel",
    "Kubernetes", "Redis", "MongoDB", "Express", "GraphQL", "Go", "Rust", "CI/CD", "REST APIs"
  ];
  const detectedSkills: any[] = [];
  commonTech.forEach((tech) => {
    const regex = new RegExp(`\\b${tech.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) {
      detectedSkills.push({
        name: tech,
        category: "Technical Skills",
        level: "Intermediate"
      });
    }
  });

  return {
    personalInfo: {
      fullName,
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      location: "",
      website: websiteMatch ? websiteMatch[0] : "",
      linkedin: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : ""
    },
    summary,
    experience: experiences.slice(0, 10),
    education: education.slice(0, 5),
    projects: projects.slice(0, 10),
    skills: detectedSkills
  };
}

export async function POST(request: Request) {
  try {
    // Optional session validation if user is signed in
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const resumeText = (body.resumeText || body.rawText || body.text || "").trim();

    if (!resumeText) {
      return NextResponse.json({ success: false, error: "Resume text is required" }, { status: 400 });
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured || !openai) {
      const fallbackData = extractResumeHeuristics(resumeText);
      const normalized = normalizeResumeData(fallbackData, resumeText);
      return NextResponse.json({ success: true, data: normalized });
    }

    const systemPrompt = `You are a professional, high-precision AI resume parsing assistant.
Your task is to take raw, unstructured text from a candidate's resume and extract/convert ALL elements into a comprehensive, strictly structured JSON object.

CRITICAL EXTRACTION RULES:
1. 100% COMPLETE EXTRACTION: You MUST extract EVERY SINGLE piece of information present in the resume text. Do NOT summarize, shorten, omit, or drop ANY work experience entries, projects, education entries, certifications, or skills.
2. PRESERVE FULL BULLET POINTS: For each experience and project, preserve all bullet points, numbers, percentages, metrics, and technical contributions verbatim. Format bullets separated by newlines in the "description" string. Do NOT compress multiple bullets into a short one-liner.
3. CAPTURE ALL ROLES & DATES: Extract every single job title, company name, location, startDate, endDate, and whether it is current.
4. EDUCATION & CERTIFICATIONS: Extract all degrees, universities, high schools, graduation years, fields of study, and GPA/CGPA/Percentage. If there are certifications, courses, or licenses (e.g. AWS, PMP, CKA, Coursera), include them in education with degree: "Certification" or in skills so nothing is omitted.
5. PROJECTS & ACHIEVEMENTS: Extract all personal/open-source projects, competitions, hackathons, awards, or leadership initiatives into the "projects" array with name, role, link (if available), dates, and full bullet points.
6. SKILLS COMPREHENSIVENESS: Extract ALL skills mentioned across programming languages, frameworks, libraries, databases, cloud platforms, tools, and methodologies into the "skills" array. Categorize them logically (e.g. "Languages", "Frameworks & Libraries", "Databases & Cloud", "Developer Tools", "Soft Skills").

JSON OUTPUT SCHEMA:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string (extract complete summary or profile paragraph)",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string (all bullet points separated by newlines)"
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "gradeType": "string ('cgpa' | 'percentage' | 'gpa' | 'none')",
      "grade": "string (e.g. '8.8 / 10' or '85%' or '3.8 / 4.0')",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "link": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (all bullet points separated by newlines)"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string",
      "level": "string"
    }
  ]
}

Return ONLY the raw JSON object. Do NOT wrap in markdown \`\`\`json blocks or add explanations.`;

    // Support up to 50,000 characters to ensure multi-page resumes and OCR results are never cut off
    const cleanResumeText = resumeText.slice(0, 50000);

    let parsedData: RawParsedData | null = null;

    try {
      const response = await openai.chat.completions.create({
        model: modelPro,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Candidate Resume Text:\n${cleanResumeText}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 8192
      });

      const rawContent = response.choices[0]?.message?.content?.trim();
      if (rawContent) {
        let cleanJson = rawContent;
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }
        parsedData = JSON.parse(cleanJson);
      }
    } catch (aiErr: any) {
      console.warn("AI Completion or JSON parsing failed in /api/ai/parse, activating heuristic fallback:", aiErr.message);
    }

    // If AI failed or returned empty data, use smart heuristics
    if (!parsedData || (!parsedData.experience?.length && !parsedData.education?.length && !parsedData.skills?.length)) {
      const fallbackData = extractResumeHeuristics(resumeText);
      parsedData = {
        ...(parsedData || {}),
        personalInfo: { ...fallbackData.personalInfo, ...(parsedData?.personalInfo || {}) },
        summary: parsedData?.summary || fallbackData.summary,
        experience: (parsedData?.experience && parsedData.experience.length > 0) ? parsedData.experience : fallbackData.experience,
        education: (parsedData?.education && parsedData.education.length > 0) ? parsedData.education : fallbackData.education,
        projects: (parsedData?.projects && parsedData.projects.length > 0) ? parsedData.projects : fallbackData.projects,
        skills: (parsedData?.skills && parsedData.skills.length > 0) ? parsedData.skills : fallbackData.skills
      };
    }

    const finalResume = normalizeResumeData(parsedData, resumeText);

    return NextResponse.json({ success: true, data: finalResume });
  } catch (error: any) {
    console.error("Resume parse failure:", error);
    // Even in total crash, attempt heuristic extraction so the user is never left with an error screen
    try {
      const body = await request.json().catch(() => ({}));
      const text = (body.resumeText || body.rawText || body.text || "").trim();
      if (text) {
        const fallback = normalizeResumeData(extractResumeHeuristics(text), text);
        return NextResponse.json({ success: true, data: fallback });
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ success: false, error: error.message || "Failed to parse resume text" }, { status: 500 });
  }
}
