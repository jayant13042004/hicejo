import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { isTechnicalRole } from "@/lib/interviewRoundCatalog";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messages = [], careerProfile = null, resumeData = null, hicejoContext = null } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required." },
        { status: 400 }
      );
    }

    const { openai, modelMini, isConfigured } = getAIClient();

    const targetRole = careerProfile?.targetRole || hicejoContext?.targetRole || "Software Engineer";
    const expLevel = careerProfile?.experienceLevel || hicejoContext?.experienceLevel || "Mid-Level";

    const isTech = isTechnicalRole(targetRole);

    const topGap = hicejoContext?.priorityGaps?.[0] || {
      requirement: isTech ? "System Architecture & Evaluation" : "Execution Metrics & Stakeholder Alignment",
      importance: "High Priority",
      problem: "Missing direct verified evidence",
      whyItMatters: isTech ? "Required by your target roles to pass technical screening" : "Required by hiring managers to verify measurable business impact",
      action: "Build Evidence",
      actionHref: "/dashboard/learning"
    };

    // Format candidate's actual resume background if available
    let candidateBackground = "";
    if (resumeData && typeof resumeData === "object") {
      const parts: string[] = [];
      if (resumeData.personalInfo?.fullName) parts.push(`Candidate: ${resumeData.personalInfo.fullName}`);
      if (resumeData.summary) parts.push(`Summary: ${resumeData.summary}`);
      if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
        parts.push(`Recent Experience:\n` + resumeData.experience.slice(0, 3).map((e: any) => `  - ${e.position} at ${e.company} (${e.startDate} - ${e.endDate}): ${e.description?.slice(0, 200)}...`).join("\n"));
      }
      if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) {
        parts.push(`Projects:\n` + resumeData.projects.slice(0, 3).map((p: any) => `  - ${p.name}: ${p.description?.slice(0, 150)}...`).join("\n"));
      }
      if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
        parts.push(`Known Skills: ` + resumeData.skills.map((s: any) => typeof s === "string" ? s : s.name).filter(Boolean).join(", "));
      }
      if (parts.length > 0) {
        candidateBackground = parts.join("\n");
      }
    } else if (careerProfile?.resumeText) {
      candidateBackground = careerProfile.resumeText.slice(0, 1200);
    }

    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    const userLower = lastUserMsg.toLowerCase();

    // Check for "What should I work on today?" or priority gap queries
    const isDailyWorkQuery =
      userLower.includes("work on today") ||
      userLower.includes("what should i do") ||
      userLower.includes("next step") ||
      userLower.includes("highest impact") ||
      userLower.includes("biggest problem") ||
      userLower.includes("prioritize");

    if (!isConfigured) {
      if (isDailyWorkQuery) {
        const jobCount = hicejoContext?.targetJobCount || 3;
        const reply = `Your highest-impact gap is **${topGap.requirement}**.

You have ${jobCount} target job(s) requiring demonstrated ${topGap.requirement} experience, but your current resume contains no direct evidence.

I recommend:
1. **Learn**: Review core ${topGap.requirement} fundamentals and trade-offs.
2. **Build Evidence**: Build one small, production-grade project or benchmark.
3. **Add to Resume**: Document real outcomes (% latency, scale, or accuracy) in the Resume Builder.
4. **Practice in Interview**: Defend your architecture choices in Interview Studio.

[Start Gap Plan →](/dashboard/learning)`;

        return NextResponse.json({ success: true, reply });
      }

      if (userLower.includes("hicejo") || userLower.includes("how to use") || userLower.includes("workflow")) {
        const reply = `Here is how the connected **Hicejo Workflow** operates:

1. **Target Jobs** (\`/dashboard/jobs\`): Save target roles and extract exact requirements.
2. **Diagnose & Gaps** (\`/dashboard/checker\`): Run the 8-dimension diagnostic to see what is hurting your application.
3. **Skills & Evidence** (\`/dashboard/learning\`): Move from *Learn* → *Practice* → *Build Evidence* → *Demonstrated*.
4. **Resume Builder** (\`/dashboard/builder\`): Craft a 1-page ATS-optimized resume grounded in genuine proof.
5. **Interview Studio** (\`/dashboard/interview\`): Defend your experience with realistic voice/text sparring and get a diagnostic debrief.
6. **My Journey** (\`/dashboard/journey\`): Track your end-to-end progress across the 6 milestones.`;

        return NextResponse.json({ success: true, reply });
      }

      const fallback = `As your Career Advisor:

Based on your profile with a focus on **${targetRole}** (${expLevel}):
• **Preparation Readiness**: ${hicejoContext?.readiness?.overall ?? 68}%
• **Top Identified Gap**: ${topGap.requirement} (${topGap.problem})
• **Recommended Action**: ${topGap.action}

Feel free to ask me anything — whether you want to discuss different companies, career paths, interview questions, or resume formulations. If not specified, I'll provide guidance with your target role (**${targetRole}**) in mind.

[Explore Skill Roadmap →](/dashboard/learning)`;

      return NextResponse.json({
        success: true,
        reply: fallback
      });
    }

    const systemPrompt = `You are the personal Hicejo Career AI Advisor — a trusted career mentor, ${isTech ? "technical hiring bar raiser" : "executive business hiring strategist"}, and personal career coach.

CANDIDATE PROFILE & BACKGROUND:
- Target Role: ${targetRole} (${expLevel}) - ${isTech ? "Technical Track" : "Business / Operational / GTM Track"}
${careerProfile?.primaryDomain ? `- Primary Domain: ${careerProfile.primaryDomain}` : ""}
${candidateBackground ? `- Candidate's Active Resume & Background:\n${candidateBackground}` : ""}
${hicejoContext?.readiness ? `- Preparation Readiness: ${hicejoContext.readiness.overall}% (Skills: ${hicejoContext.readiness.skills}%, Evidence: ${hicejoContext.readiness.evidence}%, Application: ${hicejoContext.readiness.application}%, Interview: ${hicejoContext.readiness.interview}%)` : ""}
${hicejoContext?.targetJobCount ? `- Target Jobs Saved: ${hicejoContext.targetJobCount} positions tracked` : ""}
${hicejoContext?.nextBestAction ? `- System Next Best Action: ${hicejoContext.nextBestAction.title} (${hicejoContext.nextBestAction.reason})` : ""}
${hicejoContext?.priorityGaps?.length ? `- Top Priority Gaps:\n${hicejoContext.priorityGaps.map((g: any, i: number) => `  ${i + 1}. ${g.requirement} [${g.importance}]: ${g.problem}. Action: ${g.action}`).join("\n")}` : ""}

CRITICAL BEHAVIORAL DIRECTIVES:
1. PERSONALIZED TO THE CANDIDATE: You know their actual background, strengths, past roles, and projects. Reference their real strengths, and help them bridge gaps to their target role (${targetRole}).
2. OPEN CONVERSATION (NO SINGLE-COMPANY CONSTRAINT): The user is NOT restricted to any single company or single job listing. They can ask about ANY company (startups, big tech, enterprises), various career trajectories, interview strategies, salary negotiations, or domain topics.
3. DEFAULT TARGET ROLE CONTEXT: Always keep their target role (${targetRole} - ${expLevel}) in mind. If the user's question does NOT specify a particular company or role (e.g., "What should I work on today?", "How do I answer tell me about yourself?", "What skills are in demand?"), automatically use their target role (${targetRole}) as the mental context to deliver high-impact, relevant advice. If they mention another company or role, adapt seamlessly.
4. GROUNDED & ACTIONABLE (NO AI SLOP): ${isTech
  ? "Provide practical, concrete engineering guidance with genuine architectural patterns, technical trade-offs, real metrics, and actionable steps. Never use hollow buzzwords or suggest fabricating experience."
  : "Provide practical, high-impact business strategy, domain frameworks, quantifiable metrics (CAC/LTV, pipeline conversion, financial margins, operational throughput), and actionable steps. Never use hollow buzzwords ('spearheaded', 'synergized', 'orchestrated') or suggest fabricating experience."}
5. Clean Formatting:
   - Use clean, readable paragraphs, bullet points, and numbered lists.
   - Do NOT use raw markdown dividers like '***' or excessive asterisks. Keep the tone sharp, encouraging, and highly professional.`;

    const formattedHistory = messages.slice(-10).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000)
    }));

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedHistory
      ] as any,
      temperature: 0.5,
      max_tokens: 1000
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ||
      `Your highest-impact gap is **${topGap.requirement}**.\n\n[Start Gap Plan →](/dashboard/learning)`;

    return NextResponse.json({
      success: true,
      reply
    });
  } catch (err: any) {
    console.error("Career chat API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response. Please try again."
      },
      { status: 500 }
    );
  }
}
