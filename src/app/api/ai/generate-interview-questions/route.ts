import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { role = "Software Engineer", company = "Target Company", jobDescription = "" } = await request.json().catch(() => ({}));

    const cleanRole = String(role).slice(0, 100);
    const cleanCompany = String(company).slice(0, 100);
    const cleanJd = String(jobDescription).slice(0, 2000);

    const { openai, modelMini, isConfigured } = getAIClient();

    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        questions: [
          {
            id: 1,
            category: "Technical Fundamentals",
            question: `How would you approach designing a resilient architecture for core services at ${cleanCompany}?`,
            completed: false
          },
          {
            id: 2,
            category: "Behavioral & STAR",
            question: `Tell me about a time you resolved a major technical disagreement while delivering as a ${cleanRole}.`,
            completed: false
          },
          {
            id: 3,
            category: "Problem Solving",
            question: `If a mission-critical service experienced degraded throughput, how would you systematically diagnose the root cause?`,
            completed: false
          },
          {
            id: 4,
            category: "Role Execution",
            question: `What metrics and frameworks do you use to guarantee quality and velocity as a ${cleanRole}?`,
            completed: false
          },
          {
            id: 5,
            category: "Culture & Leadership",
            question: `Why ${cleanCompany}, and how do you foster cross-functional collaboration under tight release schedules?`,
            completed: false
          }
        ]
      });
    }

    const systemPrompt = `You are a Principal Director and Senior Hiring Manager at ${cleanCompany}.
Generate 5 realistic, high-impact interview questions tailored specifically for a ${cleanRole} candidate applying to ${cleanCompany}.

Ensure diverse categories:
1. Technical Fundamentals / Architecture
2. Behavioral (STAR method focus)
3. Problem Solving & Trade-offs
4. Role Execution & Real-world Delivery
5. Company Alignment & Cross-functional Leadership

Respond in a STRICT JSON format:
{
  "questions": [
    {
      "id": number,
      "category": string,
      "question": string
    }
  ]
}
Return only raw valid JSON without markdown code fences.`;

    const userPrompt = `Target Role: ${cleanRole}
Target Company: ${cleanCompany}
${cleanJd ? `Job Description Context:\n${cleanJd}` : ""}`;

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      throw new Error("Empty response from AI");
    }

    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);
    const questions = (parsed.questions || []).map((q: any, idx: number) => ({
      id: idx + 1,
      category: q.category || "General Technical",
      question: q.question,
      completed: false
    }));

    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    console.error("Generate interview questions error:", err);
    return NextResponse.json({
      success: true,
      questions: [
        {
          id: 1,
          category: "Role Fundamentals",
          question: "Walk me through a complex challenge you solved in your recent professional experience.",
          completed: false
        },
        {
          id: 2,
          category: "Behavioral & Leadership",
          question: "Describe a scenario where you had to balance technical trade-offs against tight business deadlines.",
          completed: false
        },
        {
          id: 3,
          category: "Problem Solving",
          question: "How do you identify performance bottlenecks and ensure scalability in production?",
          completed: false
        },
        {
          id: 4,
          category: "Execution & Quality",
          question: "What testing and verification standards do you apply before shipping critical features?",
          completed: false
        },
        {
          id: 5,
          category: "Culture & Teamwork",
          question: "How do you communicate technical requirements to non-technical stakeholders and product managers?",
          completed: false
        }
      ]
    });
  }
}
