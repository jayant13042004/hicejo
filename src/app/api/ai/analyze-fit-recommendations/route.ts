import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { ResumeData } from "@/types/resume";

export async function POST(request: Request) {
  try {
    const { resumeData, overflowPercentage } = (await request.json()) as {
      resumeData: ResumeData;
      overflowPercentage?: number;
    };

    if (!resumeData) {
      return NextResponse.json({ success: false, error: "Missing resume data" }, { status: 400 });
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        data: {
          overflowSummary: `Your resume is approximately ${overflowPercentage || 10}% over the 1-page boundary.`,
          recommendations: [
            {
              id: "rec-1",
              type: "compress_bullet",
              title: "Shorten verbose work experience bullets",
              description: "2 experience bullet points can be tightened to save 2-3 lines of vertical space.",
              savingsEstimate: "2 lines",
              autoApplicable: false
            },
            {
              id: "rec-2",
              type: "spacing",
              title: "Apply Compact spacing density",
              description: "Reduce section margins and line spacing by 15% without reducing font size.",
              savingsEstimate: "4 lines",
              autoApplicable: true
            }
          ]
        }
      });
    }

    const systemPrompt = `You are a resume layout optimizer and senior recruiter.
Analyze this candidate's resume content which is currently overflowing beyond 1 A4 page (by approx ${overflowPercentage || 12}%).
Identify specific, actionable ways to achieve a clean 1-page fit while protecting key metrics and achievements.

Provide recommendations in this priority order:
1. "spacing": Recommend switching to compact spacing or trimming empty line spaces.
2. "compress_bullet": Identify specific verbose bullet points that can be shortened by 30-50%.
3. "consolidate": Identify repetitive or low-impact skills/projects that could be merged.

Format your response as strict JSON matching:
{
  "overflowSummary": string,
  "recommendations": [
    {
      "id": string,
      "type": "spacing" | "compress_bullet" | "consolidate",
      "title": string,
      "description": string,
      "savingsEstimate": string (e.g. "2 lines", "15% space"),
      "itemId": string (if specific experience or project item),
      "targetText": string (if specific bullet),
      "suggestedText": string (suggested shorter version if bullet),
      "autoApplicable": boolean
    }
  ]
}
Return only raw JSON.`;

    const userPrompt = `Resume Data:
${JSON.stringify({
  summary: resumeData.summary,
  experience: resumeData.experience?.map((e) => ({
    id: e.id,
    company: e.company,
    position: e.position,
    bullets: e.description
  })),
  projects: resumeData.projects?.map((p) => ({
    id: p.id,
    name: p.name,
    bullets: p.description
  })),
  skillsCount: resumeData.skills?.length
})}`;

    const chatResponse = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 800
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const result = JSON.parse(rawContent);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Fit recommendation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
