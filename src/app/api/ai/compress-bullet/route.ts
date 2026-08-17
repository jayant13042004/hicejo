import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { bulletText, roleContext } = await request.json();

    if (!bulletText || !bulletText.trim()) {
      return NextResponse.json({ success: false, error: "Missing bullet text" }, { status: 400 });
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    if (!isConfigured) {
      // Mock compression for offline sandbox testing
      const cleaned = bulletText
        .replace(/^(responsible for|tasked with|helped in|assisted with)\s+/i, "")
        .replace(/\s+in order to\s+/i, " to ")
        .replace(/\s+which resulted in\s+/i, ", resulting in ");
      
      const mockAlternatives = [
        `Spearheaded ${cleaned.slice(0, 80)}...`,
        `Engineered solutions to optimize ${cleaned.slice(0, 70)}...`
      ];

      return NextResponse.json({
        success: true,
        data: {
          original: bulletText,
          alternatives: mockAlternatives
        }
      });
    }

    const systemPrompt = `You are an executive resume editor and ATS optimizer specializing in high-density, high-impact bullet compression.
Your task is to shorten a verbose resume bullet point while strictly following these rules:
1. PRESERVE all numerical metrics, percentages, dollar amounts, and KPIs.
2. PRESERVE all technical terms, languages, tools, and frameworks.
3. PRESERVE the core accomplishment and direct outcome.
4. REMOVE fluff, filler phrases, passive voice ("Responsible for...", "Helped to...", "Assisted in..."), and redundant adjectives.
5. START each alternative with a strong past-tense action verb (e.g., Architected, Engineered, Streamlined, Spearheaded, Accelerated).
6. Provide 2-3 concise alternatives of varying lengths (e.g., Ultra-compact vs Balanced-compact).

Respond in a strict JSON format matching this schema:
{
  "original": string,
  "alternatives": [
    {
      "text": string,
      "reductionPercentage": number,
      "style": string ("Ultra-Compact" | "Balanced Impact" | "Metric-Focused")
    }
  ]
}
Return only raw JSON. Do not wrap in markdown blocks.`;

    const userPrompt = `Role Context: ${roleContext || "Professional Experience"}
Original Bullet Point:
"${bulletText}"`;

    const chatResponse = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 600
    });

    const rawContent = chatResponse.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to respond" }, { status: 500 });
    }

    const result = JSON.parse(rawContent);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Bullet compression error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
