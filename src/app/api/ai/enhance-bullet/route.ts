import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";

// POST /api/ai/enhance-bullet - Optimize resume bullet points using Google XYZ format
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.bulletPoint || body.bulletText || body.text || body.description || "";
    const jobTitle = body.jobTitle || "Software Engineer";
    const industry = body.industry || "Technology";

    if (!rawText || typeof rawText !== "string" || rawText.trim() === "") {
      return NextResponse.json({ success: false, error: "Bullet text is required" }, { status: 400 });
    }

    // Split into individual bullets if multiple lines are provided
    const lines = rawText
      .split("\n")
      .map((l) => l.trim().replace(/^[•\-\*\s]+/, ""))
      .filter((l) => l.length > 0);

    const isTech = isTechnicalRole(jobTitle);

    const { openai, modelMini, isConfigured } = getAIClient();

    // Fallback if AI client is not configured (offline / demo mode)
    if (!isConfigured) {
      const mockActionVerbs = isTech
        ? ["Built", "Engineered", "Designed", "Refactored", "Optimized", "Deployed"]
        : ["Led", "Accelerated", "Delivered", "Managed", "Structured", "Negotiated"];
      const enhancedLines = lines.map((line, idx) => {
        const verb = mockActionVerbs[idx % mockActionVerbs.length];
        const cleaned = line
          .replace(/^(responsible for|worked on|helped to|assisted in|tasked with)\s+/i, "")
          .trim();
        // Capitalize first char
        const rest = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
        return `• ${verb} ${rest}`;
      });

      return NextResponse.json({
        success: true,
        data: {
          enhanced: enhancedLines.join("\n"),
          bulletCount: lines.length
        }
      });
    }

    const systemPrompt = `You are a principal hiring bar raiser and executive resume strategist known for writing sharp, 100% human-sounding resume bullet points.
Your task is to rewrite draft resume bullet points using the Google XYZ formula:
"Accomplished [X], measured by [Y], by doing [Z]"

CRITICAL RULES (ANTI-AI-SLOP & HUMAN WRITING):
1. FORBIDDEN WORDS: NEVER use "spearheaded", "orchestrated", "synergized", "leveraged", "pioneered", "cutting-edge", "game-changing", "seamlessly", "testament to", "delved", "fostered", "dynamic".
2. ACTION VERBS: Start EVERY bullet point with a decisive, past-tense active verb (${isTech ? "e.g., Built, Designed, Engineered, Refactored, Optimized, Automated, Deployed, Migrated, Reduced, Scaled" : "e.g., Negotiated, Closed, Managed, Structured, Scaled, Forecasted, Standardized, Executed, Launched, Partnered, Streamlined, Reduced"}).
3. PRESERVE FACTUAL METRICS: PRESERVE all real metrics, numbers, percentages, tools, libraries, and frameworks mentioned in the draft.
4. NO FAKE METRICS: NEVER invent fake business metrics or imaginary numbers. If no numbers were given, articulate the concrete outcome (${isTech ? 'e.g., "reducing query execution time", "preventing regression bugs", "decreasing bundle size", "automating manual deployments"' : 'e.g., "accelerating deal cycle times", "improving pipeline retention", "standardizing approval workflows", "boosting campaign conversion"'}) without fabricating fake stats.
5. CONCISE & READABLE: Keep each bullet concise, high-density, and between 15 and 28 words.
6. FORMAT: If the input contains multiple lines/bullets, output EXACTLY the same number of lines, each beginning with a bullet character "• ".
7. Return ONLY the enhanced bullet point text. Do not wrap in markdown quotes or preface with commentary.`;

    const userPrompt = `Target Role: ${jobTitle}
Industry: ${industry}
Draft Bullet(s):
${lines.map((l) => `• ${l}`).join("\n")}

Enhanced Google XYZ Bullet(s):`;

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.25,
      max_tokens: 350
    });

    let enhanced = response.choices[0]?.message?.content?.trim();

    if (!enhanced) {
      return NextResponse.json({ success: false, error: "Failed to generate enhancement from AI" }, { status: 500 });
    }

    // Strip wrapping quotes if LLM added them
    if (enhanced.startsWith('"') && enhanced.endsWith('"')) {
      enhanced = enhanced.slice(1, -1).trim();
    }

    // Ensure bullet format
    const formatted = enhanced
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => (l.startsWith("•") ? l : `• ${l}`))
      .join("\n");

    return NextResponse.json({
      success: true,
      data: {
        enhanced: formatted,
        bulletCount: lines.length
      }
    });
  } catch (error: any) {
    console.error("Enhance bullet error:", error);
    return NextResponse.json({ success: false, error: error.message || "Enhancement failed" }, { status: 500 });
  }
}
