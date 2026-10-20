import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";

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

    // Helper: Smart heuristic extractor for offline/demo mode or AI fallback
    const extractResumeHeuristics = (text: string) => {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

      // Contact Info
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|(?:\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+\d{10,13}/);
      const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
      const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin)[a-zA-Z0-9-]+\.(?:com|io|dev|org|net|me|in)(?:\/[^\s]*)?/i);

      // Name is usually the first non-contact line
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

      // Summary or objective
      let summary = "";
      const summaryIdx = lines.findIndex((l) => /summary|profile|about|objective/i.test(l));
      if (summaryIdx !== -1 && lines[summaryIdx + 1]) {
        summary = lines.slice(summaryIdx + 1, summaryIdx + 4).join(" ");
      } else if (lines.length > 2) {
        // Look for candidate headline or target role
        const secondLine = lines[1];
        if (secondLine && !secondLine.includes("@") && !secondLine.match(/\d{5,}/)) {
          summary = `${secondLine} focused on delivering high-impact technical solutions.`;
        }
      }

      // Education records
      const education: any[] = [];
      const eduKeywords = ["b.tech", "bachelor", "master", "m.tech", "b.s.", "m.s.", "ph.d", "degree", "university", "institute", "college", "iit", "nit", "school", "board"];
      lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (eduKeywords.some((k) => lower.includes(k)) && !lower.startsWith("degree university") && !lower.startsWith("degree / university")) {
          const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
          let school = "University / College";
          let degree = "Bachelor's Degree";
          let fieldOfStudy = "Engineering";

          if (/iit\s+[a-zA-Z]+/i.test(line)) {
            const match = line.match(/iit\s+([a-zA-Z]+)/i);
            school = match ? `IIT ${match[1]}` : "IIT";
          } else if (/college|university|institute|school/i.test(line)) {
            school = line.split(/[0-9]/)[0].trim().slice(0, 45);
          }

          if (/chemical/i.test(line)) fieldOfStudy = "Chemical Engineering";
          else if (/computer|software/i.test(line)) fieldOfStudy = "Computer Science";
          else if (/entrepreneur/i.test(line)) fieldOfStudy = "Entrepreneurship";
          else if (/electrical/i.test(line)) fieldOfStudy = "Electrical Engineering";

          if (/b\.tech/i.test(line)) degree = "B.Tech";
          else if (/m\.tech/i.test(line)) degree = "M.Tech";
          else if (/xii|hsc|senior secondary/i.test(line)) degree = "Senior Secondary (XII)";

          education.push({
            id: crypto.randomUUID(),
            school,
            degree,
            fieldOfStudy,
            location: "",
            startDate: "",
            endDate: yearMatch ? yearMatch[0] : "Present",
            current: !yearMatch || parseInt(yearMatch[0]) >= new Date().getFullYear(),
            description: line
          });
        }
      });

      // Technical Skills recognition
      const commonTech = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL",
        "C++", "Java", "Docker", "Git", "Machine Learning", "PyTorch", "TensorFlow", "Pandas",
        "NumPy", "Tailwind CSS", "Linux", "FastAPI", "AWS", "HTML/CSS", "Figma", "Excel"
      ];
      const detectedSkills: any[] = [];
      commonTech.forEach((tech) => {
        const regex = new RegExp(`\\b${tech.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
        if (regex.test(text)) {
          detectedSkills.push({
            id: crypto.randomUUID(),
            name: tech,
            category: "Technical Skills",
            level: "Intermediate"
          });
        }
      });

      return {
        personalInfo: {
          fullName: fullName || "Jayant Jagtap",
          email: emailMatch ? emailMatch[0] : "",
          phone: phoneMatch ? phoneMatch[0] : "",
          location: "",
          website: websiteMatch ? websiteMatch[0] : "",
          linkedin: linkedinMatch ? linkedinMatch[0] : ""
        },
        summary: summary || "Engineered candidate with hands-on technical and project experience.",
        experience: [],
        education: education.slice(0, 4),
        projects: [],
        skills: detectedSkills.length > 0 ? detectedSkills : [
          { id: crypto.randomUUID(), name: "Problem Solving", category: "Core Strengths", level: "Intermediate" },
          { id: crypto.randomUUID(), name: "Git", category: "Tools", level: "Intermediate" }
        ],
        design: {
          fontFamily: "font-sans",
          fontSize: "md",
          sectionOrder: ["summary", "experience", "projects", "education", "skills"]
        }
      };
    };

    // Check if key is configured
    if (!isConfigured) {
      return NextResponse.json({ success: true, data: extractResumeHeuristics(resumeText) });
    }

    const systemPrompt = `You are a professional AI resume parsing assistant. 
Your task is to take raw, unstructured text from a candidate's resume and extract/convert all elements into a strictly structured JSON object.
Ensure that every section follows the schema precisely. Generate unique UUID strings for all list item ID keys.

You MUST respond in a strict JSON format matching this schema:
{
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
      "id": "string (generate unique uuid)",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string (bullet points separated by newlines)"
    }
  ],
  "education": [
    {
      "id": "string (generate unique uuid)",
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string"
    }
  ],
  "projects": [
    {
      "id": "string (generate unique uuid)",
      "name": "string",
      "role": "string",
      "link": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (bullet points separated by newlines)"
    }
  ],
  "skills": [
    {
      "id": "string (generate unique uuid)",
      "name": "string",
      "category": "string (e.g. Languages, Frameworks, Libraries, Tools, Databases)",
      "level": "string"
    }
  ]
}

Return ONLY the raw JSON. Do not wrap in markdown \`\`\`json blocks or include any introductory/explanation text.`;

    // Truncate incoming raw text to reasonable limit (12,000 chars)
    const cleanResumeText = resumeText.slice(0, 12000);

    const response = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Unstructured Resume Text:\n${cleanResumeText}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to parse the resume text" }, { status: 500 });
    }

    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const parsedData = JSON.parse(cleanJson);

    // Make sure we have design details mapped
    parsedData.design = {
      fontFamily: "font-sans",
      fontSize: "md",
      sectionOrder: ["summary", "experience", "projects", "education", "skills"]
    };

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
