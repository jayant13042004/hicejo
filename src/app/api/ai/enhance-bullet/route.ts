import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { createServerSideClient } from "@/lib/supabase/server";

// POST /api/ai/enhance-bullet - Optimize resume bullet point
export async function POST(request: Request) {
  try {
    // Basic session validation
    const supabase = await createServerSideClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bulletPoint, jobTitle = "Software Developer", industry = "Technology" } = await request.json();

    if (!bulletPoint || bulletPoint.trim() === "") {
      return NextResponse.json({ success: false, error: "Bullet point is required" }, { status: 400 });
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    if (!isConfigured) {
      // Fallback Mock Enhancer for development/testing if no API key is configured
      const mockEnhancements = [
        `Engineered modern application layouts, resulting in a 24% reduction in load times and a 15% increase in user session retention.`,
        `Collaborated with cross-functional design and product teams to integrate and scale feature interfaces, accelerating delivery schedules by 3 weeks.`,
        `Redesigned core module components using clean architectures, decreasing code duplication by 35% and streamlining onboarding workflows.`,
        `Architected key system logic integrations, optimizing client request handling speeds by 40% and cutting hosting costs.`,
      ];
      const selected = mockEnhancements[Math.floor(Math.random() * mockEnhancements.length)];
      return NextResponse.json({ success: true, enhanced: selected });
    }

    const systemPrompt = `You are a professional resume writer, career strategist, and recruiter. 
Your task is to take a simple resume bullet point and rewrite it to be extremely professional, high-impact, and quantified.
Follow these rules strictly:
1. Start with a strong action verb (e.g., Engineered, Spearheaded, Re-architected, Orchestrated).
2. Incorporate realistic metrics (e.g., improved speeds by 30%, increased engagement by 15%, reduced bugs by 20%) to show impact.
3. Keep the language concise, clear, and relevant to the target job and industry.
4. Return ONLY the single enhanced bullet point text. Do not wrap in quotes. Do not include introductory text, feedback, explanations, or multiple choices. Just the raw single bullet point.`;

    const userPrompt = `Target Job Title: ${jobTitle}
Target Industry: ${industry}
Original Bullet Point: "${bulletPoint}"

Enhanced Bullet Point:`;

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const enhanced = response.choices[0]?.message?.content?.trim();

    if (!enhanced) {
      return NextResponse.json({ success: false, error: "Failed to generate enhancement from AI" }, { status: 500 });
    }

    return NextResponse.json({ success: true, enhanced });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
