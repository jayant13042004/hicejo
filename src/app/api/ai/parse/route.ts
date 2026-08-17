import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Optional session validation if user is signed in
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { resumeText } = await request.json();

    if (!resumeText || resumeText.trim() === "") {
      return NextResponse.json({ success: false, error: "Resume text is required" }, { status: 400 });
    }

    const { openai, modelPro, isConfigured } = getAIClient();

    // Check if key is configured
    if (!isConfigured) {
      // Mock Parsed Resume for local fallback / sandbox testing
      const mockParsed = {
        personalInfo: {
          fullName: "Alex Rivera",
          email: "alex.rivera@email.com",
          phone: "(555) 432-1098",
          location: "Austin, TX",
          website: "https://alexrivera.dev",
          linkedin: "https://linkedin.com/in/alex-rivera"
        },
        summary: "Results-driven Software Engineer with 4+ years of experience designing scalable web architectures and leading cross-functional teams. Specialized in TypeScript, React, Node.js, and cloud deployments.",
        experience: [
          {
            id: crypto.randomUUID(),
            company: "TechNova Solutions",
            position: "Senior Software Engineer",
            location: "Austin, TX",
            startDate: "August 2022",
            endDate: "Present",
            current: true,
            description: "Led development of a high-traffic e-commerce portal, boosting transaction speeds by 30%.\nArchitected serverless API layers using Node.js, reducing monthly hosting overhead by $2,400.\nCoached and mentored 4 junior developers in clean architecture practices."
          },
          {
            id: crypto.randomUUID(),
            company: "WebCraft Studio",
            position: "Full Stack Developer",
            location: "Houston, TX",
            startDate: "June 2020",
            endDate: "July 2022",
            current: false,
            description: "Developed custom client interfaces using React and Next.js, increasing site traffic metrics by 20%.\nIntegrated payment processing gateways with Stripe API configurations.\nOptimized SQL queries, speeding up dashboard loads by 45%."
          }
        ],
        education: [
          {
            id: crypto.randomUUID(),
            school: "University of Texas at Austin",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            location: "Austin, TX",
            startDate: "September 2016",
            endDate: "May 2020",
            current: false,
            description: "Graduated with Honors. Specialized in Software Engineering and Database Systems."
          }
        ],
        projects: [
          {
            id: crypto.randomUUID(),
            name: "CloudScale Analytics",
            role: "Creator & Lead Architect",
            link: "https://github.com/alexrivera/cloudscale",
            startDate: "January 2023",
            endDate: "April 2023",
            description: "Built an open-source log aggregation engine capable of handling 50k events per minute.\nOptimized indexing mechanisms, reducing database storage size by 25%."
          }
        ],
        skills: [
          { id: crypto.randomUUID(), name: "JavaScript", category: "Languages", level: "Expert" },
          { id: crypto.randomUUID(), name: "TypeScript", category: "Languages", level: "Expert" },
          { id: crypto.randomUUID(), name: "React", category: "Frameworks", level: "Expert" },
          { id: crypto.randomUUID(), name: "Next.js", category: "Frameworks", level: "Expert" },
          { id: crypto.randomUUID(), name: "Node.js", category: "Back-end", level: "Expert" },
          { id: crypto.randomUUID(), name: "PostgreSQL", category: "Databases", level: "Intermediate" },
          { id: crypto.randomUUID(), name: "Docker", category: "Tools", level: "Intermediate" }
        ],
        design: {
          fontFamily: "font-sans",
          fontSize: "md",
          sectionOrder: ["summary", "experience", "projects", "education", "skills"]
        }
      };

      return NextResponse.json({ success: true, data: mockParsed });
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

    const response = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Unstructured Resume Text:\n${resumeText}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to parse the resume text" }, { status: 500 });
    }

    const parsedData = JSON.parse(rawContent);

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
