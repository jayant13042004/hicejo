import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Please provide content to extract (at least 20 characters)." },
        { status: 400 }
      );
    }

    const { openai, modelPro } = getAIClient();

    const systemPrompt = `You are a strict, factual extraction engine for a candidate's portfolio and fact bank.
Extract ALL projects, skills, experience, and tools described in the provided text.

STRICT ANTI-HALLUCINATION RULES:
- ONLY extract details explicitly mentioned in the text.
- Do NOT invent metrics, numbers, or technologies not mentioned.
- If a project lacks a metric, set "metrics": "".
- Bullet points must be concise and factual.

Return ONLY valid JSON matching this schema:
{
  "projects": [
    {
      "name": "string (Project Name)",
      "role": "string (e.g. Creator, Lead Developer, Contributor)",
      "link": "string or empty",
      "technologies": ["tech1", "tech2"],
      "metrics": "string (e.g. 10,000 users, 25% speedup, or empty if none)",
      "verifiedBullets": ["action verb + detail + result bullet 1", "bullet 2"]
    }
  ],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "duration": "string",
      "location": "string",
      "technologies": ["tech1"],
      "verifiedBullets": ["bullet 1"]
    }
  ],
  "skillGroups": {
    "Category Name": ["Skill1", "Skill2"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Extract all projects, skills, and experience from this text:\n\n${text.slice(0, 30000)}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4096
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    let cleanJson = raw;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    const data = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: {
        projects: data.projects || [],
        experience: data.experience || [],
        skillGroups: data.skillGroups || {}
      }
    });
  } catch (error: any) {
    console.error("Fact bank extraction error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to extract information." },
      { status: 500 }
    );
  }
}
